# NetaBridge Authentication Status & Plan

## Current State (Feb 27, 2026)

### What's Working
- **Dev Mode Login**: Email-only login via backend's `/api/v1/auth/dev/login` endpoint
- **Backend**: Has `DEV_MODE=True`, accepts dev login requests
- **Frontend**: Shows "Development Mode" indicator, no password required

### What's NOT Working
- **Microsoft SSO**: Disabled (greyed out with "Soon" badge)
- **Google/LinkedIn SSO**: Not implemented

---

## Original Goal

Use Microsoft Entra ID for SSO authentication:
1. User clicks "Continue with Microsoft"
2. User authenticates with Microsoft
3. User lands on dashboard, fully authenticated

---

## Problem Discovered

### The Setup Had Two Separate Azure AD Tenants

| Component | Tenant ID | Client ID |
|-----------|-----------|-----------|
| **Frontend (MSAL.js)** | `75ca4369-27c7-44c7-b22d-736f8986f8f5` | `628b2c60-dd5c-409b-9630-964477f7abbb` |
| **Backend API** | `3941a9dd-5463-4cdc-b641-0db1621004fa` | `113303a5-ee97-48ea-9adf-cc6c3bf6f8a6` |

### Why This Caused Issues
1. Frontend MSAL.js obtained tokens from **Frontend tenant**
2. Tokens had `audience` = Frontend Client ID
3. Backend expected tokens from **Backend tenant** with its own audience
4. Result: `401 Unauthorized - Audience doesn't match`

---

## Solution Options

### Option 1: Backend-Driven OAuth (Recommended)

**How it works:**
- Frontend redirects to backend's OAuth endpoint
- Backend handles entire Microsoft OAuth flow
- Backend issues its own JWT to frontend
- No MSAL.js needed on frontend

**Status:** Frontend is ready, waiting for backend implementation.

**Backend needs to implement:**

```python
# 1. GET /api/v1/auth/microsoft/login (PUBLIC - no API key)
@router.get("/microsoft/login")
async def microsoft_login(redirect_uri: str):
    """Redirect user to Microsoft login"""
    state = encode_state(redirect_uri)  # Store frontend URL
    auth_url = build_microsoft_auth_url(
        client_id=ENTRA_CLIENT_ID,
        redirect_uri=f"{BACKEND_URL}/api/v1/auth/microsoft/callback",
        state=state,
        scope="openid profile email"
    )
    return RedirectResponse(url=auth_url)

# 2. GET /api/v1/auth/microsoft/callback (PUBLIC - no API key)
@router.get("/microsoft/callback")
async def microsoft_callback(code: str, state: str):
    """Handle Microsoft OAuth callback"""
    # Exchange code for tokens
    tokens = await exchange_code_for_tokens(code)

    # Get user info from ID token
    user_info = decode_id_token(tokens["id_token"])

    # Create/update user in database
    user = await upsert_user(user_info)

    # Generate backend JWT
    jwt_token = create_access_token(user)

    # Redirect to frontend with token
    frontend_url = decode_state(state)
    return RedirectResponse(url=f"{frontend_url}?token={jwt_token}")
```

**Important:** These endpoints must be PUBLIC (no API key required) because browser redirects cannot include headers.

**Pros:**
- Single source of truth for auth
- No token/audience mismatch issues
- Backend controls all security
- Frontend is simple

**Cons:**
- Requires backend work

---

### Option 2: Fix Azure AD Configuration

**How it works:**
- Put frontend and backend in SAME Azure AD tenant
- Or configure backend to accept tokens from frontend's tenant

**What would need to change:**
1. Register backend API in frontend's tenant, OR
2. Register frontend app in backend's tenant
3. Update all client IDs and tenant IDs
4. Re-enable MSAL.js on frontend

**Pros:**
- Frontend handles auth directly (current MSAL.js pattern)
- Backend just validates tokens

**Cons:**
- Azure AD configuration is complex
- Current tenant setup may have been intentional
- MSAL.js adds complexity to frontend

---

### Option 3: Stay in Dev Mode (Temporary)

**Current workaround:**
- Use email-only login via `/api/v1/auth/dev/login`
- No Microsoft SSO
- Works for development/testing

**Limitations:**
- Not production-ready
- No real authentication
- Anyone can login with any email

---

## Files Changed (Frontend)

| File | Change |
|------|--------|
| `lib/auth/AuthProvider.tsx` | Created - simple token management |
| `lib/auth/MsalProvider.tsx` | Deleted - removed MSAL.js |
| `lib/auth/msalConfig.ts` | Deleted - removed MSAL config |
| `app/login/page.tsx` | Simplified - redirects to backend OAuth |
| `app/dashboard/page.tsx` | Updated - fallback user from JWT |
| `package.json` | Removed `@azure/msal-browser`, `@azure/msal-react` |

---

## Environment Variables

### Frontend (Current)
```env
NEXT_PUBLIC_API_URL=https://idealring-api...
NEXT_PUBLIC_API_KEY=Neta_Is_Here_101
NEXT_PUBLIC_ENTRA_CLIENT_ID=00000000-0000-0000-0000-000000000000  # Placeholder = dev mode
```

### Backend (Current - from Azure)
```env
ENTRA_TENANT_ID=3941a9dd-5463-4cdc-b641-0db1621004fa
ENTRA_CLIENT_ID=113303a5-ee97-48ea-9adf-cc6c3bf6f8a6
ENTRA_CLIENT_SECRET=NBi8Q~...  # Has secret for server-side OAuth
DEV_MODE=True
API_KEY=Neta_Is_Here_101
```

---

## Next Steps

### For Production Microsoft SSO:

1. **Backend dev implements OAuth endpoints** (Option 1)
   - `GET /api/v1/auth/microsoft/login`
   - `GET /api/v1/auth/microsoft/callback`
   - Make both PUBLIC (no API key check)

2. **Frontend re-enables Microsoft button**
   - Change `disabled` to `onClick={handleMicrosoftLogin}`
   - Remove "Soon" badge
   - Set real `ENTRA_CLIENT_ID` in workflow

3. **Test end-to-end flow**

### For Now:
- Use dev mode login (email only)
- All SSO buttons greyed out
- Works for development/demo

---

## Contacts

- **Frontend**: This repo (Netabridge_Frontend_V2)
- **Backend**: idealring-api (Azure Container App)
- **Backend Dev**: (coordinate for OAuth endpoint implementation)
