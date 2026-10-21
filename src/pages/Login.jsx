import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password mode
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { login, requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get("return") || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(returnUrl);
    } catch (err) {
      setError(
        err.message || "Invalid email or password. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setResetLoading(true);

    try {
      await requestPasswordReset(email);
      setResetSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[75vh]">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 md:p-10 shadow-xs animate-fade-in">
        {!isForgotMode ? (
          <>
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl font-bold text-foreground">
                Welcome Back
              </h1>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground">
                Sign in to your Pure Rooted account.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-11 rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                  <Mail className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setError("");
                      setResetSent(false);
                    }}
                    className="text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 rounded-xl border border-input bg-background pl-10 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                  <Lock className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Toggle password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 inline-flex items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground hover:opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-muted-foreground border-t border-border pt-6">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-primary hover:underline"
              >
                Create Account
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setError("");
                  setResetSent(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </button>
            </div>

            <div className="text-center mb-6">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Reset Password
              </h1>
              <p className="mt-2 text-xs text-muted-foreground">
                Enter your email address to receive password reset instructions.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {error}
              </div>
            )}

            {resetSent ? (
              <div className="p-4 rounded-2xl bg-secondary/60 border border-primary/20 text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
                <h3 className="text-sm font-bold text-foreground">
                  Reset link requested!
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If an account exists for <strong className="text-foreground">{email}</strong>, you will receive password reset instructions.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setResetSent(false);
                  }}
                  className="w-full h-10 mt-2 inline-flex items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground hover:opacity-90 cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full h-11 rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                    <Mail className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full h-11 mt-2 inline-flex items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground hover:opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {resetLoading ? "Sending Link..." : "Send Reset Link"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
