"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isPreviewMode } from "@/lib/auth/previewMode";
import { getAccessToken } from "@/lib/auth/AuthProvider";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has a valid token
    const token = getAccessToken();
    const isAuthenticated = isPreviewMode || !!token;

    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  );
}
