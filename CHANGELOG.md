# Changelog

All notable changes to Quant View will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-10-20 🎉

**First stable release of Quant View - Production Ready!**

### 🎯 Core Features

#### Data Series (15 Total)
- **Treasury Yields** (5): 1Y, 2Y, 5Y, 10Y, 20Y rates
- **Inflation** (2): CPI All Items, Core CPI (interpolated to daily)
- **Volatility** (2): VIX (S&P 500), GVZ (Gold)
- **Employment** (1): Unemployment Rate (interpolated to daily)
- **Commodities** (1): Oil Price (WTI)
- **Markets & FX** (3): S&P 500, EUR/USD, US Dollar Index
- **Economic Indicators** (1): 10Y-2Y Yield Curve Spread

#### Visualization Features
- **Multi-year selection** with automatic mode switching
- **Month-level filtering** for granular analysis
- **Smart metric selection** with mutual exclusion (absolute vs percentage)
- **Category-based organization** with color-coded tiles
- **Interactive tooltips** with formatted values and units
- **Responsive design** optimized for all screen sizes

#### Data Management
- **Automated FRED API integration** for data fetching
- **Incremental updates** to minimize API calls
- **Data interpolation** for monthly series (CPI, unemployment)
- **Sync monitoring** with drift detection
- **Data freshness indicators** with positive UX

#### Technical Excellence
- **Static export** for Cloudflare Pages deployment
- **Type-safe TypeScript** throughout
- **Modern React 19** with Next.js 15
- **Turbopack** for fast builds
- **Comprehensive documentation** (18 markdown files)

### 🐛 Bug Fixes (Pre-Release)
- Fixed Data Coverage metric showing duplicate counts instead of unique dates
- Removed non-functional "Update Data" button in static export mode
- Fixed 404 error for metadata.json with symlink solution
- Corrected footer text from "time periods" to "data points"
- Eliminated 9 unused legacy JSON files

### 📚 Documentation
- Complete deployment guide for Cloudflare Pages
- Data file structure and sync strategy documentation
- UX improvements rationale and implementation details
- Quick reference guide with all CLI commands
- Comprehensive documentation index system
- API integration guide for FRED

### 🛠️ Developer Tools
- `pnpm run setup` - Automated project setup with symlinks
- `pnpm run fetch-data` - Initial data fetch from FRED
- `pnpm run update-data` - Incremental data updates
- `pnpm run check-sync` - Data synchronization status
- `pnpm run cleanup-data` - Remove unused legacy files
- `pnpm run check-deploy` - Cloudflare deployment readiness

### 🚀 Deployment Ready
- Configured for static export (`output: 'export'`)
- Optimized build size: 9.8 MB (well under limits)
- Data files: 5.9 MB (17 JSON files)
- Cloudflare Pages compatible
- Zero-config deployment process

### 📊 Project Stats
- **Data Range**: January 2018 - Present (~1,950 business days)
- **Total Data Points**: ~29,000 records across all series
- **Build Time**: ~3 seconds with Turbopack
- **Bundle Size**: ~100 KB JavaScript (gzipped)

---

## Pre-Release Development (0.x.x)

### [0.3.1] - 2025-10-19

### Fixed
- **Data Coverage metric** - Now shows unique dates (~1,950) instead of total data points (29,269)
  - Bug: Both "Data Coverage" and "Total Data Points" displayed same value
  - Fix: Added `uniqueDates = new Set(allDates).size` to calculate unique dates
  - Impact: Metrics now show meaningful, different values

### Documentation
- Added [DATA_COVERAGE_FIX.md](docs/DATA_COVERAGE_FIX.md) - Bug analysis and fix details
- Added [DATA_FILES_QA.md](docs/DATA_FILES_QA.md) - Complete data file documentation
- Added [DATA_FILE_ANALYSIS.md](docs/DATA_FILE_ANALYSIS.md) - Technical analysis of data structure

### Maintenance
- Added `cleanup-data` script to remove 9 unused legacy JSON files
- Identified orphaned files: treasury_30y, yield_*.json, *_monthly.json files
- Created automated cleanup tool (`scripts/cleanup-data.sh`)

### [0.3.0] - 2025-01-18

### Changed
- **Status Display Redesign**: Complete UX overhaul for positive, informative experience
  - **Always green status** - Shows "Data Active" instead of alarming red/yellow
  - **Removed non-functional button** - "Update Data" button didn't work in static mode
  - **New categorization** - Series grouped as "Current", "Recent", "Updating Soon", "Refreshing"
  - **Calming language** - Replaced "Stale" with positive terms
  - **Complete visibility** - Shows ALL 15 series with their status
  - **Educational content** - Explains why timing varies (normal behavior)

### Removed
- **"Update Data" button** - Non-functional in static export mode (use CLI: `pnpm run fetch-data`)
- **Negative status colors** - Red "Out of Sync" replaced with green "Data Active"
- **Drift-based alarms** - 7-day drift shown as normal categorization, not error

### Documentation
- Added [UX_IMPROVEMENTS.md](docs/UX_IMPROVEMENTS.md) - Full redesign rationale
- Updated all documentation indexes to include UX changes
- Added CLI-only update notes to QUICK_REF.md

### Technical
- Simplified `CompactDataStatus.tsx` component (removed unused imports/state)
- New `SeriesGroup` interface for freshness categorization
- Removed dependencies on non-functional `triggerDataUpdate()` function

### [0.2.0] - 2025-10-18

### Added
- **S&P 500 Index**: Major equity market benchmark for correlation analysis with volatility metrics
  - FRED ID: `SP500`
  - Category: Markets & FX (absolute values)
  - Unit: Index points
  - Use case: Compare with VIX to analyze market performance vs. volatility
  
- **EUR/USD Exchange Rate**: Most traded currency pair in the world
  - FRED ID: `DEXUSEU`
  - Category: Markets & FX (absolute values)
  - Unit: USD per 1 EUR
  - Use case: Dollar strength analysis from European perspective
  
### Changed
- **Category Rename**: "Currency & FX" → "Markets & FX" to reflect inclusion of equity markets
- **Category Icon**: Updated from 💵 to 📊 to represent broader market coverage
- **Data Series Count**: Increased from 13 to 15 total series
- **Tooltip Formatting**: Added support for USD unit with 4 decimal precision for forex pairs
- **Markets & FX Category**: Now includes 3 series (S&P 500, EUR/USD, Dollar Index)

### Enhanced
- Better correlation analysis capabilities:
  - VIX vs S&P 500 (volatility vs market performance)
  - Dollar Index vs EUR/USD (complementary USD strength views)
  - Treasury yields vs S&P 500 (risk-on/risk-off dynamics)
  - EUR/USD vs Oil (energy import costs for Europe)

### [0.1.0] - 2025-10-18

### Added
- **Multi-Year Selection**: Users can now select multiple years simultaneously to compare trends across different time periods
- **Smart Mode Switching**: Automatic transition between single-year and multi-year modes
  - Single-year mode: Enables month-level filtering for detailed analysis
  - Multi-year mode: Shows all data across selected years, automatically disables month selection
- **Visual Indicators**: Added checkmarks and informative notices when multiple years are selected
- **Enhanced User Experience**: Clear feedback when switching between modes with helpful tooltips
- **Improved X-Axis Labels for Multi-Year**: 
  - Labels now show both month and year (e.g., "Jan 2024", "Mar '24", "Jul 2025")
  - Full year format for Jan/Feb for clear year identification
  - 2-digit year format for other months to save space
  - Labels are angled at -45° for better readability with longer text
  - Intelligent spacing based on total data points

### Changed
- Year selection now uses a Set data structure to support multiple selections
- Month selector is automatically disabled when multiple years are selected
- Data filtering logic updated to support both single and multi-year views
- Y-axis domain calculation now accounts for multiple years of data
- Current values display updated to show latest values across selected years

### Technical Details
- Replaced `selectedYear` (string) with `selectedYears` (Set<string>)
- Added `isMultiYearSelection` computed property to determine current mode
- Updated all data filtering functions to use Set-based year filtering
- Modified `availableMonths` calculation to only run in single-year mode
- Enhanced UI to show selection count and mode status

### User Guide
1. **Single-Year + Months Mode** (Default)
   - Click on one year
   - Month selector is enabled
   - Select specific months for detailed analysis
   - Best for: Quarterly reports, seasonal analysis, monthly trends

2. **Multi-Year Mode**
   - Click on multiple years (e.g., 2023, 2024, 2025)
   - Month selector automatically disables
   - View all data across selected years
   - Best for: Year-over-year comparisons, long-term trends, multi-year analysis

3. **Switching Modes**
   - Add a second year → Automatically switches to multi-year mode (months clear)
   - Remove years until only one remains → Automatically enables month selection

### Documentation Updates
- Updated README.md with new multi-year selection feature
- Added FAQ entries explaining when and why month selection is disabled
- Enhanced feature list to highlight flexible time filtering capabilities

---

## Development History

The pre-1.0 versions (0.1.x - 0.3.x) represent the active development phase where core features were built, tested, and refined. Version 1.0.0 marks the first production-ready release with stable APIs, comprehensive documentation, and deployment readiness.
