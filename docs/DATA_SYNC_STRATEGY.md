# Data Synchronization Strategy

## Problem Statement

The dashboard currently displays economic data from multiple FRED series that update at different frequencies and times:

- **Daily Series**: Treasury yields, VIX, GVZ, Oil prices, Currency rates, S&P 500
- **Monthly Series**: CPI, Core CPI, Unemployment Rate (interpolated to daily)

### Current Issues

1. **Asynchronous Updates**: Different series have different latest dates:
   - Dollar Index & EUR/USD: Updates with 1-2 week delay
   - Oil Price: Updates on trading days
   - Treasury yields: Updates on business days
   - S&P 500: Updates on market trading days
   - VIX/GVZ: Updates on trading days

2. **Data Staleness Mismatch**: When viewing current data, some series may be several days behind others, creating confusion about "current" market conditions.

## Synchronization Strategies

### Strategy 1: Latest Available Data (Current Implementation)
**Approach**: Fetch latest data for each series independently

**Pros**:
- Maximum data coverage
- No data waste
- Shows most recent available information

**Cons**:
- Different series have different "current" dates
- Can be confusing when comparing series
- "Current values" may represent different time periods

### Strategy 2: Common Latest Date Alignment
**Approach**: Align all series to the most recent date where ALL series have data

**Implementation**:
```typescript
// Find the minimum latest date across all series
const commonLatestDate = min(allSeries.map(s => s.latestDate))
// Filter all series to this date
```

**Pros**:
- All series synchronized to same "current" date
- True apples-to-apples comparison
- Clear temporal alignment

**Cons**:
- May discard very recent data from faster-updating series
- If one series lags significantly, all data appears stale

### Strategy 3: Smart Category-Based Alignment
**Approach**: Group series by update frequency and align within groups

**Implementation**:
```typescript
// Daily market data: Align to most recent common trading day
const marketDataDate = getLatestCommonTradingDay([sp500, vix, oil_price])

// Treasury data: Align to most recent business day
const treasuryDate = getLatestCommonBusinessDay([treasury_1y, treasury_2y, ...])

// Currency/FX data: Align to most recent FX trading day
const fxDate = getLatestCommonFXDay([dollar_index, eur_usd])

// Monthly data: Already interpolated to match daily series
```

**Pros**:
- Respects different data source characteristics
- Minimizes data loss
- Maintains synchronization within related series

**Cons**:
- More complex logic
- May still show mixed dates across categories

### Strategy 4: Target Date Refresh (Recommended)
**Approach**: Update all series to target a specific date (e.g., "yesterday's close")

**Implementation**:
```typescript
async function updateToTargetDate(targetDate: string) {
  const results = await Promise.all(
    allSeries.map(series => fetchSeriesUpTo(series, targetDate))
  )
  
  // Only commit if ALL series successfully updated to target date
  if (results.every(r => r.success)) {
    commitAllUpdates()
  } else {
    // Retry failed series or alert
    handlePartialFailure(results)
  }
}
```

**Pros**:
- All series synchronized to specific target
- Easy to understand and communicate
- Atomic update (all or nothing)

**Cons**:
- May need to wait for slower-updating series
- Requires retry logic for unavailable data

## Recommended Implementation: Hybrid Approach

Combine strategies for optimal results:

### Phase 1: Update Execution
1. **Determine Target Date**: Use T-1 (previous business day) as target
2. **Update All Series**: Fetch data up to target date
3. **Validate Coverage**: Ensure all series have data for target date
4. **Handle Gaps**: For series missing target date, use latest available

### Phase 2: Data Presentation
1. **Display Latest Common Date**: Show when all series were last synchronized
2. **Flag Stale Series**: Indicate which series are behind
3. **Show Individual Freshness**: Display "as of" date for each series

### Phase 3: Update Scheduling
- **Weekday Updates**: Run daily at 6 PM EST (after market close)
- **Weekend/Holiday Handling**: Skip updates on non-trading days
- **Monthly Data**: Update on release schedule (typically first of month)

## Implementation Plan

### 1. Enhanced Metadata Tracking
```typescript
interface SeriesMetadata {
  key: string
  latestDate: string
  recordCount: number
  fredSeriesId: string
  lastSuccessfulUpdate: string
  staleness: 'current' | 'delayed' | 'stale'
  daysOld: number
}
```

### 2. Synchronization Check
```typescript
function checkSynchronization(metadata: DataMetadata): SyncReport {
  const latestDates = Object.values(metadata.seriesInfo).map(s => s.latestDate)
  const newestDate = max(latestDates)
  const oldestDate = min(latestDates)
  const daysDrift = daysBetween(oldestDate, newestDate)
  
  return {
    isFullySynced: daysDrift === 0,
    commonDate: oldestDate,
    newestDate: newestDate,
    daysDrift: daysDrift,
    staleSeries: findSeriesOlderThan(metadata, 3) // 3+ days old
  }
}
```

### 3. Smart Update Strategy
```typescript
async function smartUpdate() {
  // 1. Get current state
  const metadata = await loadMetadata()
  const syncReport = checkSynchronization(metadata)
  
  // 2. Determine target date (most recent business day)
  const targetDate = getMostRecentBusinessDay()
  
  // 3. Update all series to target
  const updates = await updateAllSeriesToDate(targetDate)
  
  // 4. Verify synchronization
  if (updates.every(u => u.success)) {
    console.log(`✅ All series synchronized to ${targetDate}`)
  } else {
    console.warn(`⚠️ Partial sync: ${updates.filter(u => u.success).length}/${updates.length}`)
  }
  
  return updates
}
```

## Configuration Options

Add to `.env.local`:
```bash
# Data synchronization strategy
DATA_SYNC_STRATEGY=target_date  # Options: latest_available, common_date, target_date
DATA_SYNC_TARGET_OFFSET_DAYS=1  # Use T-1 (yesterday) as target
DATA_SYNC_MAX_DRIFT_DAYS=3      # Alert if series drift more than 3 days apart
DATA_SYNC_FORCE_ALIGNMENT=true  # Force all series to common date on display
```

## Monitoring & Alerts

### Dashboard Indicators
1. **Sync Status Badge**: 
   - 🟢 Fully Synced (all series within 1 day)
   - 🟡 Partial Sync (1-3 day drift)
   - 🔴 Out of Sync (3+ day drift)

2. **Per-Series Freshness**:
   - Show "as of [date]" for each visible series
   - Highlight stale series in red

3. **Update Log**:
   - Display last successful update time
   - Show which series were updated
   - Report any failures

## Migration Path

### Phase 1 (Immediate): 
- ✅ Fix display text (13 → 15 series)
- ✅ Document current sync issues
- Add "as of" dates to metadata display

### Phase 2 (Short-term):
- Implement synchronization check
- Add sync status indicators to UI
- Log sync drift in update script

### Phase 3 (Medium-term):
- Implement target date update strategy
- Add configuration options
- Create admin dashboard for sync monitoring

### Phase 4 (Long-term):
- Automated alerts for sync issues
- Historical sync tracking
- Predictive data availability
