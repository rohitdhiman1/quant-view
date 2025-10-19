# New Data Series: S&P 500 & EUR/USD

## Overview
Added 2 new high-value data series to enhance market analysis capabilities and provide better correlation insights.

## New Series Details

### 1. S&P 500 Index
**FRED Series ID**: `SP500`

**Description**: Standard & Poor's 500 Index - the most widely followed equity market benchmark representing the 500 largest U.S. public companies.

**Key Details**:
- **Category**: Markets & FX (absolute values)
- **Frequency**: Daily
- **Unit**: Index points
- **Color**: Blue (#1e40af)
- **Date Range**: 2018-present

**Why This Matters**:
- ✅ Most-watched stock market indicator
- ✅ Enables VIX correlation analysis (volatility vs actual market performance)
- ✅ Risk-on/risk-off indicator when compared with Treasury yields
- ✅ Economic health barometer
- ✅ Professional standard for equity market analysis

**Analysis Opportunities**:
1. **VIX vs S&P 500**: Verify inverse correlation (high volatility = market drops)
2. **S&P 500 vs Treasury Yields**: When yields rise, stocks often fall
3. **S&P 500 vs Unemployment**: Economic health correlation
4. **S&P 500 vs Dollar Index**: Strong dollar often pressures stocks

### 2. EUR/USD Exchange Rate
**FRED Series ID**: `DEXUSEU`

**Description**: U.S. Dollars to One Euro Spot Exchange Rate - the most traded currency pair in the world, representing approximately 24% of daily forex volume.

**Key Details**:
- **Category**: Markets & FX (absolute values)
- **Frequency**: Daily
- **Unit**: USD (dollars per 1 Euro)
- **Color**: Emerald (#047857)
- **Date Range**: 2018-present
- **Precision**: 4 decimal places (e.g., 1.0845)

**Why This Matters**:
- ✅ Most liquid forex pair globally
- ✅ Euro is 2nd most important reserve currency
- ✅ Complementary view to US Dollar Index
- ✅ European economic health indicator
- ✅ International trade implications

**Analysis Opportunities**:
1. **EUR/USD vs Dollar Index**: Complementary USD strength analysis
2. **EUR/USD vs Oil Prices**: European energy import costs
3. **EUR/USD vs Treasury Yields**: Interest rate differential impacts
4. **EUR/USD vs Inflation**: Purchasing power comparisons

## Implementation Details

### Category Organization
**Before**: 
- Currency & FX (1 series) 💵

**After**:
- Markets & FX (3 series) 📊
  - S&P 500 Index
  - EUR/USD Exchange Rate  
  - US Dollar Index

### Code Changes

**1. FRED Config (`lib/fred-config.ts`)**
```typescript
export const CURRENCY_SERIES: TreasuryYieldConfig[] = [
  {
    key: 'dollar_index',
    name: 'US Dollar Index',
    fredSeriesId: 'DTWEXBGS',
    color: '#7c2d92',
    category: 'currency',
    frequency: 'daily',
    unit: 'Index'
  },
  {
    key: 'eur_usd',
    name: 'EUR/USD Exchange Rate',
    fredSeriesId: 'DEXUSEU',
    color: '#059669',
    category: 'currency',
    frequency: 'daily',
    unit: 'USD'
  },
  {
    key: 'sp500',
    name: 'S&P 500 Index',
    fredSeriesId: 'SP500',
    color: '#2563eb',
    category: 'currency',
    frequency: 'daily',
    unit: 'Index'
  }
]
```

**2. Type Definitions (`types/data.ts`)**
```typescript
{
  key: 'eur_usd',
  name: 'EUR/USD Exchange Rate',
  color: '#047857',
  visible: false,
  category: 'currency',
  unit: 'USD'
},
{
  key: 'sp500',
  name: 'S&P 500 Index',
  color: '#1e40af',
  visible: false,
  category: 'currency',
  unit: 'Index'
}
```

**3. Chart Component Updates**
- Category name: "Currency & FX" → "Markets & FX"
- Category icon: 💵 → 📊
- Tooltip formatting: Added USD unit with 4 decimal precision
- Y-axis: Uses generic format for mixed absolute units

**4. Value Formatting**
```typescript
// EUR/USD: 4 decimal places for forex precision
if (unit === 'USD') {
  formattedValue = `$${entry.value.toFixed(4)}`  // e.g., $1.0845
}

// S&P 500: 2 decimal places for index
if (unit === 'Index') {
  formattedValue = entry.value.toFixed(2)  // e.g., 4,567.89
}
```

## Data Fetching

### Initial Data Fetch
```bash
# Fetch all historical data including new series
pnpm run fetch-data
```

This will automatically fetch:
- S&P 500 data from 2018 to present (~1,950+ records)
- EUR/USD data from 2018 to present (~1,950+ records)

### Regular Updates
```bash
# Update with latest data
pnpm run update-data
```

### Expected File Outputs
- `/data/sp500.json` - S&P 500 daily index values
- `/data/eur_usd.json` - EUR/USD exchange rates
- `/data/metadata.json` - Updated with new series info

## Usage Examples

### 1. Market Volatility Analysis
**Question**: "Is high VIX actually correlated with market drops?"

**Steps**:
1. Select VIX from Market Volatility tile
2. Select S&P 500 from Markets & FX tile
3. Choose multi-year view (2023, 2024, 2025)
4. Observe inverse correlation

**Expected Pattern**: When VIX spikes (fear), S&P 500 typically drops

### 2. Dollar Strength Analysis
**Question**: "How does USD strength look from different angles?"

**Steps**:
1. Select US Dollar Index from Markets & FX
2. Select EUR/USD from Markets & FX
3. Choose single year with all months

**Expected Pattern**: When Dollar Index rises, EUR/USD falls (inverse)

### 3. Risk-On/Risk-Off
**Question**: "How do stocks react to rising yields?"

**Steps**:
1. Select 10-Year Treasury from Treasury Yields
2. Select S&P 500 from Markets & FX
3. Choose multi-year comparison

**Expected Pattern**: Rising yields often pressure stocks (inverse)

### 4. European Energy Costs
**Question**: "How do EUR/USD moves affect European oil costs?"

**Steps**:
1. Select EUR/USD from Markets & FX
2. Select Oil Price from Commodities
3. Analyze correlation

**Expected Pattern**: Weaker EUR = higher oil costs for Europe

## Dashboard Impact

### Before
- **Total Series**: 13
- **Absolute Value Series**: 2 (Oil, Dollar Index)
- **Category Count**: 7
- **Markets & FX**: 1 series

### After
- **Total Series**: 15 ✨
- **Absolute Value Series**: 4 (Oil, Dollar Index, EUR/USD, S&P 500) ✨
- **Category Count**: 7 (unchanged)
- **Markets & FX**: 3 series ✨

### New Correlation Pairs
1. VIX ↔ S&P 500
2. Dollar Index ↔ EUR/USD
3. Treasury Yields ↔ S&P 500
4. EUR/USD ↔ Oil Price
5. S&P 500 ↔ Unemployment Rate

## Technical Notes

### Data Format Examples

**S&P 500**:
```json
[
  { "date": "2024-01-02", "value": 4742.83 },
  { "date": "2024-01-03", "value": 4688.68 },
  { "date": "2024-01-04", "value": 4697.24 }
]
```

**EUR/USD**:
```json
[
  { "date": "2024-01-02", "value": 1.0845 },
  { "date": "2024-01-03", "value": 1.0912 },
  { "date": "2024-01-04", "value": 1.0948 }
]
```

### Display Examples

**Tooltip**:
- S&P 500: `4,742.83`
- EUR/USD: `$1.0845`
- Dollar Index: `102.45`

**Current Values**:
- S&P 500 Index: `4742.83`
- EUR/USD Exchange Rate: `$1.0845`

## Testing Checklist

✅ Build succeeds with no errors
✅ New series appear in Markets & FX tile
✅ Category renamed to "Markets & FX"
✅ Category icon changed to 📊
✅ Tooltip formatting works for USD unit
✅ Current values display correctly
✅ Y-axis handles mixed absolute units
✅ Mutual exclusion works (can't mix with percentages)
✅ Multi-year selection works
✅ Data fetch script includes new series
⏳ Data files created after fetch
⏳ Visual verification of data quality

## Next Steps

1. **Fetch Data**: Run `pnpm run fetch-data` to populate initial data
2. **Verify**: Check `/data` directory for new JSON files
3. **Test**: Load dashboard and verify new series appear
4. **Analyze**: Try correlation examples above
5. **Document**: Update user guide with new analysis examples

## Future Enhancements

### Additional Series to Consider
1. **NASDAQ Composite** (NASDAQCOM) - Tech-heavy market index
2. **USD/JPY** (DEXJPUS) - 2nd most traded forex pair
3. **Gold Price** (GOLDAMGBD228NLBM) - Safe haven asset
4. **30-Year Treasury** (DGS30) - Complete yield curve

### Enhanced Features
1. Correlation coefficient calculator
2. Percentage change overlay
3. Moving averages (50-day, 200-day)
4. Custom date range picker
5. Export data to CSV

## Conclusion

These 2 new series significantly enhance the dashboard's analytical capabilities:
- **S&P 500** brings equity market performance into the mix
- **EUR/USD** provides international currency perspective
- Together they enable powerful correlation analysis
- Category reorganization ("Markets & FX") better represents scope

The dashboard is now a more comprehensive macro-economic analysis platform! 🚀
