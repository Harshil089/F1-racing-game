# Vercel Deployment Guide - F1 Racing Game

## ✅ Fixed Issues

### 1. **Read-only Filesystem Error**
- ❌ **Before**: Used file-based storage (`data/leaderboard.json`)
- ✅ **Now**: Uses Upstash Redis database via Vercel KV

### 2. **WebSocket Incompatibility**
- ❌ **Before**: Used custom `server.js` with Socket.IO (not supported on Vercel)
- ✅ **Now**: Uses HTTP polling (works everywhere, including Vercel)

### 3. **Mobile Connection Issues**
- ❌ **Before**: WebSocket connection failures on some devices
- ✅ **Now**: Simple HTTP requests work on all devices

---

## Changes Made

### Files Modified:

1. **[lib/database.ts](lib/database.ts)** - Migrated from file storage to Redis
   - Uses `@vercel/kv` for Vercel deployments
   - Uses `@upstash/redis` for direct Upstash connections
   - Auto-detects environment and uses correct client

2. **[hooks/useLeaderboard.ts](hooks/useLeaderboard.ts)** - Replaced WebSockets with polling
   - Polls `/api/leaderboard` every 3 seconds
   - Immediately updates after score submission
   - Works on all platforms (Vercel, mobile, laptop)

3. **[package.json](package.json)** - Updated scripts
   - `dev`: Now uses `next dev` (standard Next.js)
   - `start`: Now uses `next start` (Vercel-compatible)

4. **server.js** - Renamed to `server.js.backup`
   - Custom server no longer needed
   - Kept as backup for reference

### Dependencies Added:
- `@upstash/redis` - Redis client for Upstash
- `@vercel/kv` - Vercel's KV storage integration

---

## Deployment Steps

### Step 1: Database is Already Connected ✅
Your Vercel project already has these environment variables:
```
KV_REST_API_URL
KV_REST_API_TOKEN
KV_REST_API_READ_ONLY_TOKEN
KV_URL
REDIS_URL
```

### Step 2: Push Changes to Trigger Deployment

```bash
# Check what's changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Fix: Replace WebSocket with polling for Vercel compatibility

- Migrate from file storage to Upstash Redis
- Remove custom server.js, use standard Next.js
- Replace Socket.IO with HTTP polling
- Fix mobile device compatibility issues"

# Push to deploy
git push origin main
```

### Step 3: Verify Deployment

After deployment completes:

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Check "Functions" tab for any errors

2. **Test the Live Site**:
   - Visit your Vercel URL
   - Play the game on both laptop and mobile
   - Submit a score and check if leaderboard updates
   - Wait 3 seconds and check if other players' scores appear

3. **Check Leaderboard API**:
   - Visit: `https://your-site.vercel.app/api/leaderboard`
   - Should return: `{"leaderboard": [...]}`

---

## How It Works Now

### Leaderboard Update Flow:

```
┌─────────────────────────────────────────────┐
│ Player submits score                        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ POST /api/leaderboard/update                │
│ - Validates score                           │
│ - Updates Redis database                    │
│ - Returns updated leaderboard + position    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ useLeaderboard hook immediately updates     │
│ local state with response                   │
└─────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ All devices poll GET /api/leaderboard       │
│ every 3 seconds to get latest data          │
└─────────────────────────────────────────────┘
```

### Polling vs WebSocket:

| Feature | WebSocket (Old) | Polling (New) |
|---------|-----------------|---------------|
| **Vercel Support** | ❌ No | ✅ Yes |
| **Mobile Compatibility** | ⚠️ Issues | ✅ Works everywhere |
| **Update Delay** | Instant | ~3 seconds max |
| **Network Usage** | Lower | Slightly higher |
| **Reliability** | Depends on connection | Very reliable |
| **Complexity** | High | Low |

For a leaderboard with 3 entries that updates occasionally, polling is perfect!

---

## Expected Behavior After Deployment

### ✅ What Should Work:

1. **Leaderboard displays on all devices** (laptop, mobile)
2. **Scores are saved to Redis** (persistent across deployments)
3. **Mobile devices can connect** (no WebSocket issues)
4. **Live indicator shows "Live"** (polling is active)
5. **Leaderboard updates within 3 seconds** of new score

### ⚠️ Differences from Before:

- **Update delay**: 0-3 seconds instead of instant (acceptable trade-off)
- **No WebSocket logs**: Since we're using HTTP, no socket connection logs
- **Simpler logs**: Just HTTP requests in Vercel function logs

---

## Troubleshooting

### Issue: Leaderboard shows empty
**Check:**
1. Verify Redis is connected in Vercel → Storage
2. Check environment variables are set
3. Look at Vercel function logs for errors

**Test:**
```bash
curl https://your-site.vercel.app/api/leaderboard
```

### Issue: Scores not saving
**Check:**
1. Verify POST request succeeds (check Network tab)
2. Check Vercel function logs for Redis errors
3. Verify Redis credentials are valid

### Issue: Polling not working
**Check:**
1. Open browser console
2. Look for errors in Network tab
3. Verify `/api/leaderboard` returns 200 OK

---

## Performance Notes

### Polling Efficiency:

- **Request frequency**: Every 3 seconds
- **Request size**: ~500 bytes (small)
- **Bandwidth per user**: ~10 KB/minute (negligible)
- **Vercel function invocations**: ~20 per minute per active user

This is well within Vercel's free tier limits!

### Optimization Ideas (Optional):

If you want to reduce polling:

1. **Increase interval**: Change `POLL_INTERVAL` from 3000ms to 5000ms
2. **Conditional polling**: Only poll when on results screen
3. **Exponential backoff**: Poll frequently at first, then slow down

Current implementation is simple and efficient enough.

---

## Local Development

### Running Locally:

```bash
# Install dependencies
npm install

# Set up environment variables (optional for local)
# Create .env.local with your Redis credentials

# Start dev server
npm run dev
```

### Testing Locally Without Redis:

If you don't have Redis credentials locally:
- The app will show an error in server logs
- But the UI will still work
- Leaderboard will just be empty

To test with Redis locally, add to `.env.local`:
```env
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
```

---

## Summary

✅ **Fixed**: Read-only filesystem error on Vercel
✅ **Fixed**: WebSocket compatibility issues
✅ **Fixed**: Mobile device connection problems
✅ **Improved**: Simpler, more reliable architecture
✅ **Maintained**: All game functionality works as before

The app is now **fully compatible with Vercel's serverless platform**!
