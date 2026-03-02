"use client";

/**
 * Login page
 * ==========
 * Production: "Continue with Microsoft" redirects the browser to the backend's
 * /auth/login endpoint, which initiates the Entra External ID OAuth flow.
 * The backend sets an HttpOnly `idealring_session` cookie on completion and
 * redirects the browser back to /dashboard.
 *
 * Dev mode (ENTRA_CLIENT_ID unset / placeholder):
 * An email / password form is shown that calls POST /auth/dev/login and
 * stores the returned JWT in memory via setAccessToken().  The AuthProvider
 * then picks up the token and resolves the user via /auth/me.
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isPreviewMode } from "@/lib/auth/previewMode";
import {
  AUTH_ENDPOINTS,
  setAccessToken,
  useAuth,
} from "@/lib/auth/AuthProvider";
import { API_BASE_URL, API_KEY } from "@/lib/api/client";
import Link from "next/link";
import dynamic from "next/dynamic";
import AuthLayout from "@/components/AuthLayout";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

const ButtonParticles = dynamic(() => import("@/components/ButtonParticles"), {
  ssr: false,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Whether the app is configured with a real Entra client ID. */
function isEntraConfigured(): boolean {
  const id = process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID ?? "";
  return id.length > 0 && id !== "00000000-0000-0000-0000-000000000000";
}

// ---------------------------------------------------------------------------
// Inner component (uses useSearchParams – must be inside Suspense)
// ---------------------------------------------------------------------------

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, isAuthenticated, refreshUser } = useAuth();

  const [formReady, setFormReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Is Entra configured? If not, show dev-mode email/pass form.
  const devMode = !isEntraConfigured();

  // ------------------------------------------------------------------
  // On mount: handle OAuth error/expired params
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isPreviewMode) {
      router.replace("/dashboard");
      return;
    }
    const authError = searchParams.get("error");
    if (authError) setError(decodeURIComponent(authError));
    if (searchParams.get("expired") === "1")
      setError("Your session has expired. Please sign in again.");
    setFormReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect once AuthProvider confirms session
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isLoading, isAuthenticated, router]);

  if (!formReady || isLoading) return <BrandedLoading context="auth" />;

  // ------------------------------------------------------------------
  // Production: Microsoft SSO
  // ------------------------------------------------------------------
  const handleLogin = () => {
    setSubmitting(true);
    setError("");

    // Pass current origin as proxy_base_url to handle local Next.js proxy rewrite scenarios
    const proxyBaseUrl = encodeURIComponent(window.location.origin);
    const loginUrl = `${API_BASE_URL}${AUTH_ENDPOINTS.microsoftLogin}`;
    const separator = loginUrl.includes("?") ? "&" : "?";
    window.location.href = `${loginUrl}${separator}proxy_base_url=${proxyBaseUrl}`;
  };

  // ------------------------------------------------------------------
  // Dev mode: email / password
  // ------------------------------------------------------------------
  const handleEmailBlur = () => {
    if (email.trim()) setShowPassword(true);
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) { setError("Please enter your email address."); return; }

    setSubmitting(true);
    setError("");

    try {
      const url = new URL(`${API_BASE_URL}${AUTH_ENDPOINTS.devLogin}`);
      url.searchParams.set("email", trimmedEmail);

      const res = await fetch(url.toString(), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
        },
        body: JSON.stringify({ email: trimmedEmail, password: password || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          res.status === 401
            ? "Invalid email or password."
            : ((data as Record<string, unknown>)?.detail as string) ?? "Authentication failed.",
        );
      }

      const data = await res.json();
      setAccessToken(data.access_token);

      // Sync profile (upsert in DB)
      const displayName = trimmedEmail
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.sync}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.access_token}`,
          ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
        },
        body: JSON.stringify({ email: trimmedEmail, display_name: displayName }),
      }).catch(() => { });

      await refreshUser();
      router.replace("/dashboard");
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      let friendly = "Unable to sign in. Please try again.";
      if (raw.includes("Failed to fetch") || raw.includes("ERR_CONNECTION_REFUSED"))
        friendly = "Cannot reach the server. Is the backend running?";
      else if (raw.length > 0 && raw.length < 120)
        friendly = raw;
      setError(friendly);
    } finally {
      setSubmitting(false);
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

        {/* ── Production mode: External ID login ── */}
        {!devMode && (
          <div className="space-y-3 mb-5 animate-stagger">
            <button
              onClick={handleLogin}
              disabled={submitting}
              className="w-full h-11 flex items-center justify-center gap-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-medium rounded-md transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] focus-visible:ring-offset-2"
            >
              {submitting ? "Redirecting…" : "Sign in"}
            </button>
          </div>
        )}

        {/* ── Dev mode: email / password form ── */}
        {devMode && (
          <form onSubmit={handleDevLogin} noValidate className="space-y-3">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                required
                className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            {showPassword && (
              <div className="animate-fade-in-up space-y-1">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password (optional in dev mode)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
                <div className="text-right">
                  <Link href="/forgot-password" className="text-xs text-[var(--accent)] hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-all relative overflow-hidden bg-[var(--brand-500)] hover:bg-[var(--brand-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] btn-click"
            >
              <ButtonParticles className="absolute inset-0 z-0" />
              <span className="relative z-10">{submitting ? "Signing in…" : "Sign in"}</span>
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
          By continuing you agree to our{" "}
          <a href="#" className="text-[var(--accent)] hover:underline">Terms</a>
          {" "}and{" "}
          <a href="#" className="text-[var(--accent)] hover:underline">Privacy Policy</a>.
        </p>
      </div>

      {/* Dev mode indicator */}
      {devMode && (
        <div className="mt-4 p-3 bg-[var(--warning-50)] border border-[var(--warning-500)]/30 rounded-lg animate-fade-in-up">
          <div className="text-xs font-semibold text-[var(--warning-600)] mb-1">Development Mode</div>
          <p className="text-xs text-[var(--warning-500)]">
            Entra ID is not configured. Enter any email to sign in (password optional).{" "}
            Set{" "}
            <code className="font-mono bg-[var(--warning-100)] px-1 rounded">NEXT_PUBLIC_ENTRA_CLIENT_ID</code>{" "}
            to enable Microsoft SSO.
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
        Need help?{" "}
        <a href="mailto:support@netabridge.com" className="text-[var(--accent)] hover:underline">
          Contact support
        </a>
      </p>
    </AuthLayout>
  );
}

// ---------------------------------------------------------------------------
// Page export (wraps LoginContent in Suspense for useSearchParams)
// ---------------------------------------------------------------------------

function LoginFallback() {
  return <BrandedLoading context="login" />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}