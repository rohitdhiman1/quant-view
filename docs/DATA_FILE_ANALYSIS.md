# Data File Analysis & Cleanup

**Date**: October 19, 2025  
**Status**: Analysis Complete ✅

---

## 🔍 Current Situation

### Question 1: What's the difference between `/data` and `/public/data`?

**Answer**: They are **THE SAME FILES** - `public/data` is a **symlink** to `../data`.

```bash
$ ls -la public/data
lrwxr-xr-x  1 rohitdhiman  staff  7 Oct 19 13:51 public/data -> ../data
```

**Why a symlink?**
- Next.js only serves files from the `public/` directory over HTTP
- We store actual data files in `data/` (cleaner project structure)
- Symlink makes them accessible at `/data/metadata.json` URL
- Created to fix the 404 error (see [404_FIX.md](404_FIX.md))

### Question 2: Where does fetched data get stored?

**Answer**: Data is stored in `data/*.json` files (root level `data/` directory).

**Fetch scripts behavior**:
```typescript
// From lib/fred-config.ts
export const FRED_CONFIG = {
  dataDir: './data',              // Writes to data/
  metadataFile: './data/metadata.json'
}
```

**Scripts write to**:
- `data/treasury_1y.json`
- `data/treasury_2y.json`
- `data/cpi.json`
- etc.

**App reads from**:
```typescript
// From app/page.tsx
const dataPath = path.join(process.cwd(), 'data', filename)
```

### Question 3: Why do we need files in two places?

**We don't!** It's just one location with a symlink for HTTP access.

**Purpose of each access method**:
1. **`data/*.json`** (file system)
   - Used by Next.js server during build (`app/page.tsx`)
   - Used by CLI scripts to write data
   
2. **`public/data/*.json`** (HTTP via symlink)
   - Used by client-side components (`CompactDataStatus.tsx`)
   - Fetches `metadata.json` to show data freshness

---

## 📊 File Inventory

### Total Files
- **25 JSON files** in `data/` directory
- **15 series** actually used by the app

### Files Currently Used (15) ✅

Based on `app/page.tsx` and `lib/fred-config.ts`:

| File | Series | Category | Used By |
|------|--------|----------|---------|
| `treasury_1y.json` | 1-Year Treasury | Yields | ✅ App |
| `treasury_2y.json` | 2-Year Treasury | Yields | ✅ App |
| `treasury_5y.json` | 5-Year Treasury | Yields | ✅ App |
| `treasury_10y.json` | 10-Year Treasury | Yields | ✅ App |
| `treasury_20y.json` | 20-Year Treasury | Yields | ✅ App |
| `cpi.json` | CPI All Items | Inflation | ✅ App |
| `core_cpi.json` | Core CPI | Inflation | ✅ App |
| `vix.json` | S&P 500 Volatility | Volatility | ✅ App |
| `gvz.json` | Gold Volatility | Volatility | ✅ App |
| `unemployment_rate.json` | Unemployment Rate | Employment | ✅ App |
| `oil_price.json` | Oil Price (WTI) | Commodities | ✅ App |
| `dollar_index.json` | US Dollar Index | Markets & FX | ✅ App |
| `eur_usd.json` | EUR/USD Rate | Markets & FX | ✅ App |
| `sp500.json` | S&P 500 Index | Markets & FX | ✅ App |
| `yield_curve_spread.json` | 10Y-2Y Spread | Economic Indicators | ✅ App |

**Special file**:
- `metadata.json` - Contains last update time and series info (used by `CompactDataStatus.tsx`)

### Files NOT Used (9) ❌

These files exist but are **NEVER referenced** in the code:

| File | Suspected Purpose | Used? |
|------|-------------------|-------|
| `treasury_30y.json` | 30-Year Treasury (removed from config?) | ❌ NO |
| `yield_5y.json` | Duplicate/legacy? (we use `treasury_5y.json`) | ❌ NO |
| `yield_15y.json` | Legacy yield file? | ❌ NO |
| `yield_20y.json` | Legacy yield file? | ❌ NO |
| `treasury_yield.json` | Old combined file? | ❌ NO |
| `cpi_monthly.json` | Non-interpolated monthly data? | ❌ NO |
| `core_cpi_monthly.json` | Non-interpolated monthly data? | ❌ NO |
| `unemployment_rate_monthly.json` | Non-interpolated monthly data? | ❌ NO |

**Verdict**: These 9 files appear to be **legacy/unused** and can likely be deleted.

---

## 🔬 Code Analysis

### Where Series Are Defined

**`lib/fred-config.ts`** - Single source of truth:
```typescript
export const TREASURY_YIELD_SERIES: TreasuryYieldConfig[] = [
  // Only includes: 1y, 2y, 5y, 10y, 20y
  // NO 30y treasury defined!
]

export const ALL_SERIES: SeriesConfig[] = [
  ...TREASURY_YIELD_SERIES,  // 5 series
  ...INFLATION_SERIES,       // 2 series (cpi, core_cpi)
  ...VOLATILITY_SERIES,      // 2 series (vix, gvz)
  ...EMPLOYMENT_SERIES,      // 1 series (unemployment_rate)
  ...COMMODITY_SERIES,       // 1 series (oil_price)
  ...CURRENCY_SERIES,        // 3 series (dollar_index, eur_usd, sp500)
  ...ECONOMIC_INDICATOR_SERIES // 1 series (yield_curve_spread)
]
// Total: 15 series
```

### Where Data Is Loaded

**`app/page.tsx`** - Loads exactly 15 files:
```typescript
const seriesDataPromises = [
  { key: 'treasury_1y', filename: 'treasury_1y.json' },
  { key: 'treasury_2y', filename: 'treasury_2y.json' },
  { key: 'treasury_5y', filename: 'treasury_5y.json' },
  { key: 'treasury_10y', filename: 'treasury_10y.json' },
  { key: 'treasury_20y', filename: 'treasury_20y.json' },
  { key: 'cpi', filename: 'cpi.json' },
  { key: 'core_cpi', filename: 'core_cpi.json' },
  { key: 'vix', filename: 'vix.json' },
  { key: 'gvz', filename: 'gvz.json' },
  { key: 'unemployment_rate', filename: 'unemployment_rate.json' },
  { key: 'oil_price', filename: 'oil_price.json' },
  { key: 'dollar_index', filename: 'dollar_index.json' },
  { key: 'eur_usd', filename: 'eur_usd.json' },
  { key: 'sp500', filename: 'sp500.json' },
  { key: 'yield_curve_spread', filename: 'yield_curve_spread.json' }
]
// NO treasury_30y, yield_5y, etc.
```

### Grep Search Results

**Searched for unused files** - NO matches found:
- `treasury_yield.json` - Not mentioned anywhere
- `yield_15y.json` - Not mentioned anywhere
- `yield_20y.json` - Not mentioned anywhere  
- `yield_5y.json` - Not mentioned anywhere
- `cpi_monthly.json` - Not mentioned anywhere
- `core_cpi_monthly.json` - Not mentioned anywhere
- `unemployment_rate_monthly.json` - Not mentioned anywhere
- `treasury_30y.json` - Not in FRED_CONFIG or page.tsx

---

## 🗑️ Cleanup Recommendation

### Files Safe to Delete (9 files)

These files are **orphaned legacy data** that serve no purpose:

```bash
# Legacy/duplicate yield files (4 files)
data/treasury_yield.json
data/yield_5y.json
data/yield_15y.json
data/yield_20y.json

# Removed series (1 file)
data/treasury_30y.json

# Non-interpolated monthly data (3 files)
# (App only uses interpolated versions)
data/cpi_monthly.json
data/core_cpi_monthly.json
data/unemployment_rate_monthly.json
```

### Why These Exist

**Possible reasons**:
1. **Legacy from old implementation** - Different naming scheme
2. **treasury_30y** - Was in config, then removed (not in current FRED_CONFIG)
3. **\*_monthly files** - Non-interpolated versions before daily interpolation was added
4. **yield_\*.json** - Old naming convention (now use `treasury_*.json`)

### Storage Impact

Each file is ~40-80 KB, so:
- **9 unused files** × ~60 KB = **~540 KB wasted**
- Not huge, but creates confusion

### Backup Files

Your `data/backup/` directory has **many snapshots**. Consider:
- Keep last 3 backups only
- Or archive old backups (compress to .tar.gz)

---

## ✅ Cleanup Plan

### Step 1: Verify Unused Files

Before deleting, confirm these files aren't loaded:

```bash
# Search entire codebase for references
grep -r "treasury_30y" .
grep -r "yield_15y" .
grep -r "yield_20y" .
grep -r "yield_5y\.json" .
grep -r "treasury_yield\.json" .
grep -r "monthly\.json" .
```

### Step 2: Delete Unused Files

If no matches found (safe to delete):

```bash
# Remove unused series data
rm data/treasury_30y.json
rm data/treasury_yield.json
rm data/yield_5y.json
rm data/yield_15y.json
rm data/yield_20y.json

# Remove non-interpolated monthly data
rm data/cpi_monthly.json
rm data/core_cpi_monthly.json
rm data/unemployment_rate_monthly.json
```

### Step 3: Clean Up Backups (Optional)

```bash
# Keep only last 3 backups
cd data/backup
ls -t | tail -n +4 | xargs rm -rf

# Or compress old backups
tar -czf old_backups_2025.tar.gz 2025-*
rm -rf 2025-*
```

### Step 4: Verify App Still Works

```bash
# Build the app
pnpm run build

# Check sync status
pnpm run check-sync

# Verify all 15 series load
pnpm run dev
# Visit http://localhost:3000
```

---

## 📝 Summary

| Aspect | Answer |
|--------|--------|
| **`/data` vs `/public/data`** | Same files (symlink) |
| **Where data is stored** | `data/*.json` (15 series + metadata) |
| **Why two locations** | Symlink for HTTP access (client-side) |
| **Total files** | 25 JSON files |
| **Used files** | 16 files (15 series + metadata) |
| **Unused files** | 9 legacy/orphaned files |
| **Cleanup impact** | Remove ~540 KB, reduce confusion |

### Key Takeaways

✅ **Single source of data** - `data/` directory  
✅ **Symlink for HTTP** - `public/data` → `../data`  
✅ **15 active series** - Defined in `fred-config.ts`  
✅ **9 orphaned files** - Safe to delete  
✅ **No duplication** - Just symlink confusion  

---

## 🔗 Related Documentation

- **[404_FIX.md](404_FIX.md)** - Why symlink was created
- **[SETUP_SCRIPT.md](SETUP_SCRIPT.md)** - Automated symlink setup
- **[SYNC_STRATEGY.md](SYNC_STRATEGY.md)** - Data update strategy

---

**Next Action**: Review unused files list and delete if confirmed safe. Would you like me to execute the cleanup?
