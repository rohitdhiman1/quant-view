# 📋 Quick Reference

> **TL;DR** - The essentials you need, nothing more.

## �️ Setup

```bash
# Install dependencies
pnpm install

# Setup symlinks (fixes 404 errors)
pnpm run setup

# Fetch initial data from FRED API
pnpm run fetch-data

# Build the application
pnpm run build

# Start development server
pnpm run dev
```

## 🗑️ Maintenance

```bash
# Remove unused/legacy data files
pnpm run cleanup-data

# Check which files are used
cat docs/DATA_FILE_ANALYSIS.md
```

**Done!** Open http://localhost:3000

---

## 🔥 Most Used Commands

```bash
# Development
pnpm run dev              # Start dev server
pnpm run build            # Build for production
pnpm run setup            # Fix 404 errors, create symlinks

# Data Management
pnpm run fetch-data       # Initial data fetch (one-time)
pnpm run update-data      # Update with latest data
pnpm run check-sync       # Check data synchronization status
```

---

## 🐛 Common Issues - Instant Fixes

### 404 Error (metadata.json)
```bash
pnpm run setup
```
[Full fix →](./404_FIX_SUMMARY.md)

### Data is stale
```bash
pnpm run update-data
```
[Learn about sync →](./SYNC_VISUAL_OVERVIEW.md)

### Need to start fresh
```bash
rm -rf data/*.json
pnpm run fetch-data
```
[Data guide →](../README.md#initial-data-setup)

---

## 📚 Documentation - Where to Look

| Need | Doc | Time |
|------|-----|------|
| **Project overview** | [README.md](../README.md) | 10 min |
| **What's new** | [CHANGELOG.md](../CHANGELOG.md) | 5 min |
| **Fix 404 error** | [404_FIX_SUMMARY.md](./404_FIX_SUMMARY.md) | 3 min |
| **Understand sync** | [SYNC_VISUAL_OVERVIEW.md](./SYNC_VISUAL_OVERVIEW.md) | 5 min |
| **All docs** | [INDEX.md](./INDEX.md) | Browse |

---

## 🎯 By Role

### I'm a **User**
1. Read: [README.md](../README.md)
2. Setup: Run commands above
3. Issues: Check [Common Issues](#-common-issues---instant-fixes)

### I'm a **Developer**
1. Read: [README.md](../README.md) + [FRED_API_GUIDE.md](../FRED_API_GUIDE.md)
2. Setup: Run commands above
3. Deep dive: [DATA_SYNC_STRATEGY.md](./DATA_SYNC_STRATEGY.md)

### I'm **Troubleshooting**
1. Check: [Common Issues](#-common-issues---instant-fixes)
2. Diagnose: `pnpm run check-sync`
3. Deep fix: [404_FIX_VISUAL.md](./404_FIX_VISUAL.md)

💡 **Note**: Data updates are CLI-only (static export mode). After updating data, rebuild: `pnpm run build`

---

## 📊 Project Stats

- **15 Data Series** (Treasury, Inflation, Volatility, etc.)
- **2018-Present** data range
- **~2,000 points** per series
- **Daily updates** for market data
- **Monthly** for CPI/Employment (interpolated)

---

## 🔑 Key Files

```
quant-view/
├── app/page.tsx ........... Main dashboard
├── components/
│   ├── ChartComponent.tsx . Interactive chart
│   └── CompactDataStatus .. Sync indicator
├── data/ .................. JSON data files
├── scripts/
│   ├── fetch-initial-data . Initial setup
│   ├── update-data ........ Daily updates
│   └── check-sync ......... Status check
└── docs/ .................. All documentation
    └── INDEX.md ........... Full doc index
```

---

## 💡 Quick Tips

✅ **Run `pnpm run setup` after cloning** - Avoids 404 errors  
✅ **Check sync daily**: `pnpm run check-sync`  
✅ **Update weekly**: `pnpm run update-data`  
⚠️ **Don't commit** `.env.local` (has API key)  
⚠️ **Data drift is normal** (2-3 days between series)  

---

## 🆘 Emergency Procedures

### Nothing Works
```bash
rm -rf node_modules out .next
pnpm install
pnpm run setup
pnpm run dev
```

### Data Corrupted
```bash
rm -rf data/*.json
pnpm run fetch-data  # Takes ~2 min
```

### Still Broken
1. Check [404_FIX_SUMMARY.md](./404_FIX_SUMMARY.md)
2. Review [INDEX.md](./INDEX.md) → Troubleshooting
3. Run `pnpm run check-sync` for diagnostics

---

## 🔗 Links

- [Full Documentation Index](./INDEX.md)
- [GitHub Repo](https://github.com/rohitdhiman1/quant-view)
- [FRED API](https://fred.stlouisfed.org/)

---

<div align="center">

**⏱️ Total setup time: ~5 minutes**

**📖 For comprehensive docs:** [INDEX.md](./INDEX.md)

**🐛 Got issues?** Check [Common Issues](#-common-issues---instant-fixes) above

</div>
