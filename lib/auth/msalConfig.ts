import { Configuration, LogLevel } from "@azure/msal-browser";

/**
 * MSAL Configuration for Microsoft Entra ID
 *
 * For regular Entra ID (employees only):
 *   authority: "https://login.microsoftonline.com/{tenant-id}"
 *
 * For Entra External ID / CIAM (customers/partners):
 *   authority: "https://{subdomain}.ciam.login.microsoft.com/{tenant-id}"
 *   knownAuthorities: ["{subdomain}.ciam.login.microsoft.com"]
 *
 * For B2C (legacy):
 *   authority: "https://{tenant-name}.b2clogin.com/{tenant-name}.onmicrosoft.com/{policy-name}"
 *   knownAuthorities: ["{tenant-name}.b2clogin.com"]
 */

// Environment variables - set these in .env.local
const clientId = process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID || "";
const tenantId = process.env.NEXT_PUBLIC_ENTRA_TENANT_ID || "";
const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000";

// CIAM (Entra External ID) configuration
const ciamSubdomain = process.env.NEXT_PUBLIC_CIAM_SUBDOMAIN;

// B2C configuration (legacy)
const b2cTenantName = process.env.NEXT_PUBLIC_B2C_TENANT_NAME;
const b2cPolicyName = process.env.NEXT_PUBLIC_B2C_POLICY_NAME || "B2C_1_signupsignin";

const isCIAM = !!ciamSubdomain;
const isB2C = !!b2cTenantName && !isCIAM;

// Determine authority based on auth type: CIAM > B2C > Regular Entra ID
let authority: string;
let knownAuthorities: string[];

if (isCIAM) {
  // CIAM (Entra External ID) - for external customers
  authority = `https://${ciamSubdomain}.ciam.login.microsoft.com/${tenantId}`;
  knownAuthorities = [`${ciamSubdomain}.ciam.login.microsoft.com`];
} else if (isB2C) {
  // B2C (legacy)
  authority = `https://${b2cTenantName}.b2clogin.com/${b2cTenantName}.onmicrosoft.com/${b2cPolicyName}`;
  knownAuthorities = [`${b2cTenantName}.b2clogin.com`];
} else {
  // Multi-tenant Entra ID - use /common for any Microsoft account
  // Use /organizations for work/school only, /consumers for personal only
  authority = `https://login.microsoftonline.com/common`;
  knownAuthorities = [];
}

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

// Scopes for login - basic profile scopes (idToken)
export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

// Scopes for calling your backend API (if registered in Azure AD)
export const apiRequest = {
  scopes: ["openid", "profile", "email"],
};
