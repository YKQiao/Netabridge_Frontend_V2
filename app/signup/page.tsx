"use client";

/**
 * Signup page
 * ===========
 * Production: Account creation is handled by Microsoft Entra External ID
 * (CIAM).  The user clicks "Continue with Microsoft", is redirected to Entra's
 * self-service signup flow, and on return the backend creates the DB record
 * during the /auth/callback handler.
 *
 * Dev mode (ENTRA_CLIENT_ID unset / placeholder):
 * A simple form collects email + display name; the backend's
 * /auth/dev/login endpoint creates / upserts the account.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import AuthLayout from "@/components/AuthLayout";
import { validateEmail } from "@/lib/passwordValidation";
import { useAuth, AUTH_ENDPOINTS, setAccessToken } from "@/lib/auth/AuthProvider";
import { API_BASE_URL, API_KEY } from "@/lib/api/client";
import { BrandedLoading } from "@/components/ui/BrandedLoading";

const ButtonParticles = dynamic(() => import("@/components/ButtonParticles"), {
  ssr: false,
});

function isEntraConfigured(): boolean {
  const id = process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID ?? "";
  return id.length > 0 && id !== "00000000-0000-0000-0000-000000000000";
}

export default function SignupPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Dev-mode form fields
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const devMode = !isEntraConfigured();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <BrandedLoading context="auth" />;

  // ── Production: Microsoft SSO ──────────────────────────────────────
  const handleMicrosoftSignup = () => {
    setSubmitting(true);
    setError("");
    window.location.href = `${API_BASE_URL}${AUTH_ENDPOINTS.microsoftLogin}`;
  };

  // ── Dev mode: create account via dev endpoint ──────────────────────
  const handleDevSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedName = displayName.trim();

    const emailCheck = validateEmail(trimmedEmail);
    if (!emailCheck.isValid) { setError(emailCheck.error ?? "Invalid email."); return; }
    if (!trimmedName) { setError("Please enter your name."); return; }

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
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as Record<string, unknown>)?.detail as string ?? "Failed to create account.");
      }

      const data = await res.json();
      setAccessToken(data.access_token);

      // Sync profile with chosen display name
      const fullName = companyName.trim()
        ? `${trimmedName} (${companyName.trim()})`
        : trimmedName;

      await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.sync}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.access_token}`,
          ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
        },
        body: JSON.stringify({ email: trimmedEmail, display_name: fullName }),
      }).catch(() => {});

      await refreshUser();
      router.replace("/dashboard");
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      setError(raw || "Failed to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────
  return (
    <AuthLayout variant="signup">
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-6 shadow-sm animate-scale-fade">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            Create your account
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {devMode
              ? "Enter your details to get started"
              : "Sign up with your Microsoft work or personal account"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[var(--error-50)] border border-[var(--error-500)]/20 rounded-lg text-[var(--error-500)] text-sm animate-fade-in-up">
            {error}
          </div>
        )}

        {/* ── Production: SSO ── */}
        {!devMode && (
          <div className="space-y-3">
            <button
              onClick={handleMicrosoftSignup}
              disabled={submitting}
              className="w-full h-10 flex items-center justify-center gap-2.5 border border-[var(--border-default)] text-[var(--text-secondary)] text-sm font-medium rounded-md hover:bg-[var(--gray-50)] active:bg-[var(--gray-100)] bg-[var(--bg-card)] transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 23 23" aria-hidden="true">
                <path fill="#f25022" d="M1 1h10v10H1z" />
                <path fill="#00a4ef" d="M12 1h10v10H12z" />
                <path fill="#7fba00" d="M1 12h10v10H1z" />
                <path fill="#ffb900" d="M12 12h10v10H12z" />
              </svg>
              {submitting ? "Redirecting…" : "Continue with Microsoft"}
            </button>

            <p className="text-center text-xs text-[var(--text-muted)] pt-2">
              New users are automatically registered on first sign-in.
              <br />
              Already have an account? Use the same button to sign in.
            </p>
          </div>
        )}

        {/* ── Dev mode: form ── */}
        {devMode && (
          <form onSubmit={handleDevSignup} noValidate className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Work Email <span className="text-[var(--error-500)]">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Your Name <span className="text-[var(--error-500)]">*</span>
              </label>
              <input
                id="displayName"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Company Name <span className="text-[var(--text-muted)]">(optional)</span>
              </label>
              <input
                id="companyName"
                type="text"
                autoComplete="organization"
                placeholder="Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-all relative overflow-hidden bg-[var(--brand-500)] hover:bg-[var(--brand-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] btn-click mt-1"
            >
              <ButtonParticles className="absolute inset-0 z-0" />
              <span className="relative z-10">{submitting ? "Creating account…" : "Create Account"}</span>
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
          By continuing you agree to our{" "}
          <a href="#" className="text-[var(--accent)] hover:underline">Terms</a>
          {" "}and{" "}
          <a href="#" className="text-[var(--accent)] hover:underline">Privacy Policy</a>.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

