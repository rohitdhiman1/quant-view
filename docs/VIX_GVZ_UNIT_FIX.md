# VIX & GVZ Unit Correction

**Date:** October 24, 2025  
**Issue:** VIX and GVZ were incorrectly labeled as percentages when they are actually index point values

## Background

VIX (CBOE Volatility Index) and GVZ (Gold Volatility Index) measure implied volatility as **index point values**, not percentages. For example:
- VIX at 20 means an index level of 20 points (representing expected annualized volatility)
- This is different from yields or rates which are actual percentages (e.g., 4.5%)

## Changes Made

### 1. `types/data.ts`
- **Changed:** VIX unit from `'%'` to `'points'`
- **Changed:** GVZ unit from `'%'` to `'points'`
- **Updated:** Documentation comment to include 'points' as a valid unit type

```typescript
// Before
{
  key: 'vix',
  name: 'VIX (S&P 500 Volatility)',
  unit: '%'  // ❌ Incorrect
}

// After
{
  key: 'vix',
  name: 'VIX (S&P 500 Volatility)',
  unit: 'points'  // ✅ Correct
}
```

### 2. `components/ChartComponent.tsx`
- **Added:** Handler for `'points'` unit in CustomTooltip formatting
- **Added:** Handler for `'points'` unit in Current Values display
- **Updated:** `isAbsoluteMetric()` helper to include `'points'` alongside other absolute metrics
  - This ensures VIX/GVZ are properly scaled on the same axis as other index values

```typescript
// Updated helper function
const isAbsoluteMetric = (unit: string) => {
  return unit === '$/barrel' || unit === 'Index' || unit === 'USD' || unit === 'points'
}
```

### 3. `lib/fred-config.ts`
- **Updated:** Comment to document `'points'` as a valid unit type

## Display Behavior

### Before Fix
- VIX: `20.50%` ❌
- GVZ: `15.75%` ❌

### After Fix
- VIX: `20.50` ✅ (displays as pure number, representing index points)
- GVZ: `15.75` ✅ (displays as pure number, representing index points)

## Technical Details

### Why 'points' is treated as an absolute metric:
VIX and GVZ join other absolute-value metrics that don't use percentage scaling:
- **Oil Price:** measured in $/barrel
- **Dollar Index:** measured in Index points
- **EUR/USD:** measured in USD
- **S&P 500:** measured in Index points
- **VIX/GVZ:** measured in volatility index points

This categorization ensures:
1. Proper Y-axis scaling when charted together
2. Consistent visual comparison with other indices
3. No misleading percentage symbols in tooltips or legends

## Data Integrity

✅ **No data changes required** - the underlying data values remain unchanged  
✅ **Backward compatible** - only display formatting affected  
✅ **Build successful** - verified with `npm run build`  
✅ **Type safety maintained** - no TypeScript errors  

## Testing Checklist

- [x] TypeScript compilation passes
- [x] Next.js build successful
- [x] No ESLint errors introduced
- [x] Tooltip formatting handles 'points'
- [x] Current Values section handles 'points'
- [x] Chart scaling treats VIX/GVZ as absolute metrics

## Impact

**User-facing changes:**
- More accurate labeling of volatility indices
- Better semantic understanding for financial professionals
- Clearer distinction between percentage rates and index values

**Technical changes:**
- Consistent unit handling across all components
- Improved type definitions
- Better code documentation

## References

- CBOE VIX White Paper: VIX represents implied volatility as an annualized percentage point value (expressed as an index)
- FRED Series: VIXCLS (CBOE Volatility Index: VIX)
- FRED Series: GVZCLS (CBOE Gold ETF Volatility Index)
