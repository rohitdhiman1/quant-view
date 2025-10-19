# Visual Guide: 404 Fix

## The Problem Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Request                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                 GET /data/metadata.json
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Dev Server                        │
│                                                              │
│  Looking in: public/                                         │
│  ❌ public/data/metadata.json NOT FOUND                     │
│                                                              │
│  Returns: 404 Not Found                                      │
│  Body: <!DOCTYPE html>...(404 page)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Browser (CompactDataStatus)                  │
│                                                              │
│  await fetch('/data/metadata.json')                         │
│  Response: 404 with HTML body                               │
│                                                              │
│  JSON.parse(htmlContent) ❌                                 │
│  Error: Unexpected token '<', "<!DOCTYPE "...               │
└─────────────────────────────────────────────────────────────┘
```

## The Solution

```
File System Before Fix:
├── data/
│   ├── metadata.json       ← Data files here
│   ├── cpi.json
│   └── ...
└── public/
    ├── file.svg
    └── globe.svg           ← No data folder!

                    ↓  Apply Fix  ↓

File System After Fix:
├── data/
│   ├── metadata.json       ← Original location
│   ├── cpi.json
│   └── ...
└── public/
    ├── file.svg
    ├── globe.svg
    └── data -> ../data/    ← Symlink added!
```

## The Fix Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Apply Fix Command                         │
│                                                              │
│  $ ln -sf ../data public/data                               │
│                                                              │
│  Creates: public/data -> ../data/                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Browser Request                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                 GET /data/metadata.json
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Dev Server                        │
│                                                              │
│  Looking in: public/                                         │
│  ✅ public/data/metadata.json FOUND (via symlink)          │
│                                                              │
│  Follows: public/data -> ../data/metadata.json              │
│  Returns: 200 OK with JSON content                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Browser (CompactDataStatus)                  │
│                                                              │
│  await fetch('/data/metadata.json')                         │
│  Response: 200 OK with valid JSON                           │
│                                                              │
│  JSON.parse(jsonContent) ✅                                 │
│  Display: 🔴 Out of Sync (7d drift)                        │
└─────────────────────────────────────────────────────────────┘
```

## Symlink Visualization

```
          Your Request                    Next.js Server
          ───────────                     ──────────────

http://localhost:3000/data/metadata.json
              │
              ▼
    ┌──────────────────┐
    │   public/data/   │ ← Next.js looks here
    └──────────────────┘
              │
              │ (symlink)
              │
              ▼
    ┌──────────────────┐
    │      data/       │ ← Points to actual files
    └──────────────────┘
              │
              ▼
    ┌──────────────────┐
    │ metadata.json    │ ← Real file location
    └──────────────────┘
```

## Setup Script Flow

```
╔════════════════════════════════════════════════════════════╗
║                    pnpm run setup                           ║
╚════════════════════════════════════════════════════════════╝
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│ Check if in      │                  │ Check if symlink │
│ correct folder   │                  │ already exists   │
└──────────────────┘                  └──────────────────┘
        │                                       │
        │ ✅ package.json exists                │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│ Verify data/     │                  │ Create symlink   │
│ folder exists    │────────NO───────▶│ ln -sf ../data   │
└──────────────────┘                  │ public/data      │
        │                              └──────────────────┘
        │ ✅ Data found                         │
        ▼                                       │
┌──────────────────┐                           │
│ Check if         │                           │
│ node_modules/    │◀──────────────────────────┘
│ exists           │
└──────────────────┘
        │
        │ ✅ Dependencies installed
        ▼
┌──────────────────┐
│ Display next     │
│ steps            │
└──────────────────┘
```

## Directory Structure Comparison

### Before (Broken)
```
quant-view/
├── data/
│   ├── metadata.json        # Not accessible via HTTP
│   ├── cpi.json
│   └── ...
├── public/
│   └── images/              # Only this is served
└── components/
    └── CompactDataStatus.tsx # ❌ Can't fetch /data/metadata.json
```

### After (Fixed)
```
quant-view/
├── data/
│   ├── metadata.json        # Source of truth
│   ├── cpi.json
│   └── ...
├── public/
│   ├── images/
│   └── data@ -> ../data/    # ✅ Symlink provides HTTP access
└── components/
    └── CompactDataStatus.tsx # ✅ Can now fetch /data/metadata.json
```

## Network Tab: Before vs After

### Before (404 Error)
```
Request URL: http://localhost:3000/data/metadata.json
Status: 404 Not Found
Response: <!DOCTYPE html><html>...404 Page...
Error: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

### After (Success)
```
Request URL: http://localhost:3000/data/metadata.json
Status: 200 OK
Response: {"lastUpdated":"2025-10-18","seriesInfo":{...}}
✓ JSON parsed successfully
```

## Component State: Before vs After

### Before
```
CompactDataStatus.tsx
├── State: Loading...
├── Error: Failed to fetch
└── Display: 🔴 "Loading..."
```

### After
```
CompactDataStatus.tsx
├── State: Loaded ✓
├── Data: {"lastUpdated": "2025-10-18", ...}
└── Display: 🔴 "Out of Sync (7d drift)"
```

## Quick Reference Commands

```bash
# Check if symlink exists
ls -la public/data

# Create symlink manually
ln -sf ../data public/data

# Use setup script (recommended)
pnpm run setup

# Test HTTP access
curl http://localhost:3000/data/metadata.json

# Verify in browser
open http://localhost:3000
# (Check browser console for errors)
```

## Troubleshooting Flowchart

```
                   ┌─────────────────────┐
                   │ Still seeing 404?   │
                   └─────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │ Symlink  │     │ Server   │     │ Browser  │
    │ exists?  │     │ running? │     │ cache?   │
    └──────────┘     └──────────┘     └──────────┘
          │                 │                 │
        NO│YES           NO│YES           YES│NO
          │                 │                 │
          ▼                 ▼                 ▼
    Run setup      Restart dev      Clear cache
    pnpm run       server:           Cmd+Shift+R
    setup          pnpm run dev      (Mac)
                                    Ctrl+Shift+R
                                    (Win/Linux)
```

## Success Indicators

✅ **Symlink Check**
```bash
$ ls -la public/data
lrwxr-xr-x  1 user staff  7 Oct 19 13:51 data -> ../data
```

✅ **HTTP Check**
```bash
$ curl -I http://localhost:3000/data/metadata.json
HTTP/1.1 200 OK
Content-Type: application/json
```

✅ **Browser Check**
- No red errors in console
- Sync status shows: "🔴 Out of Sync" or "🟢 Synced"
- No "Unexpected token" errors

---

**Visual Guide Status:** Complete ✅
**All diagrams:** ASCII-art for universal compatibility
**Next step:** Browse to http://localhost:3000 and verify!
