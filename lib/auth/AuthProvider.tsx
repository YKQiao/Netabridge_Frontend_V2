"use client";

import { ReactNode } from "react";
import { isPreviewMode, initDemoSession } from "./previewMode";

/**
 * Simple Auth Provider
 *
 * Backend handles all OAuth/Microsoft authentication.
 * Frontend just manages the session token from backend.
 */

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  // In preview mode, initialize demo session
  if (typeof window !== "undefined" && isPreviewMode) {
    initDemoSession();
  }

  return <>{children}</>;
}

/**
 * Auth utility functions
 */

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token");
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("access_token", token);
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("user_oid");
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Backend OAuth endpoints
 * The backend handles all Microsoft OAuth flow
 */
export const AUTH_ENDPOINTS = {
  // Redirect user here to start Microsoft login
  microsoftLogin: "/api/v1/auth/microsoft/login",

  // Backend redirects here after MS auth (handled by backend)
  microsoftCallback: "/api/v1/auth/microsoft/callback",

  // Email/password login
  login: "/api/v1/auth/login",

  // Dev mode login (only works when backend DEV_MODE=true)
  devLogin: "/api/v1/auth/dev/login",

  // Sync user data after OAuth
  sync: "/api/v1/auth/sync",

  // Get current user
  me: "/api/v1/users/me",
};
