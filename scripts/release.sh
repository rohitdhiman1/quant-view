#!/bin/bash

###############################################################################
# Release Preparation Script
# Automates the release process with version bumping and tagging
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Quant View Release Manager${NC}"
echo "═══════════════════════════════════════"
echo ""

# Get current version
CURRENT_VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
echo -e "Current version: ${GREEN}v$CURRENT_VERSION${NC}"
echo ""

# Ask for new version
echo "What type of release is this?"
echo "  1) Patch (1.0.0 → 1.0.1) - Bug fixes, docs, minor changes"
echo "  2) Minor (1.0.0 → 1.1.0) - New features, backwards-compatible"
echo "  3) Major (1.0.0 → 2.0.0) - Breaking changes"
echo "  4) Custom version"
echo ""
read -p "Select (1-4): " RELEASE_TYPE

# Calculate new version
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

case $RELEASE_TYPE in
  1)
    PATCH=$((PATCH + 1))
    NEW_VERSION="$MAJOR.$MINOR.$PATCH"
    RELEASE_NAME="Patch"
    ;;
  2)
    MINOR=$((MINOR + 1))
    PATCH=0
    NEW_VERSION="$MAJOR.$MINOR.$PATCH"
    RELEASE_NAME="Minor"
    ;;
  3)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    NEW_VERSION="$MAJOR.$MINOR.$PATCH"
    RELEASE_NAME="Major"
    ;;
  4)
    read -p "Enter new version (e.g., 1.0.1): " NEW_VERSION
    RELEASE_NAME="Custom"
    ;;
  *)
    echo -e "${RED}Invalid selection${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${RELEASE_NAME} Release: ${GREEN}v$CURRENT_VERSION${NC} → ${GREEN}v$NEW_VERSION${NC}"
echo ""

# Get release description
echo "Enter release description (press Ctrl+D when done):"
echo "Example: Bug fixes and performance improvements"
RELEASE_DESC=$(cat)

# Confirm
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "  Version: v$NEW_VERSION"
echo "  Type: $RELEASE_NAME"
echo "  Description: $RELEASE_DESC"
echo ""
read -p "Proceed with release? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
  echo -e "${YELLOW}Release cancelled${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}📋 Running pre-release checks...${NC}"

# Check git status
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}⚠️  Warning: Uncommitted changes detected${NC}"
  git status -s
  echo ""
  read -p "Continue anyway? (y/n): " CONTINUE
  if [ "$CONTINUE" != "y" ]; then
    exit 1
  fi
fi

# Run build
echo ""
echo -e "${BLUE}🔨 Building project...${NC}"
if pnpm run build > /tmp/release-build.log 2>&1; then
  echo -e "${GREEN}✅ Build succeeded${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  cat /tmp/release-build.log
  exit 1
fi

# Update package.json
echo ""
echo -e "${BLUE}📝 Updating package.json...${NC}"
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
rm package.json.bak
echo -e "${GREEN}✅ Updated version to v$NEW_VERSION${NC}"

# Add CHANGELOG entry reminder
echo ""
echo -e "${YELLOW}⚠️  REMINDER: Update CHANGELOG.md manually${NC}"
echo "Add the following section:"
echo ""
echo "## [${NEW_VERSION}] - $(date +%Y-%m-%d)"
echo ""
echo "$RELEASE_DESC"
echo ""
read -p "Press Enter when CHANGELOG.md is updated..."

# Commit version bump
echo ""
echo -e "${BLUE}📦 Committing version bump...${NC}"
git add package.json CHANGELOG.md
git commit -m "chore: bump version to ${NEW_VERSION}

${RELEASE_DESC}
"
echo -e "${GREEN}✅ Committed version bump${NC}"

# Create tag
echo ""
echo -e "${BLUE}🏷️  Creating git tag...${NC}"
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}

${RELEASE_DESC}
"
echo -e "${GREEN}✅ Created tag v${NEW_VERSION}${NC}"

# Push
echo ""
echo -e "${BLUE}🚀 Pushing to remote...${NC}"
read -p "Push to origin? (y/n): " PUSH
if [ "$PUSH" = "y" ]; then
  git push origin main
  git push origin "v${NEW_VERSION}"
  echo -e "${GREEN}✅ Pushed to remote${NC}"
else
  echo -e "${YELLOW}⚠️  Skipped push (run manually: git push origin main --tags)${NC}"
fi

# Success
echo ""
echo -e "${GREEN}🎉 Release v${NEW_VERSION} completed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify deployment: https://dash.cloudflare.com/"
echo "  2. Test deployed site"
echo "  3. Create GitHub release (optional)"
echo "  4. Announce release"
echo ""
echo "Tag details:"
echo "  Tag: v${NEW_VERSION}"
echo "  View: git show v${NEW_VERSION}"
echo ""
