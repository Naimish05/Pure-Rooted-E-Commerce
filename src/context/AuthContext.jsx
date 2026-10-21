import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getNeonClient } from "../api/neon";

const AuthContext = createContext();
const AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL || "";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (currentUser) => {
    try {
      const client = await getNeonClient();
      const { data } = await client
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (e) {
      console.warn("Profile fetch error:", e);
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${AUTH_URL}/get-session`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("neon_user", JSON.stringify(data.user));
          await fetchProfile(data.user);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Session check error:", e);
    }

    // Clean up if invalid/expired session
    setUser(null);
    setProfile(null);
    localStorage.removeItem("neon_user");
    localStorage.removeItem("neon_jwt_token");
    setLoading(false);
  }, [fetchProfile]);

  // Check current session on mount
  useEffect(() => {
    let mounted = true;
    async function init() {
      if (mounted) {
        await checkSession();
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [checkSession]);

  const login = async (email, password) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const res = await fetch(`${AUTH_URL}/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Invalid email or password");
    }

    if (data.user) {
      setUser(data.user);
      localStorage.setItem("neon_user", JSON.stringify(data.user));

      // Fetch JWT token
      try {
        const tokenRes = await fetch(`${AUTH_URL}/token`, {
          credentials: "include",
        });
        if (tokenRes.ok) {
          const tData = await tokenRes.json();
          if (tData?.token) {
            localStorage.setItem("neon_jwt_token", tData.token);
          }
        }
      } catch (err) {
        console.debug("Failed to fetch initial JWT token:", err);
      }

      await fetchProfile(data.user);
    }

    return data;
  };

  const signup = async (email, password, fullName) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (fullName || "").trim();
    const res = await fetch(`${AUTH_URL}/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: cleanEmail, password, name: cleanName }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to sign up");
    }

    if (data.user) {
      setUser(data.user);
      localStorage.setItem("neon_user", JSON.stringify(data.user));

      // Create profile row
      try {
        const client = await getNeonClient();
        await client.from("profiles").upsert({
          id: data.user.id,
          full_name: cleanName,
          email: cleanEmail,
          role: "user",
        });
      } catch (err) {
        console.warn("Failed to create user profile row:", err);
      }
    }

    return data;
  };

  const requestPasswordReset = async (email) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const redirectTo = `${window.location.origin}/reset-password`;
    const res = await fetch(`${AUTH_URL}/request-password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, redirectTo }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to request password reset");
    }
    return data;
  };

  const resetPassword = async (token, newPassword) => {
    const res = await fetch(`${AUTH_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to reset password");
    }
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${AUTH_URL}/sign-out`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.debug("Sign out network error:", err);
    }

    setUser(null);
    setProfile(null);
    localStorage.removeItem("neon_user");
    localStorage.removeItem("neon_jwt_token");
  };

  const isAdmin =
    (user?.role || "").toLowerCase() === "admin" ||
    (profile?.role || "").toLowerCase() === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        login,
        signup,
        requestPasswordReset,
        resetPassword,
        logout,
        refreshSession: checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
