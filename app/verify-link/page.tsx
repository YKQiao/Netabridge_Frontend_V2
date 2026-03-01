"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { ShieldCheck } from "@phosphor-icons/react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function VerifyLinkPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
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
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <ShieldCheck size={24} weight="fill" className="text-green-600" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            Account linking handled automatically
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            NetaBridge uses Microsoft&apos;s secure authentication. If you have an existing account,
            it will be linked automatically when you sign in with Microsoft.
          </p>
        </div>

        <Link
          href="/login"
          className="block w-full h-10 text-center leading-10 text-white text-sm font-medium rounded-md bg-[var(--brand-500)] hover:bg-[var(--brand-600)] transition-all"
        >
          Return to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
