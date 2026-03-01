/**
 * Tests for app/login/page.tsx
 *
 * We test the rendered UI in both dev mode (no Entra configured)
 * and production mode (real client ID present), as well as the
 * dev-login form submission flow.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------

const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    push: mockRouterPush,
    back: jest.fn(),
    prefetch: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

// ---------------------------------------------------------------------------
// Mock heavy components that are irrelevant to login logic
// ---------------------------------------------------------------------------

jest.mock("@/components/AuthLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-layout">{children}</div>,
}));

jest.mock("@/components/ui/BrandedLoading", () => ({
  __esModule: true,
  BrandedLoading: () => <div data-testid="loading" />,
}));

// next/dynamic is used for ButtonParticles – stub it out
jest.mock("next/dynamic", () => () => () => null);

// ---------------------------------------------------------------------------
// Mock AuthProvider
// ---------------------------------------------------------------------------

const mockRefreshUser = jest.fn();

jest.mock("@/lib/auth/AuthProvider", () => ({
  ...jest.requireActual("@/lib/auth/AuthProvider"),
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: false,
    user: null,
    logout: jest.fn(),
    refreshUser: mockRefreshUser,
  }),
}));

// ---------------------------------------------------------------------------
// Mock previewMode so we never redirect to /dashboard on mount
// ---------------------------------------------------------------------------

jest.mock("@/lib/auth/previewMode", () => ({
  isPreviewMode: false,
}));

// ---------------------------------------------------------------------------
// Mock API client (we inspect fetch calls directly, but need module to resolve)
// ---------------------------------------------------------------------------

jest.mock("@/lib/api/client", () => ({
  API_BASE_URL: "http://localhost:8000",
  API_KEY: "test-key",
  setBearerToken: jest.fn(),
  getBearerToken: jest.fn().mockReturnValue(null),
}));

// ---------------------------------------------------------------------------
// Import subject after mocks are in place
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-require-imports
const LoginPage = require("@/app/login/page").default;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const originalFetch = global.fetch;

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  delete (window as unknown as Record<string, unknown>).location;
  (window as unknown as Record<string, unknown>).location = {
    href: "",
    assign: jest.fn(),
  } as unknown as Location;
});

afterEach(() => {
  global.fetch = originalFetch;
  // Reset Entra env var
  delete process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID;
});

function renderLogin() {
  return render(<LoginPage />);
}

// ---------------------------------------------------------------------------
// Dev mode tests (no Entra client ID → devMode = true)
// ---------------------------------------------------------------------------

describe("LoginPage – dev mode (no Entra ID configured)", () => {
  beforeEach(() => {
    // Unset so isEntraConfigured() returns false
    delete process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID;
  });

  it("renders the Sign in heading", async () => {
    renderLogin();
    await waitFor(() => {
      // Use heading role to avoid matching the submit button text "Sign in"
      expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    });
  });

  it("renders an email input field in dev mode", async () => {
    renderLogin();
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/email/i) ||
        screen.getByRole("textbox", { name: /email/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows an error when submitting with empty email", async () => {
    renderLogin();
    await waitFor(() => screen.getByRole("button", { name: /sign in/i }));

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/enter your email/i),
      ).toBeInTheDocument();
    });
  });

  it("calls /auth/dev/login with the submitted email on success", async () => {
    (global.fetch as jest.Mock)
      // First call: /auth/dev/login
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ access_token: "dev.jwt" }),
      })
      // Second call: /auth/sync (best-effort, can succeed or fail)
      .mockResolvedValueOnce({ status: 200, ok: true, json: () => Promise.resolve({}) });

    renderLogin();
    await waitFor(() => screen.getByRole("textbox"));

    // Type the email
    const emailInput = screen.getByRole("textbox");
    await userEvent.type(emailInput, "alice@test.com");

    // Submit
    fireEvent.submit(emailInput.closest("form")!);

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(1);
      const firstUrl = calls[0][0] as string;
      expect(firstUrl).toContain("/auth/dev/login");
      // Email is appended as a query param; @ is percent-encoded in URLs
      expect(decodeURIComponent(firstUrl)).toContain("alice@test.com");
    });
  });

  it("shows an error message when the login API returns 401", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ detail: "Invalid credentials" }),
    });

    renderLogin();
    await waitFor(() => screen.getByRole("textbox"));

    const emailInput = screen.getByRole("textbox");
    await userEvent.type(emailInput, "bad@test.com");
    fireEvent.submit(emailInput.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it("shows a connection error when fetch throws (server unreachable)", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Failed to fetch"));

    renderLogin();
    await waitFor(() => screen.getByRole("textbox"));

    const emailInput = screen.getByRole("textbox");
    await userEvent.type(emailInput, "offline@test.com");
    fireEvent.submit(emailInput.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText(/cannot reach the server/i),
      ).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Production mode tests (real Entra client ID configured)
// ---------------------------------------------------------------------------

describe("LoginPage – production mode (Entra ID configured)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID = "real-client-id-12345";
  });

  it("renders the 'Continue with Microsoft' button", async () => {
    renderLogin();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /continue with microsoft/i }),
      ).toBeInTheDocument();
    });
  });

  it("Microsoft button is enabled", async () => {
    renderLogin();
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /continue with microsoft/i });
      expect(btn).not.toBeDisabled();
    });
  });

  it("clicking Microsoft button sets window.location.href to auth login URL", async () => {
    renderLogin();
    await waitFor(() =>
      screen.getByRole("button", { name: /continue with microsoft/i }),
    );

    fireEvent.click(screen.getByRole("button", { name: /continue with microsoft/i }));

    const href = (window.location as unknown as { href: string }).href;
    expect(href).toContain("/auth/login");
  });
});
