"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import AuthLayout from "@/components/AuthLayout";

const ButtonParticles = dynamic(() => import("@/components/ButtonParticles"), {
  ssr: false,
});

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // Form fields
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !displayName) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use relative URL to leverage Next.js proxy (bypasses CORS)
      const API_BASE = "";
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

      // Step 1: Create user via dev login endpoint
      const loginResp = await fetch(
        `${API_BASE}/api/v1/auth/dev/login?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: { "X-API-Key": API_KEY },
        }
      );

      if (!loginResp.ok) {
        const errText = await loginResp.text();
        throw new Error(`Failed to create account: ${errText}`);
      }

      const loginData = await loginResp.json();
      const token = loginData.access_token;

      // Step 2: Sync user profile with display name
      const syncResp = await fetch(`${API_BASE}/api/v1/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({
          email: email,
          display_name: companyName ? `${displayName} (${companyName})` : displayName,
        }),
      });

      if (!syncResp.ok) {
        console.warn("Profile sync failed, but account was created");
      }

      // Store token and redirect
      sessionStorage.setItem("access_token", token);
      sessionStorage.setItem("user_oid", loginData.user_oid);

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signup failed:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setError("");
    setStep(2);
  };

  return (
    <AuthLayout variant="signup">
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-6 shadow-sm animate-scale-fade">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-[var(--accent)]' : 'bg-[var(--gray-200)]'}`} />
          <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-[var(--accent)]' : 'bg-[var(--gray-200)]'}`} />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            {step === 1 ? "Create your account" : "Tell us about yourself"}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {step === 1 ? "Enter your email to get started" : "Help others find and connect with you"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[var(--error-50)] border border-[var(--error-500)]/20 rounded-lg text-[var(--error-500)] text-sm animate-fade-in-up">
            {error}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={goToStep2} className="space-y-4 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!email}
              className="w-full h-10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all relative overflow-hidden bg-[var(--brand-500)] hover:bg-[var(--brand-600)] btn-click"
            >
              <ButtonParticles className="absolute inset-0 z-0" />
              <span className="relative z-10">Continue</span>
            </button>
          </form>
        )}

        {/* Step 2: Profile Details */}
        {step === 2 && (
          <form onSubmit={handleSignup} className="space-y-4 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Your Name <span className="text-[var(--error-500)]">*</span>
              </label>
              <input
                type="text"
                placeholder="John Smith"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Company Name <span className="text-[var(--text-muted)]">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 h-10 border border-[var(--border-default)] text-[var(--text-secondary)] text-sm font-medium rounded-md hover:bg-[var(--gray-100)] transition-all btn-click"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !displayName}
                className="flex-1 h-10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all relative overflow-hidden bg-[var(--brand-500)] hover:bg-[var(--brand-600)] btn-click"
              >
                <ButtonParticles className="absolute inset-0 z-0" />
                <span className="relative z-10">{loading ? "Creating..." : "Create Account"}</span>
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-[var(--accent)] hover:underline">Terms</a>
          {" "}and{" "}
          <a href="#" className="text-[var(--accent)] hover:underline">Privacy Policy</a>
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
