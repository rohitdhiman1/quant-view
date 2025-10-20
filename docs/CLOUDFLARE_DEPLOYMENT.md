# Cloudflare Pages Deployment Guide

**Date**: October 20, 2025  
**Project**: Quant View - Static Next.js Dashboard  
**Status**: Ready for Deployment ✅

---

## ✅ Perfect for Cloudflare Pages

Your project is **ideal** for Cloudflare Pages deployment:

### Why It Works Perfectly

| Requirement | Your Project | Status |
|-------------|--------------|--------|
| **Static Export** | `output: 'export'` in `next.config.ts` | ✅ Perfect |
| **Static JSON Files** | 5.9 MB data directory | ✅ Well within limits |
| **Build Output Size** | 9.8 MB total | ✅ Under 25 MB limit |
| **No API Routes** | Pure static site | ✅ No edge functions needed |
| **No Database** | File-based data | ✅ No external services |

### Cloudflare Pages Limits (All Passed)

| Limit | Your Project | Headroom |
|-------|--------------|----------|
| **Max File Size** | 25 MB | 9.8 MB ✅ (60% unused) |
| **Max Files** | 20,000 files | ~100 files ✅ (99.5% unused) |
| **Max Functions Size** | 1 MB per function | N/A (no functions) ✅ |
| **Free Builds/Month** | 500 builds | Unlimited usage ✅ |
| **Free Bandwidth** | Unlimited | Perfect ✅ |

---

## 🚀 Deployment Methods

### Method 1: Direct Git Integration (Recommended)

**Easiest and most automated approach**

#### Step 1: Push to GitHub (if not already)

```bash
cd /Users/rohitdhiman/Documents/MyProjects/quant-view

# Initialize git if needed
git init
git add .
git commit -m "Initial commit: Quant View Dashboard"

# Push to GitHub
git remote add origin https://github.com/rohitdhiman1/quant-view.git
git push -u origin main
```

#### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**
3. Authorize Cloudflare to access your GitHub
4. Select repository: `rohitdhiman1/quant-view`

#### Step 3: Configure Build Settings

```yaml
Production Branch: main
Build Command: pnpm run build
Build Output Directory: out
Root Directory: (leave empty)
Environment Variables: (none needed)
```

**Build Configuration Details**:
- Framework preset: **Next.js (Static HTML Export)**
- Node version: **18** or **20** (auto-detected)
- Package manager: **pnpm** (auto-detected from `pnpm-lock.yaml`)

#### Step 4: Deploy

Click **Save and Deploy** → Cloudflare builds and deploys automatically!

**First build time**: ~2-3 minutes  
**Subsequent builds**: ~1-2 minutes

---

### Method 2: Wrangler CLI (Advanced)

**For local testing and manual deployments**

#### Installation

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

#### Deploy from Local

```bash
# Build locally first
pnpm run build

# Deploy to Cloudflare Pages
wrangler pages deploy out --project-name=quant-view

# Or use a custom domain
wrangler pages deploy out --project-name=quant-view --branch=main
```

#### Create wrangler.toml (Optional)

```toml
name = "quant-view"
compatibility_date = "2025-10-20"

[site]
bucket = "./out"
```

---

## 📁 Project Structure for Cloudflare

Your current structure is **perfect**:

```
quant-view/
├── out/                    ← Deployed to Cloudflare
│   ├── index.html
│   ├── _next/
│   │   ├── static/
│   │   └── chunks/
│   ├── data/               ← JSON files (symlinked from ../data)
│   │   ├── treasury_1y.json
│   │   ├── sp500.json
│   │   └── metadata.json
│   └── ...
├── data/                   ← Source data (5.9 MB)
│   └── *.json
├── public/
│   └── data -> ../data     ← Symlink (works in build)
├── next.config.ts          ← output: 'export' ✅
└── package.json
```

**Key Points**:
- ✅ Symlink (`public/data → ../data`) resolves during build
- ✅ All JSON files copied to `out/data/` 
- ✅ Static HTML files load JSON via fetch at runtime
- ✅ No server-side rendering needed

---

## 🔧 Build Configuration

### package.json Scripts (Already Configured)

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",  // ← Cloudflare runs this
    "start": "next start"                // ← Not used (static export)
  }
}
```

### next.config.ts (Already Configured)

```typescript
const nextConfig = {
  output: 'export',      // ← Static HTML export
  trailingSlash: true,   // ← Clean URLs
}
```

**No changes needed!** ✅

---

## 🌍 Custom Domain Setup

### Option 1: Cloudflare-Managed Domain

If your domain is on Cloudflare:

1. Go to **Workers & Pages** → Your Project → **Custom Domains**
2. Click **Set up a custom domain**
3. Enter: `quant.yourdomain.com`
4. Click **Activate Domain**

Cloudflare automatically:
- Creates DNS records
- Provisions SSL certificate
- Enables HTTPS redirect

### Option 2: External Domain (CNAME)

If your domain is elsewhere:

1. In Cloudflare Pages, get your deployment URL:
   ```
   quant-view.pages.dev
   ```

2. Add CNAME record in your DNS provider:
   ```
   Type: CNAME
   Name: quant
   Value: quant-view.pages.dev
   ```

3. Add domain in Cloudflare Pages UI

---

## 🔄 Automatic Deployments

### Trigger on Git Push

Once connected to GitHub:

```bash
# Make changes
git add .
git commit -m "Update data and charts"
git push origin main

# Cloudflare automatically:
# 1. Detects push
# 2. Runs: pnpm install
# 3. Runs: pnpm run build
# 4. Deploys out/ directory
# 5. Invalidates CDN cache
# 6. Goes live in ~2 minutes
```

### Preview Deployments

Every PR gets its own preview URL:
```
https://<hash>.quant-view.pages.dev
```

Perfect for testing changes before merging!

---

## 📊 Data Update Workflow

### Strategy 1: Manual Updates (Recommended for Now)

```bash
# 1. Update data locally
pnpm run update-data

# 2. Commit and push
git add data/
git commit -m "Update data: $(date +%Y-%m-%d)"
git push origin main

# 3. Cloudflare auto-deploys
# ✅ New data live in ~2 minutes
```

### Strategy 2: GitHub Actions (Automated)

Create `.github/workflows/update-data.yml`:

```yaml
name: Update Data

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:      # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Update data
        env:
          FRED_API_KEY: ${{ secrets.FRED_API_KEY }}
        run: pnpm run update-data
      
      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add data/
          git commit -m "Auto-update data: $(date +%Y-%m-%d)" || exit 0
          git push
```

**Setup**:
1. Go to GitHub repo → Settings → Secrets
2. Add secret: `FRED_API_KEY` = your FRED API key
3. Push workflow file
4. Data updates automatically daily + auto-deploys!

---

## 🚦 Deployment Checklist

### Pre-Deployment

- [x] Static export enabled (`output: 'export'`)
- [x] Build succeeds locally (`pnpm run build`)
- [x] Out directory created (`out/`)
- [x] Data files accessible (`out/data/*.json`)
- [x] Symlink resolves in build
- [x] No API routes (all client-side)
- [x] No environment variables needed (FRED key only for builds)

### During Deployment

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Cloudflare Pages project created
- [ ] Build settings configured
- [ ] First deployment successful

### Post-Deployment

- [ ] Site loads correctly
- [ ] Charts render with data
- [ ] All 15 series display
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics enabled (optional)

---

## 🎯 Expected Results

### Performance

| Metric | Expected | Why |
|--------|----------|-----|
| **First Load** | < 2s | Static HTML, CDN cached |
| **Time to Interactive** | < 3s | Pre-built bundle |
| **JSON Load** | < 500ms | 5.9 MB, gzip compressed |
| **Lighthouse Score** | 95+ | Optimized static site |

### Cloudflare Benefits

- ✅ **Global CDN** - 200+ edge locations
- ✅ **Free HTTPS** - Automatic SSL
- ✅ **DDoS Protection** - Built-in
- ✅ **Analytics** - Real-time traffic stats
- ✅ **Atomic Deploys** - Zero downtime
- ✅ **Instant Rollback** - One-click revert

---

## 🔒 Security Considerations

### API Key Protection

**Your FRED API key is safe** because:

1. ✅ Used only during **build time** (not in browser)
2. ✅ Never bundled in `out/` directory
3. ✅ Not needed for runtime (data is pre-fetched)
4. ✅ Stored securely in GitHub Secrets (if using Actions)

### Build vs Runtime

```typescript
// BUILD TIME (local/CI)
// ✅ FRED_API_KEY used here
pnpm run fetch-data    // Calls FRED API
pnpm run update-data   // Calls FRED API
pnpm run build         // Generates static files

// RUNTIME (Cloudflare Pages)
// ✅ No API key needed
fetch('/data/sp500.json')  // Loads pre-fetched JSON
```

---

## 📈 Scaling Considerations

### Current Project

- **Data size**: 5.9 MB (16 JSON files)
- **Total size**: 9.8 MB (with Next.js bundle)
- **Series**: 15 economic indicators
- **Date range**: Jan 2018 - Oct 2025 (~1,950 days)

### Future Growth Estimate

If you add 10 more series:
- **Data size**: ~9 MB (25 series × ~100 KB each)
- **Total size**: ~13 MB
- **Still well within limits** ✅ (< 25 MB)

### If You Exceed Limits Later

**Option 1: Data Optimization**
```bash
# Compress JSON files
gzip data/*.json  # ~70% size reduction
```

**Option 2: Split by Year**
```json
// Instead of: sp500.json (all data)
// Split into: sp500-2023.json, sp500-2024.json, sp500-2025.json
```

**Option 3: Cloudflare Workers**
```typescript
// Serve large files from R2 bucket
// Pages = static HTML/JS
// R2 = large JSON files
```

**But you're nowhere near these limits!** 🎉

---

## 🧪 Testing Before Deployment

### Local Preview

```bash
# Build and test locally
pnpm run build

# Serve the out/ directory
npx serve out

# Visit: http://localhost:3000
```

### Validate Build Output

```bash
# Check out/ directory structure
ls -la out/
ls -la out/data/

# Verify JSON files copied
cat out/data/metadata.json

# Check HTML files
cat out/index.html | grep "data-"
```

---

## 🚀 Quick Start Commands

### First Deployment

```bash
# 1. Ensure latest build works
pnpm run build

# 2. Push to GitHub
git add .
git commit -m "Prepare for Cloudflare Pages deployment"
git push origin main

# 3. Go to Cloudflare Dashboard
# - Connect GitHub repo
# - Set build command: pnpm run build
# - Set output directory: out
# - Deploy!

# 4. Visit your site
# https://quant-view.pages.dev
```

### Update Data & Redeploy

```bash
# Update data
pnpm run update-data

# Commit and push
git add data/
git commit -m "Data update: $(date +%Y-%m-%d)"
git push origin main

# Auto-deploys in ~2 minutes ✅
```

---

## 📚 Useful Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Pages GitHub Integration](https://developers.cloudflare.com/pages/platform/git-integration/)

---

## 🎉 Summary

### Your Project is Perfect for Cloudflare Pages

| Feature | Status | Notes |
|---------|--------|-------|
| **Static Export** | ✅ Ready | `output: 'export'` configured |
| **Data Files** | ✅ Supported | 5.9 MB, well within limits |
| **Build Size** | ✅ Optimal | 9.8 MB total (60% headroom) |
| **No API Routes** | ✅ Perfect | Pure static site |
| **Fast Deployment** | ✅ 2 min | Auto-deploy on push |
| **Free Tier** | ✅ Sufficient | Unlimited bandwidth |

### Next Steps

1. Push code to GitHub (if not already)
2. Connect GitHub to Cloudflare Pages
3. Configure build: `pnpm run build` → `out/`
4. Deploy and celebrate! 🎊

**Deployment time**: 15 minutes from start to live site! 🚀

---

**Your static JSON files are not a problem at all - they're actually a strength of this approach!** Static assets on Cloudflare's CDN = blazing fast global performance. 💪
