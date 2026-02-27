// Preview/Demo Mode Configuration
// When NEXT_PUBLIC_PREVIEW_MODE is true OR running on Vercel preview,
// authentication is bypassed with a demo user

export const isPreviewMode =
  process.env.NEXT_PUBLIC_PREVIEW_MODE === "true" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

export const DEMO_USER = {
  id: "demo-user-001",
  oid: "demo-user-001",
  email: "demo@netabridge.com",
  display_name: "Demo User",
  name: "Demo User",
};

export const DEMO_TOKEN = "demo-preview-token";

// Initialize demo session (call this on app load when in preview mode)
export function initDemoSession() {
  if (isPreviewMode && typeof window !== "undefined") {
    sessionStorage.setItem("access_token", DEMO_TOKEN);
    sessionStorage.setItem("user_oid", DEMO_USER.oid);
    console.log("[Preview Mode] Demo session initialized");
  }
}

// Check if current session is demo
export function isDemoSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("access_token") === DEMO_TOKEN;
}

// Fetch user - returns demo user in preview mode, otherwise calls API
export async function fetchCurrentUser(): Promise<typeof DEMO_USER | null> {
  if (isPreviewMode || isDemoSession()) {
    return DEMO_USER;
  }

  const token = typeof window !== "undefined" ? sessionStorage.getItem("access_token") : null;
  if (!token) return null;

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

  try {
    const response = await fetch("/api/v1/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-Key": API_KEY,
      },
    });

    if (response.ok) {
      return await response.json();
    }

    if (response.status === 401) {
      sessionStorage.removeItem("access_token");
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch user:", error);
  }

  return null;
}
