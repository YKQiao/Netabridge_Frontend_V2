/**
 * Typed API client for the NetaBridge backend.
 *
 * Production: All requests use `credentials: "include"` so the browser
 * automatically sends the `idealring_session` HttpOnly cookie set by the BFF.
 *
 * Dev mode: A Bearer JWT obtained from /auth/dev/login is attached as a
 * fallback (stored in the AuthProvider's in-memory state and injected here).
 *
 * Usage:
 *   import { apiClient } from "@/lib/api/client";
 *   const user = await apiClient.get<User>("/users/me");
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/**
 * Base URL of the backend API (no trailing slash).
 * IMPORTANT: Leave empty to use relative URLs - Vercel/Next.js rewrites will proxy to backend.
 * This ensures cookies are first-party (same domain), avoiding cross-site cookie issues.
 */
export const API_BASE_URL = "";

/** Optional infra-level API key required by the backend. */
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

// ---------------------------------------------------------------------------
// Internal token store (dev-mode Bearer token)
// ---------------------------------------------------------------------------

let _bearerToken: string | null = null;

/** Save a dev-mode JWT so all subsequent requests include it. */
export function setBearerToken(token: string | null): void {
  _bearerToken = token;
}

/** Read the currently stored dev-mode JWT (may be null in production). */
export function getBearerToken(): string | null {
  return _bearerToken;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

export interface ApiError {
  status: number;
  message: string;
  detail?: unknown;
}

export class ApiRequestError extends Error {
  status: number;
  detail?: unknown;

  constructor({ status, message, detail }: ApiError) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: HeadersInit,
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
    ...(_bearerToken ? { Authorization: `Bearer ${_bearerToken}` } : {}),
    ...(extraHeaders as Record<string, string>),
  };

  const res = await fetch(url, {
    method,
    credentials: "include", // Always send the BFF session cookie
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    // Session expired – redirect to login (only in browser context)
    if (typeof window !== "undefined") {
      // Brief delay so any pending renders can flush
      setTimeout(() => {
        window.location.href = "/login?expired=1";
      }, 0);
    }
    throw new ApiRequestError({ status: 401, message: "Session expired" });
  }

  if (!res.ok) {
    let detail: unknown;
    let message = `Request failed (${res.status})`;
    try {
      const json = await res.json();
      detail = json;
      if (typeof json.detail === "string") message = json.detail;
      else if (typeof json.message === "string") message = json.message;
    } catch {
      // ignore parse errors
    }
    throw new ApiRequestError({ status: res.status, message, detail });
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API client object
// ---------------------------------------------------------------------------

export const apiClient = {
  get: <T>(path: string, headers?: HeadersInit) =>
    request<T>("GET", path, undefined, headers),

  post: <T>(path: string, body?: unknown, headers?: HeadersInit) =>
    request<T>("POST", path, body, headers),

  put: <T>(path: string, body?: unknown, headers?: HeadersInit) =>
    request<T>("PUT", path, body, headers),

  patch: <T>(path: string, body?: unknown, headers?: HeadersInit) =>
    request<T>("PATCH", path, body, headers),

  delete: <T>(path: string, headers?: HeadersInit) =>
    request<T>("DELETE", path, undefined, headers),
};
