"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMsal } from "@azure/msal-react";
import nextDynamic from "next/dynamic";
import AuthLayout from "@/components/AuthLayout";
import { Link2, AlertTriangle } from "lucide-react";

const ButtonParticles = nextDynamic(() => import("@/components/ButtonParticles"), {
  ssr: false,
});

function VerifyLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { instance } = useMsal();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const pendingEmail = sessionStorage.getItem("pending_link_email");

    if (emailParam) {
      setEmail(emailParam);
    } else if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      // No email - redirect to login
      router.push("/login");
      return;
    }

    // Check if we have a pending OAuth token
    const pendingToken = sessionStorage.getItem("pending_oauth_token");
    if (!pendingToken) {
      router.push("/login");
      return;
    }

    setCheckingAuth(false);
  }, [searchParams, router]);

  const handleVerifyAndLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_BASE = "";
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
      const pendingToken = sessionStorage.getItem("pending_oauth_token");

      // Verify password and link account
      const response = await fetch(`${API_BASE}/api/v1/auth/link-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({
          email,
          password,
          oauth_token: pendingToken,
          oauth_provider: "microsoft",
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Incorrect password. Please try again.");
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to link account");
      }

      const data = await response.json();

      // Clear pending data and store actual token
      sessionStorage.removeItem("pending_oauth_token");
      sessionStorage.removeItem("pending_link_email");
      sessionStorage.setItem("access_token", data.access_token);
      if (data.user_oid) {
        sessionStorage.setItem("user_oid", data.user_oid);
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Link verification failed:", err);
      setError(err.message || "Failed to verify. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Clear pending OAuth data
    sessionStorage.removeItem("pending_oauth_token");
    sessionStorage.removeItem("pending_link_email");
    instance.clearCache();
    router.push("/login");
  };

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <AuthLayout variant="login">
        <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-6 shadow-sm">
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-[var(--brand-500)] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="login">
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-6 shadow-sm animate-scale-fade">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Link2 className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            Account already exists
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Verify your identity to link Microsoft login
          </p>
        </div>

        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-amber-800 font-medium">Security verification required</p>
              <p className="text-xs text-amber-700 mt-0.5">
                An account with <strong>{email}</strong> already exists. Enter your password
                to link your Microsoft account for easier sign-in.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[var(--error-50)] border border-[var(--error-500)]/20 rounded-lg text-[var(--error-500)] text-sm animate-fade-in-up">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyAndLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full h-10 px-3 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 h-10 border border-[var(--border-default)] text-[var(--text-secondary)] text-sm font-medium rounded-md hover:bg-[var(--gray-100)] transition-all btn-click"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 h-10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all relative overflow-hidden bg-[var(--brand-500)] hover:bg-[var(--brand-600)] btn-click"
            >
              <ButtonParticles className="absolute inset-0 z-0" />
              <span className="relative z-10">
                {loading ? "Verifying..." : "Verify & Link"}
              </span>
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          <a href="/forgot-password" className="text-[var(--accent)] hover:underline">
            Forgot your password?
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}

// Loading fallback for Suspense
function VerifyLinkLoading() {
  return (
    <AuthLayout variant="login">
      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)] p-6 shadow-sm">
        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-[var(--brand-500)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </AuthLayout>
  );
}

// Wrap in Suspense for useSearchParams
export default function VerifyLinkPage() {
  return (
    <Suspense fallback={<VerifyLinkLoading />}>
      <VerifyLinkContent />
    </Suspense>
  );
}
