# Git Tagging Strategy & Rollback Guide

**Version**: 1.0.0  
**Date**: October 23, 2025  
**Status**: Production Ready 🏷️

---

## 🎯 Purpose

This guide explains **when** to create git tags, **how** to create them properly, and **how to rollback** to a previous tag if something goes wrong.

---

## 📋 When to Create a Tag

### ✅ DO Create a Tag When:

1. **Stable Milestone Reached**
   - All features working correctly
   - No known critical bugs
   - Documentation up-to-date
   - Tests passing (if applicable)
   - Successfully deployed and verified

2. **Before Major Changes**
   - About to start a refactor
   - Upgrading major dependencies
   - Changing architecture
   - *Tag the stable state first as a safety checkpoint*

3. **Production Deployment**
   - Deploying to production (Cloudflare Pages)
   - Release to users
   - Public announcement

4. **Regular Intervals** (Your 50-commit rule)
   - After ~50 commits
   - At end of sprint/milestone
   - Monthly/quarterly releases
   - When CHANGELOG.md has enough entries

5. **Feature Complete**
   - Major feature finished and tested
   - Breaking change implemented
   - New data series added and verified

### ❌ DON'T Create a Tag When:

- Work in progress (half-done features)
- Known bugs exist (unless marking as beta/alpha)
- Tests failing
- Build not working
- Documentation incomplete
- Working on feature branch (tag from main only)

---

## 🏷️ Tag Naming Convention

### Production Releases

```bash
v1.0.0     # First stable release
v1.0.1     # Patch release (bug fixes)
v1.1.0     # Minor release (new features)
v2.0.0     # Major release (breaking changes)
```

### Pre-Release Tags

```bash
v1.1.0-beta.1      # Beta testing
v1.1.0-rc.1        # Release candidate
v1.1.0-alpha.1     # Alpha testing
v2.0.0-snapshot    # Snapshot before major work
```

### Special Tags

```bash
v1.0.0-stable      # Mark stable checkpoint
v1.0.0-backup      # Safety backup before risky change
deploy-20251023    # Deployment marker (if needed)
```

---

## 🔧 How to Create Tags

### Method 1: Quick Tag (After Recent Commit)

```bash
# 1. Ensure you're on main with latest changes
git checkout main
git pull origin main

# 2. Check recent commits
git log --oneline -5

# 3. Create annotated tag on current commit
git tag -a v1.0.0 -m "Release v1.0.0: First stable release

Features:
- 15 economic data series from FRED
- Multi-year selection with month filtering
- Interactive Recharts visualization
- Data refresh automation
- Comprehensive documentation

Build: 9.8 MB
Data: 5.9 MB (17 JSON files)
Status: Production ready ✅
"

# 4. Push tag to remote
git push origin v1.0.0

# 5. Verify tag was created
git tag -l "v1.*"
git show v1.0.0
```

### Method 2: Tag Specific Commit (Past Commit)

```bash
# 1. Find the commit hash you want to tag
git log --oneline --graph -10

# Example output:
# abc1234 fix: correct tooltip positioning
# def5678 feat: add EUR/USD series
# 789abcd docs: update deployment guide

# 2. Tag that specific commit
git tag -a v1.0.0 789abcd -m "Release v1.0.0: Stable checkpoint"

# 3. Push tag
git push origin v1.0.0
```

### Method 3: Use Release Script (Recommended)

```bash
# Automated with version bump and CHANGELOG update
pnpm run release

# Follow prompts:
# - Select release type (patch/minor/major)
# - Enter description
# - Confirm CHANGELOG update
# - Push to remote
```

---

## 🔍 Tag Checklist (Before Creating)

Use this checklist to ensure your tag is production-ready:

### Pre-Tag Verification

```bash
# 1. Check git status (should be clean)
git status

# 2. Verify you're on main branch
git branch --show-current

# 3. Pull latest changes
git pull origin main

# 4. Run build
pnpm run build

# 5. Check deployment readiness
pnpm run check-deploy

# 6. Verify data sync
pnpm run check-sync

# 7. Review recent changes
git log --oneline -10

# 8. Check current version
grep version package.json
```

### Tag Creation Checklist

- [ ] All tests passing (if applicable)
- [ ] Build succeeds without errors
- [ ] No uncommitted changes (`git status` clean)
- [ ] Documentation updated
- [ ] CHANGELOG.md has entry for this version
- [ ] Version bumped in package.json
- [ ] Deployed and verified working
- [ ] No known critical bugs

---

## 🔄 Rollback Strategies

### Strategy 1: Rollback to Previous Tag (Emergency)

**Scenario**: Just deployed v1.0.1 but it's broken. Need to rollback to v1.0.0 immediately.

```bash
# 1. List all tags to find the one you want
git tag -l

# Output:
# v1.0.0
# v1.0.1

# 2. Check out the previous stable tag
git checkout v1.0.0

# 3. Verify you're on the right version
git describe --tags
# Output: v1.0.0

# 4. Create a new branch from this tag (for safety)
git checkout -b rollback-to-v1.0.0

# 5. Deploy this version to Cloudflare
# (Cloudflare will deploy from the commit you push)

# 6. Push rollback branch to trigger deployment
git push origin rollback-to-v1.0.0

# 7. In Cloudflare dashboard, set "rollback-to-v1.0.0" as production branch temporarily
```

**Quick Emergency Rollback** (if branch deployment configured):

```bash
# Force push the old tag to main (DANGEROUS - use with caution)
git checkout v1.0.0
git branch -f main
git checkout main
git push origin main --force

# Better alternative: Revert commits
git checkout main
git revert HEAD~3..HEAD  # Revert last 3 commits
git push origin main
```

### Strategy 2: Create Hotfix from Previous Tag

**Scenario**: Need to fix a bug in production (v1.0.0) while v1.1.0 development continues.

```bash
# 1. Create hotfix branch from stable tag
git checkout v1.0.0
git checkout -b hotfix/critical-bug-fix

# 2. Make your fixes
# ... edit files ...

# 3. Commit fixes
git add .
git commit -m "fix: resolve critical data loading issue"

# 4. Create new patch tag
git tag -a v1.0.1 -m "Hotfix v1.0.1: Critical bug fix"

# 5. Push hotfix and tag
git push origin hotfix/critical-bug-fix
git push origin v1.0.1

# 6. Merge back to main
git checkout main
git merge hotfix/critical-bug-fix
git push origin main

# 7. Deploy v1.0.1 to production
# Cloudflare will auto-deploy from main
```

### Strategy 3: Soft Rollback (Preserve History)

**Scenario**: Want to rollback but keep git history intact.

```bash
# 1. Find the commit hash of the stable tag
git show v1.0.0
# Note the commit hash, e.g., abc123def456

# 2. Revert all commits since that tag
git checkout main
git revert --no-commit abc123def456..HEAD

# 3. Commit the revert
git commit -m "revert: rollback to v1.0.0 state

Rolling back due to critical issues in v1.0.1
Reverts all changes after v1.0.0
"

# 4. Push to trigger deployment
git push origin main

# 5. Tag this rollback state
git tag -a v1.0.1-rollback -m "Rollback to v1.0.0 state"
git push origin v1.0.1-rollback
```

### Strategy 4: Point-in-Time Recovery

**Scenario**: Need to investigate a specific version without affecting production.

```bash
# 1. Clone repository to separate directory
cd ~/temp
git clone https://github.com/rohitdhiman1/quant-view.git quant-view-recovery
cd quant-view-recovery

# 2. Check out the tag you want to investigate
git checkout v1.0.0

# 3. Test locally
pnpm install
pnpm run build
pnpm run dev

# 4. If this version is good, copy needed files to main repo
# Or cherry-pick specific commits back to main
```

---

## 📊 Rollback Decision Matrix

| Severity | Time Pressure | Strategy | Command |
|----------|---------------|----------|---------|
| **Critical** | Immediate | Force rollback | `git push --force` to previous commit |
| **High** | < 1 hour | Checkout tag + new branch | `git checkout v1.0.0 -b rollback` |
| **Medium** | < 24 hours | Hotfix from tag | `git checkout v1.0.0 -b hotfix` |
| **Low** | > 24 hours | Revert commits | `git revert` bad commits |
| **Investigation** | No rush | Point-in-time recovery | `git checkout v1.0.0` (detached) |

---

## 🛡️ Safety Practices

### Before Risky Changes

```bash
# Create safety checkpoint tag
git tag -a v1.0.0-pre-refactor -m "Safety checkpoint before major refactor"
git push origin v1.0.0-pre-refactor
```

### After Successful Deployment

```bash
# Tag successful deployment
git tag -a v1.0.0-deployed -m "Successfully deployed to production on 2025-10-23"
git push origin v1.0.0-deployed
```

### Regular Backups

```bash
# Weekly/monthly backup tags
git tag -a backup-2025-10-23 -m "Weekly backup checkpoint"
git push origin backup-2025-10-23
```

---

## 🔍 Tag Management Commands

### View Tags

```bash
# List all tags
git tag

# List tags with messages
git tag -n

# List tags matching pattern
git tag -l "v1.0.*"

# Show tag details
git show v1.0.0

# Compare two tags
git diff v1.0.0 v1.0.1

# List commits between tags
git log v1.0.0..v1.0.1 --oneline
```

### Delete Tags

```bash
# Delete local tag
git tag -d v1.0.1

# Delete remote tag
git push origin --delete v1.0.1

# Delete tag and recreate (if made mistake)
git tag -d v1.0.1
git push origin --delete v1.0.1
git tag -a v1.0.1 -m "Corrected tag"
git push origin v1.0.1
```

### Rename Tags

```bash
# Git doesn't support renaming, must delete and recreate
git tag -a v1.1.0 v1.0.2  # Create new tag from old
git tag -d v1.0.2         # Delete old tag locally
git push origin v1.1.0    # Push new tag
git push origin --delete v1.0.2  # Delete old tag remotely
```

---

## 📈 Tag History Tracking

### Current Tags (Example After v1.0.0)

```bash
# View tag history
git log --tags --simplify-by-decoration --pretty="format:%ci %d"
```

Expected output:
```
2025-10-23 v1.0.0 (First stable release)
2025-11-15 v1.0.1 (Bug fixes)
2025-12-20 v1.0.2 (Performance improvements)
2026-01-25 v1.1.0 (New features: commodities)
```

### Tag Timeline

```
v1.0.0 ────────▶ v1.0.1 ────────▶ v1.0.2 ────────▶ v1.1.0
 │                │                │                │
 │                │                │                └─ Minor: New features
 │                │                └───────────────── Patch: Performance
 │                └───────────────────────────────── Patch: Bug fixes
 └───────────────────────────────────────────────── Major: First release
```

---

## 🚨 Emergency Rollback Runbook

### If Production is Broken Right Now

**Step 1: Identify the Problem** (2 minutes)
```bash
# Check what's currently deployed
git log -1

# Check recent tags
git tag -l | tail -5
```

**Step 2: Find Last Known Good Version** (1 minute)
```bash
# View tag details
git show v1.0.0
```

**Step 3: Rollback** (3 minutes)
```bash
# Checkout stable tag
git checkout v1.0.0

# Force push to main (emergency only!)
git checkout -B main
git push origin main --force

# Or better: create rollback branch
git checkout -b emergency-rollback-v1.0.0
git push origin emergency-rollback-v1.0.0
# Then change production branch in Cloudflare to this branch
```

**Step 4: Verify** (2 minutes)
```bash
# Wait for Cloudflare deployment (~1-2 min)
# Check site: https://your-domain.pages.dev
# Verify it's working
```

**Step 5: Post-Mortem** (later)
```bash
# Tag the broken version for investigation
git checkout main
git tag -a v1.0.1-broken -m "Broken deployment - DO NOT USE"

# Document what went wrong in issue/docs
```

**Total Time: ~8 minutes to rollback**

---

## 📝 Tag Template Messages

### Release Tag

```bash
git tag -a v1.0.1 -m "Release v1.0.1: Brief description

### Fixed
- Bug fix 1
- Bug fix 2

### Changed
- Improvement 1
- Improvement 2

### Added
- New feature 1

Build: X.X MB
Status: Production ready ✅
Deployed: 2025-10-23
"
```

### Hotfix Tag

```bash
git tag -a v1.0.1 -m "Hotfix v1.0.1: Critical bug fix

Emergency fix for production issue:
- Fixed data loading timeout
- Corrected tooltip crash on mobile

Urgency: Critical
Deployed: 2025-10-23 14:30 UTC
"
```

### Checkpoint Tag

```bash
git tag -a v1.0.0-checkpoint -m "Checkpoint: Stable state before refactor

Marking stable checkpoint before major refactor.
All features working, tests passing.

Can rollback to this tag if refactor causes issues.
"
```

---

## 🎯 Your Tagging Schedule

Based on your 50-commit rule:

| Interval | Tag | Purpose |
|----------|-----|---------|
| Now | v1.0.0 | First stable release |
| +50 commits | v1.0.1 | Bug fixes, improvements |
| +50 commits | v1.0.2 | Performance, docs |
| +50 commits + feature | v1.1.0 | New data series |
| Before major work | v1.1.0-checkpoint | Safety backup |
| +50 commits + feature | v1.2.0 | Export functionality |
| Breaking changes | v2.0.0 | Major version |

---

## 📚 Related Documentation

- **[RELEASE_MANAGEMENT.md](RELEASE_MANAGEMENT.md)** - Complete release guide
- **[CHANGELOG.md](../CHANGELOG.md)** - Version history
- **[CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md)** - Deployment guide

---

## ✅ Quick Reference

### Tag Now (Current Commit)
```bash
git tag -a v1.0.0 -m "Release v1.0.0: First stable release"
git push origin v1.0.0
```

### Rollback to Previous Tag
```bash
git checkout v1.0.0
git checkout -b rollback-to-v1.0.0
git push origin rollback-to-v1.0.0
```

### Delete Bad Tag
```bash
git tag -d v1.0.1
git push origin --delete v1.0.1
```

### View All Tags
```bash
git tag -l
git show v1.0.0
```

---

**Remember**: Tags are permanent markers - only create them for stable, tested code! 🏷️
