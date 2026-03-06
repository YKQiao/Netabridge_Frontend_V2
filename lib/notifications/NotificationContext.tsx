"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NotificationCounts {
  unreadMessages: number;
  pendingConnections: number;
}

interface NotificationContextValue extends NotificationCounts {
  /** Total badge count (messages + connections). */
  total: number;
  /** Force a refresh of counts. */
  refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// API response shapes (only the fields we need)
// ---------------------------------------------------------------------------

interface ConversationSummary {
  id: string;
  unread_count: number;
}

interface ConnectionSummary {
  connection_id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  initiated_by_me?: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const NotificationContext = createContext<NotificationContextValue>({
  unreadMessages: 0,
  pendingConnections: 0,
  total: 0,
  refresh: async () => {},
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const POLL_INTERVAL = 12_000; // 12 seconds

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    unreadMessages: 0,
    pendingConnections: 0,
  });
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const consecutiveFailsRef = useRef(0);

  const fetchCounts = useCallback(async () => {
    if (!mountedRef.current) return;
    // Stop polling after 3 consecutive failures (e.g. session expired)
    if (consecutiveFailsRef.current >= 3) return;

    const thisRequest = ++requestIdRef.current;

    const [convosResult, connsResult] = await Promise.allSettled([
      apiClient.get<ConversationSummary[]>("/api/v1/messages/conversations"),
      apiClient.get<ConnectionSummary[]>("/api/v1/connections"),
    ]);

    // Ignore stale responses — a newer request was already fired
    if (!mountedRef.current || thisRequest !== requestIdRef.current) return;

    const bothFailed =
      convosResult.status === "rejected" && connsResult.status === "rejected";
    if (bothFailed) {
      consecutiveFailsRef.current++;
      return;
    }
    consecutiveFailsRef.current = 0;

    let unreadMessages = 0;
    if (convosResult.status === "fulfilled" && Array.isArray(convosResult.value)) {
      unreadMessages = convosResult.value.reduce(
        (sum, c) => sum + (c.unread_count || 0),
        0
      );
    }

    let pendingConnections = 0;
    if (connsResult.status === "fulfilled" && Array.isArray(connsResult.value)) {
      pendingConnections = connsResult.value.filter(
        (c) => c.status === "PENDING" && c.initiated_by_me === false
      ).length;
    }

    setCounts({ unreadMessages, pendingConnections });
  }, []);

  // Fetch on mount + poll
  useEffect(() => {
    mountedRef.current = true;

    if (!isAuthenticated) {
      setCounts({ unreadMessages: 0, pendingConnections: 0 });
      return;
    }

    // Reset failure counter when user (re-)authenticates
    consecutiveFailsRef.current = 0;

    fetchCounts();
    const interval = setInterval(fetchCounts, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, fetchCounts]);

  const value: NotificationContextValue = {
    ...counts,
    total: counts.unreadMessages + counts.pendingConnections,
    refresh: fetchCounts,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotifications(): NotificationContextValue {
  return useContext(NotificationContext);
}
