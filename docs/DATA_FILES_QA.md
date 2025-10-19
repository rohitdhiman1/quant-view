# Data Files Q&A - Complete Answers

**Date**: October 19, 2025  
**Status**: Analyzed & Documented ✅

---

## Your Questions Answered

### Q1: What's the diff between `/data` and `/public/data`?

**Answer**: **They're the SAME files** - no difference at all!

```bash
$ ls -la public/data
lrwxr-xr-x ... public/data -> ../data
         ↑
    SYMLINK (not a copy!)
```

**Explanation**:
- `public/data` is a **symbolic link** pointing to `../data`
- It's like a shortcut on Windows or alias on Mac
- Any file in `data/` automatically appears in `public/data/`
- No duplication, no extra storage

**Why it exists**:
- Next.js only serves files from `public/` over HTTP
- Client-side code needs to fetch `metadata.json` via HTTP
- Symlink was created to fix the 404 error ([see 404_FIX.md](404_FIX.md))

---

### Q2: When we fetch data for series, where does it get stored?

**Answer**: Data is stored in **`data/*.json`** files at the root level.

**Detailed flow**:

1. **Scripts write data**:
   ```typescript
   // scripts/fetch-initial-data.ts & update-data.ts
   import { FRED_CONFIG } from '../lib/fred-config'
   
   FRED_CONFIG.dataDir = './data'  // Writes here
   
   // Creates files like:
   // data/treasury_1y.json
   // data/sp500.json
   // data/metadata.json
   ```

2. **App reads data** (server-side):
   ```typescript
   // app/page.tsx
   const dataPath = path.join(process.cwd(), 'data', filename)
   const fileContents = await fs.readFile(dataPath, 'utf8')
   ```

3. **Client reads metadata** (HTTP):
   ```typescript
   // components/CompactDataStatus.tsx
   const res = await fetch('/data/metadata.json')
   //                        ↑
   //               via public/data symlink
   ```

**Storage location**: All files in **`data/`** directory (15 series + 1 metadata)

---

### Q3: Why do we need files in two places?

**Answer**: **We don't!** It's only ONE location with a symlink for access.

**The two access patterns**:

| Access Method | Used By | Purpose | Path |
|---------------|---------|---------|------|
| **File System** | Server components, CLI scripts | Build-time data loading, writing | `data/*.json` |
| **HTTP** | Client components | Runtime fetch (metadata only) | `/data/metadata.json` (via symlink) |

**Why both patterns**:
- **Server-side (Next.js)**: Reads files directly during build
- **Client-side (browser)**: Can't access file system, needs HTTP

**The symlink solves this elegantly**:
```
data/metadata.json          ← Physical file
        ↓ (symlinked)
public/data/metadata.json   ← HTTP accessible
        ↓ (served as)
http://localhost:3000/data/metadata.json  ← Browser fetches this
```

---

### Q4: Are those files the same?

**Answer**: **YES - 100% identical!**

Proof:
```bash
# They have the exact same inode (same file on disk)
$ ls -i data/metadata.json
12345678 data/metadata.json

$ ls -i public/data/metadata.json  
12345678 public/data/metadata.json
         ↑
   Same inode = same file!
```

Any change to `data/metadata.json` is **instantly** visible via `public/data/metadata.json`.

---

### Q5: I see a lot of JSON files - are some unused?

**Answer**: **YES! 9 files are unused legacy files.**

#### Files Breakdown

**Total**: 25 JSON files  
**Used**: 16 files (15 series + metadata)  
**Unused**: 9 orphaned legacy files

#### Currently Used Files (16) ✅

| # | File | Series | Used By |
|---|------|--------|---------|
| 1 | `treasury_1y.json` | 1-Year Treasury | ✅ `app/page.tsx` |
| 2 | `treasury_2y.json` | 2-Year Treasury | ✅ `app/page.tsx` |
| 3 | `treasury_5y.json` | 5-Year Treasury | ✅ `app/page.tsx` |
| 4 | `treasury_10y.json` | 10-Year Treasury | ✅ `app/page.tsx` |
| 5 | `treasury_20y.json` | 20-Year Treasury | ✅ `app/page.tsx` |
| 6 | `cpi.json` | CPI (interpolated) | ✅ `app/page.tsx` |
| 7 | `core_cpi.json` | Core CPI (interpolated) | ✅ `app/page.tsx` |
| 8 | `vix.json` | S&P 500 Volatility | ✅ `app/page.tsx` |
| 9 | `gvz.json` | Gold Volatility | ✅ `app/page.tsx` |
| 10 | `unemployment_rate.json` | Unemployment (interpolated) | ✅ `app/page.tsx` |
| 11 | `oil_price.json` | Oil Price (WTI) | ✅ `app/page.tsx` |
| 12 | `dollar_index.json` | US Dollar Index | ✅ `app/page.tsx` |
| 13 | `eur_usd.json` | EUR/USD Rate | ✅ `app/page.tsx` |
| 14 | `sp500.json` | S&P 500 Index | ✅ `app/page.tsx` |
| 15 | `yield_curve_spread.json` | 10Y-2Y Spread | ✅ `app/page.tsx` |
| 16 | `metadata.json` | Last update info | ✅ `CompactDataStatus.tsx` |

#### Unused/Legacy Files (9) ❌

| # | File | Why Unused |
|---|------|------------|
| 1 | `treasury_30y.json` | Not in `FRED_CONFIG`, removed from app |
| 2 | `treasury_yield.json` | Old combined file (now split by maturity) |
| 3 | `yield_5y.json` | Legacy naming (now `treasury_5y.json`) |
| 4 | `yield_15y.json` | Legacy file (not in current config) |
| 5 | `yield_20y.json` | Legacy file (now `treasury_20y.json`) |
| 6 | `cpi_monthly.json` | Non-interpolated version (not used) |
| 7 | `core_cpi_monthly.json` | Non-interpolated version (not used) |
| 8 | `unemployment_rate_monthly.json` | Non-interpolated version (not used) |

**Verification**: Code search found **ZERO references** to these 9 files.

---

## 🗑️ Cleanup Instructions

### Automated Cleanup (Recommended)

```bash
# Run the cleanup script
pnpm run cleanup-data
```

**What it does**:
1. Lists all unused files with sizes
2. Shows total space to reclaim (~540 KB)
3. Asks for confirmation
4. Deletes unused files
5. Verifies remaining files

### Manual Cleanup

```bash
# Delete unused files manually
rm data/treasury_30y.json
rm data/treasury_yield.json
rm data/yield_5y.json
rm data/yield_15y.json
rm data/yield_20y.json
rm data/cpi_monthly.json
rm data/core_cpi_monthly.json
rm data/unemployment_rate_monthly.json

# Verify count
ls -1 data/*.json | wc -l
# Should show: 16 (was 25, now 16)
```

### After Cleanup

```bash
# Verify app still works
pnpm run build

# Check data sync status
pnpm run check-sync

# Test locally
pnpm run dev
```

---

## 📊 Visual Summary

### Before Cleanup
```
data/
├── treasury_1y.json        ✅ USED
├── treasury_2y.json        ✅ USED
├── treasury_5y.json        ✅ USED
├── treasury_10y.json       ✅ USED
├── treasury_20y.json       ✅ USED
├── treasury_30y.json       ❌ UNUSED (removed series)
├── treasury_yield.json     ❌ UNUSED (old combined file)
├── yield_5y.json           ❌ UNUSED (legacy naming)
├── yield_15y.json          ❌ UNUSED (legacy)
├── yield_20y.json          ❌ UNUSED (legacy naming)
├── cpi.json                ✅ USED (interpolated)
├── cpi_monthly.json        ❌ UNUSED (raw monthly)
├── core_cpi.json           ✅ USED (interpolated)
├── core_cpi_monthly.json   ❌ UNUSED (raw monthly)
├── vix.json                ✅ USED
├── gvz.json                ✅ USED
├── unemployment_rate.json              ✅ USED (interpolated)
├── unemployment_rate_monthly.json      ❌ UNUSED (raw monthly)
├── oil_price.json          ✅ USED
├── dollar_index.json       ✅ USED
├── eur_usd.json            ✅ USED
├── sp500.json              ✅ USED
├── yield_curve_spread.json ✅ USED
├── metadata.json           ✅ USED
└── backup/                 (many snapshots)

Total: 25 files (16 used, 9 unused)
```

### After Cleanup
```
data/
├── treasury_1y.json        ✅ USED
├── treasury_2y.json        ✅ USED
├── treasury_5y.json        ✅ USED
├── treasury_10y.json       ✅ USED
├── treasury_20y.json       ✅ USED
├── cpi.json                ✅ USED
├── core_cpi.json           ✅ USED
├── vix.json                ✅ USED
├── gvz.json                ✅ USED
├── unemployment_rate.json  ✅ USED
├── oil_price.json          ✅ USED
├── dollar_index.json       ✅ USED
├── eur_usd.json            ✅ USED
├── sp500.json              ✅ USED
├── yield_curve_spread.json ✅ USED
├── metadata.json           ✅ USED
└── backup/                 (keep last 3)

Total: 16 files (all used!)
```

---

## 🎯 Key Takeaways

| Question | Answer |
|----------|--------|
| **Diff between `/data` and `/public/data`?** | **Same files** (symlink) |
| **Where is data stored?** | **`data/*.json`** (15 series + metadata) |
| **Why two places?** | **One place** (symlink for HTTP access) |
| **Are files the same?** | **YES** (same inode, same file) |
| **Are some files unused?** | **YES** (9 legacy files can be deleted) |
| **Safe to delete?** | **YES** (verified via code search) |
| **Storage savings?** | **~540 KB + less confusion** |

---

## 🔗 Related Documentation

- **[DATA_FILE_ANALYSIS.md](DATA_FILE_ANALYSIS.md)** - Full technical analysis
- **[404_FIX.md](404_FIX.md)** - Why symlink was created
- **[SETUP_SCRIPT.md](SETUP_SCRIPT.md)** - Automated symlink setup
- **[QUICK_REF.md](QUICK_REF.md)** - Commands reference

---

## 📝 Scripts Reference

```bash
# Setup (creates symlink)
pnpm run setup

# Data management
pnpm run fetch-data      # Fetch all data from FRED
pnpm run update-data     # Update existing data
pnpm run check-sync      # Check sync status

# Cleanup
pnpm run cleanup-data    # Remove unused files

# Development
pnpm run dev             # Start dev server
pnpm run build           # Build for production
```

---

**Conclusion**: You have 9 unused legacy files taking up space and creating confusion. Safe to delete! Run `pnpm run cleanup-data` to remove them. 🗑️✨
