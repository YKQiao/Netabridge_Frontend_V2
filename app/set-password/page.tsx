"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMsal } from "@azure/msal-react";
import nextDynamic from "next/dynamic";
import AuthLayout from "@/components/AuthLayout";
import { PasswordInput, ConfirmPasswordInput } from "@/components/PasswordInput";
import { validatePassword, doPasswordsMatch } from "@/lib/passwordValidation";
import { Shield } from "lucide-react";

const ButtonParticles = nextDynamic(() => import("@/components/ButtonParticles"), {
  ssr: false,
});

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { instance } = useMsal();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  const passwordValidation = validatePassword(password);
  const passwordsMatch = doPasswordsMatch(password, confirmPassword);

  // Get user info from MSAL or query params
  useEffect(() => {
    const account = instance.getActiveAccount();
    if (account) {
      setEmail(account.username || "");
      setDisplayName(account.name || "");
    } else {
      // Check if we have info in query params (fallback)
      const emailParam = searchParams.get("email");
      const nameParam = searchParams.get("name");
      if (emailParam) setEmail(emailParam);
      if (nameParam) setDisplayName(nameParam);
    }

    // If no email at all, redirect to login
    const token = sessionStorage.getItem("pending_oauth_token");
    if (!token && !instance.getActiveAccount()) {
      router.push("/login");
      return;
    }

    setCheckingAuth(false);
  }, [instance, searchParams, router]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const pendingToken = sessionStorage.getItem("pending_oauth_token");

      // Set password for OAuth user
      const response = await fetch(`${API_BASE}/api/v1/auth/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          ...(pendingToken ? { Authorization: `Bearer ${pendingToken}` } : {}),
        },
        body: JSON.stringify({
          email,
          password,
          oauth_provider: "microsoft",
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to set password");
      }

      const data = await response.json();

      // Clear pending token and store actual token
      sessionStorage.removeItem("pending_oauth_token");
      sessionStorage.removeItem("needs_password_setup");
      sessionStorage.setItem("access_token", data.access_token || pendingToken);
      if (data.user_oid) {
        sessionStorage.setItem("user_oid", data.user_oid);
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Set password failed:", err);
      setError(err.message || "Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <AuthLayout variant="signup">
        <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-6 shadow-sm">
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-[var(--brand-500)] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="signup">
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-6 shadow-sm animate-scale-fade">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-[var(--brand-100)] flex items-center justify-center">
            <Shield className="w-6 h-6 text-[var(--brand-500)]" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            Secure your account
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Create a password to protect your NetaBridge account
          </p>
          {email && (
            <p className="text-sm text-[var(--text-secondary)] mt-2 font-medium">
              {email}
            </p>
          )}
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Why set a password?</strong> This allows you to sign in with email/password
            in addition to Microsoft, and adds an extra layer of security to your account.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[var(--error-50)] border border-[var(--error-500)]/20 rounded-lg text-[var(--error-500)] text-sm animate-fade-in-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSetPassword} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading || !passwordValidation.isValid || !passwordsMatch}
            className="w-full h-10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all relative overflow-hidden bg-[var(--brand-500)] hover:bg-[var(--brand-600)] btn-click"
          >
            <ButtonParticles className="absolute inset-0 z-0" />
            <span className="relative z-10">
              {loading ? "Setting password..." : "Set Password & Continue"}
            </span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          You can change your password anytime in Settings
        </p>
      </div>
    </AuthLayout>
  );
}

// Loading fallback for Suspense
function SetPasswordLoading() {
  return (
    <AuthLayout variant="signup">
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-6 shadow-sm">
        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-[var(--brand-500)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </AuthLayout>
  );
}

// Wrap in Suspense for useSearchParams
export default function SetPasswordPage() {
  return (
    <Suspense fallback={<SetPasswordLoading />}>
      <SetPasswordContent />
    </Suspense>
  );
}
