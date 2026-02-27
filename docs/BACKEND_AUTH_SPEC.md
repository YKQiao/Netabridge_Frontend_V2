# Backend Authentication API Specification

This document outlines the authentication endpoints required by the Neta frontend. The frontend is complete and currently falls back to dev mode when these endpoints are unavailable.

---

## Current State

### Frontend Ready
- 3-step signup with password + complexity validation
- Login with email/password
- Microsoft OAuth with forced password setup
- Account linking for existing users

### Backend Has
- `POST /api/v1/auth/dev/login` - Dev mode (email only, no password)
- `POST /api/v1/auth/sync` - Sync profile after OAuth

### Backend Needs
The endpoints below to enable full password-based authentication.

---

## Required Endpoints

### 1. `POST /api/v1/auth/register`

Create a new account with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "display_name": "John Smith"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbG...",
  "user_oid": "uuid-here"
}
```

**Errors:**
- `409 Conflict` - Email already exists
- `400 Bad Request` - Invalid password (doesn't meet complexity)

**Password Requirements:**
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

---

### 2. `POST /api/v1/auth/login`

Authenticate with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbG...",
  "user_oid": "uuid-here"
}
```

**Errors:**
- `401 Unauthorized` - Invalid email or password
- `404 Not Found` - Account doesn't exist

---

### 3. `POST /api/v1/auth/check-account`

Check if an email exists and its OAuth linking status. Used by frontend to determine login flow.

**Request:**
```json
{
  "email": "user@example.com",
  "oauth_provider": "microsoft"  // optional
}
```

**Response (200 OK):**
```json
{
  "account_exists": true,
  "is_linked": false,
  "needs_password_setup": false
}
```

**Field Descriptions:**
- `account_exists` - Does a user with this email exist?
- `is_linked` - Is the specified OAuth provider linked to this account?
- `needs_password_setup` - Does this OAuth user need to set a local password?

**Use Cases:**
| Scenario | Response |
|----------|----------|
| New user | `{account_exists: false, is_linked: false, needs_password_setup: false}` |
| Existing user, has password | `{account_exists: true, is_linked: false, needs_password_setup: false}` |
| OAuth user, no password yet | `{account_exists: true, is_linked: true, needs_password_setup: true}` |
| OAuth user, has password | `{account_exists: true, is_linked: true, needs_password_setup: false}` |

---

### 4. `POST /api/v1/auth/set-password`

Set a password for an OAuth-authenticated user (first-time setup).

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "oauth_provider": "microsoft"
}
```

**Headers:**
```
Authorization: Bearer <oauth_token>
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbG...",
  "user_oid": "uuid-here"
}
```

**Flow:**
1. User signs in with Microsoft OAuth
2. Frontend detects `needs_password_setup: true`
3. User is redirected to `/set-password`
4. User creates a password
5. Frontend calls this endpoint with OAuth token + new password

---

### 5. `POST /api/v1/auth/link-account`

Link an OAuth provider to an existing account. Requires password verification for security.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "ExistingPass123!",
  "oauth_token": "eyJhbG...",
  "oauth_provider": "microsoft"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbG...",
  "user_oid": "uuid-here"
}
```

**Errors:**
- `401 Unauthorized` - Wrong password

**Flow:**
1. User has existing email/password account
2. User tries to sign in with Microsoft (same email)
3. Frontend detects `account_exists: true, is_linked: false`
4. User is redirected to `/verify-link`
5. User enters existing password to prove ownership
6. Frontend calls this endpoint to link Microsoft to account

---

### 6. `POST /api/v1/auth/forgot-password`

Request a password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account exists, a reset email has been sent"
}
```

**Notes:**
- Always returns 200 to prevent email enumeration
- Send email with reset token (valid for 1 hour)
- Reset token should be single-use

**Flow:**
1. User enters email on `/forgot-password` page
2. Frontend calls this endpoint
3. Backend sends reset email if account exists
4. User clicks link in email → `/reset-password?token=xxx`
5. User sets new password

---

## Database Changes

Add to the `users` table:

```sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN oauth_providers JSONB DEFAULT '[]';
```

**oauth_providers example:**
```json
["microsoft", "google"]
```

---

## Security Notes

1. **Password Hashing** - Use bcrypt with cost factor 12+
2. **Rate Limiting** - Limit login attempts (e.g., 5 per minute per IP)
3. **Token Expiry** - Access tokens should expire (e.g., 24 hours)
4. **Password Validation** - Validate complexity server-side, not just frontend

---

## Dev Mode Behavior

When `DEV_MODE=true` or endpoints return 500:

1. **Signup** falls back to `/auth/dev/login` + `/auth/sync`
2. **Login** uses `/auth/dev/login` (password ignored)
3. **OAuth checks** are skipped, users go straight to dashboard

This allows frontend development without backend changes.

---

## Frontend Files Reference

| File | Purpose |
|------|---------|
| `app/signup/page.tsx` | 3-step signup with password |
| `app/login/page.tsx` | Login with email/password + OAuth |
| `app/set-password/page.tsx` | Force password setup after OAuth |
| `app/verify-link/page.tsx` | Verify existing account before linking |
| `lib/passwordValidation.ts` | Password complexity validation |
| `components/PasswordInput.tsx` | Password input with strength indicator |

---

## Testing

Once backend is ready:

1. **Signup Flow**
   - Create account with email + password
   - Verify password complexity is enforced
   - Verify duplicate email returns 409

2. **Login Flow**
   - Login with correct password
   - Verify wrong password returns 401
   - Verify non-existent email returns 404

3. **OAuth + Password Setup**
   - Sign in with Microsoft (new user)
   - Verify redirect to `/set-password`
   - Set password and verify account works

4. **Account Linking**
   - Create email/password account
   - Try Microsoft login with same email
   - Verify redirect to `/verify-link`
   - Enter password to link accounts

---

## Questions?

Contact the frontend team or check the code in the `feature/visual-fixes-login` branch.
