"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isPreviewMode, DEMO_USER, DEMO_TOKEN } from "./previewMode";

interface User {
  id: string;
  email: string;
  display_name: string;
  name?: string;
}

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

export function useAuth(): UseAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // In preview mode, use demo user directly
    if (isPreviewMode || token === DEMO_TOKEN) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

        const response = await fetch(`/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-API-Key": API_KEY,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else if (response.status === 401) {
          sessionStorage.removeItem("access_token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user_oid");
    router.push("/login");
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  };
}
