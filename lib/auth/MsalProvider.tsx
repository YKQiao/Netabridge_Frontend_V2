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

// Initialize MSAL once - optimized for speed
async function initializeMsal(): Promise<void> {
  if (isInitialized) return;

  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        // Fast init - just initialize the instance
        await msalInstance.initialize();

        // Set active account immediately if one exists (sync, fast)
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
        }

        // Listen for auth events (sync, fast)
        msalInstance.addEventCallback((event) => {
          if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
            const payload = event.payload as AuthenticationResult;
            msalInstance.setActiveAccount(payload.account);
          }
          if (event.eventType === EventType.LOGIN_FAILURE) {
            clearStuckAuthState();
          }
        });

        isInitialized = true;

        // Handle redirect response AFTER marking as initialized (non-blocking)
        // This runs in background - doesn't block the UI
        msalInstance.handleRedirectPromise()
          .then((response) => {
            if (response) {
              msalInstance.setActiveAccount(response.account);
              // Trigger re-render by dispatching storage event
              window.dispatchEvent(new Event('msal:redirectComplete'));
            }
          })
          .catch((redirectError) => {
            console.error("[Auth] Redirect handling error:", redirectError);
            clearStuckAuthState();
          });

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize MSAL in background - doesn't block render
    initializeMsal().catch((err) => {
      console.error("[Auth] Init error:", err);

      // Only show error for critical auth failures
      if (err instanceof BrowserAuthError && err.errorCode === "interaction_in_progress") {
        clearStuckAuthState();
        setError("Previous login was interrupted. Please try again.");
      }
      // Other errors: log but don't block - app will work without SSO
    });
  }, []);

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

  // Render immediately - MSAL initializes in background
  return (
    <MsalReactProvider instance={msalInstance}>
      {children}
    </MsalReactProvider>
  );
}

export { msalInstance };
