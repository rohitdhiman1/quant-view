# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Dev server (Turbopack)
npm run build            # Production build (static export to /out)
npm run lint             # ESLint
npm run fetch-data       # Full historical data fetch from FRED API (one-time)
npm run update-data      # Incremental data update (regular use)
npm run check-sync       # Data freshness report across all series
npm run setup            # Create public/data -> ../data symlink
```

## Architecture

This is a static-export Next.js dashboard that fetches financial time-series data from the FRED API, stores it as JSON files, and renders interactive charts.

### Data Pipeline

1. **Fetch scripts** (`scripts/fetch-initial-data.ts`, `scripts/update-data.ts`) call FRED API via `lib/fred-client.ts`
2. Series are defined in `lib/fred-config.ts` — each has a FRED series ID, category, frequency, and display config
3. Monthly series (CPI, unemployment) get linearly interpolated to daily via `lib/interpolation.ts`
4. Data lands in `/data/{series_key}.json` as `[{date, value}]` arrays; `data/metadata.json` tracks freshness
5. `public/data` is a symlink to `../data` so the static build can serve JSON files

### Two Metric Groups (Mutual Exclusion)

Series are split into two groups that **cannot be plotted together** (different Y-axis scales):

- **Percentage**: treasury yields (1Y/2Y/5Y/10Y/20Y), CPI, core CPI, unemployment rate, fed rate, yield curve spread
- **Absolute**: VIX, GVZ (points), oil price ($/barrel), S&P 500 (index), EUR/USD, dollar index

This is enforced in `ChartComponent.tsx` — selecting a series from one group deselects all from the other.

### Rendering

- `app/page.tsx` is a **Server Component** that reads all JSON files from `/data` at build time and passes them to the chart
- `components/ChartComponent.tsx` is the main **Client Component** (`'use client'`) — handles series selection, year/month filtering, and Recharts rendering
- Series display config (colors, units, visibility defaults) lives in `types/data.ts` (`SERIES_CONFIGS`)

### Key Conventions

- Static export only (`output: 'export'` in next.config.ts) — no server-side API routes at runtime
- Data updates happen via CLI scripts, not the web UI
- FRED API key goes in `.env.local` as `FRED_API_KEY`
- Path alias: `@/*` maps to project root
