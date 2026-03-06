"use client";

/**
 * BFF Authentication Provider
 * ============================================================
 * Implements the Backend-for-Frontend (BFF) session-cookie pattern
 * as specified in BE_design_v1.md § 3.
 *
 * Production flow:
 *   1. User clicks "Continue with Microsoft" → redirected to
 *      GET /api/v1/auth/login (backend initiates Entra OAuth).
 *   2. Backend exchanges code, creates user in DB, sets
 *      `idealring_session` HttpOnly cookie, redirects browser to
 *      WEBSITE_LOCATION/dashboard.
 *   3. Every subsequent API call goes to the backend with
 *      `credentials: "include"` – the cookie is sent automatically.
 *   4. GET /api/v1/auth/me validates the cookie server-side and
 *      returns the current user; this is the single source of truth
 *      for the frontend.
 *
 * Dev mode (no Entra configured):
 *   - POST /api/v1/auth/dev/login returns a signed HS256 JWT.
 *   - The JWT is stored in React state (not localStorage / sessionStorage)
 *     and injected into every API call as a Bearer token via apiClient.
 *   - `setAccessToken` / `getAccessToken` are exported for imperative use
 *     in page-level handlers (e.g. login page before the provider has
 *     updated its state).
 *
 * Exports
 * -------
 *   AuthProvider          – wrap your app with this
 *   useAuth               – hook to read user state and call logout()
 *   AUTH_ENDPOINTS        – canonical endpoint paths
 *   getAccessToken()      – returns dev-mode JWT (null in production)
 *   setAccessToken(token) – stores dev-mode JWT and notifies provider
 *   clearAuth()           – clears dev-mode JWT and resets auth state
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getBearerToken, setBearerToken, API_BASE_URL, API_KEY } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
}

interface AuthContextValue {
  /** Null while loading or when unauthenticated. */
  user: AuthUser | null;
  /** True during the initial session check. */
  isLoading: boolean;
  /** Shorthand: user !== null. */
  isAuthenticated: boolean;
  /** Call to sign the user out (clears cookie + redirects to Entra logout). */
  logout: () => Promise<void>;
  /**
   * Refresh the user object from /auth/me – useful after profile updates.
   * Call this after a successful sync or profile mutation.
   */
  refreshUser: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Endpoint catalogue
// ---------------------------------------------------------------------------

export const AUTH_ENDPOINTS = {
  /** Redirects browser to Azure Entra login / signup. */
  microsoftLogin: "/api/v1/auth/login",
  /** OAuth callback handled by backend (not called directly from frontend). */
  callback: "/api/v1/auth/callback",
  /** Returns user info from session cookie (fast, no DB). */
  me: "/api/v1/auth/me",
  /** Full user profile from DB. */
  usersMe: "/api/v1/users/me",
  /** Upsert user profile in DB after first login. */
  sync: "/api/v1/auth/sync",
  /** Clears session cookie & redirects to Entra global logout. */
  logout: "/api/v1/auth/logout",
  /**
   * Dev / demo only: returns a signed HS256 JWT.
   * In production, restricted to @demo.com accounts.
   */
  devLogin: "/api/v1/auth/dev/login",
  /**
   * @deprecated The login field is an alias of devLogin kept for backward
   * compatibility with legacy page imports.
   */
  login: "/api/v1/auth/dev/login",
} as const;

// ---------------------------------------------------------------------------
// Module-level token store (dev-mode only)
//
// We keep the token in module scope so page handlers can call
// setAccessToken() before the provider re-renders (e.g. right after a
// successful /auth/dev/login response, before router.push("/dashboard")).
// ---------------------------------------------------------------------------

/** Subscribers notified when the dev token changes. */
const _listeners = new Set<(token: string | null) => void>();

function notifyListeners(token: string | null) {
  _listeners.forEach((fn) => fn(token));
}

/**
 * Store a dev-mode JWT.  Persists it in the API client so every
 * subsequent `apiClient.*` call attaches `Authorization: Bearer <token>`.
 */
export function setAccessToken(token: string): void {
  setBearerToken(token);
  notifyListeners(token);
}

/**
 * Read the currently stored dev-mode JWT.
 * Returns null in production (BFF cookie flow).
 */
export function getAccessToken(): string | null {
  return getBearerToken();
}

/**
 * Clear the dev-mode JWT and notify the provider to reset auth state.
 * Call this when you need to imperatively sign out outside of a component.
 */
export function clearAuth(): void {
  setBearerToken(null);
  notifyListeners(null);
}

// ---------------------------------------------------------------------------
// Auth fetch helper (used only inside this file, bypasses apiClient to avoid
// circular dependency on the 401 redirect logic)
// ---------------------------------------------------------------------------

function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getBearerToken();
  const headers: HeadersInit = {
    ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init?.headers,
  };
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => { },
  refreshUser: async () => { },
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const isLoggingOutRef = useRef(false);

  // ------------------------------------------------------------------
  // fetchUser – calls GET /auth/me then optionally enriches from /users/me
  // ------------------------------------------------------------------
  const fetchUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await authFetch(AUTH_ENDPOINTS.me);
      if (res.ok) {
        const sessionData = await res.json();

        //  /auth/me returns { oid, email, name } – remap to AuthUser shape
        const partial: AuthUser = {
          id: sessionData.id ?? sessionData.oid ?? "unknown",
          email: sessionData.email ?? "",
          display_name:
            sessionData.display_name ?? sessionData.name ?? sessionData.email ?? "User",
        };

        // Silently enrich with full DB profile (best-effort)
        try {
          const profileRes = await authFetch(AUTH_ENDPOINTS.usersMe);
          if (profileRes.ok) {
            const profile = await profileRes.json();
            return {
              id: profile.id ?? partial.id,
              email: profile.email ?? partial.email,
              display_name: profile.display_name ?? partial.display_name,
            };
          }
        } catch {
          // Ignore – use the session data we already have
        }

        return partial;
      }

      // /auth/me failed (no session cookie) — fall back to /users/me if we have a Bearer token
      if (getBearerToken()) {
        const profileRes = await authFetch(AUTH_ENDPOINTS.usersMe);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          return {
            id: profile.id ?? "unknown",
            email: profile.email ?? "",
            display_name: profile.display_name ?? profile.email ?? "User",
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  // ------------------------------------------------------------------
  // refreshUser – public, can be called after profile mutations
  // ------------------------------------------------------------------
  const refreshUser = useCallback(async () => {
    const fresh = await fetchUser();
    if (mountedRef.current) setUser(fresh);
  }, [fetchUser]);

  // ------------------------------------------------------------------
  // Bootstrap: check session on mount, subscribe to token changes
  // ------------------------------------------------------------------
  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      const resolved = await fetchUser();
      if (mountedRef.current) {
        setUser(resolved);
        setIsLoading(false);
      }
    }

    init();

    // Re-check auth whenever the dev-mode token changes
    const onTokenChange = async (token: string | null) => {
      if (!mountedRef.current || isLoggingOutRef.current) return;
      if (!token) {
        setUser(null);
        return;
      }
      // A new dev token was stored – re-check /auth/me (now includes Bearer)
      const resolved = await fetchUser();
      if (mountedRef.current) setUser(resolved);
    };

    _listeners.add(onTokenChange);

    return () => {
      mountedRef.current = false;
      _listeners.delete(onTokenChange);
    };
  }, [fetchUser]);

  // ------------------------------------------------------------------
  // Logout
  // ------------------------------------------------------------------
  const logout = useCallback(async () => {
    isLoggingOutRef.current = true;

    // Clear dev-mode token (no-op in production)
    clearAuth();

    // Do NOT call setUser(null) here.
    // If we set the user to null immediately, protected pages like Dashboard
    // will re-render and dispatch router.push('/login'), effectively cancelling
    // the top-level window.location.href navigation below before it can complete.
    // We want the browser to reach the backend to clear the HttpOnly session.

    // Navigate the full page so the browser follows the backend's
    // redirect chain (session cookie clear → Entra global logout).
    window.location.href = `${API_BASE_URL}${AUTH_ENDPOINTS.logout}`;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
