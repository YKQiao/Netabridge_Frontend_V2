# NetaBridge Authentication Setup

## Overview

This document outlines all changes made to configure Microsoft Entra ID authentication for the NetaBridge frontend and backend.

## Current Configuration

### App Registration: IdealRing External App
- **Client ID**: `628b2c60-dd5c-409b-9630-964477f7abbb`
- **Tenant**: Workforce tenant `75ca4369-27c7-44c7-b22d-736f8986f8f5`
- **Sign-in Audience**: `AzureADandPersonalMicrosoftAccount` (multi-tenant)
- **Platform**: SPA (Single Page Application)

### Redirect URIs (SPA)
- `http://localhost:7000` (local dev)
- `http://localhost:3000` (alternative local)
- `https://slava-netabridge-frontend.whitepond-90b8fa05.canadacentral.azurecontainerapps.io` (Azure)

### API Permissions
- `User.Read` (Microsoft Graph) - delegated

---

## Changes Made

### 1. Azure App Registration

| Change | Before | After |
|--------|--------|-------|
| Added SPA redirect URIs | Only Web URIs | SPA URIs for localhost:7000, localhost:3000, Azure URL |
| Added API permission | None | User.Read (Microsoft Graph) |

### 2. Backend (idealring-api) Environment Variables

| Variable | Before | After |
|----------|--------|-------|
| `ENTRA_CLIENT_ID` | `113303a5-ee97-48ea-9adf-cc6c3bf6f8a6` | `628b2c60-dd5c-409b-9630-964477f7abbb` |
| `ENTRA_TENANT_ID` | `3941a9dd-5463-4cdc-b641-0db1621004fa` (CIAM) | `75ca4369-27c7-44c7-b22d-736f8986f8f5` (Workforce) |
| `AUTH_PROVIDER` | `supabase` | `entra` |

### 3. Frontend Configuration

#### .env.local
```env
NEXT_PUBLIC_ENTRA_CLIENT_ID=628b2c60-dd5c-409b-9630-964477f7abbb
NEXT_PUBLIC_ENTRA_TENANT_ID=75ca4369-27c7-44c7-b22d-736f8986f8f5
NEXT_PUBLIC_REDIRECT_URI=http://localhost:7000
```

#### msalConfig.ts
- Changed authority from specific tenant to `/common` for multi-tenant support
- Added CIAM authority support (for future use)
- Authority: `https://login.microsoftonline.com/common`

#### MsalProvider.tsx
- Added 10-second timeout for stuck initialization
- Added automatic clearing of stuck auth state from sessionStorage
- Added better error logging with `[Auth]` prefix
- Added "Reset & Refresh" button on errors

### 4. GitHub Actions Workflow

Updated `.github/workflows/deploy-azure.yml`:
```yaml
NEXT_PUBLIC_ENTRA_CLIENT_ID: 628b2c60-dd5c-409b-9630-964477f7abbb
NEXT_PUBLIC_ENTRA_TENANT_ID: 75ca4369-27c7-44c7-b22d-736f8986f8f5
```

---

## Why External Users Can Sign In (Multi-Tenant)

The app is configured with `signInAudience: "AzureADandPersonalMicrosoftAccount"` which allows:

1. **Work/School accounts** from ANY Azure AD tenant (not just the home tenant)
2. **Personal Microsoft accounts** (outlook.com, hotmail.com, etc.)

The authority `/common` enables this by not restricting to a specific tenant.

### First-Time Sign-In for External Users
When users from other tenants sign in for the first time, they see a **consent prompt** asking them to allow the app to access their basic profile. They must click "Accept" to proceed.

---

## Limitations of Current Setup

### What This Setup CAN Do
- Allow existing Microsoft users to sign in
- Support users from any Azure AD tenant
- Support personal Microsoft accounts
- Validate tokens and sync users to the backend database

### What This Setup CANNOT Do (Requires CIAM)
- **Self-service sign-up**: Users cannot create NEW accounts
- **Email/password registration**: No local accounts
- **Social logins**: Google, Facebook, etc. not available
- **User management portal**: No self-service profile editing
- **Custom user flows**: No customizable sign-up/sign-in experiences
- **Passwordless auth**: No email OTP or magic links

### To Enable Full Customer Sign-Up Features
You need **Entra External ID (CIAM)** tenant (`3941a9dd-5463-4cdc-b641-0db1621004fa`):
1. Create app registration in CIAM tenant
2. Configure user flows for sign-up/sign-in
3. Update frontend to use CIAM authority: `https://netabridge.ciam.login.microsoft.com/{tenant-id}`
4. Update backend to validate tokens from CIAM tenant

---

## Tenant Reference

| Tenant | ID | Purpose |
|--------|-----|---------|
| Workforce (guannetabridge) | `75ca4369-27c7-44c7-b22d-736f8986f8f5` | Internal employees, current setup |
| CIAM (netabridge) | `3941a9dd-5463-4cdc-b641-0db1621004fa` | External customers, future setup |

---

## Testing Authentication

### Local Development
1. Run `npm run dev -- -p 7000`
2. Go to `http://localhost:7000/login`
3. Click "Continue with Microsoft"
4. Sign in with any Microsoft account
5. Accept consent prompt (first time only)

### Debugging
- Check browser console for `[Auth]` prefixed logs
- Token info is logged after successful login (aud, tid, oid)
- If stuck, run in browser console: `sessionStorage.clear(); location.reload()`
