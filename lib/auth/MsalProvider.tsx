"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  PublicClientApplication,
  EventType,
  AuthenticationResult,
  BrowserAuthError,
} from "@azure/msal-browser";
import { MsalProvider as MsalReactProvider } from "@azure/msal-react";
import { msalConfig } from "./msalConfig";

// Create MSAL instance (singleton)
const msalInstance = new PublicClientApplication(msalConfig);

// Track initialization state
let initializationPromise: Promise<void> | null = null;
let isInitialized = false;

// Initialize MSAL once
async function initializeMsal(): Promise<void> {
  if (isInitialized) return;

  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        console.log("[Auth] Initializing MSAL...");
        await msalInstance.initialize();

        // Handle any redirect response
        try {
          const response = await msalInstance.handleRedirectPromise();
          if (response) {
            console.log("[Auth] Redirect login successful");
            msalInstance.setActiveAccount(response.account);
          }
        } catch (redirectError) {
          console.error("[Auth] Redirect handling error:", redirectError);
          clearStuckAuthState();
        }

        // Set active account if one exists
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
          console.log("[Auth] Active account set:", accounts[0].username);
        }

        // Listen for auth events
        msalInstance.addEventCallback((event) => {
          if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
            const payload = event.payload as AuthenticationResult;
            msalInstance.setActiveAccount(payload.account);
            console.log("[Auth] Login success:", payload.account?.username);
          }
          if (event.eventType === EventType.LOGIN_FAILURE) {
            console.error("[Auth] Login failed:", event.error);
            clearStuckAuthState();
          }
          if (event.eventType === EventType.ACQUIRE_TOKEN_FAILURE) {
            console.error("[Auth] Token acquisition failed:", event.error);
          }
        });

        isInitialized = true;
        console.log("[Auth] MSAL initialized successfully");
      } catch (error) {
        console.error("[Auth] MSAL initialization failed:", error);
        initializationPromise = null;
        throw error;
      }
    })();
  }

  return initializationPromise;
}

// Clear stuck authentication state from session storage
function clearStuckAuthState(): void {
  console.log("[Auth] Clearing stuck auth state...");
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.includes("msal.interaction.status") ||
        key.includes("msal.request.params") ||
        key.includes("msal.temp") ||
        key.includes("interaction_in_progress")
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      console.log("[Auth] Removed:", key);
    });
  } catch (e) {
    console.error("[Auth] Error clearing auth state:", e);
  }
}

// Export for external use
export function resetAuthState(): void {
  clearStuckAuthState();
  window.location.reload();
}

interface Props {
  children: ReactNode;
}

export function MsalProvider({ children }: Props) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Set a timeout for initialization (10 seconds)
    timeoutId = setTimeout(() => {
      if (mounted && !ready) {
        console.error("[Auth] Initialization timeout - clearing stuck state");
        clearStuckAuthState();
        setError("Authentication initialization timed out. Please refresh the page.");
      }
    }, 10000);

    initializeMsal()
      .then(() => {
        if (mounted) {
          setReady(true);
          clearTimeout(timeoutId);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error("[Auth] Init error:", err);
          clearTimeout(timeoutId);

          // Handle specific MSAL errors
          if (err instanceof BrowserAuthError) {
            if (err.errorCode === "interaction_in_progress") {
              clearStuckAuthState();
              setError("Previous login was interrupted. Please try again.");
            } else {
              setError(`Authentication error: ${err.errorMessage}`);
            }
          } else {
            setError("Failed to initialize authentication. Please refresh.");
          }
        }
      });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [ready]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => {
              clearStuckAuthState();
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reset & Refresh
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500 mb-2">Initializing authentication...</div>
          <div className="text-xs text-gray-400">If this takes too long, try refreshing</div>
        </div>
      </div>
    );
  }

  return (
    <MsalReactProvider instance={msalInstance}>
      {children}
    </MsalReactProvider>
  );
}

export { msalInstance };
