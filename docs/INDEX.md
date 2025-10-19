# 📚 Documentation Index

> **Quick Navigation**: Find exactly what you need without the overwhelm.

## 🚀 Start Here

| Document | Description | When to Use |
|----------|-------------|-------------|
| [README.md](../README.md) | Project overview, features, quick start | First time setup, project intro |
| [CHANGELOG.md](../CHANGELOG.md) | Version history, release notes | Check what's new in each version |

---

## 📖 Core Documentation

### Getting Started
- **[README.md](../README.md)** - Main project documentation
  - Features & capabilities
  - Installation instructions
  - Quick start guide
  - Available commands

### API Integration
- **[FRED_API_GUIDE.md](../FRED_API_GUIDE.md)** - FRED API integration guide
  - How to get API key
  - Series configuration
  - Data fetching process
  - Rate limiting & best practices

---

## 🔧 Technical Guides

### Data Management

| Guide | What's Inside | Read This When... |
|-------|---------------|-------------------|
| **[DATA_SYNC_STRATEGY.md](./DATA_SYNC_STRATEGY.md)** | Comprehensive sync strategies, implementation plans | Planning data sync improvements, understanding drift |
| **[SYNC_IMPROVEMENTS_SUMMARY.md](./SYNC_IMPROVEMENTS_SUMMARY.md)** | Executive summary of sync solutions | Quick overview of sync status & next steps |
| **[SYNC_VISUAL_OVERVIEW.md](./SYNC_VISUAL_OVERVIEW.md)** | Visual diagrams of current sync state | Understanding why series have different dates |

### Feature Documentation

| Feature | Documentation | Purpose |
|---------|---------------|---------|
| **Multi-Year Selection** | [MULTI_YEAR_X_AXIS_IMPROVEMENTS.md](./MULTI_YEAR_X_AXIS_IMPROVEMENTS.md) | How multi-year chart selection works |
| **New Series** | [NEW_SERIES_SP500_EURUSD.md](./NEW_SERIES_SP500_EURUSD.md) | Adding S&P 500, EUR/USD, Dollar Index |

---

## 🐛 Troubleshooting & Fixes

### Recent Fixes

| Issue | Documentation | Quick Fix |
|-------|---------------|-----------|
| **404 Error (metadata.json)** | [404_FIX_SUMMARY.md](./404_FIX_SUMMARY.md) | `pnpm run setup` |
| **404 Visual Guide** | [404_FIX_VISUAL.md](./404_FIX_VISUAL.md) | See diagrams of the fix |
| **Data Access Issues** | [DATA_ACCESS_FIX.md](./DATA_ACCESS_FIX.md) | Detailed fix documentation |
| **Status Display UX** | [UX_IMPROVEMENTS.md](./UX_IMPROVEMENTS.md) | Positive data status redesign |

### Common Issues

<details>
<summary><strong>🔴 "Data not loading" or 404 errors</strong></summary>

**Solution:** Run setup script to create symlink
```bash
pnpm run setup
```

**Docs:** [404_FIX_SUMMARY.md](./404_FIX_SUMMARY.md)
</details>

<details>
<summary><strong>🟡 "Series have different dates"</strong></summary>

**Explanation:** Different FRED series update on different schedules (normal behavior)

**Check Status:**
```bash
pnpm run check-sync
```

**Docs:** [SYNC_VISUAL_OVERVIEW.md](./SYNC_VISUAL_OVERVIEW.md)
</details>

<details>
<summary><strong>⚙️ "Need to update data"</strong></summary>

**Solution:**
```bash
pnpm run update-data
```

**Docs:** [README.md](../README.md#data-management-commands)
</details>

---

## 📋 Reference Documents

### Recent Changes
- **[CHANGES.md](../CHANGES.md)** - Detailed summary of recent fixes
  - Display text corrections
  - Sync monitoring implementation
  - 404 fix details

### Version History
- **[CHANGELOG.md](../CHANGELOG.md)** - Complete version history
  - All releases since v1.0
  - Breaking changes
  - New features by version

---

## 🗂️ Documentation by Purpose

### 👨‍💻 For Developers

```
📦 Setup & Installation
├─ README.md ..................... Quick start, installation
├─ scripts/setup.sh .............. Automated setup script
└─ FRED_API_GUIDE.md ............. API integration guide

🔨 Development
├─ DATA_SYNC_STRATEGY.md ......... Technical sync strategies
├─ MULTI_YEAR_X_AXIS_IMPROVEMENTS  Feature implementation details
└─ NEW_SERIES_SP500_EURUSD.md .... Adding new data series

🐛 Debugging
├─ 404_FIX_SUMMARY.md ............ Recent 404 fix
├─ 404_FIX_VISUAL.md ............. Visual troubleshooting
└─ DATA_ACCESS_FIX.md ............ File access issues
```

### 👥 For Users

```
🚀 Getting Started
├─ README.md ..................... Start here!
└─ CHANGELOG.md .................. What's new?

📊 Using the Dashboard
├─ README.md (Features section) .. All features explained
└─ SYNC_VISUAL_OVERVIEW.md ....... Understanding data freshness

🔄 Data Updates
├─ SYNC_IMPROVEMENTS_SUMMARY.md .. Data sync overview
└─ README.md (Data section) ...... Update commands
```

### 🎯 For Specific Tasks

| I Want To... | Read This |
|--------------|-----------|
| Set up the project | [README.md](../README.md) → Installation |
| Fix 404 errors | [404_FIX_SUMMARY.md](./404_FIX_SUMMARY.md) |
| Understand data sync | [SYNC_VISUAL_OVERVIEW.md](./SYNC_VISUAL_OVERVIEW.md) |
| Add new data series | [NEW_SERIES_SP500_EURUSD.md](./NEW_SERIES_SP500_EURUSD.md) |
| Check what changed | [CHANGELOG.md](../CHANGELOG.md) |
| Get FRED API key | [FRED_API_GUIDE.md](../FRED_API_GUIDE.md) |
| Understand multi-year feature | [MULTI_YEAR_X_AXIS_IMPROVEMENTS.md](./MULTI_YEAR_X_AXIS_IMPROVEMENTS.md) |
| See latest fixes | [CHANGES.md](../CHANGES.md) |

---

## 🎨 Document Types Legend

| Icon | Type | When to Read |
|------|------|--------------|
| 📖 | **Guide** | Learning how to do something |
| 🔧 | **Technical** | Understanding implementation |
| 🐛 | **Fix/Troubleshooting** | Solving a specific problem |
| 📋 | **Reference** | Looking up information |
| 🎯 | **Summary** | Quick overview |
| 📊 | **Visual** | Seeing diagrams/charts |

---

## 📏 Document Reading Time

| Document | Length | Reading Time |
|----------|--------|--------------|
| README.md | Long | 10-15 min |
| CHANGELOG.md | Medium | 5-10 min |
| FRED_API_GUIDE.md | Medium | 5-10 min |
| CHANGES.md | Long | 10-15 min |
| DATA_SYNC_STRATEGY.md | Long | 15-20 min |
| SYNC_IMPROVEMENTS_SUMMARY.md | Medium | 5-10 min |
| SYNC_VISUAL_OVERVIEW.md | Medium | 5-10 min |
| 404_FIX_SUMMARY.md | Short | 3-5 min |
| 404_FIX_VISUAL.md | Medium | 5-10 min |
| DATA_ACCESS_FIX.md | Short | 3-5 min |
| MULTI_YEAR_X_AXIS_IMPROVEMENTS.md | Medium | 5-10 min |
| NEW_SERIES_SP500_EURUSD.md | Medium | 5-10 min |

---

## 🔍 Search by Keyword

<details>
<summary><strong>Click to expand keyword index</strong></summary>

### Keywords → Documents

**API, FRED, Data Source**
- FRED_API_GUIDE.md
- README.md

**404, Error, Not Found**
- 404_FIX_SUMMARY.md
- 404_FIX_VISUAL.md
- DATA_ACCESS_FIX.md

**Sync, Synchronization, Drift**
- DATA_SYNC_STRATEGY.md
- SYNC_IMPROVEMENTS_SUMMARY.md
- SYNC_VISUAL_OVERVIEW.md

**Setup, Installation, Getting Started**
- README.md
- 404_FIX_SUMMARY.md (setup script)

**Features, Multi-Year, Charts**
- MULTI_YEAR_X_AXIS_IMPROVEMENTS.md
- README.md

**New Series, S&P 500, EUR/USD**
- NEW_SERIES_SP500_EURUSD.md

**Changes, Updates, What's New**
- CHANGES.md
- CHANGELOG.md

**Troubleshooting, Debugging, Problems**
- 404_FIX_SUMMARY.md
- 404_FIX_VISUAL.md
- DATA_ACCESS_FIX.md
- SYNC_VISUAL_OVERVIEW.md

</details>

---

## 🎓 Learning Paths

### Path 1: New to the Project
1. [README.md](../README.md) - Understand what it does
2. [FRED_API_GUIDE.md](../FRED_API_GUIDE.md) - Set up API access
3. [404_FIX_SUMMARY.md](./404_FIX_SUMMARY.md) - Run setup (avoid common issue)
4. Start coding! 🚀

### Path 2: Understanding Data Sync
1. [SYNC_VISUAL_OVERVIEW.md](./SYNC_VISUAL_OVERVIEW.md) - See current state
2. [SYNC_IMPROVEMENTS_SUMMARY.md](./SYNC_IMPROVEMENTS_SUMMARY.md) - Understand solutions
3. [DATA_SYNC_STRATEGY.md](./DATA_SYNC_STRATEGY.md) - Deep dive (optional)

### Path 3: Troubleshooting
1. Check [Common Issues](#common-issues) above
2. [404_FIX_VISUAL.md](./404_FIX_VISUAL.md) - Visual debugging
3. [DATA_ACCESS_FIX.md](./DATA_ACCESS_FIX.md) - Detailed fix steps

### Path 4: Contributing/Extending
1. [README.md](../README.md) - Project structure
2. [NEW_SERIES_SP500_EURUSD.md](./NEW_SERIES_SP500_EURUSD.md) - Example of adding series
3. [DATA_SYNC_STRATEGY.md](./DATA_SYNC_STRATEGY.md) - Architecture understanding

---

## 📁 File Organization

```
quant-view/
├── 📄 Root Documentation (User-facing)
│   ├── README.md .................... Main docs (START HERE)
│   ├── CHANGELOG.md ................. Version history
│   ├── CHANGES.md ................... Recent detailed changes
│   └── FRED_API_GUIDE.md ............ API integration
│
└── 📂 docs/ (Detailed Technical Docs)
    ├── 🐛 Fixes & Troubleshooting
    │   ├── 404_FIX_SUMMARY.md ....... Recent 404 fix summary
    │   ├── 404_FIX_VISUAL.md ........ 404 fix with diagrams
    │   └── DATA_ACCESS_FIX.md ....... Data access detailed fix
    │
    ├── 🔄 Data Synchronization
    │   ├── DATA_SYNC_STRATEGY.md .... Complete sync strategy
    │   ├── SYNC_IMPROVEMENTS_SUMMARY  Sync executive summary
    │   └── SYNC_VISUAL_OVERVIEW.md .. Sync state visualization
    │
    └── ✨ Features
        ├── MULTI_YEAR_X_AXIS_IMPROVEMENTS.md
        └── NEW_SERIES_SP500_EURUSD.md
```

---

## 💡 Quick Tips

### When You're Stuck
1. **Check [Common Issues](#common-issues)** - Quick solutions to frequent problems
2. **Run diagnostics**: `pnpm run check-sync` - See current state
3. **Search keywords** - Use Cmd/Ctrl+F in this index

### When Planning Work
1. **Review [CHANGELOG.md](../CHANGELOG.md)** - Understand version history
2. **Read [DATA_SYNC_STRATEGY.md](./DATA_SYNC_STRATEGY.md)** - Technical architecture
3. **Check [CHANGES.md](../CHANGES.md)** - Latest implementations

### When Onboarding
1. Start with [README.md](../README.md)
2. Run `pnpm run setup`
3. Skim [SYNC_VISUAL_OVERVIEW.md](./SYNC_VISUAL_OVERVIEW.md) to understand data
4. Check [CHANGELOG.md](../CHANGELOG.md) for recent changes

---

## 🔗 External Resources

- [FRED API Documentation](https://fred.stlouisfed.org/docs/api/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Recharts Documentation](https://recharts.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 📝 Document Maintenance

**Last Updated:** October 19, 2025

**Next Review:** When adding new major features or documentation

**How to Update:**
1. Add new docs to appropriate section
2. Update keyword index
3. Add to learning paths if applicable
4. Keep reading times current

---

<div align="center">

**Need help?** Check the [Common Issues](#common-issues) section above or search by [keyword](#-search-by-keyword).

**Found a bug?** See [Troubleshooting](#-troubleshooting--fixes) documentation.

**Want to contribute?** Start with [README.md](../README.md) and [Learning Path 4](#path-4-contributingextending).

</div>
