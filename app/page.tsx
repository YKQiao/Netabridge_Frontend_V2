"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isPreviewMode } from "@/lib/auth/previewMode";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Root route – immediately redirect to /dashboard (authenticated) or
 * /login (unauthenticated).  We wait for the AuthProvider to finish its
 * initial /auth/me check before acting so we don't flash a redirect.
 */
export default function Home() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isPreviewMode) {
      router.replace("/dashboard");
      return;
    }
    if (!isLoading) {
      router.replace(isAuthenticated ? "/dashboard" : "/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-400 text-sm">Loading…</div>
    </div>
  );
}
