"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import AuthLayout from "@/components/AuthLayout";
import { PasswordInput, ConfirmPasswordInput } from "@/components/PasswordInput";
import { validatePassword, doPasswordsMatch, validateEmail } from "@/lib/passwordValidation";

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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const passwordValidation = validatePassword(password);
  const passwordsMatch = doPasswordsMatch(password, confirmPassword);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !displayName || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (!passwordValidation.isValid) {
      setError("Password does not meet requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_BASE = "";
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
      let token: string;
      let userOid: string | undefined;

      // Try register endpoint first (production)
      const registerResp = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({
          email,
          password,
          display_name: companyName ? `${displayName} (${companyName})` : displayName,
        }),
      });

      if (registerResp.ok) {
        const registerData = await registerResp.json();
        token = registerData.access_token;
        userOid = registerData.user_oid;
      } else if (registerResp.status === 409) {
        throw new Error("An account with this email already exists. Please sign in instead.");
      } else if (registerResp.status === 404 || registerResp.status === 501) {
        // Fallback to dev endpoint only if register endpoint not implemented
        console.warn("Register endpoint not available, using dev fallback");
        const devResp = await fetch(
          `${API_BASE}/api/v1/auth/dev/login?email=${encodeURIComponent(email)}`,
          {
            method: "POST",
            headers: { "X-API-Key": API_KEY },
          }
        );

        if (!devResp.ok) {
          throw new Error("Failed to create account");
        }

        const devData = await devResp.json();
        token = devData.access_token;
        userOid = devData.user_oid;

        // Sync profile
        await fetch(`${API_BASE}/api/v1/auth/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-API-Key": API_KEY,
          },
          body: JSON.stringify({
            email,
            display_name: companyName ? `${displayName} (${companyName})` : displayName,
          }),
        }).catch((e) => console.warn("Profile sync failed:", e));
      } else {
        // Real error from backend (400 validation, 500 server error, etc.)
        const errorData = await registerResp.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create account");
      }

      // Store token and redirect
      sessionStorage.setItem("access_token", token);
      if (userOid) {
        sessionStorage.setItem("user_oid", userOid);
      }

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

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Invalid email");
      return;
    }

    setError("");
    setStep(2);
  };

  const goToStep3 = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      setError("Password does not meet all requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setStep(3);
  };

  return (
    <AuthLayout variant="signup">
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-6 shadow-sm animate-scale-fade">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-[var(--accent)]' : 'bg-[var(--gray-200)]'}`} />
          <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-[var(--accent)]' : 'bg-[var(--gray-200)]'}`} />
          <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 3 ? 'bg-[var(--accent)]' : 'bg-[var(--gray-200)]'}`} />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            {step === 1 ? "Create your account" : step === 2 ? "Secure your account" : "Tell us about yourself"}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {step === 1
              ? "Enter your email to get started"
              : step === 2
              ? "Create a strong password"
              : "Help others find and connect with you"}
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

        {/* Step 2: Password */}
        {step === 2 && (
          <form onSubmit={goToStep3} className="space-y-4 animate-fade-in-up">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Password <span className="text-[var(--error-500)]">*</span>
              </label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Create a strong password"
                showStrength
                showRequirements
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Confirm Password <span className="text-[var(--error-500)]">*</span>
              </label>
              <ConfirmPasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                originalPassword={password}
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
                disabled={!passwordValidation.isValid || !passwordsMatch}
                className="flex-1 h-10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all relative overflow-hidden bg-[var(--brand-500)] hover:bg-[var(--brand-600)] btn-click"
              >
                <ButtonParticles className="absolute inset-0 z-0" />
                <span className="relative z-10">Continue</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Profile Details */}
        {step === 3 && (
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
                onClick={() => setStep(2)}
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
