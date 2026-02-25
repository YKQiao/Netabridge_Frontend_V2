# Vercel Deployment Guide

Deploy the NetaBridge frontend to Vercel.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub repo access
- Backend API deployed (Azure staging or production)

## Quick Deploy

### Option 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Set **Root Directory** to `src/web`
4. Framework Preset: **Next.js** (auto-detected)
5. Add Environment Variables (see below)
6. Click **Deploy**

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd src/web

# Deploy
vercel

# For production
vercel --prod
```

## Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://idealring-api.azurewebsites.net` |
| `NEXT_PUBLIC_API_KEY` | API key for backend | `your-api-key` |
| `NEXT_PUBLIC_ENTRA_CLIENT_ID` | Entra External ID Client ID | `e11df852-1343-...` |
| `NEXT_PUBLIC_ENTRA_TENANT_ID` | Entra Tenant ID | `75ca4369-27c7-...` |
| `NEXT_PUBLIC_REDIRECT_URI` | OAuth redirect (your Vercel URL) | `https://yourapp.vercel.app` |

### Environment-Specific Variables

Use Vercel's environment scoping:
- **Production**: `https://netabridge.vercel.app`
- **Preview**: `https://netabridge-git-*.vercel.app`
- **Development**: `http://localhost:7000`

## Project Configuration

### vercel.json (Optional)

Create `src/web/vercel.json` if you need custom config:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Build Settings in Vercel Dashboard

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `src/web` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node.js Version | 20.x |

## Entra External ID Configuration

After deploying to Vercel, update your Azure Entra External ID app registration:

1. Go to Azure Portal → Entra External ID → App Registrations
2. Select your app
3. Go to **Authentication** → **Platform configurations**
4. Add redirect URIs:
   - `https://yourapp.vercel.app` (production)
   - `https://yourapp-git-*.vercel.app` (preview branches)

## Monorepo Setup

Since this is a monorepo with backend in `src/backend`:

### Vercel Ignore Build Step (Optional)

To only rebuild when frontend changes, create `src/web/vercel-ignore-build.sh`:

```bash
#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

# Check if changes are in src/web
git diff HEAD^ HEAD --quiet src/web
if [ $? -eq 0 ]; then
  echo "No changes in src/web, skipping build"
  exit 0
else
  echo "Changes detected in src/web, proceeding with build"
  exit 1
fi
```

Then in Vercel Dashboard → Settings → Git → Ignored Build Step:
```
bash src/web/vercel-ignore-build.sh
```

## Domain Setup

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `app.netabridge.com`)
3. Configure DNS:
   - **CNAME**: `app` → `cname.vercel-dns.com`
   - Or use Vercel nameservers for full DNS management

## Troubleshooting

### Build Fails with "Can't resolve 'tailwindcss'"

Ensure you're building from `src/web` directory, not root.

### 401 Unauthorized from API

1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify `NEXT_PUBLIC_API_KEY` is set
3. Ensure backend CORS allows your Vercel domain

### Entra Login Fails

1. Verify redirect URI matches exactly (including https://)
2. Check `NEXT_PUBLIC_ENTRA_CLIENT_ID` is correct
3. Ensure app registration has correct redirect URIs

## CI/CD

Vercel automatically deploys:
- **Production**: On push to `main` branch
- **Preview**: On pull requests

### GitHub Integration

1. Connect your GitHub repo in Vercel
2. Enable automatic deployments
3. Preview deployments are created for each PR

## Cost

- **Hobby (Free)**: Good for development/testing
- **Pro ($20/mo)**: Production use, team features
- **Enterprise**: Custom pricing

---

## Quick Reference

```bash
# Local development
cd src/web
npm run dev -- --port 7000

# Build locally
npm run build

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```
