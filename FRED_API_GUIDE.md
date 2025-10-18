# FRED API Integration Usage Guide

## Setup

1. **Get your FRED API key** from [https://fred.stlouisfed.org/docs/api/api_key.html](https://fred.stlouisfed.org/docs/api/api_key.html)

2. **Add API key to environment**:
   ```bash
   # Add to .env.local
   FRED_API_KEY=your_fred_api_key_here
   ```

## Initial Data Fetch

To fetch historical data from 2016 to present:

```bash
# Fetch all treasury yield data (5Y, 10Y, 15Y, 20Y) from FRED API
pnpm run fetch-data
```

This will:
- Fetch data from 2016-01-01 to today
- Save data to individual JSON files in `/data/` directory
- Create metadata tracking in `/data/metadata.json`
- Backup existing data before overwriting

## Incremental Updates

To update with only new data since last fetch:

```bash
# Update data with only new records
pnpm run update-data
```

This will:
- Check the last data date for each series
- Fetch only new data since that date
- Merge with existing data
- Update metadata with new record counts

## Automatic Updates

The dashboard includes automatic data refresh capabilities:

### 1. Manual Updates via UI
- Data freshness indicator shows in the dashboard
- Click "Update Data" button when data is stale
- Real-time status updates and progress

### 2. API Endpoints
```bash
# Check data freshness
GET /api/data/update

# Trigger data update
POST /api/data/update
```

### 3. Programmatic Updates
```javascript
import { checkDataFreshness, triggerDataUpdate } from '@/lib/data-refresh'

// Check if data needs updating
const freshness = await checkDataFreshness()
if (freshness.needsUpdate) {
  const result = await triggerDataUpdate()
  console.log(`Updated ${result.seriesUpdated.length} series`)
}
```

## Data Structure

### Metadata Format (`/data/metadata.json`)
```json
{
  "lastUpdated": "2025-10-16",
  "seriesInfo": {
    "treasury_5y": {
      "latestDate": "2025-10-15",
      "recordCount": 2584,
      "fredSeriesId": "GS5"
    }
  }
}
```

### Data Files
Each series is saved as individual JSON files:
- `/data/treasury_5y.json` - 5-Year Treasury yields
- `/data/treasury_10y.json` - 10-Year Treasury yields  
- `/data/treasury_15y.json` - 15-Year Treasury yields
- `/data/treasury_20y.json` - 20-Year Treasury yields

### Data Point Format
```json
[
  {
    "date": "2016-01-01",
    "value": 1.76
  }
]
```

## FRED Series IDs

| Series | FRED ID | Description |
|--------|---------|-------------|
| 5-Year Treasury | GS5 | 5-Year Treasury Constant Maturity Rate |
| 10-Year Treasury | GS10 | 10-Year Treasury Constant Maturity Rate |
| 15-Year Treasury | GS15 | 15-Year Treasury Constant Maturity Rate |
| 20-Year Treasury | GS20 | 20-Year Treasury Constant Maturity Rate |

## Rate Limiting

- FRED API allows 120 requests per minute
- Our client implements 500ms delays between requests
- Automatic retry logic for failed requests

## Error Handling

- Failed requests are logged but don't stop the process
- Individual series failures won't affect other series
- Backup system preserves data before updates
- Graceful fallbacks for missing data

## Production Deployment

### Static Site Generation
Data is fetched at build time for static deployment:
```bash
# Fetch latest data then build
pnpm run fetch-data && pnpm run build
```

### Scheduled Updates
Set up cron jobs or GitHub Actions for automatic updates:
```yaml
# .github/workflows/update-data.yml
name: Update Financial Data
on:
  schedule:
    - cron: '0 9 * * 1-5' # Weekdays at 9 AM
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
```

## Monitoring

The dashboard provides real-time data freshness monitoring:
- Visual indicators for data age
- Automatic staleness detection
- Manual refresh capabilities
- Update history and status

## Troubleshooting

### Common Issues

1. **API Key not found**
   ```
   ❌ FRED_API_KEY environment variable not set
   ```
   Solution: Add your FRED API key to `.env.local`

2. **Rate limit exceeded**
   ```
   FRED API error: 429 Too Many Requests
   ```
   Solution: Wait and retry. Our client handles this automatically.

3. **No new data available**
   ```
   📅 No new data available for 10-Year Treasury
   ```
   This is normal - FRED data isn't published on weekends/holidays.

### Debug Mode

Enable verbose logging:
```bash
DEBUG=1 pnpm run update-data
```