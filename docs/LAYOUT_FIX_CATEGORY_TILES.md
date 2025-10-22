# Category Tiles Layout Fix

**Date:** October 24, 2025  
**Issue:** "MARKETS & FX" tile was wrapping to a second line at 100% zoom in Chrome, breaking the clean horizontal layout

## Problem

The data series selection section had an unbalanced layout:
- **Left section (Percentage):** 5-column grid with 4 categories (Treasury, Inflation, Economic Indicators, Labor Market)
- **Right section (Absolute):** 2-column grid with 3 categories (OTHER/Volatility, COMMODITIES, MARKETS & FX)
- **Width:** Right section fixed at 280px

This caused the "MARKETS & FX" tile to wrap to a second line because 3 items couldn't fit comfortably in a 2-column grid within 280px.

## Solution

Rebalanced the layout to keep all category tiles in a single horizontal row:

### Layout Changes

**Before:**
```
PERCENTAGE (5 columns, 4 items)  |  ABSOLUTE (2 columns, 3 items → caused wrapping)
- Treasury Yields                |  - OTHER (Volatility)
- Inflation Metrics              |  - COMMODITIES
- Economic Indicators            |  - MARKETS & FX ↓ (wrapped to next line)
- Labor Market                   |
```

**After:**
```
PERCENTAGE (4 columns, 4 items)  |  ABSOLUTE (3 columns, 3 items)
- Treasury Yields                |  - OTHER (Volatility)  - COMMODITIES  - MARKETS & FX
- Inflation Metrics              |
- Economic Indicators            |
- Labor Market                   |
```

## Technical Changes

### `components/ChartComponent.tsx`

1. **Percentage section grid:**
   - Changed from: `grid-cols-5` (5 columns)
   - Changed to: `grid-cols-4` (4 columns)
   - Rationale: Better balance with only 4 percentage categories

2. **Absolute section grid:**
   - Changed from: `grid-cols-2` (2 columns)
   - Changed to: `grid-cols-3` (3 columns)
   - Rationale: Fits all 3 absolute categories in one row

3. **Absolute section width:**
   - Changed from: `280px`
   - Changed to: `420px`
   - Rationale: Provides adequate space for 3 columns at 100% zoom

```typescript
// Before
<div className="grid grid-cols-5 gap-2">  // Percentage
<div className="flex-shrink-0" style={{ width: '280px' }}>
  <div className="grid grid-cols-2 gap-2">  // Absolute

// After
<div className="grid grid-cols-4 gap-2">  // Percentage
<div className="flex-shrink-0" style={{ width: '420px' }}>
  <div className="grid grid-cols-3 gap-2">  // Absolute
```

## Benefits

✅ **Clean horizontal layout** - All category tiles in one line at 100% zoom  
✅ **Better visual balance** - 4:3 ratio matches actual category counts  
✅ **No wrapping issues** - Adequate space for all tiles  
✅ **Improved UX** - Cleaner, more professional appearance  
✅ **Responsive** - Maintains proper spacing across different zoom levels  

## Categories Distribution

### Percentage Metrics (4 categories):
1. 🏛️ **Treasury Yields** - 5 series
2. 📈 **Inflation Metrics** - 2 series
3. 📉 **Economic Indicators** - 1 series
4. 👥 **Labor Market** - 1 series

### Absolute Metrics (3 categories):
1. 📦 **OTHER** (Volatility) - VIX, GVZ (2 series)
2. 🪔 **COMMODITIES** - Oil Price (1 series)
3. 📊 **MARKETS & FX** - Dollar Index, EUR/USD, S&P 500 (3 series)

## Visual Impact

The layout now properly reflects the logical grouping:
- **Left side:** All percentage-based metrics (yields, inflation, unemployment, spreads)
- **Right side:** All absolute-value metrics (volatility indices, commodities, market indices, FX rates)

## Testing

✅ **Build successful:** No TypeScript errors  
✅ **Layout verified:** No wrapping at 100% zoom  
✅ **Responsive behavior:** Tiles scale appropriately  
✅ **Visual alignment:** Clean horizontal arrangement  

## Browser Compatibility

Tested and working in:
- Chrome at 100% zoom ✅
- Expected to work at 90-110% zoom levels
- Grid layout responsive to viewport changes
