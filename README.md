# Quant View

A financial dashboard that fetches publicly available economic data from the [FRED API](https://fred.stlouisfed.org/) and displays it as interactive charts.

## Data Series

**Percentage metrics** (shared Y-axis):
- Treasury Yields: 1Y, 2Y, 5Y, 10Y, 20Y
- Inflation: CPI, Core CPI
- Unemployment Rate
- Fed Rate
- Yield Curve Spread (10Y-2Y)

**Absolute metrics** (shared Y-axis):
- VIX, GVZ (volatility indices)
- Oil Price (WTI)
- S&P 500, EUR/USD, Dollar Index

Percentage and absolute metrics cannot be plotted together (different scales).

## Setup

```bash
git clone https://github.com/rohitdhiman1/quant-view.git
cd quant-view
npm install
npm run setup          # creates public/data symlink
```

Create `.env.local`:
```
FRED_API_KEY=your_key_here
```

Get a free API key from [FRED](https://fred.stlouisfed.org/docs/api/api_key.html).

## Operations Guide

### Fetch data (first time)

Downloads all historical data from 2018 to present:

```bash
npm run fetch-data
```

Run this once after cloning, or whenever you want a full refresh.

### Update data (regular use)

Fetches only new data since your last update:

```bash
npm run update-data
```

Run weekly or monthly. Treasury data updates daily (business days), CPI/unemployment update monthly.

### Check sync status

See how fresh each series is:

```bash
npm run check-sync
```

Different series update on different schedules — some drift between them is normal.

### Build & deploy

```bash
npm run build          # static export to /out
```

Deploy the `out/` directory to any static host (Cloudflare Pages, Vercel, etc.).

### Typical workflow

```bash
npm run update-data    # pull latest data
npm run build          # rebuild static site
git add data/
git commit -m "update data"
git push               # auto-deploys if CI is configured
```

## All Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (static export) |
| `npm run fetch-data` | Full historical data fetch |
| `npm run update-data` | Incremental data update |
| `npm run check-sync` | Data freshness report |
| `npm run setup` | Create symlinks |
| `npm run cleanup-data` | Remove orphaned data files |
| `npm run check-deploy` | Cloudflare deployment check |
| `npm run release` | Tag a new release |

## Stack

Next.js (static export), React, TypeScript, Tailwind CSS, Recharts

## Data Format

All series stored as JSON in `/data`:
```json
[{"date": "2024-01-02", "value": 4.25}, ...]
```

`metadata.json` tracks when each series was last updated.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FRED_API_KEY` | Yes | Your FRED API key |
| `FRED_API_BASE_URL` | No | Defaults to `https://api.stlouisfed.org/fred` |

## License

MIT
