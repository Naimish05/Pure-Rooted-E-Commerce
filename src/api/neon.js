import { createClient } from "@supabase/supabase-js";

const DATA_API_URL = import.meta.env.VITE_NEON_DATA_API_URL || "";
const AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL || "";
const POSTGREST_BASE = DATA_API_URL.replace(/\/rest\/v1\/?$/, "");

let clientInstance = null;

function isTokenExpired(token) {
  if (!token || typeof token !== "string") return true;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const payload = JSON.parse(atob(base64));
    return !payload.exp || payload.exp * 1000 <= Date.now() + 30000;
  } catch {
    return true;
  }
}

export async function getValidToken() {
  // 1. Check user token
  let userToken = localStorage.getItem("neon_jwt_token");
  if (userToken && !isTokenExpired(userToken)) {
    return userToken;
  }

  // If expired or missing, try refreshing from Better Auth session
  const storedUser = localStorage.getItem("neon_user");
  if (storedUser) {
    try {
      const res = await fetch(`${AUTH_URL}/token`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data?.token) {
          localStorage.setItem("neon_jwt_token", data.token);
          return data.token;
        }
      } else {
        localStorage.removeItem("neon_jwt_token");
        localStorage.removeItem("neon_user");
      }
    } catch {
      localStorage.removeItem("neon_jwt_token");
    }
  }

  // 2. Fall back to anonymous token
  let anonToken = localStorage.getItem("neon_anon_token");
  if (anonToken && !isTokenExpired(anonToken)) {
    return anonToken;
  }

  try {
    const res = await fetch(`${AUTH_URL}/token/anonymous`);
    if (res.ok) {
      const data = await res.json();
      if (data?.token) {
        localStorage.setItem("neon_anon_token", data.token);
        return data.token;
      }
    }
  } catch (e) {
    console.warn("Failed to fetch anonymous token:", e);
  }

  return "anon";
}

export async function getNeonClient() {
  const token = await getValidToken();

  if (!clientInstance) {
    clientInstance = createClient(POSTGREST_BASE, token, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          apikey: token,
          Authorization: `Bearer ${token}`,
        },
      },
    });
  } else {
    clientInstance.supabaseKey = token;
    if (clientInstance.rest?.headers) {
      clientInstance.rest.headers["apikey"] = token;
      clientInstance.rest.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return clientInstance;
}
