import { Configuration, LogLevel } from "@azure/msal-browser";

/**
 * MSAL Configuration for Microsoft Entra ID
 *
 * For regular Entra ID (employees only):
 *   authority: "https://login.microsoftonline.com/{tenant-id}"
 *
 * For Entra External ID / B2C (customers/partners):
 *   authority: "https://{tenant-name}.b2clogin.com/{tenant-name}.onmicrosoft.com/{policy-name}"
 *   knownAuthorities: ["{tenant-name}.b2clogin.com"]
 */

// Environment variables - set these in .env.local
const clientId = process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID || "";
const tenantId = process.env.NEXT_PUBLIC_ENTRA_TENANT_ID || "";
const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000";

// Determine authority based on whether we're using B2C or regular Entra ID
const b2cTenantName = process.env.NEXT_PUBLIC_B2C_TENANT_NAME;
const b2cPolicyName = process.env.NEXT_PUBLIC_B2C_POLICY_NAME || "B2C_1_signupsignin";

const isB2C = !!b2cTenantName;

const authority = isB2C
  ? `https://${b2cTenantName}.b2clogin.com/${b2cTenantName}.onmicrosoft.com/${b2cPolicyName}`
  : `https://login.microsoftonline.com/${tenantId}`;

const knownAuthorities = isB2C ? [`${b2cTenantName}.b2clogin.com`] : [];

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    knownAuthorities,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        // Don't log PII
        if (containsPii) return;

        // Filter out noisy/expected errors
        const suppressedMessages = [
          "popup_window_error",
          "window closed",
          "user_cancelled",
          "monitorPopupForHash",
          "Hash does not contain",
        ];

        const shouldSuppress = suppressedMessages.some(msg =>
          message.toLowerCase().includes(msg.toLowerCase())
        );

        if (shouldSuppress) return;

        // Only log actual errors in production
        if (level === LogLevel.Error) {
          console.error("[Auth]", message);
        }
      },
      // Only log errors, not warnings
      logLevel: LogLevel.Error,
    },
  },
};

// Scopes for login - adjust based on your API permissions
export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

// Scopes for calling your backend API
export const apiRequest = {
  scopes: [`api://${clientId}/access_as_user`],
};
