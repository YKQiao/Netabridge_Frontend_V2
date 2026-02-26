/**
 * API Client for IdealRing Backend
 * Handles authentication and API calls
 */

import { msalInstance } from "./auth/MsalProvider";
import { loginRequest } from "./auth/msalConfig";

// Use relative URL to leverage Next.js rewrites (bypasses CORS)
// Next.js proxies /api/* to the backend defined in next.config.ts
const API_BASE = "";
const API_PREFIX = "/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

/**
 * Get access token from MSAL
 */
async function getAccessToken(): Promise<string | null> {
  const account = msalInstance.getActiveAccount();
  if (!account) return null;

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return response.idToken;
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
}

/**
 * Make authenticated API request
 */
async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  const url = `${API_BASE}${API_PREFIX}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  // Handle empty responses
  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return {} as T;
  }

  return response.json();
}

// =============================================================================
// API Methods
// =============================================================================

export const api = {
  // Auth
  syncUser: async (email: string, displayName: string) => {
    return fetchApi("/auth/sync", {
      method: "POST",
      body: JSON.stringify({ email, display_name: displayName }),
    });
  },

  // Users
  getMe: () => fetchApi<{ id: string; email: string; display_name: string }>("/users/me"),

  // Connections
  listConnections: () => fetchApi<any[]>("/connections"),

  sendInvite: (targetEmail: string) =>
    fetchApi("/connections/invite", {
      method: "POST",
      body: JSON.stringify({ target_email: targetEmail }),
    }),

  respondToInvite: (connectionId: string, action: "ACCEPTED" | "REJECTED") =>
    fetchApi(`/connections/${connectionId}/respond`, {
      method: "PUT",
      body: JSON.stringify({ action }),
    }),

  // Resources (Sell Posts)
  listResources: () => fetchApi<any[]>("/resources"),

  createResource: (data: {
    name: string;
    description?: string;
    quantity: number;
    price?: number;
    currency?: string;
  }) =>
    fetchApi("/resources", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Buy Posts
  listBuyPosts: () => fetchApi<any[]>("/buy-posts"),

  createBuyPost: (data: {
    title: string;
    description: string;
    budget_range?: string;
    deadline?: string;
  }) =>
    fetchApi("/buy-posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Chat
  createChatSession: (title?: string) =>
    fetchApi<{ session_id: string }>("/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  getChatHistory: (sessionId: string) =>
    fetchApi<{ messages: any[] }>(`/chat/sessions/${sessionId}/history`),

  sendMessage: (sessionId: string, content: string) =>
    fetchApi<{ content: string }>(`/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: { text: content } }),
    }),
};
