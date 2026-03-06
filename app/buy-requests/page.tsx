"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BuyRequestsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/marketplace?tab=buy-requests");
  }, [router]);
  return null;
}
