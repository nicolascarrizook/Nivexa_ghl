# Vercel Deployment - Quick Start

## 5-Minute Deployment Guide

### Step 1: Get Supabase Credentials
```bash
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to Settings > API
4. Copy these values:
   - Project URL → VITE_SUPABASE_URL
   - anon/public key → VITE_SUPABASE_ANON_KEY
```

### Step 2: Deploy to Vercel

**Option A: One-Click Deploy**
1. Click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)
2. Connect your Git repository
3. Add environment variables (from Step 1)
4. Click "Deploy"

**Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel login
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
# (paste your URL when prompted)

vercel env add VITE_SUPABASE_ANON_KEY
# (paste your anon key when prompted)

# Deploy to production
vercel --prod
```

### Step 3: Configure Supabase Redirects
```bash
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your Vercel URL to Site URL: https://your-project.vercel.app
3. Add to Redirect URLs:
   - https://your-project.vercel.app
   - https://your-project.vercel.app/**
```

## Environment Variables Required

| Variable | Where to Find | Example |
|----------|---------------|---------|
| `VITE_SUPABASE_URL` | Supabase > Settings > API > Project URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase > Settings > API > anon/public | `eyJhbGciOi...` |

## Build Configuration

The project is configured to use:
- **Build Command**: `npm run build:skip-check` (skips TS errors in Storybook/tests)
- **Output Directory**: `dist`
- **Framework**: Vite
- **Node Version**: 18+ (automatic on Vercel)

## Troubleshooting

### Build Fails
```bash
# Check build locally first
npm run build:skip-check

# If successful, redeploy to Vercel
vercel --prod
```

### Environment Variables Not Working
```bash
# Variables are build-time only
# After adding/changing them, redeploy:
vercel --prod
```

### 404 on Page Refresh
This should not happen - `vercel.json` handles SPA routing.
If it does, check that `vercel.json` exists in your repo.

### Supabase Connection Fails
1. Verify env vars in Vercel Dashboard
2. Check they start with `VITE_` prefix
3. Ensure CORS is configured in Supabase (add Vercel domain)

## Next Steps

After successful deployment:

1. **Custom Domain** (optional)
   - Vercel Dashboard > Settings > Domains
   - Add your domain and configure DNS

2. **Analytics** (optional)
   - Enable Vercel Analytics in Dashboard
   - Install `@vercel/speed-insights` for performance monitoring

3. **CI/CD** (automatic)
   - Push to main branch = production deploy
   - Pull requests = preview deploys

## Links

- Full Deployment Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard

---

**Need Help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting.
