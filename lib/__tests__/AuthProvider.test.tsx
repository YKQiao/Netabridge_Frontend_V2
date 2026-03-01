/**
 * Tests for lib/auth/AuthProvider.tsx
 *
 * Strategy:
 *  - Mock global.fetch for all API calls.
 *  - Mock next/navigation so hooks don't crash in jsdom.
 *  - Use @testing-library/react renderHook / render with AuthProvider wrapper.
 *  - Call clearAuth() in beforeEach to reset module-level token state.
 */

import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  AuthProvider,
  useAuth,
  setAccessToken,
  clearAuth,
  getAccessToken,
} from "@/lib/auth/AuthProvider";
import { setBearerToken } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------

const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeResponse(status: number, body: unknown) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  };
}

/** Wrap a component / hook with the real AuthProvider. */
function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

const originalFetch = global.fetch;

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  clearAuth();
  jest.clearAllMocks();
  global.fetch = jest.fn();
  // Replace window.location so redirect calls don't throw in jsdom
  delete (window as unknown as Record<string, unknown>).location;
  (window as unknown as Record<string, unknown>).location = {
    href: "",
    assign: jest.fn(),
  } as unknown as Location;
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// getAccessToken / setAccessToken / clearAuth
// ---------------------------------------------------------------------------

describe("token helpers", () => {
  it("getAccessToken returns null initially", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("setAccessToken stores a JWT readable via getAccessToken", () => {
    setAccessToken("test.jwt.token");
    expect(getAccessToken()).toBe("test.jwt.token");
    // Cleanup
    clearAuth();
  });

  it("clearAuth resets the token to null", () => {
    setAccessToken("some.token");
    clearAuth();
    expect(getAccessToken()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// AuthProvider – initial user resolution
// ---------------------------------------------------------------------------

describe("AuthProvider – session bootstrap", () => {
  it("sets user from /auth/me when session cookie is valid", async () => {
    const sessionUser = { id: "u1", email: "alice@test.com", name: "Alice" };
    const profileUser = { id: "u1", email: "alice@test.com", display_name: "Alice" };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(makeResponse(200, sessionUser)) // /auth/me
      .mockResolvedValueOnce(makeResponse(200, profileUser)); // /users/me (enrichment)

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe("alice@test.com");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("leaves user null when /auth/me returns 401 (no session)", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(makeResponse(401, { detail: "Not authenticated" }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("leaves user null when fetch throws a network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network failure"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// AuthProvider – dev-mode token listener
// ---------------------------------------------------------------------------

describe("AuthProvider – dev token listener", () => {
  it("re-fetches user when setAccessToken is called", async () => {
    // First call: no session
    // Second call pair: after token is set, /auth/me + /users/me succeed
    const devUser = { id: "dev1", email: "dev@test.com", display_name: "Dev User" };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(makeResponse(401, {})) // initial /auth/me → no session
      .mockResolvedValueOnce(makeResponse(200, { id: "dev1", email: "dev@test.com", name: "Dev User" })) // /auth/me after token
      .mockResolvedValueOnce(makeResponse(200, devUser)); // /users/me enrichment

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // No user yet
    expect(result.current.user).toBeNull();

    // Set a dev token – this should trigger a listener and re-fetch
    act(() => {
      setAccessToken("dev.jwt.here");
    });

    await waitFor(() => expect(result.current.user).not.toBeNull());
    expect(result.current.user?.email).toBe("dev@test.com");

    clearAuth();
  });

  it("clears user when clearAuth is called while authenticated", async () => {
    const sessionUser = { id: "u2", email: "bob@test.com", name: "Bob" };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(makeResponse(200, sessionUser))
      .mockResolvedValueOnce(makeResponse(200, { id: "u2", email: "bob@test.com", display_name: "Bob" }));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    act(() => {
      clearAuth();
    });

    await waitFor(() => expect(result.current.user).toBeNull());
  });
});

// ---------------------------------------------------------------------------
// AuthProvider – refreshUser
// ---------------------------------------------------------------------------

describe("AuthProvider – refreshUser", () => {
  it("updates user from latest /auth/me response", async () => {
    const initial = { id: "u3", email: "carol@test.com", name: "Carol" };
    const updated = { id: "u3", email: "carol@test.com", display_name: "Carol Updated" };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(makeResponse(200, initial)) // bootstrap /auth/me
      .mockResolvedValueOnce(makeResponse(200, { id: "u3", email: "carol@test.com", display_name: "Carol" })) // bootstrap /users/me
      .mockResolvedValueOnce(makeResponse(200, updated)) // refreshUser /auth/me
      .mockResolvedValueOnce(makeResponse(200, updated)); // refreshUser /users/me

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user?.display_name).toBe("Carol Updated");
  });
});

// ---------------------------------------------------------------------------
// useAuth – outside provider
// ---------------------------------------------------------------------------

describe("useAuth – default context (outside AuthProvider)", () => {
  it("returns a non-null context object with safe defaults", () => {
    // Without the wrapper, useAuth should return the createContext default
    const { result } = renderHook(() => useAuth());
    expect(result.current).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true); // context default
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.refreshUser).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// AuthProvider – logout
// ---------------------------------------------------------------------------

describe("AuthProvider – logout", () => {
  it("clears user and redirects window.location to logout endpoint", async () => {
    const sessionUser = { id: "u4", email: "dave@test.com", name: "Dave" };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(makeResponse(200, sessionUser))
      .mockResolvedValueOnce(makeResponse(200, { id: "u4", email: "dave@test.com", display_name: "Dave" }));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    // window.location.href should have been set to something containing "logout"
    const href = (window.location as unknown as { href: string }).href;
    expect(href).toContain("logout");
  });
});
