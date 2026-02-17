# Mobile Connection Debugging Guide

## Issue: Some mobile devices can't connect to the game

If the leaderboard shows "Live" on one device but "Offline" on others, follow these steps:

---

## Quick Checks

### 1. **Are all devices on the same WiFi network?**
   - ✅ All devices (laptop + all phones) must be on the **same WiFi network**
   - ❌ Mobile data won't work for local development
   - ❌ Different WiFi networks won't work

### 2. **Check the URL on failing phones**
   Open the browser console on the failing phone:
   - Safari (iOS): Settings → Safari → Advanced → Web Inspector (connect to Mac)
   - Chrome (Android): Open DevTools via `chrome://inspect`

   Look for logs like:
   ```
   ✅ Socket connected: [socket-id]
   ❌ Socket connection error: [error message]
   ```

### 3. **Common Issues & Solutions**

#### Issue A: "Mixed Content" Error (HTTP vs HTTPS)
**Symptoms:**
- Console shows: `Mixed Content: The page at 'https://...' was loaded over HTTPS, but attempted to connect to the insecure HTTP endpoint`

**Solution:**
- If your Vercel deployment uses HTTPS, make sure your laptop server also supports HTTPS
- OR use the same protocol on all devices (all HTTP or all HTTPS)

---

#### Issue B: Firewall Blocking Connections
**Symptoms:**
- Connection timeout
- `ERR_CONNECTION_REFUSED` or `ERR_CONNECTION_TIMED_OUT`

**Solution for Local Development:**
1. **Check your laptop's firewall settings**
   - macOS: System Preferences → Security & Privacy → Firewall → Firewall Options
   - Allow incoming connections for Node.js

2. **Temporarily disable firewall** (for testing):
   ```bash
   # macOS
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
   ```

   **⚠️ Remember to turn it back on after testing:**
   ```bash
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
   ```

---

#### Issue C: Browser Compatibility
**Symptoms:**
- Works on some browsers but not others
- Console shows: `Failed to load socket.io-client`

**Solutions:**
1. **Clear browser cache** on failing phones
2. **Try a different browser** (Chrome, Safari, Firefox)
3. **Update the browser** to the latest version
4. **Disable browser extensions** that might block WebSockets

---

#### Issue D: Network Configuration (Router)
**Symptoms:**
- Works on one phone but not others, all on same WiFi

**Solutions:**
1. **Check AP Isolation** (some routers isolate devices):
   - Log into your router settings
   - Look for "AP Isolation" or "Client Isolation"
   - Disable it if enabled

2. **Check if router allows peer-to-peer connections**:
   - Some guest networks block device-to-device communication
   - Try using the main WiFi network instead of guest network

---

#### Issue E: Port Blocking
**Symptoms:**
- Connection attempts but never completes

**Solution:**
1. **Check if port 3000 is accessible**:
   - Get your laptop's IP address:
     ```bash
     # macOS/Linux
     ifconfig | grep "inet " | grep -v 127.0.0.1

     # Windows
     ipconfig
     ```

2. **Test from the failing phone**:
   - Open browser on phone
   - Visit: `http://[YOUR_LAPTOP_IP]:3000`
   - If you see the game, the port is accessible
   - If not, port is blocked

---

## Production (Vercel) Issues

If this is happening on your **live Vercel deployment**:

### Issue: WebSockets don't work on Vercel
**Solution:** Vercel doesn't support WebSockets with custom servers. You have two options:

1. **Use polling instead** (simpler):
   - Remove WebSocket dependency
   - Use HTTP polling to fetch leaderboard every few seconds

2. **Deploy WebSocket server separately**:
   - Deploy `server.js` to Railway, Render, or Fly.io
   - Update the socket connection URL to point to that server

---

## Debugging Steps

### Step 1: Check Console Logs
On the **failing phone**, open browser console and look for:

```javascript
// Good signs:
✅ Socket connected: abc123
📡 Connected to: http://192.168.1.5:3000
🌐 Transport: websocket

// Bad signs:
❌ Socket connection error: timeout
❌ Socket connection error: ERR_CONNECTION_REFUSED
🔗 Attempted URL: http://localhost:3000  // ← WRONG! Should be your laptop's IP
```

### Step 2: Verify Network
1. **Get your laptop's IP**:
   ```bash
   # macOS
   ipconfig getifaddr en0

   # Or check all network interfaces
   ifconfig | grep "inet "
   ```

2. **On the failing phone**, visit:
   ```
   http://[YOUR_LAPTOP_IP]:3000
   ```

   Can you see the game?
   - ✅ Yes → Network is fine, issue is with Socket.IO
   - ❌ No → Network/firewall issue

### Step 3: Test Socket.IO Directly
Add this to the browser console on the failing phone:

```javascript
// Replace with your laptop's IP
const socket = io('http://192.168.1.5:3000', {
  transports: ['polling', 'websocket']
});

socket.on('connect', () => {
  console.log('✅ Manual socket test: CONNECTED!');
});

socket.on('connect_error', (err) => {
  console.error('❌ Manual socket test: FAILED', err);
});
```

---

## Quick Fix: Force Polling Only

If WebSockets are causing issues, force polling mode:

**Edit `/hooks/useLeaderboard.ts` line 56:**

```typescript
// OLD (tries WebSocket first)
transports: ['websocket', 'polling'],

// NEW (polling only, more reliable across networks)
transports: ['polling'],
```

This is slower but more reliable across different network configurations.

---

## Production Deployment Note

⚠️ **Important**: If you're testing this on Vercel, **WebSockets won't work** because:
- Vercel doesn't support custom servers (like `server.js`)
- Vercel serverless functions are stateless and can't maintain WebSocket connections

For Vercel deployment, you must either:
1. Remove WebSocket features and use polling/refresh instead
2. Deploy the WebSocket server to a different platform (Railway, Render, Fly.io)

---

## Still Having Issues?

If none of the above works, collect this information:

1. **Laptop IP address**: `ifconfig getifaddr en0`
2. **Failing phone OS & browser**: e.g., "iOS 17, Safari" or "Android 13, Chrome"
3. **Working phone OS & browser**: e.g., "Android 12, Chrome"
4. **Console error from failing phone** (screenshot)
5. **Server logs** when the failing phone tries to connect

Then check if there's a pattern (e.g., all iOS devices fail, all Android work).
