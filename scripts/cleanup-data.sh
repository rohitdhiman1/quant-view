#!/bin/bash

###############################################################################
# Data Files Cleanup Script
# Removes orphaned/legacy JSON files that are no longer used by the application
###############################################################################

set -e  # Exit on error

echo "🗑️  Data Files Cleanup"
echo "===================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Files to remove (confirmed unused via code search)
UNUSED_FILES=(
  "data/treasury_30y.json"
  "data/treasury_yield.json"
  "data/yield_5y.json"
  "data/yield_15y.json"
  "data/yield_20y.json"
  "data/cpi_monthly.json"
  "data/core_cpi_monthly.json"
  "data/unemployment_rate_monthly.json"
)

echo "📋 Files marked for deletion:"
echo ""
for file in "${UNUSED_FILES[@]}"; do
  if [ -f "$file" ]; then
    size=$(du -h "$file" | cut -f1)
    echo "  • $file ($size)"
  else
    echo "  • $file (not found)"
  fi
done
echo ""

# Count files to delete
files_found=0
for file in "${UNUSED_FILES[@]}"; do
  if [ -f "$file" ]; then
    ((files_found++))
  fi
done

if [ $files_found -eq 0 ]; then
  echo -e "${GREEN}✅ No unused files found - already clean!${NC}"
  exit 0
fi

# Calculate total size
total_size=$(du -ch "${UNUSED_FILES[@]}" 2>/dev/null | grep total | cut -f1)

echo -e "${YELLOW}⚠️  This will delete $files_found unused files (~$total_size)${NC}"
echo ""
echo "These files are legacy/orphaned data that:"
echo "  • Are NOT referenced in any code (verified via grep)"
echo "  • Are NOT loaded by app/page.tsx"
echo "  • Are NOT defined in lib/fred-config.ts"
echo ""
echo -e "${YELLOW}Press ENTER to continue or Ctrl+C to cancel...${NC}"
read

echo ""
echo "🗑️  Deleting unused files..."
echo ""

deleted_count=0
for file in "${UNUSED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Removing: $file"
    rm "$file"
    ((deleted_count++))
  fi
done

echo ""
echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  • Deleted: $deleted_count files"
echo "  • Freed: ~$total_size"
echo ""
echo "Remaining data files:"
ls -1 data/*.json | wc -l | xargs echo "  •" "files"
echo ""
echo "Next steps:"
echo "  1. Verify app still works: pnpm run build"
echo "  2. Check data status: pnpm run check-sync"
echo "  3. Test locally: pnpm run dev"
echo ""
