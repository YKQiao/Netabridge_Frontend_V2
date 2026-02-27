"use client";

import { useState, useEffect } from "react";
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

  // Check dev mode, existing token, and try silent auth on client only
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID;
    setIsDev(!clientId || clientId === "00000000-0000-0000-0000-000000000000");

    const token = sessionStorage.getItem("access_token");
    if (token) {
      router.push("/dashboard");
      return;
    }

    // Try silent authentication if user already has an account
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      setLoading(true);
      instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      }).then((response) => {
        if (response) {
          sessionStorage.setItem("access_token", response.idToken);
          router.push("/dashboard");
        }
      }).catch(() => {
        // Silent auth failed, user needs to login interactively
        setLoading(false);
      });
    }
  }, [router, instance]);

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // Use redirect for faster, more reliable login (avoids popup blockers and COOP issues)
      await instance.loginRedirect(loginRequest);
      // Note: Page will redirect, so code below won't execute
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

  // Handle redirect response (runs after returning from Microsoft login)
  useEffect(() => {
    const handleRedirectResponse = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        if (response?.account) {
          setLoading(true);
          instance.setActiveAccount(response.account);

          const API_BASE = "";
          const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
          const token = response.idToken;

          // Sync user with backend (don't block on this)
          fetch(`${API_BASE}/api/v1/auth/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-API-Key": API_KEY,
            },
            body: JSON.stringify({
              email: response.account.username || "",
              display_name: response.account.name || response.account.username || "",
            }),
          }).catch((e) => console.warn("User sync error:", e));

          sessionStorage.setItem("access_token", token);
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Redirect handling error:", err);
        setLoading(false);
      }
    };

    handleRedirectResponse();
  }, [instance, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_BASE = ""; // Use Next.js proxy
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

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
    } catch (err: any) {
      console.error("Login failed:", err);

      let friendlyMessage = "Unable to sign in. Please try again.";

      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        friendlyMessage = "Unable to connect to server. Please check your connection.";
      } else if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
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
          {/* Microsoft - SAP style: outlined with border */}
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

          {/* Google - Coming Soon */}
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

          {/* LinkedIn - Coming Soon */}
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

        {/* Email Form - Always visible */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>
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
            SSO not configured. Email login uses dev endpoint.
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Don't have an account?{" "}
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
