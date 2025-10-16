# Quant View - Financial Analytics Dashboard

A professional, interactive financial analytics dashboard built with Next.js, featuring real-time Federal Reserve economic data integration via the FRED API.

![Dashboard Preview](https://img.shields.io/badge/Dashboard-Live%20FRED%20Data-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan)
![Recharts](https://img.shields.io/badge/Recharts-3.2.1-orange)

## 🎯 Features

- **Real Federal Reserve Data**: Live treasury yields (2Y, 5Y, 10Y, 30Y) from FRED API
- **Interactive Multi-Series Charts**: Professional Recharts visualizations with filtering
- **Smart Data Management**: Incremental updates to minimize API calls
- **Static Export Ready**: Deploy anywhere as static HTML
- **Professional UI**: Modern card-based design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## 📊 Dashboard Capabilities

- **Treasury Yields**: 2Y, 5Y, 10Y, 30Y bond yields from Federal Reserve
- **Interactive Filtering**: Category-based chip selection system
- **Data Freshness Indicators**: Visual status of data age and updates
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Export Ready**: Static build for CDN deployment

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
```

### Initial Data Setup (One-Time)

```bash
# Fetch historical treasury data (2016-present)
pnpm run fetch-data
```

This downloads:
- **2Y, 5Y, 10Y, 30Y Treasury yields**
- **Historical data from Jan 2016 to present**
- **~117+ records per series** (monthly Federal Reserve data)
- **Automatic backup** of existing data

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

### Current Data Status

Your dashboard includes **real Federal Reserve daily data**:
- **Data Range**: January 2018 to October 2025
- **4 Treasury Series**: 1Y, 5Y, 10Y, 20Y yields  
- **1,947+ data points each** (daily Fed data from business days)
- **Last Updated**: October 16, 2025
- **Data Files**: Persisted in `/data/` directory (~101KB per series)

### Updating Data

**✅ Your initial data is complete and persisted!** No need to re-fetch.

#### Smart Update Strategy

```bash
# Check for new data (recommended weekly/monthly)
pnpm run update-data

# If updates found, rebuild
pnpm run build
```

#### When to Update

🟢 **Good times:**
- **Weekly or monthly** (Fed publishes data monthly)
- **Before presentations/analysis**
- **When data feels outdated**

🔴 **Avoid:**
- **Every time you open the project** (unnecessary API calls)
- **Daily updates** (Fed data isn't published daily)

#### Update Workflow Example

```bash
# October 2025 example - your data goes through Oct 15, 2025
pnpm run update-data    # Fetches only new daily data (minimal API calls)
pnpm run build         # Rebuilds with latest data
```

### Data Persistence

- **Files**: Stored in `/data/treasury_*.json`
- **Metadata**: Tracked in `/data/metadata.json`
- **Backups**: Automatic backups in `/data/backup/`
- **Format**: Standard JSON with date/value pairs

## 🛠 Technology Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript with full type safety
- **Styling**: Tailwind CSS 4.0
- **Charts**: Recharts 3.2.1 for interactive visualizations
- **Data Source**: Federal Reserve Economic Data (FRED) API
- **Deployment**: Static HTML export

## 📁 Project Structure

```
quant-view/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard page
│   └── api/data/update/   # API routes (static export compatible)
├── components/            # React components
│   ├── ChartComponent.tsx # Multi-series chart
│   └── DataFreshnessIndicator.tsx
├── lib/                   # Utility libraries
│   ├── fred-client.ts     # FRED API client
│   ├── fred-config.ts     # API configuration
│   └── data-refresh.ts    # Data refresh utilities
├── scripts/               # Data management scripts
│   ├── fetch-initial-data.ts  # One-time data fetch
│   └── update-data.ts     # Incremental updates
├── types/                 # TypeScript definitions
├── data/                  # Persisted data files
│   ├── treasury_*.json    # Treasury yield data
│   ├── metadata.json      # Data tracking
│   └── backup/            # Automatic backups
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
pnpm run fetch-data       # Initial data fetch (one-time)
pnpm run update-data      # Incremental data updates
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

### Series Configuration

| Series | FRED ID | Description | Color |
|--------|---------|-------------|--------|
| 1-Year Treasury | DGS1 | 1-Year Treasury Constant Maturity Rate (Daily) | Blue-500 |
| 5-Year Treasury | DGS5 | 5-Year Treasury Constant Maturity Rate (Daily) | Emerald-500 |
| 10-Year Treasury | DGS10 | 10-Year Treasury Constant Maturity Rate (Daily) | Amber-500 |
| 20-Year Treasury | DGS20 | 20-Year Treasury Constant Maturity Rate (Daily) | Red-500 |

### API Features

- **Rate Limiting**: 500ms delays between requests
- **Error Handling**: Graceful failures with backups
- **Incremental Updates**: Only fetch new data since last update
- **Data Validation**: Filters invalid data points

## 🔍 Data Format

### Treasury Data Structure
```json
[
  {
    "date": "2016-01-01",
    "value": 2.09
  },
  {
    "date": "2016-02-01", 
    "value": 1.78
  }
]
```

### Metadata Tracking
```json
{
  "lastUpdated": "2025-10-16",
  "seriesInfo": {
    "treasury_10y": {
      "latestDate": "2025-09-01",
      "recordCount": 117,
      "fredSeriesId": "GS10"
    }
  }
}
```

## 🎨 Chart Features

- **Daily Data Visualization**: High-resolution daily treasury yield charts
- **Year Filtering**: Select specific years for focused analysis (2018-2025)
- **Multi-Series Support**: Compare multiple treasury yields
- **Interactive Filtering**: Category-based chip selection
- **Professional Styling**: Modern card-based design
- **Custom Tooltips**: Formatted dates and percentage values
- **Responsive Design**: Works on all device sizes
- **Export Ready**: Static generation compatible

### Year-Based Analysis

The dashboard intelligently handles **1,947+ daily data points per series** by allowing users to select specific years:
- **Current Year Default**: Automatically shows current year data
- **Historical Analysis**: Switch between 2018-2025 for trend analysis
- **Performance Optimized**: Only renders selected year data for smooth interaction
- **Data Point Counter**: Shows exactly how many days of data are displayed

## 🔐 Environment Variables

```bash
# Required
FRED_API_KEY=your_fred_api_key_here

# Optional
FRED_API_BASE_URL=https://api.stlouisfed.org/fred
```

## 📋 FAQ

**Q: Do I need to run the initial fetch again?**
A: No! Your data is persisted in `/data/` directory. Just run `pnpm run update-data` for new data.

**Q: How often should I update data?**
A: Weekly or monthly. Federal Reserve publishes treasury data monthly, not daily.

**Q: Can I deploy this as a static site?**
A: Yes! Run `pnpm run build` and deploy the `/out` directory anywhere.

**Q: What if the FRED API is down?**
A: Your existing data continues to work. Updates will resume when API is available.

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
