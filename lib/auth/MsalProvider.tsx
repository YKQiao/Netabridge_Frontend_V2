"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  PublicClientApplication,
  EventType,
  AuthenticationResult,
} from "@azure/msal-browser";
import { MsalProvider as MsalReactProvider } from "@azure/msal-react";
import { msalConfig } from "./msalConfig";

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Handle redirect promise on load
msalInstance.initialize().then(() => {
  // Handle redirect response
  msalInstance.handleRedirectPromise().then((response) => {
    if (response) {
      msalInstance.setActiveAccount(response.account);
    }
  });

  // Set active account if one exists
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  // Listen for sign-in events
  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      msalInstance.setActiveAccount(payload.account);
    }
  });
});

interface Props {
  children: ReactNode;
}

export function MsalProvider({ children }: Props) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    msalInstance.initialize().then(() => {
      setIsInitialized(true);
    });
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Initializing...</div>
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
