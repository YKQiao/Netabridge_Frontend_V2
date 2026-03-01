/**
 * Preview / demo mode detection.
 *
 * When NEXT_PUBLIC_PREVIEW_MODE=true the app renders with mock data and skips
 * real authentication so it can be shared as a live clickable prototype.
 */

export const isPreviewMode =
  process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";

/** Fallback user shown in preview / demo mode. */
export const DEMO_USER = {
  id: "demo-user-id",
  email: "demo@netabridge.com",
  display_name: "Demo User",
} as const;
