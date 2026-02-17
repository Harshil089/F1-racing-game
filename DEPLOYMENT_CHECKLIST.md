# Deployment Checklist ✅

## After Vercel Deployment Completes

### 1. Check Deployment Status
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Find your F1 Racing Game project
- [ ] Verify deployment status shows "Ready"
- [ ] Check that build completed without errors

### 2. Verify Environment Variables
- [ ] Go to Project Settings → Environment Variables
- [ ] Confirm these variables exist:
  - `KV_REST_API_URL` ✅
  - `KV_REST_API_TOKEN` ✅
  - `KV_REST_API_READ_ONLY_TOKEN` ✅
  - `KV_URL` ✅
  - `REDIS_URL` ✅

### 3. Test API Endpoints

Open these URLs in your browser (replace with your actual Vercel URL):

**GET Leaderboard:**
```
https://your-app.vercel.app/api/leaderboard
```
Expected response:
```json
{"leaderboard": []}
```
or with data:
```json
{
  "leaderboard": [
    {
      "name": "Player Name",
      "phone": "1234567890",
      "reactionTime": 234,
      "carNumber": 44,
      "timestamp": 1234567890
    }
  ]
}
```

### 4. Test on Laptop

- [ ] Open your Vercel URL on laptop
- [ ] Complete registration
- [ ] Play the game
- [ ] Submit a score
- [ ] Verify leaderboard shows your score
- [ ] Check that "Live" indicator is showing (green dot)
- [ ] Wait 3 seconds and verify data persists

### 5. Test on Mobile Device

- [ ] Open your Vercel URL on phone
- [ ] Complete registration
- [ ] Play the game (thumb detection should work)
- [ ] Submit a score
- [ ] Verify leaderboard shows your score
- [ ] Check that "Live" indicator is showing
- [ ] Verify you can see scores from other devices

### 6. Test Multi-Device Sync

**On Device 1 (Laptop):**
- [ ] Play and submit a score

**On Device 2 (Mobile):**
- [ ] Open the game
- [ ] Wait up to 3 seconds
- [ ] Verify Device 1's score appears in leaderboard

**On Device 2 (Mobile):**
- [ ] Play and submit a score

**On Device 1 (Laptop):**
- [ ] Wait up to 3 seconds
- [ ] Verify Device 2's score appears in leaderboard

### 7. Check Vercel Function Logs

- [ ] Go to Vercel Dashboard → Your Project → Deployments
- [ ] Click on the latest deployment
- [ ] Click "Functions" tab
- [ ] Look for these function logs:
  - `/api/leaderboard` - Should show GET requests
  - `/api/leaderboard/update` - Should show POST requests
- [ ] Verify no Redis connection errors
- [ ] Verify no "EROFS: read-only file system" errors

### 8. Verify Redis Database

- [ ] Go to Vercel Dashboard → Storage
- [ ] Click on your Upstash Redis database
- [ ] Check that data exists (optional - requires Redis CLI)
- [ ] Verify connection status is "Connected"

---

## Common Issues & Solutions

### ❌ Issue: Leaderboard shows empty

**Possible causes:**
1. Redis not connected
2. Environment variables missing
3. API route error

**Solution:**
1. Check Vercel function logs for errors
2. Test API endpoint directly: `/api/leaderboard`
3. Verify Redis connection in Vercel → Storage

---

### ❌ Issue: "Live" shows "Offline"

**This is actually OK!** The "Live" indicator uses polling, not real-time WebSocket. It should show:
- ✅ Green dot + "Live" = API is responding
- ❌ Gray dot + "Offline" = API not responding

If showing "Offline":
1. Check if `/api/leaderboard` endpoint works
2. Check browser console for fetch errors
3. Verify Vercel deployment is running

---

### ❌ Issue: Scores not saving

**Possible causes:**
1. Redis credentials invalid
2. API route failing
3. Network error

**Solution:**
1. Open browser DevTools → Network tab
2. Submit a score and watch for POST request to `/api/leaderboard/update`
3. Check response status (should be 200)
4. If 500 error, check Vercel function logs

---

### ❌ Issue: Redis connection error

**Error message:**
```
Redis configuration missing. Please set KV_REST_API_URL...
```

**Solution:**
1. Verify environment variables are set in Vercel
2. Redeploy the application (to pick up new env vars)
3. Check Upstash database is active

---

## Success Criteria ✅

Your deployment is successful if:

- ✅ Both laptop and mobile can access the game
- ✅ Leaderboard displays on both devices
- ✅ Scores save and persist across page refreshes
- ✅ Multiple devices can see each other's scores (within 3 seconds)
- ✅ No errors in Vercel function logs
- ✅ API endpoints return valid JSON

---

## Performance Verification

### Expected Behavior:

**Update Latency:**
- Player submits score → Immediate update on their device
- Other devices see update → Within 3 seconds (polling interval)

**API Response Times:**
- GET `/api/leaderboard` → <200ms (Redis is fast!)
- POST `/api/leaderboard/update` → <500ms

**No Errors:**
- No "read-only filesystem" errors ✅
- No WebSocket connection failures ✅
- No timeout errors ✅

---

## Next Steps After Verification

If everything works:
1. ✅ Share the Vercel URL with users
2. ✅ Monitor Vercel analytics for usage
3. ✅ Check Redis usage to ensure you're within free tier limits

If there are issues:
1. Check the troubleshooting section above
2. Review Vercel function logs
3. Test API endpoints directly
4. Verify Redis connection

---

## Monitoring

### Keep an Eye On:

1. **Vercel Usage**
   - Function invocations (should be <1000/day for small usage)
   - Bandwidth (polling uses minimal bandwidth)

2. **Redis Usage**
   - Commands (should be <10,000/day for free tier)
   - Storage (3 entries = <1KB, well within 256MB limit)

3. **Error Rate**
   - Check Vercel function logs for 500 errors
   - Monitor for Redis connection issues

---

Good luck! 🏎️💨 Your F1 Racing Game should now be fully functional on Vercel!
