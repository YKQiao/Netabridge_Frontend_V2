# Backend Auth - Required Changes

## 6 New Endpoints Needed

| # | Endpoint | Purpose |
|---|----------|---------|
| 1 | `POST /api/v1/auth/register` | Create account (email + password) |
| 2 | `POST /api/v1/auth/login` | Login (email + password) |
| 3 | `POST /api/v1/auth/check-account` | Check if email exists + OAuth status |
| 4 | `POST /api/v1/auth/set-password` | Set password for OAuth users |
| 5 | `POST /api/v1/auth/link-account` | Link OAuth to existing account |
| 6 | `POST /api/v1/auth/forgot-password` | Send password reset email |

## DB Changes

```sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN oauth_providers JSONB DEFAULT '[]';
```

## Password Rules (validate server-side)

- Min 12 chars, max 128 chars
- 1 uppercase, 1 lowercase, 1 number, 1 special char
- Hash with bcrypt (cost 12+)

## Standard Response

All auth endpoints return:
```json
{ "access_token": "...", "user_oid": "..." }
```

## Full Spec

See `docs/BACKEND_AUTH_SPEC.md` for request/response details, error codes, and flows.
