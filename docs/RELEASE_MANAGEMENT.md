# Release Management Guide

**Version**: 1.0.0  
**Date**: October 20, 2025  
**Status**: Production Ready 🎉

---

## 📋 Semantic Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

1.0.0
│ │ │
│ │ └─── PATCH: Bug fixes, documentation, minor tweaks
│ └───── MINOR: New features, backwards-compatible
└─────── MAJOR: Breaking changes, major refactors
```

### Version Number Guidelines

| Version Type | When to Increment | Examples |
|--------------|-------------------|----------|
| **MAJOR** (1.x.x → 2.0.0) | Breaking changes, major redesigns | API changes, data format changes, removing features |
| **MINOR** (1.0.x → 1.1.0) | New features, backwards-compatible | New data series, new chart types, new filters |
| **PATCH** (1.0.0 → 1.0.1) | Bug fixes, documentation, tweaks | Fix calculations, update docs, UI polish |

---

## 🏷️ Git Tagging Strategy

### Creating a Release Tag

#### For Official Releases

```bash
# 1. Ensure you're on main branch with clean working directory
git checkout main
git pull origin main
git status  # Should be clean

# 2. Update version in package.json
# Edit: "version": "1.0.0" → "1.0.1"

# 3. Update CHANGELOG.md
# Add new version section with changes

# 4. Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.1"

# 5. Create annotated tag
git tag -a v1.0.1 -m "Release v1.0.1: Brief description"

# 6. Push commits and tags
git push origin main
git push origin v1.0.1

# 7. Cloudflare auto-deploys from main branch
```

#### For Pre-Release/Beta

```bash
# Beta releases for testing
git tag -a v1.1.0-beta.1 -m "Beta: New feature X for testing"
git push origin v1.1.0-beta.1
```

### Listing All Tags

```bash
# List all tags
git tag

# List tags with messages
git tag -n

# List tags matching pattern
git tag -l "v1.0.*"
```

### Deleting a Tag (if needed)

```bash
# Delete local tag
git tag -d v1.0.1

# Delete remote tag
git push origin --delete v1.0.1
```

---

## 📊 Release Frequency Guidelines

### Patch Releases (1.0.x)

**Frequency**: As needed (typically every ~50 commits or 2-4 weeks)

**Criteria**:
- Accumulated bug fixes
- Documentation improvements
- Minor UI tweaks
- Performance optimizations
- Dependency updates

**Example Release Cycle**:
```
Day 1:   v1.0.0 released
Week 2:  v1.0.1 (bug fixes)
Week 6:  v1.0.2 (docs + minor fixes)
Week 10: v1.0.3 (performance improvements)
```

### Minor Releases (1.x.0)

**Frequency**: Every 2-3 months or when significant feature is ready

**Criteria**:
- New data series added
- New chart types
- Major UI enhancements
- New filtering capabilities
- Significant feature additions

**Example**:
- v1.1.0: Add commodity prices (gold, silver)
- v1.2.0: Add comparison mode
- v1.3.0: Add export functionality

### Major Releases (x.0.0)

**Frequency**: Annually or when breaking changes are necessary

**Criteria**:
- Complete redesign
- Major architectural changes
- Breaking API changes
- Data format changes

**Example**:
- v2.0.0: Migrate to new charting library
- v3.0.0: Add real-time data support

---

## 🔄 Release Workflow

### Step-by-Step Process

#### 1. Pre-Release Preparation

```bash
# Check current version
cat package.json | grep version

# Review commits since last release
git log v1.0.0..HEAD --oneline

# Run all checks
pnpm run lint
pnpm run build
pnpm run check-sync
pnpm run check-deploy
```

#### 2. Update Version Files

**package.json**:
```json
{
  "version": "1.0.1"  // Update this
}
```

**CHANGELOG.md**:
```markdown
## [1.0.1] - 2025-11-15

### Fixed
- Fixed data loading timeout on slow connections
- Corrected tooltip positioning on mobile devices

### Changed
- Improved error messages for failed data fetches
- Updated documentation with new examples

### Documentation
- Added troubleshooting guide
- Updated deployment instructions
```

#### 3. Commit and Tag

```bash
# Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.1

- Fixed data loading timeout
- Improved mobile tooltip positioning
- Updated documentation
"

# Create annotated tag
git tag -a v1.0.1 -m "Release v1.0.1

Bug Fixes:
- Data loading timeout on slow connections
- Tooltip positioning on mobile devices

Documentation:
- Added troubleshooting guide
- Updated deployment instructions
"

# Push everything
git push origin main --tags
```

#### 4. Verify Deployment

```bash
# Cloudflare auto-deploys from main
# Check deployment status at:
# https://dash.cloudflare.com/

# Verify site is live
curl https://your-domain.pages.dev

# Check version in browser console
# (if you add version to footer)
```

#### 5. Create GitHub Release (Optional)

1. Go to: https://github.com/rohitdhiman1/quant-view/releases
2. Click "Draft a new release"
3. Select tag: `v1.0.1`
4. Title: `v1.0.1 - Bug Fixes and Documentation`
5. Description: Copy from CHANGELOG.md
6. Attach build artifacts (optional)
7. Publish release

---

## 📝 Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(chart): add zoom controls` |
| `fix` | Bug fix | `fix(data): correct interpolation` |
| `docs` | Documentation | `docs(readme): update setup guide` |
| `style` | Code style (formatting) | `style(ui): improve spacing` |
| `refactor` | Code refactoring | `refactor(api): simplify fetch logic` |
| `perf` | Performance improvement | `perf(chart): optimize rendering` |
| `test` | Adding tests | `test(utils): add date helper tests` |
| `chore` | Maintenance | `chore: bump version to 1.0.1` |

### Examples

```bash
# New feature (minor version bump)
git commit -m "feat(series): add gold and silver prices

- Added FRED series for gold (GOLDAMGBD228NLBM)
- Added FRED series for silver (SILVERPRICE)
- Updated category icons and colors
"

# Bug fix (patch version bump)
git commit -m "fix(tooltip): correct position on mobile

Tooltips were appearing off-screen on mobile devices.
Now properly constrained to viewport boundaries.

Fixes #123
"

# Documentation (patch version bump)
git commit -m "docs(deployment): add Vercel instructions

Added alternative deployment guide for Vercel
alongside existing Cloudflare Pages guide.
"

# Breaking change (major version bump)
git commit -m "feat(api)!: change data format to v2

BREAKING CHANGE: Data files now use nested structure
instead of flat array. Migration guide added.

Old: [{ date, value }]
New: { meta: {...}, data: [...] }
"
```

---

## 🔍 Release Checklist

### Pre-Release

- [ ] All tests pass
- [ ] Build succeeds locally
- [ ] Documentation is up-to-date
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Breaking changes documented (if any)
- [ ] Dependencies updated (if needed)

### Release

- [ ] Commit version bump
- [ ] Create annotated git tag
- [ ] Push commits and tags
- [ ] Verify Cloudflare deployment
- [ ] Test deployed site
- [ ] Create GitHub release (optional)

### Post-Release

- [ ] Announce release (if public)
- [ ] Monitor for issues
- [ ] Update project board
- [ ] Archive old documentation (if major version)

---

## 📈 Version History Tracking

### Current Release

```
Version: 1.0.0
Date: 2025-10-20
Commits: ~150 (pre-release development)
Status: Production Ready ✅
```

### Projected Releases

```
v1.0.1 (Nov 2025)    - Bug fixes after first deployment
v1.0.2 (Dec 2025)    - Performance improvements
v1.1.0 (Jan 2026)    - New data series (commodities)
v1.2.0 (Mar 2026)    - Export functionality
v2.0.0 (Q3 2026)     - Major redesign
```

---

## 🎯 Versioning Best Practices

### DO ✅

- **Always** update CHANGELOG.md
- **Always** use annotated tags (`git tag -a`)
- **Always** test before tagging
- Use clear, descriptive tag messages
- Follow semantic versioning strictly
- Document breaking changes prominently

### DON'T ❌

- Don't skip version numbers
- Don't create tags without testing
- Don't use lightweight tags for releases
- Don't forget to push tags (`--tags`)
- Don't change historical tags
- Don't release from feature branches

---

## 🚀 Quick Reference Commands

```bash
# Check current version
grep version package.json

# List all releases
git tag -l "v*"

# Show release details
git show v1.0.0

# Compare releases
git diff v1.0.0 v1.0.1

# Checkout specific version
git checkout v1.0.1

# Return to latest
git checkout main

# Create new release
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

---

## 📚 Related Documentation

- **[CHANGELOG.md](../CHANGELOG.md)** - Complete version history
- **[CONTRIBUTING.md](#)** - How to contribute (create if needed)
- **[CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md)** - Deployment guide

---

## 🎉 Release Milestones

### v1.0.0 (Current) - First Stable Release
- ✅ 15 economic data series
- ✅ Multi-year selection
- ✅ Month-level filtering
- ✅ Comprehensive documentation
- ✅ Cloudflare Pages ready
- ✅ Production tested

### Future Milestones

**v1.1.0** - Enhanced Data Coverage
- Add precious metals (gold, silver, platinum)
- Add international indices (FTSE, DAX, Nikkei)
- Add currency crosses (GBP/USD, USD/JPY)

**v1.2.0** - Export & Sharing
- Export charts as PNG/SVG
- Share custom views via URL
- Export data as CSV

**v2.0.0** - Real-Time Data
- WebSocket integration for live updates
- Real-time market data
- Streaming price feeds

---

**Remember**: Every ~50 commits or significant feature = new release! 🎯
