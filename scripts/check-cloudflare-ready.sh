#!/bin/bash

###############################################################################
# Cloudflare Pages Pre-Deployment Check
# Validates project is ready for deployment
###############################################################################

set -e

echo "🚀 Cloudflare Pages Deployment Readiness Check"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to print check result
check_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $2"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $2"
    ((CHECKS_FAILED++))
  fi
}

echo "1️⃣  Checking Next.js Configuration..."
if grep -q "output: 'export'" next.config.ts; then
  check_result 0 "Static export enabled in next.config.ts"
else
  check_result 1 "Static export NOT enabled (add output: 'export' to next.config.ts)"
fi

echo ""
echo "2️⃣  Checking if Build Has Been Run..."
if [ -d "out" ] && [ -f "out/index.html" ]; then
  check_result 0 "Build output exists (run 'npm run build' to regenerate)"
else
  echo -e "${YELLOW}⚠️  INFO${NC}: No build output found. Running build check..."
  if npm run build > /tmp/build-test.log 2>&1; then
    check_result 0 "Build succeeds (npm run build)"
  else
    check_result 1 "Build failed - check /tmp/build-test.log for errors"
  fi
fi

echo ""
echo "3️⃣  Checking Build Output..."
if [ -d "out" ]; then
  check_result 0 "out/ directory exists"
  
  # Check size
  SIZE=$(du -sm out | cut -f1)
  if [ $SIZE -lt 25 ]; then
    check_result 0 "Build size: ${SIZE}MB (under 25MB limit)"
  else
    check_result 1 "Build size: ${SIZE}MB (exceeds 25MB limit!)"
  fi
else
  check_result 1 "out/ directory not found (build may have failed)"
fi

echo ""
echo "4️⃣  Verifying Data Files..."
if [ -d "out/data" ]; then
  check_result 0 "out/data/ directory exists"
  
  JSON_COUNT=$(ls -1 out/data/*.json 2>/dev/null | wc -l | tr -d ' ')
  if [ $JSON_COUNT -gt 0 ]; then
    check_result 0 "Found $JSON_COUNT JSON data files in out/data/"
  else
    check_result 1 "No JSON files found in out/data/"
  fi
else
  check_result 1 "out/data/ directory missing (symlink may not have resolved)"
fi

echo ""
echo "5️⃣  Checking HTML Output..."
if [ -f "out/index.html" ]; then
  check_result 0 "index.html generated"
else
  check_result 1 "index.html not found"
fi

echo ""
echo "6️⃣  Validating Package Manager..."
if [ -f "package-lock.json" ]; then
  check_result 0 "package-lock.json exists"
else
  check_result 1 "package-lock.json missing (run npm install)"
fi

echo ""
echo "7️⃣  Checking Git Status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
  check_result 0 "Git repository initialized"
  
  if git remote -v | grep -q "github.com"; then
    REMOTE_URL=$(git remote get-url origin)
    check_result 0 "GitHub remote configured: $REMOTE_URL"
  else
    check_result 1 "GitHub remote not configured (needed for auto-deploy)"
  fi
else
  check_result 1 "Not a git repository (initialize with: git init)"
fi

echo ""
echo "8️⃣  Environment Check..."
if [ -f ".env.local" ]; then
  if grep -q "FRED_API_KEY" .env.local; then
    echo -e "${YELLOW}⚠️  INFO${NC}: .env.local found (not needed for deployment, only for local data updates)"
  fi
else
  echo -e "${YELLOW}ℹ️  INFO${NC}: No .env.local file (OK - not needed for deployment)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Checks passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks failed: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 Project is ready for Cloudflare Pages deployment!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Push to GitHub: git push origin main"
  echo "2. Go to: https://dash.cloudflare.com/"
  echo "3. Workers & Pages → Create → Pages → Connect to Git"
  echo "4. Select your repo and configure:"
  echo "   - Build command: npm run build"
  echo "   - Build output: out"
  echo "5. Deploy! 🚀"
  echo ""
  echo "📚 Full guide: docs/CLOUDFLARE_DEPLOYMENT.md"
  exit 0
else
  echo -e "${RED}❌ Fix the issues above before deploying${NC}"
  exit 1
fi
