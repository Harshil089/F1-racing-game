# Real-Time Leaderboard with WebSockets

This F1 Racing Game now features real-time leaderboard updates using Socket.IO WebSockets!

## 🚀 Features

- **Real-time Updates**: Leaderboard updates automatically across all connected clients
- **Persistent Storage**: Scores are saved to a JSON database file
- **Live Dashboard**: Dedicated leaderboard page with live updates
- **Connection Status**: Visual indicators showing connection status
- **No Duplicates**: Users identified by name + phone number combination
- **Auto-sync**: When a new record is set, all viewers see it instantly

## 📁 New Files Created

### Server
- `server.js` - Custom Next.js server with Socket.IO integration
- `lib/database.ts` - File-based JSON database for leaderboard persistence

### API Routes
- `app/api/leaderboard/route.ts` - GET endpoint to fetch current leaderboard
- `app/api/leaderboard/update/route.ts` - POST endpoint to update leaderboard

### Client
- `hooks/useLeaderboard.ts` - Custom React hook for real-time leaderboard
- `app/leaderboard/page.tsx` - Standalone leaderboard dashboard page

### Data
- `data/leaderboard.json` - Persistent leaderboard storage (auto-created)

## 🎮 How to Use

### Starting the Server

```bash
npm run dev
```

This now starts the custom server with Socket.IO support on port 3000.

### Accessing the Leaderboard

1. **In-Game**: After completing a race, see the leaderboard in the results screen
2. **Dashboard**: Visit `/leaderboard` for a full-screen live leaderboard view

### How It Works

1. **Player finishes race** → Score is sent to API
2. **API updates database** → New leaderboard is calculated
3. **Socket.IO broadcasts** → All connected clients receive update
4. **UI updates automatically** → No page refresh needed!

## 🔌 WebSocket Events

### Client → Server
- `leaderboard:update` - Broadcast when leaderboard is updated

### Server → Client
- `leaderboard:updated` - Receive updated leaderboard data

## 📊 Real-time Dashboard Features

Visit `/leaderboard` to see:
- Live connection status indicator
- Total records count
- Fastest time
- Average time
- Top 3 champions with detailed info
- Auto-refreshing when new records are set

## 🔧 Technical Details

- **WebSocket Library**: Socket.IO v4.8
- **Database**: JSON file storage in `data/` directory
- **Uniqueness**: Users identified by `name + phone` combination
- **Max Entries**: Top 3 fastest times
- **Auto-reconnection**: Client automatically reconnects if connection drops

## 🎯 Benefits

1. **Multi-user Support**: Multiple people can race simultaneously
2. **Competition**: See real-time updates as others beat your score
3. **No Refresh Needed**: Instant updates without page reload
4. **Scalable**: Can handle many concurrent connections
5. **Persistent**: Scores survive server restarts

## 🛠️ Configuration

The server runs on port 3000 by default. To change:

```javascript
// In server.js
const port = parseInt(process.env.PORT || '3000', 10);
```

## 📝 Environment

No environment variables needed! Everything works out of the box.

## 🎨 UI Indicators

- 🟢 **Green dot** = Connected to real-time updates
- 🔴 **Gray dot** = Offline/Disconnected
- **"Live"** = Real-time updates active

Enjoy the real-time racing competition! 🏁
