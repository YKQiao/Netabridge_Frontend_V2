"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResourcesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/marketplace?tab=resources");
  }, [router]);
  return null;
}
