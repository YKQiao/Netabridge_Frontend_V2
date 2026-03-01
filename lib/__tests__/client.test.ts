/**
 * Tests for lib/api/client.ts
 *
 * Strategy:
 *  - Replace global.fetch with a jest.fn() before each test and restore it after.
 *  - Reset the module-level bearer token with setBearerToken(null) in beforeEach.
 *  - Override window.location for redirect assertions (jsdom makes it read-only).
 */

import {
  setBearerToken,
  getBearerToken,
  apiClient,
  ApiRequestError,
} from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal fetch-Response-like object for mocking. */
function mockResponse(
  status: number,
  body: unknown = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _headers: Record<string, string> = {},
) {
  const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
  return {
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(typeof body === "string" ? JSON.parse(body) : body),
    text: () => Promise.resolve(bodyStr),
  };
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

const originalFetch = global.fetch;

beforeEach(() => {
  // Reset any bearer token set by a previous test
  setBearerToken(null);
  // Provide a default no-op fetch; individual tests override this
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Token store
// ---------------------------------------------------------------------------

describe("setBearerToken / getBearerToken", () => {
  it("starts as null", () => {
    expect(getBearerToken()).toBeNull();
  });

  it("stores a token and retrieves it", () => {
    setBearerToken("my-secret-token");
    expect(getBearerToken()).toBe("my-secret-token");
  });

  it("can clear the token by passing null", () => {
    setBearerToken("tok");
    setBearerToken(null);
    expect(getBearerToken()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// ApiRequestError
// ---------------------------------------------------------------------------

describe("ApiRequestError", () => {
  it("is an instance of Error", () => {
    const err = new ApiRequestError({ status: 404, message: "Not Found" });
    expect(err).toBeInstanceOf(Error);
  });

  it("exposes status and message", () => {
    const err = new ApiRequestError({ status: 422, message: "Unprocessable" });
    expect(err.status).toBe(422);
    expect(err.message).toBe("Unprocessable");
  });

  it("optionally exposes detail", () => {
    const detail = { field: "email", msg: "invalid" };
    const err = new ApiRequestError({ status: 422, message: "Unprocessable", detail });
    expect(err.detail).toEqual(detail);
  });

  it("has name ApiRequestError", () => {
    const err = new ApiRequestError({ status: 500, message: "Server error" });
    expect(err.name).toBe("ApiRequestError");
  });
});

// ---------------------------------------------------------------------------
// apiClient.get – happy path
// ---------------------------------------------------------------------------

describe("apiClient.get", () => {
  it("calls fetch with credentials: 'include'", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse(200, { id: "1" }),
    );

    await apiClient.get("/users/me");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.credentials).toBe("include");
  });

  it("does NOT attach X-API-Key header when NEXT_PUBLIC_API_KEY is not set in test env", async () => {
    // The module captures API_KEY at import time from NEXT_PUBLIC_API_KEY.
    // In the test environment this env var is unset, so API_KEY is empty and
    // the header must be absent – this verifies the conditional header logic.
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(200, {}));
    await apiClient.get("/users/me");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const headers = options.headers as Record<string, string>;
    // API_KEY is "" in test env → conditional omits the header
    expect(headers["X-API-Key"]).toBeUndefined();
  });

  it("attaches Authorization header when a bearer token is stored", async () => {
    setBearerToken("dev-jwt-token");
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(200, { result: true }));

    await apiClient.get("/some/path");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const headers = options.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer dev-jwt-token");
  });

  it("does NOT attach Authorization header when no token is stored", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(200, {}));

    await apiClient.get("/some/path");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const headers = options.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("resolves with parsed JSON on success", async () => {
    const payload = { id: "abc", name: "Alice" };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(200, payload));

    const result = await apiClient.get<typeof payload>("/resource");
    expect(result).toEqual(payload);
  });

  it("resolves with undefined on 204 No Content", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 204, ok: true, json: () => Promise.resolve(null), text: () => Promise.resolve("") });

    const result = await apiClient.get("/resource");
    expect(result).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// apiClient.get – error responses
// ---------------------------------------------------------------------------

describe("apiClient.get – error handling", () => {
  it("throws ApiRequestError on 401", async () => {
    // Suppress the window.location redirect side-effect
    delete (window as unknown as Record<string, unknown>).location;
    (window as unknown as Record<string, unknown>).location = { href: "" } as Location;

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(401, {}));

    await expect(apiClient.get("/protected")).rejects.toBeInstanceOf(ApiRequestError);
    const calls = (global.fetch as jest.Mock).mock.calls;
    expect(calls.length).toBe(1);
  });

  it("401 error has status 401", async () => {
    delete (window as unknown as Record<string, unknown>).location;
    (window as unknown as Record<string, unknown>).location = { href: "" } as Location;

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(401, {}));

    try {
      await apiClient.get("/protected");
    } catch (err) {
      expect((err as ApiRequestError).status).toBe(401);
    }
  });

  it("throws ApiRequestError on 500 with a detail message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse(500, { detail: "Internal server error" }),
    );

    let caught: ApiRequestError | undefined;
    try {
      await apiClient.get("/resource");
    } catch (err) {
      caught = err as ApiRequestError;
    }

    expect(caught).toBeInstanceOf(ApiRequestError);
    expect(caught!.status).toBe(500);
    expect(caught!.message).toBe("Internal server error");
  });

  it("throws ApiRequestError on 404 with a message field", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse(404, { message: "Not Found" }),
    );

    await expect(apiClient.get("/missing")).rejects.toMatchObject({
      status: 404,
      message: "Not Found",
    });
  });
});

// ---------------------------------------------------------------------------
// apiClient.post – sends body as JSON
// ---------------------------------------------------------------------------

describe("apiClient.post", () => {
  it("sends method POST with JSON body", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(201, { created: true }));

    await apiClient.post("/items", { name: "Widget" });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({ name: "Widget" });
    const headers = options.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });
});

// ---------------------------------------------------------------------------
// apiClient.delete – no body
// ---------------------------------------------------------------------------

describe("apiClient.delete", () => {
  it("sends method DELETE without Content-Type", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ status: 204, ok: true, json: () => Promise.resolve(null), text: () => Promise.resolve("") });

    await apiClient.delete("/items/1");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe("DELETE");
    const headers = options.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
  });
});
