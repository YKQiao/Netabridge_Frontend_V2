"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { ShieldCheck, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function SetPasswordPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
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
            <ShieldCheck size={24} weight="fill" className="text-[var(--brand-500)]" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            Password managed by Microsoft
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Your password is managed securely through Microsoft&apos;s identity platform.
            To change your password, visit your Microsoft account settings.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="https://myaccount.microsoft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-10 text-white text-sm font-medium rounded-md bg-[var(--brand-500)] hover:bg-[var(--brand-600)] transition-all"
          >
            Manage Password at Microsoft
          </a>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full h-10 border border-[var(--border-default)] text-[var(--text-secondary)] text-sm font-medium rounded-md hover:bg-[var(--gray-100)] transition-all"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
