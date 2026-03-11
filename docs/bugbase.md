# Bug Base

## Resolved Bugs

### 1. 404 Error - metadata.json not accessible
**Date:** Oct 2025 | **Severity:** High | **Status:** FIXED

**Problem:** `CompactDataStatus.tsx` fetches `/data/metadata.json` but Next.js only serves files from `public/`. Browser got HTML 404 page, JSON.parse failed with "Unexpected token '<'".

**Fix:** Created symlink `public/data -> ../data`. Automated via `npm run setup`.

**Prevention:** Always run `npm run setup` after cloning.

---

### 2. Display text showed wrong count
**Date:** Oct 2025 | **Severity:** Minor | **Status:** FIXED

**Problem:** Footer showed "Data spans 13 time periods" using `combinedData.length` (number of data points for current view) instead of meaningful info.

**Fix:** Changed to `{combinedData.length} data points`. Series count already shown elsewhere as "{visibleSeries.size} of {data.series.length} series displayed".

---

### 3. Data Coverage and Total Data Points showed same value
**Date:** Oct 2025 | **Severity:** Minor | **Status:** FIXED

**Problem:** Both metrics showed 29,269 because Data Coverage used `allDates.length` (with duplicates across series) instead of unique dates.

**Fix:** Added `const uniqueDates = new Set(allDates).size` for the Data Coverage card. Now shows ~1,950 unique dates vs ~29,269 total data points.

---

### 4. VIX & GVZ incorrectly labeled as percentages
**Date:** Oct 2025 | **Severity:** Medium | **Status:** FIXED

**Problem:** VIX/GVZ unit was `'%'` but they are index point values, not percentages. Displayed as "20.50%" instead of "20.50".

**Fix:** Changed unit to `'points'` in `types/data.ts`. Updated `isAbsoluteMetric()` in ChartComponent to include `'points'`. Updated tooltip and current values formatting.

---

### 5. "MARKETS & FX" tile wrapping to second line
**Date:** Oct 2025 | **Severity:** Minor | **Status:** FIXED

**Problem:** Right section had 3 categories in a 2-column grid within 280px, causing wrap at 100% zoom.

**Fix:** Rebalanced layout: percentage section 4 columns (was 5), absolute section 3 columns (was 2), width 420px (was 280px).

---

### 6. "Other" category label not descriptive
**Date:** Oct 2025 | **Severity:** Minor | **Status:** FIXED

**Problem:** VIX/GVZ category was labeled "Other" with generic icon.

**Fix:** Renamed to "Volatility" with lightning bolt icon.

---

### 7. Inconsistent tile widths
**Date:** Oct 2025 | **Severity:** Minor | **Status:** FIXED

**Problem:** Flex-based grid with `minWidth` caused variable tile sizes.

**Fix:** Replaced with fixed-width CSS Grid: `repeat(4, 150px)` for percentage tiles, `repeat(3, 140px)` for absolute tiles.

---

### 8. Non-functional "Update Data" button in static export
**Date:** Jan 2025 | **Severity:** Medium | **Status:** FIXED

**Problem:** Button called API routes that don't exist in static export mode. Always showed error. Created false expectation of runtime updates.

**Fix:** Removed button entirely. Redesigned status indicator to always show green "Data Active" with positive, educational messaging about data timing. Categories: Current (0-1d), Recent (2-3d), Updating Soon (4-7d), Refreshing (8+d).

---

### 9. Orphaned legacy data files
**Date:** Oct 2025 | **Severity:** Low | **Status:** CLEANUP AVAILABLE

**Problem:** 9 unused JSON files in `data/` (~540 KB): `treasury_30y.json`, `treasury_yield.json`, `yield_5y.json`, `yield_15y.json`, `yield_20y.json`, `cpi_monthly.json`, `core_cpi_monthly.json`, `unemployment_rate_monthly.json`.

**Fix:** Run `npm run cleanup-data` to remove them. Only 16 files needed (15 series + metadata).

---

## Known Issues

_None currently tracked._
