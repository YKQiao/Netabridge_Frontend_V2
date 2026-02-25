"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsAuthenticated } from "@azure/msal-react";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  );
}
