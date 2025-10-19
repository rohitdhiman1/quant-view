# Quant View - Financial Analytics Dashboard

A professional, interactive financial analytics dashboard built with Next.js, featuring real-time Federal Reserve economic data integration via the FRED API.

![Dashboard Preview](https://img.shields.io/badge/Dashboard-Live%20FRED%20Data-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan)
![Recharts](https://img.shields.io/badge/Recharts-3.2.1-orange)

---

## 📚 Documentation Categories

### Navigation & Organization
- [INDEX.md](docs/INDEX.md) - Master index with search
- [QUICK_REF.md](docs/QUICK_REF.md) - Quick reference guide
- [MAP.md](docs/MAP.md) - Visual documentation map
- [docs/README.md](docs/README.md) - Documentation hub

### Fixes & Improvements
- [13_SERIES_FIX.md](docs/13_SERIES_FIX.md) - Display text correction
- [404_FIX.md](docs/404_FIX.md) - Symlink solution
- [SETUP_SCRIPT.md](docs/SETUP_SCRIPT.md) - Automated setup
- [UX_IMPROVEMENTS.md](docs/UX_IMPROVEMENTS.md) - Positive status design

### Data Synchronization
- [SYNC_STRATEGY.md](docs/SYNC_STRATEGY.md) - Why series update differently
- [SYNC_MONITORING.md](docs/SYNC_MONITORING.md) - CLI monitoring tool
- [DRIFT_EXPLANATION.md](docs/DRIFT_EXPLANATION.md) - Understanding data drift

### Features
- [MULTI_YEAR_X_AXIS_IMPROVEMENTS.md](docs/MULTI_YEAR_X_AXIS_IMPROVEMENTS.md) - X-axis enhancements
- [NEW_SERIES_SP500_EURUSD.md](docs/NEW_SERIES_SP500_EURUSD.md) - New series addition

---

## 🎯 Features

- **Comprehensive Economic Data**: 15 data series including Treasury yields, inflation (CPI), market volatility (VIX, GVZ), employment, commodities (Oil), currency (EUR/USD, Dollar Index), and equity markets (S&P 500)
- **Interactive Multi-Series Charts**: Professional Recharts visualizations with advanced filtering
- **Smart Metric Selection**: Mutual exclusion between percentage and absolute value metrics
- **Advanced Time Filtering**: Year and month selection for precise time range analysis
- **Dark Mode Toggle**: Beautiful light/dark theme with persistent preference storage
- **Data Freshness Indicators**: Real-time status of data age with update functionality
- **Compact Modern UI**: Horizontal tile-based layout optimized for space efficiency
- **Static Export Ready**: Deploy anywhere as static HTML
- **TypeScript**: Full type safety throughout the application

## 📊 Dashboard Capabilities

### Data Series (15 Total)
- **Treasury Yields** (5): 1Y, 2Y, 5Y, 10Y, 20Y bond yields from Federal Reserve
- **Inflation Metrics** (2): CPI All Items & Core CPI with interpolation
- **Market Volatility** (2): VIX (stocks) & GVZ (gold) indices
- **Employment** (1): Unemployment Rate
- **Commodities** (1): WTI Crude Oil Price ($/barrel)
- **Markets & FX** (3): S&P 500 Index, EUR/USD Exchange Rate, US Dollar Index
- **Economic Indicators** (1): Yield Curve Spread (10Y-2Y)

### Interactive Features
- **Smart Metric Selection**: Automatic mutual exclusion between percentage and absolute metrics
- **Category Tiles**: Hover popups with individual series selection
- **Advanced Time Filtering**: 
  - **Multi-Year Selection**: Select multiple years to compare trends across years
  - **Month-Level Filtering**: When single year is selected, filter by specific months
  - **Smart Mode Switching**: Month selection automatically disabled in multi-year mode
- **Data Status**: Real-time freshness indicator with update button
- **Current Values**: Live display of latest values for selected metrics
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Export Ready**: Static build for CDN deployment

## ✨ Recent Improvements

### v2.1 - Advanced Time Filtering
- 📆 **Multi-Year Selection**: Select multiple years simultaneously to compare trends across time periods
- 🔄 **Smart Mode Switching**: Automatic transition between single-year (with months) and multi-year modes
- 📊 **Enhanced Visualization**: Seamless data display for both single and multi-year selections
- ⚡ **Optimized Performance**: Efficient data filtering for large time ranges

### v2.0 - Modern Financial Dashboard
- 📊 **Expanded Data**: 13 economic indicators including VIX, GVZ, Oil, Dollar Index
- 🎯 **Smart Selection**: Mutual exclusion between percentage and absolute metrics
- 📅 **Month Selection**: Granular time filtering with multi-select month grid
- 🎨 **Horizontal Layout**: Space-efficient single-row category tiles
- 💾 **Compact Status**: Streamlined data freshness indicator in header
- 🔄 **Enhanced Filtering**: Category-based tile system with hover popups
- ⚡ **Performance**: Optimized rendering and state management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- FRED API key from [St. Louis Fed](https://fred.stlouisfed.org/docs/api/api_key.html)

### Installation

```bash
# Clone the repository
git clone https://github.com/rohitdhiman1/quant-view.git
cd quant-view

# Install dependencies
pnpm install

# Set up environment variables
echo "FRED_API_KEY=your_fred_api_key_here" > .env.local
echo "FRED_API_BASE_URL=https://api.stlouisfed.org/fred" >> .env.local

# Run setup script (creates necessary symlinks)
pnpm run setup
```

**Note:** The setup script creates a symlink from `public/data` to `data/` so JSON files are accessible via HTTP. This is required for the data freshness indicator to work.

### Initial Data Setup (Required - One Time Only)

```bash
# Fetch historical data (2018-present) - REQUIRED for first-time setup
pnpm run fetch-data
```

**When to run `fetch-data`:**
- ✅ **First time setting up the project**
- ✅ **After cloning the repository**
- ✅ **If you want to completely refresh all historical data**
- ✅ **If your `/data` directory is empty or corrupted**

This downloads and processes:
- **Treasury Yields**: 1Y, 5Y, 10Y, 20Y daily data (~1,947 records each)
- **CPI Inflation**: Monthly data interpolated to daily business days (~2,034 records each)
- **Historical range**: January 2018 to present
- **Automatic backup**: Saves existing data before overwriting

### Development

```bash
# Start development server
pnpm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build static export
pnpm run build

# Output in /out directory ready for deployment
```

## 📈 Data Management

### Understanding Your Data

The dashboard integrates **13 data series** from multiple sources:

| Series | Source | Frequency | Records | Type | Category |
|--------|--------|-----------|---------|------|----------|
| 1-Year Treasury | DGS1 | Daily | ~1,947 | % | Yields |
| 2-Year Treasury | DGS2 | Daily | ~1,947 | % | Yields |
| 5-Year Treasury | DGS5 | Daily | ~1,947 | % | Yields |
| 10-Year Treasury | DGS10 | Daily | ~1,947 | % | Yields |
| 20-Year Treasury | DGS20 | Daily | ~1,947 | % | Yields |
| 30-Year Treasury | DGS30 | Daily | ~1,947 | % | Yields |
| CPI All Items | CPIAUCSL | Monthly → Daily | ~2,034 | % | Inflation |
| Core CPI | CPILFESL | Monthly → Daily | ~2,034 | % | Inflation |
| VIX | VIXCLS | Daily | ~1,947 | % | Volatility |
| GVZ | GVZCLS | Daily | ~1,947 | % | Volatility |
| Unemployment Rate | UNRATE | Monthly → Daily | ~2,034 | % | Employment |
| WTI Crude Oil | DCOILWTICO | Daily | ~1,947 | $/barrel | Commodities |
| US Dollar Index | DTWEXBGS | Daily | ~1,947 | Index | Currency |

### When to Run Data Commands

#### `pnpm run fetch-data` - Complete Historical Fetch
**Use for:** Initial setup, complete data refresh, or data corruption recovery

```bash
pnpm run fetch-data
```

**When to run:**
- ✅ **First time setup** (required)
- ✅ **After git clone** (required)
- ✅ **Monthly/quarterly** for complete data refresh
- ✅ **If `/data` directory is missing or corrupted**
- ⚠️ **Uses more API calls** (fetches all historical data)

**What it does:**
- Downloads complete historical data from 2018 to present
- Calculates year-over-year inflation rates from CPI index values
- Interpolates monthly CPI data to daily business days
- Backs up existing data automatically
- Replaces all data files

#### `pnpm run update-data` - Incremental Updates
**Use for:** Regular maintenance, checking for new data

```bash
pnpm run update-data
```

**When to run:**
- ✅ **Weekly/monthly routine** (recommended)
- ✅ **Before important analysis or presentations**
- ✅ **When you want the latest data without full refresh**
- ✅ **Minimal API usage** (only fetches new data since last update)

**What it does:**
- Checks each series for new data since last update
- For treasury yields: Appends new daily records
- For CPI: Fetches new monthly data and re-interpolates entire daily series
- Updates metadata with latest information
- Preserves existing data structure

### Smart Update Strategy

**✅ Recommended workflow:**

```bash
# Step 1: Check for updates (minimal API calls)
pnpm run update-data

# Step 2: If updates found, rebuild the app
pnpm run build
```

**📅 Update frequency recommendations:**
- **Treasury Yields**: Updated daily by Fed (business days only)
- **CPI Data**: Updated monthly by Bureau of Labor Statistics
- **Your updates**: Weekly or monthly is sufficient
- **Avoid**: Daily updates (wastes API quota, limited new data)

### Data Interpolation Details

**Why CPI interpolation?**
- CPI is published **monthly** (12 data points/year)
- Treasury yields are **daily** (250+ data points/year)
- Interpolation creates smooth daily CPI for consistent visualization

**How it works:**
1. Fetch monthly CPI index values from FRED
2. Calculate year-over-year inflation rates 
3. Apply linear interpolation between monthly points
4. Generate daily values for business days only
5. Align perfectly with treasury yield date ranges

**Files created:**
- `cpi.json` - Daily interpolated CPI inflation rates
- `cpi_monthly.json` - Raw monthly CPI index values  
- `core_cpi.json` - Daily interpolated Core CPI inflation rates
- `core_cpi_monthly.json` - Raw monthly Core CPI index values

### Data Persistence & Backup

- **Treasury Files**: `/data/treasury_1y.json`, `treasury_5y.json`, `treasury_10y.json`, `treasury_20y.json`
- **CPI Files**: `/data/cpi.json`, `/data/core_cpi.json` (daily interpolated)
- **Raw CPI Files**: `/data/cpi_monthly.json`, `/data/core_cpi_monthly.json` (original monthly data)
- **Metadata**: `/data/metadata.json` (tracks last update dates and record counts)
- **Automatic Backups**: `/data/backup/` with timestamps
- **Format**: Standard JSON arrays with `{date: "YYYY-MM-DD", value: number}` structure

## 🛠 Technology Stack

- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Language**: TypeScript with full type safety
- **Styling**: Tailwind CSS 4.0 with dark mode support
- **Charts**: Recharts 3.2.1 for interactive visualizations
- **State Management**: React Context API for theme management
- **Data Source**: Federal Reserve Economic Data (FRED) API
- **Deployment**: Static HTML export for edge deployment

## 📁 Project Structure

```
quant-view/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard page (server component)
│   ├── layout.tsx         # Root layout with ThemeProvider
│   ├── globals.css        # Global styles with dark mode
│   └── api/data/update/   # API routes (static export compatible)
├── components/            # React components
│   ├── ChartComponent.tsx # Multi-series chart with filters
│   ├── MonthSelector.tsx  # Month selection grid
│   ├── CompactDataStatus.tsx # Data freshness indicator
│   ├── ThemeToggle.tsx    # Dark mode toggle button
│   └── HeaderActions.tsx  # Header action components
├── contexts/              # React contexts
│   └── ThemeContext.tsx   # Theme management context
├── lib/                   # Utility libraries
│   ├── fred-client.ts     # FRED API client
│   ├── fred-config.ts     # API configuration & series definitions
│   ├── interpolation.ts   # CPI interpolation utilities
│   └── data-refresh.ts    # Data refresh utilities
├── scripts/               # Data management scripts
│   ├── fetch-initial-data.ts  # One-time data fetch
│   └── update-data.ts     # Incremental updates
├── types/                 # TypeScript definitions
│   └── data.ts           # Data series type definitions
├── data/                  # Persisted data files (13 series)
│   ├── treasury_*.json    # Treasury yield data (6 files)
│   ├── cpi*.json         # CPI inflation data (2 files)
│   ├── vix.json          # VIX volatility index
│   ├── gvz.json          # GVZ gold volatility
│   ├── unemployment_rate*.json # Employment data
│   ├── oil_price.json    # WTI crude oil prices
│   ├── dollar_index.json # US Dollar Index
│   ├── yield_curve_spread.json # 10Y-2Y spread
│   ├── metadata.json     # Data tracking & freshness
│   └── backup/           # Automatic backups with timestamps
└── out/                   # Static export output
```

## 🔧 Available Scripts

```bash
# Development
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm run start            # Start production server
pnpm run lint             # Run ESLint

# Data Management
pnpm run fetch-data       # Initial/complete data fetch (first-time setup)
pnpm run update-data      # Incremental updates (regular maintenance)
```

## 🚀 Deployment

### Static Hosting (Recommended)

```bash
# Build static export
pnpm run build

# Deploy /out directory to:
# - Vercel, Netlify, GitHub Pages
# - AWS S3, Azure Storage, GCP Storage
# - Any CDN or static hosting service
```

### Automated Data Updates

For production, set up scheduled data updates:

```yaml
# .github/workflows/update-data.yml
name: Update Financial Data
on:
  schedule:
    - cron: '0 9 * * 1' # Weekly on Mondays at 9 AM
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm run update-data
        env:
          FRED_API_KEY: ${{ secrets.FRED_API_KEY }}
      - run: pnpm run build
      # Deploy /out directory
```

## 📊 FRED API Integration

### Complete Series Configuration

| Series | FRED ID | Description | Unit | Category | Color |
|--------|---------|-------------|------|----------|-------|
| 1-Year Treasury | DGS1 | 1-Year Treasury Constant Maturity Rate | % | Yields | Emerald-600 |
| 2-Year Treasury | DGS2 | 2-Year Treasury Constant Maturity Rate | % | Yields | Blue-600 |
| 5-Year Treasury | DGS5 | 5-Year Treasury Constant Maturity Rate | % | Yields | Teal-600 |
| 10-Year Treasury | DGS10 | 10-Year Treasury Constant Maturity Rate | % | Yields | Purple-600 |
| 20-Year Treasury | DGS20 | 20-Year Treasury Constant Maturity Rate | % | Yields | Pink-600 |
| 30-Year Treasury | DGS30 | 30-Year Treasury Constant Maturity Rate | % | Yields | Rose-600 |
| CPI All Items | CPIAUCSL | Consumer Price Index for All Urban Consumers | % | Inflation | Purple-500 |
| Core CPI | CPILFESL | CPI excluding Food & Energy | % | Inflation | Pink-500 |
| VIX | VIXCLS | CBOE Volatility Index | % | Volatility | Red-500 |
| GVZ | GVZCLS | CBOE Gold Volatility Index | % | Volatility | Amber-500 |
| Unemployment | UNRATE | Unemployment Rate | % | Employment | Indigo-500 |
| WTI Oil | DCOILWTICO | Crude Oil Prices: West Texas Intermediate | $/barrel | Commodities | Orange-700 |
| Dollar Index | DTWEXBGS | Trade Weighted U.S. Dollar Index | Index | Currency | Green-700 |

### API Features

- **Rate Limiting**: 500ms delays between requests (120 requests/minute limit)
- **Error Handling**: Graceful failures with automatic backups
- **Incremental Updates**: Only fetch new data since last update
- **Smart Interpolation**: Monthly CPI data interpolated to daily business days
- **Data Validation**: Filters invalid data points and handles missing values

## 🔍 Data Format

### Treasury Data Structure (Daily)
```json
[
  {
    "date": "2018-01-02",
    "value": 2.46
  },
  {
    "date": "2018-01-03", 
    "value": 2.44
  }
]
```

### CPI Data Structure (Daily Interpolated)
```json
[
  {
    "date": "2018-01-01",
    "value": 0.0000
  },
  {
    "date": "2018-01-02",
    "value": 0.0087
  }
]
```

### Raw Monthly CPI Data
```json
[
  {
    "date": "2018-01-01",
    "value": 248.859
  },
  {
    "date": "2018-02-01",
    "value": 249.529
  }
]
```

### Metadata Tracking
```json
{
  "lastUpdated": "2025-10-16",
  "seriesInfo": {
    "treasury_10y": {
      "latestDate": "2025-10-15",
      "recordCount": 1947,
      "fredSeriesId": "DGS10"
    },
    "cpi": {
      "latestDate": "2025-10-15", 
      "recordCount": 2034,
      "fredSeriesId": "CPIAUCSL"
    }
  }
}
```

## 🎨 UI/UX Features

### Chart Visualization
- **Daily Data Visualization**: High-resolution daily data with smooth interpolation
- **Multi-Series Support**: Compare up to 13 different economic indicators
- **Flexible Time Ranges**: 
  - **Single-Year + Months**: View specific months within a year for detailed analysis
  - **Multi-Year**: Select multiple years for long-term trend comparison
- **Custom Tooltips**: Context-aware formatting (%, $, Index values)
- **Responsive Legend**: Color-coded series with current values
- **Y-Axis Formatting**: Automatic unit detection and formatting

### Interactive Controls
- **Category Tiles**: Organized into 7 categories with hover popups
  - Treasury Yields (5 series)
  - Inflation Metrics (2 series)
  - Market Volatility (2 series)
  - Labor Market (1 series)
  - Economic Indicators (1 series)
  - Commodities (1 series)
  - Markets & FX (3 series: S&P 500, EUR/USD, Dollar Index)
- **Smart Selection**: Mutual exclusion between percentage and absolute metrics
- **Year Filtering**: Select specific years (2018-2025) with chips
- **Month Selection**: Multi-select month grid with range support
- **Current Values Display**: Live values for selected metrics

### Theme System
- **Dark Mode Toggle**: Beautiful light/dark themes inspired by modern financial apps
- **Persistent Preference**: Saves theme choice to localStorage
- **Smooth Transitions**: 300ms CSS transitions for seamless switching
- **Comprehensive Coverage**: All components styled for both themes
  - Header and navigation
  - Metric cards with colored accents
  - Category tiles and popups
  - Chart and tooltips
  - Time selectors
  - Data status indicators

### Data Management UI
- **Compact Status Indicator**: Top-right header with color-coded freshness
  - 🟢 Green: Data current (< 7 days old)
  - 🟡 Yellow: Update available (7-14 days old)
  - 🔴 Red: Data stale (> 14 days old)
- **Hover Tooltip**: Detailed status with update button
- **Animated Pulse**: Visual feedback for current data
- **Update Functionality**: One-click data refresh from UI

### Layout Optimization
- **Horizontal Tile Layout**: Space-efficient single-row design
- **Full-Width Responsive**: No artificial width constraints
- **Compact Month Grid**: 12 columns for minimal vertical space
- **Professional Styling**: Modern cards, shadows, and gradients

### Data Visualization Details

The dashboard handles **large datasets efficiently**:
- **Treasury Yields**: 1,947+ daily data points per series (business days 2018-2025)
- **CPI Inflation**: 2,034+ interpolated daily data points (smooth daily curves)
- **Performance Optimized**: Year filtering for responsive interaction
- **Business Days Only**: Charts respect market calendar (Monday-Friday)
- **Aligned Time Series**: All data perfectly synchronized for comparison

## 🔐 Environment Variables

```bash
# Required
FRED_API_KEY=your_fred_api_key_here

# Optional
FRED_API_BASE_URL=https://api.stlouisfed.org/fred
```

## 📋 FAQ

**Q: Do I need to run fetch-data every time?**
A: No! Only run `pnpm run fetch-data` once for initial setup. Use `pnpm run update-data` for regular updates.

**Q: What's the difference between fetch-data and update-data?**
A: `fetch-data` downloads complete historical data (first-time setup). `update-data` only gets new data since your last update (maintenance).

**Q: How often should I update data?**
A: Weekly or monthly. Treasury data updates daily (business days), CPI updates monthly. No need for daily updates.

**Q: Why is CPI data interpolated?**
A: CPI is published monthly, but treasury yields are daily. Interpolation creates smooth daily CPI curves for consistent visualization.

**Q: Can I deploy this as a static site?**
A: Yes! Run `pnpm run build` and deploy the `/out` directory to any static hosting service.

**Q: What if the FRED API is down?**
A: Your existing data continues to work. Updates will resume when the API is available.

**Q: How much API quota does this use?**
A: `fetch-data` uses ~13 requests (one per series). `update-data` uses fewer (only checks for new data).

**Q: What files should I backup?**
A: The entire `/data` directory contains all your persisted data and automatic backups.

**Q: How does dark mode work?**
A: Click the sun/moon icon in the top-right header. Your preference is saved to localStorage and persists across sessions.

**Q: Why can't I select percentage and absolute metrics together?**
A: Different Y-axis scales (% vs $ vs Index) make comparison difficult. The UI enforces mutual exclusion for clearer visualization.

**Q: How do I select multiple years?**
A: Click on any year chip to add it to your selection. You can select multiple years to compare trends across time. Note that month selection is automatically disabled when multiple years are selected.

**Q: How do I select multiple months?**
A: Month selection is available only when a single year is selected. Click individual months in the grid, and the UI automatically creates ranges for consecutive selections (up to 6 months).

**Q: Why can't I select months when multiple years are selected?**
A: When viewing multiple years, month-level filtering is disabled to provide a clearer year-over-year comparison. Select a single year to enable month filtering for granular analysis.

**Q: What's the yield curve spread?**
A: The difference between 10-Year and 2-Year Treasury yields. A negative spread often signals recession risk.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- [Federal Reserve Economic Data (FRED)](https://fred.stlouisfed.org/) for providing free economic data APIs
- [Recharts](https://recharts.org/) for excellent React charting components
- [Next.js](https://nextjs.org/) for the fantastic React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

**Built with ❤️ for financial analysis and data visualization**
