# Fix: Data Files Not Accessible (404 Error)

## Problem

When running the development server, the browser console showed:
```
Error: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
GET /data/metadata.json 404 in 722ms
```

## Root Cause

The `CompactDataStatus.tsx` component tries to fetch `/data/metadata.json` from the web server, but Next.js doesn't automatically serve files from the `data/` directory. Only files in the `public/` directory are served statically.

## Solution

Create a symlink from `public/data` to the root `data/` directory so the JSON files are accessible via HTTP.

### Implementation

```bash
# Create symlink
ln -sf ../data public/data
```

This creates a symbolic link at `public/data/` that points to `../data/`, making all data files accessible at `/data/*` URLs.

### Verification

```bash
# Verify symlink exists
ls -la public/data

# Should show: lrwxr-xr-x ... data -> ../data

# Test file access
ls public/data/metadata.json

# Should show the file successfully
```

## Automated Setup

A setup script has been created to automate this process:

```bash
pnpm run setup
```

This script:
1. Creates the `public/data` symlink if it doesn't exist
2. Verifies data files are present
3. Checks dependencies are installed
4. Provides next steps guidance

## File Changes

### New Files
- `scripts/setup.sh` - Automated setup script
- `docs/DATA_ACCESS_FIX.md` - This documentation

### Modified Files
- `package.json` - Added `"setup"` script

### Created Symlink
- `public/data -> ../data` - Allows HTTP access to data files

## Why Symlink vs Copy?

**Symlink Advantages:**
- No file duplication
- Data updates automatically reflect in public folder
- Single source of truth for data files
- Easier to maintain

**Alternative (if symlinks don't work on your system):**
Create a post-build script to copy files:
```json
{
  "scripts": {
    "postbuild": "cp -r data/* out/data/"
  }
}
```

## Git Considerations

The symlink (`public/data`) is tracked in Git. This is intentional because:
1. It documents the required setup
2. It works across Unix-based systems (macOS, Linux)
3. On Windows, Git for Windows handles symlinks appropriately

If you clone the repo fresh, the symlink should work automatically. If not, run:
```bash
pnpm run setup
```

## Testing

After applying the fix:

1. **Start dev server:**
   ```bash
   pnpm run dev
   ```

2. **Open browser to http://localhost:3000**

3. **Open browser console** - Should see no 404 errors

4. **Check network tab** - `/data/metadata.json` should return 200 OK

5. **Verify sync status** - The sync status indicator should load correctly

## Troubleshooting

### Issue: "EACCES: permission denied" when creating symlink
**Solution:** Run the command with appropriate permissions or use `sudo` if needed.

### Issue: Symlink not working on Windows
**Solution:** 
- Use Git Bash or WSL
- OR use the copy approach instead:
  ```bash
  # Copy data to public (run before each build)
  cp -r data public/
  ```

### Issue: 404 still appearing after symlink
**Solution:**
1. Verify symlink exists: `ls -la public/data`
2. Restart dev server: `pnpm run dev`
3. Clear browser cache
4. Check file exists: `ls public/data/metadata.json`

### Issue: Build fails with symlink
**Solution:** Next.js should handle symlinks in `public/` correctly, but if issues arise, add to `next.config.ts`:
```typescript
webpack: (config) => {
  config.resolve.symlinks = true
  return config
}
```

## Related Components

The following components fetch data from `/data/`:

1. **CompactDataStatus.tsx**
   - Fetches: `/data/metadata.json`
   - Purpose: Display sync status and data freshness

2. **Future components** may also need to fetch:
   - Individual series JSON files
   - Backup data for comparison
   - Metadata for detailed views

## Prevention

To prevent this issue in the future:

1. **Run setup after git clone:**
   ```bash
   git clone <repo>
   cd quant-view
   pnpm run setup  # Creates symlink
   ```

2. **Document in README:**
   - Setup instructions include running setup script
   - Explain the symlink requirement

3. **CI/CD:** Ensure deployment scripts create the symlink or copy files appropriately

## Status

✅ **FIXED** - Symlink created and tested
✅ **DOCUMENTED** - This file and setup script created
✅ **AUTOMATED** - Setup script added to package.json
✅ **TESTED** - Dev server runs without 404 errors

## Summary

The 404 error for `/data/metadata.json` was caused by Next.js not serving files outside the `public/` directory. Creating a symlink from `public/data` to `data/` resolves this issue by making the data files accessible via HTTP while maintaining a single source of truth.

**Quick fix:** `ln -sf ../data public/data && pnpm run dev`
