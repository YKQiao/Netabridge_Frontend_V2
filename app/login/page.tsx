"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "@/lib/auth/msalConfig";
import Link from "next/link";
import dynamic from "next/dynamic";
import AuthLayout from "@/components/AuthLayout";

const ButtonParticles = dynamic(() => import("@/components/ButtonParticles"), {
  ssr: false,
});

export default function LoginPage() {
  const router = useRouter();
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDev, setIsDev] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const checkEmailRef = useRef<string>("");

  // Check dev mode and existing token on client only
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID;
    setIsDev(!clientId || clientId === "00000000-0000-0000-0000-000000000000");

    const token = sessionStorage.getItem("access_token");
    if (token) {
      router.push("/dashboard");
      return;
    }

    // Don't auto-silently authenticate - this causes redirect loops
    // if the backend doesn't recognize the MSAL token.
    // Let the user explicitly click "Sign in with Microsoft"
  }, [router]);

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await instance.loginRedirect(loginRequest);
    } catch (err: any) {
      const errorCode = err?.errorCode || "";
      console.error("Login redirect failed:", err);
      setError(
        errorCode === "interaction_in_progress"
          ? "A login is already in progress. Please wait."
          : "Unable to sign in. Please try again."
      );
      setLoading(false);
    }
  };

  // Handle successful authentication from MSAL (after redirect)
  // We listen for the active account being set by MsalProvider
  useEffect(() => {
    const account = instance.getActiveAccount();
    if (account && isAuthenticated) {
      // User is authenticated via Microsoft
      setLoading(true);

      const API_BASE = "";
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

      // Get token silently since user is already authenticated
      instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      }).then((response) => {
        const token = response.idToken;

        // Check if user exists and needs password setup (skip in dev mode)
        const clientId = process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID;
        const isDevMode = !clientId || clientId === "00000000-0000-0000-0000-000000000000";

        if (!isDevMode) {
          fetch(`${API_BASE}/api/v1/auth/check-account`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": API_KEY,
            },
            body: JSON.stringify({
              email: account.username || "",
              oauth_provider: "microsoft",
            }),
          }).then(checkResp => {
            if (checkResp.ok) {
              return checkResp.json().catch(() => ({}));
            }
            return {};
          }).then((checkData: { needs_password_setup?: boolean; account_exists?: boolean; is_linked?: boolean }) => {
            if (checkData.needs_password_setup) {
              sessionStorage.setItem("pending_oauth_token", token);
              sessionStorage.setItem("needs_password_setup", "true");
              router.push("/set-password");
              return;
            }

            if (checkData.account_exists && !checkData.is_linked) {
              sessionStorage.setItem("pending_oauth_token", token);
              sessionStorage.setItem("pending_link_email", account.username || "");
              router.push(`/verify-link?email=${encodeURIComponent(account.username || "")}`);
              return;
            }

            // Normal flow - save token and go to dashboard
            finishLogin(token, account, API_BASE, API_KEY);
          }).catch(() => {
            // Endpoint not available, continue with normal flow
            finishLogin(token, account, API_BASE, API_KEY);
          });
        } else {
          // Dev mode - just finish login
          finishLogin(token, account, API_BASE, API_KEY);
        }
      }).catch((err) => {
        console.error("Token acquisition error:", err);
        setLoading(false);
      });
    }
  }, [isAuthenticated, instance, router]);

  // Helper to finish login process
  const finishLogin = (token: string, account: any, API_BASE: string, API_KEY: string) => {
    // Sync user with backend
    fetch(`${API_BASE}/api/v1/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        email: account.username || "",
        display_name: account.name || account.username || "",
      }),
    }).catch((e) => console.warn("User sync error:", e));

    sessionStorage.setItem("access_token", token);
    router.push("/dashboard");
  };

  // Check if email exists when user finishes typing
  const handleEmailBlur = async () => {
    if (!email) return;
    setShowPasswordField(true);

    // In dev mode, skip account check
    if (isDev) {
      setAccountExists(false);
      return;
    }

    // Track current email to prevent race conditions
    const currentEmail = email;
    checkEmailRef.current = currentEmail;

    try {
      const API_BASE = "";
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

      const response = await fetch(`${API_BASE}/api/v1/auth/check-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({ email: currentEmail }),
      });

      // Only update state if this is still the current check
      if (checkEmailRef.current !== currentEmail) return;

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        setAccountExists(data.account_exists || false);
      }
    } catch {
      // Endpoint not available, assume dev mode behavior
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_BASE = "";
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

      // If password provided, try login (regardless of accountExists - check may have failed)
      if (password) {
        const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Invalid email or password");
          }
          throw new Error("Authentication failed");
        }

        const data = await response.json();
        sessionStorage.setItem("access_token", data.access_token);
        if (data.user_oid) {
          sessionStorage.setItem("user_oid", data.user_oid);
        }
        router.push("/dashboard");
        return;
      }

      // Dev mode fallback (no password required)
      if (isDev) {
        const response = await fetch(
          `${API_BASE}/api/v1/auth/dev/login?email=${encodeURIComponent(email)}`,
          {
            method: "POST",
            headers: { "X-API-Key": API_KEY },
          }
        );

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const data = await response.json();
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("user_oid", data.user_oid);

        try {
          await fetch(`${API_BASE}/api/v1/auth/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.access_token}`,
              "X-API-Key": API_KEY,
            },
            body: JSON.stringify({
              email: email,
              display_name: email
                .split("@")[0]
                .replace(/[._]/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            }),
          });
        } catch (syncError) {
          console.warn("User sync failed:", syncError);
        }

        router.push("/dashboard");
        return;
      }

      // Account doesn't exist - redirect to signup
      if (!accountExists) {
        setError("No account found with this email. Please sign up first.");
        return;
      }

      // Account exists but no password entered
      if (!password) {
        setError("Please enter your password");
        return;
      }
    } catch (err: any) {
      console.error("Login failed:", err);

      let friendlyMessage = "Unable to sign in. Please try again.";

      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        friendlyMessage = "Unable to connect to server. Please check your connection.";
      } else if (err.message?.includes("Invalid email or password")) {
        friendlyMessage = "Invalid email or password.";
      } else if (err.message?.includes("404")) {
        friendlyMessage = "Service unavailable. Please try again later.";
      }

      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-6 shadow-sm animate-scale-fade">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            Sign in
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Access your NetaBridge account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[var(--error-50)] border border-[var(--error-500)]/20 rounded-lg text-[var(--error-500)] text-sm animate-fade-in-up">
            {error}
          </div>
        )}

        {/* SSO Buttons */}
        <div className="space-y-3 mb-4 animate-stagger">
          <button
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="w-full h-10 flex items-center justify-center gap-2 border border-[var(--border-default)] bg-[var(--bg-card)] hover:bg-[var(--gray-100)] disabled:opacity-50 text-[var(--text-primary)] text-sm font-medium rounded-md transition-all btn-click"
          >
            <svg className="w-4 h-4" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Continue with Microsoft
          </button>

          <button
            disabled
            className="w-full h-10 flex items-center justify-center gap-2 border border-[var(--border-default)] text-[var(--text-muted)] text-sm font-medium rounded-md cursor-not-allowed relative bg-[var(--bg-card)] btn-click"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#9CA3AF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#9CA3AF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#9CA3AF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#9CA3AF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            <span className="absolute right-3 text-[10px] bg-[var(--gray-200)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">
              Soon
            </span>
          </button>

          <button
            disabled
            className="w-full h-10 flex items-center justify-center gap-2 border border-[var(--border-default)] text-[var(--text-muted)] text-sm font-medium rounded-md cursor-not-allowed relative bg-[var(--bg-card)] btn-click"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#9CA3AF">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
            <span className="absolute right-3 text-[10px] bg-[var(--gray-200)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">
              Soon
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-light)]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[var(--bg-card)] text-[var(--text-muted)]">or</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>
          {(showPasswordField || password) && (
            <div className="animate-fade-in-up">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
              <div className="mt-1 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-all relative overflow-hidden bg-[var(--brand-500)] hover:bg-[var(--brand-600)] btn-click"
          >
            <ButtonParticles className="absolute inset-0 z-0" />
            <span className="relative z-10">{loading ? "Signing in..." : "Sign in"}</span>
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
          By continuing, you agree to our{" "}
          <a href="#" className="text-[var(--accent)] hover:underline">Terms</a>
          {" "}and{" "}
          <a href="#" className="text-[var(--accent)] hover:underline">Privacy Policy</a>
        </p>
      </div>

      {/* Dev Mode Indicator */}
      {isDev && (
        <div className="mt-4 p-3 bg-[var(--warning-50)] border border-[var(--warning-500)]/30 rounded-lg animate-fade-in-up">
          <div className="text-xs font-medium text-[var(--warning-600)] mb-1">Development Mode</div>
          <p className="text-xs text-[var(--warning-500)]">
            SSO not configured. Email login uses dev endpoint (password optional).
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[var(--accent)] hover:underline font-medium">
          Sign up
        </Link>
      </p>

      <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
        Need help?{" "}
        <a href="mailto:support@netabridge.com" className="text-[var(--accent)] hover:underline">
          Contact support
        </a>
      </p>
    </AuthLayout>
  );
}
