# Redis Database Setup for F1 Racing Game

## Overview
The leaderboard now uses **Redis** (via Upstash/Vercel KV) instead of file-based storage to work on Vercel's serverless platform.

## Setup Instructions

### Option 1: Vercel Deployment (Recommended)

1. **Go to your Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (F1-racing-game)
3. **Go to Storage tab**
4. **Click "Create Database"**
5. **Select "KV (Durable Redis)"** or **"Upstash Redis"**
6. **Follow the prompts** to create the database
7. **Connect it to your project** - Vercel will automatically add the environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
   - `KV_URL`

8. **Redeploy your application** - The environment variables will be available automatically

### Option 2: Manual Upstash Setup (Alternative)

If you want to use Upstash directly (not through Vercel):

1. **Go to Upstash Console**: https://console.upstash.com/
2. **Create a new Redis database** (free tier available)
3. **Copy the REST API credentials**:
   - REST API URL
   - REST API Token
4. **Add to Vercel Environment Variables**:
   - Go to your project settings on Vercel
   - Navigate to "Environment Variables"
   - Add:
     - `UPSTASH_REDIS_REST_URL` = (your REST API URL)
     - `UPSTASH_REDIS_REST_TOKEN` = (your REST API Token)
5. **Redeploy**

## Local Development (Optional)

To test locally with Redis:

1. **Get your Upstash/Vercel KV credentials** from either:
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - OR Upstash Console

2. **Create a `.env.local` file** in the project root:
```env
# Option A: If using Vercel KV
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token

# Option B: If using Upstash directly
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

3. **Run the development server**:
```bash
npm run dev
```

## Environment Variables Explained

The code automatically uses the right configuration:

- **On Vercel**: Uses `KV_REST_API_URL` and `KV_REST_API_TOKEN` (set automatically when you add Vercel KV storage)
- **Manual/Local**: Uses `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

## Verifying the Setup

After deploying:

1. Visit your live site
2. Play the game and submit a score
3. Check if the leaderboard updates
4. Check Vercel deployment logs for any errors

If you see Redis-related errors, ensure:
- ✅ The database is created and connected in Vercel
- ✅ Environment variables are set correctly
- ✅ You've redeployed after adding the database

## Migration Notes

- **Old data**: Previous leaderboard data stored in `data/leaderboard.json` will NOT be automatically migrated
- **Fresh start**: The Redis database starts empty
- **No data loss on new scores**: All new scores will be properly saved to Redis

## Cost

- **Vercel KV / Upstash**: Free tier includes:
  - 10,000 commands per day
  - 256 MB storage
  - This is MORE than enough for a leaderboard with 3 entries!

## Troubleshooting

### Error: "Redis configuration missing"
- Make sure you've added the Redis database in Vercel
- Verify environment variables are set
- Redeploy the application

### Leaderboard not updating
- Check Vercel deployment logs for errors
- Ensure the API routes are working: `/api/leaderboard` and `/api/leaderboard/update`
- Test the endpoints using Vercel's function logs

### Local development not working
- Ensure `.env.local` exists with correct credentials
- Restart the development server after adding environment variables
