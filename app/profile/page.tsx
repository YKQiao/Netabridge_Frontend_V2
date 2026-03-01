"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Profile page - redirects to /settings
 * The profile is now integrated as the default tab in settings
 */
export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings");
  }, [router]);

  // Show a minimal loading state during redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-[#4A7DC4] rounded-full animate-spin" />
        <span className="text-[14px]">Redirecting to settings...</span>
      </div>
    </div>
  );
}
