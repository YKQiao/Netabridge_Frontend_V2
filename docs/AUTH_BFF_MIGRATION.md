# Auth BFF Migration

**Branch:** `guan/auth_bff`  
**Date:** 2026-02-28  
**Author:** Guan

---

## Overview

Full replacement of the legacy sessionStorage-based JWT authentication with a **Backend-for-Frontend (BFF) session-cookie pattern**. The frontend no longer reads, writes, or decodes JWTs — all session state is managed via an HttpOnly cookie (`idealring_session`) set by the backend after authentication.

---

## Motivation

The previous implementation:
- Stored `access_token` in `sessionStorage` across every page (XSS-vulnerable)
- Required each page to decode the JWT manually (`atob(token.split('.')[1])`)
- Used MSAL.js with a two-tenant Azure AD configuration that caused `401 Audience mismatch` errors
- Had no centralised auth state — each page independently checked `sessionStorage`

---

## Architecture After Migration

```
Browser                      Backend
  │                             │
  │── GET /auth/login ─────────▶│ (Entra OAuth redirect)
  │◀── 302 + Set-Cookie ────────│ (idealring_session HttpOnly)
  │                             │
  │── GET /api/v1/auth/me ─────▶│ (cookie sent automatically)
  │◀── { id, email, ... } ──────│
  │                             │
  │  All subsequent API calls   │
  │── credentials: "include" ──▶│ (cookie attached by browser)
```

**Dev mode** (no Entra client ID configured): backend issues a short-lived HS256 JWT via `POST /auth/dev/login`. This JWT is held **in React module state only** (never `localStorage`/`sessionStorage`) and injected as a `Bearer` header by `apiClient`.

---

## Files Changed

### Deleted
| File | Reason |
|---|---|
| `lib/api.ts` | Replaced by `lib/api/client.ts` |
| `lib/auth/useAuth.ts` | Logic absorbed into `AuthProvider.tsx` |
| `docs/AUTH_SETUP.md` | Superseded by this document |
| `docs/AUTH_STATUS.md` | Superseded by this document |
| `docs/BACKEND_AUTH_SPEC.md` | Superseded — spec was for the old password-based flow |
| `docs/BACKEND_TODO.md` | Superseded |
| `postcss.config.mjs` | Removed (Tailwind v4 handles PostCSS internally) |
| `public/PARTICLES_CONFIG.md` | Cleanup of stale dev doc |
| `public/logo.png` | Moved out of public root |
| `scripts/config_new_azure_auth.py` | No longer needed |

### New Files
| File | Purpose |
|---|---|
| `lib/api/client.ts` | Typed BFF API client — wraps `fetch` with `credentials: "include"`, Bearer header injection, `ApiRequestError`, and a 401 → `/login?expired=1` redirect |
| `lib/__tests__/passwordValidation.test.ts` | 16 unit tests for `validateEmail`, `validatePassword`, `doPasswordsMatch` |
| `lib/__tests__/client.test.ts` | 13 unit tests for token store, `ApiRequestError`, HTTP verbs, error responses |
| `lib/__tests__/AuthProvider.test.tsx` | 11 tests for session bootstrap, dev-token listener, `refreshUser`, `logout` |
| `app/__tests__/login.test.tsx` | 8 tests for dev-mode form, production Microsoft button, error states |
| `jest.config.js` | Jest config using `next/jest` transformer and `jest-environment-jsdom` |
| `jest.setup.ts` | Imports `@testing-library/jest-dom` |
| `docs/AUTH_BFF_MIGRATION.md` | This file |

### Modified — Library
| File | Summary of changes |
|---|---|
| `lib/auth/AuthProvider.tsx` | Full rewrite. Now exports `AuthProvider` (React context), `useAuth()` hook, `setAccessToken`, `getAccessToken`, `clearAuth`. Calls `GET /auth/me` on mount. Subscribes to dev-token changes via module-level `_listeners` Set. |
| `lib/auth/previewMode.ts` | Removed `sessionStorage` reads; `initDemoSession` now no-ops (cookie flow handles session). Added `NEXT_PUBLIC_PREVIEW_MODE` env support. |
| `lib/passwordValidation.ts` | Cleaned up; no functional changes to validation logic. |
| `lib/particles.ts` | Minor cleanup. |
| `next.config.ts → next.config.mjs` | Renamed for Next.js 14 ESM compatibility. |
| `package.json` | Removed `@azure/msal-browser`, `@azure/msal-react`. Added `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@types/jest`. Added `test`, `test:watch`, `test:coverage` scripts. |
| `tsconfig.json` | Regenerated with standard Next.js 14 defaults. |
| `.env.local.example` | Added `NEXT_PUBLIC_PREVIEW_MODE`. |

### Modified — Pages
All pages migrated from manual `sessionStorage.getItem("access_token")` + fetch to `useAuth()` + `apiClient.*`.

| Page | Key changes |
|---|---|
| `app/login/page.tsx` | Full rewrite. Production: "Continue with Microsoft" → `window.location.href = ${API_BASE_URL}/auth/login`. Dev mode: email/password form → `POST /auth/dev/login` → `setAccessToken()` → `refreshUser()` → push `/dashboard`. |
| `app/signup/page.tsx` | Removed duplicate `export default` (had two). Uses `fetch` directly (registration flow, no auth required). |
| `app/dashboard/page.tsx` | Replaced JWT decode + sessionStorage with `useAuth()`. |
| `app/profile/page.tsx` | `useAuth()` + redirect if unauthenticated. |
| `app/settings/page.tsx` | `useAuth()` + `apiClient.get/patch` for profile CRUD. |
| `app/discover/page.tsx` | `useAuth()` + redirect. |
| `app/connections/page.tsx` | `useAuth()` + `apiClient` for all invite/accept/reject handlers. |
| `app/resources/page.tsx` | `useAuth()` + `apiClient` for resource CRUD. |
| `app/chat/page.tsx` | `useAuth()` + `apiClient` + `credentials: "include"` for streaming. |
| `app/buy-requests/page.tsx` | `useAuth()` + `apiClient` for buy-post CRUD. |
| `app/forgot-password/page.tsx` | Fixed import (`lucide-react` → `@phosphor-icons/react`). Uses `API_BASE_URL` from `apiClient`. |
| `app/set-password/page.tsx` | Rewritten as informational page — delegates to Microsoft account portal (BFF pattern has no local password). |
| `app/verify-link/page.tsx` | Rewritten as informational page — account linking is handled server-side. |
| `app/page.tsx` | Root redirect now uses `getAccessToken()` instead of `sessionStorage`. |

---

## Key Design Decisions

### No sessionStorage
Zero references to `sessionStorage` remain in any `app/**` file. Confirmed by grep.

### Single Auth Source of Truth
`GET /api/v1/auth/me` is the only call that determines who the user is. The provider calls it on mount and whenever the dev-mode token changes.

### Dev Mode is Opt-In
Dev mode activates only when `NEXT_PUBLIC_ENTRA_CLIENT_ID` is absent or equals the placeholder `00000000-0000-0000-0000-000000000000`. Production builds with a real client ID get the Microsoft SSO button.

### Error Handling
`ApiRequestError` is thrown on all non-2xx responses. `401` additionally performs a deferred `window.location` redirect to `/login?expired=1`.

---

## Test Coverage

Run with `npm test`.

| Suite | Tests | Coverage area |
|---|---|---|
| `passwordValidation.test.ts` | 16 | Email, password requirements, match |
| `client.test.ts` | 13 | Token store, HTTP verbs, 401/500/204 |
| `AuthProvider.test.tsx` | 11 | Bootstrap, token listener, logout, refreshUser |
| `login.test.tsx` | 8 | Dev form, production SSO, error states |
| **Total** | **58** | |

---

## Environment Variables Required

```env
NEXT_PUBLIC_API_URL=https://idealring-api.<region>.azurecontainerapps.io
NEXT_PUBLIC_API_KEY=<your-api-key>

# Production: set to real Entra client ID to enable Microsoft SSO
# Dev/staging: omit or use placeholder to enable email login form
NEXT_PUBLIC_ENTRA_CLIENT_ID=00000000-0000-0000-0000-000000000000

# Optional: bypass auth entirely with a demo user
NEXT_PUBLIC_PREVIEW_MODE=false
```

---

## What the Backend Needs

For production Microsoft SSO to work end-to-end, the backend must implement:

- `GET /api/v1/auth/login` — initiate Entra OAuth redirect (public, no API key)
- `GET /api/v1/auth/callback` — handle Entra callback, set `idealring_session` cookie, redirect to `/dashboard`
- `GET /api/v1/auth/me` — validate cookie, return `{ id, email, display_name }`
- `GET /api/v1/auth/logout` — clear cookie, redirect to Entra global logout

These endpoints must allow browser requests without the `X-API-Key` header, since browser redirects cannot carry custom headers.
