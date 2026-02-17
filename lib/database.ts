/**
 * Redis-based database for leaderboard (works with Vercel/Upstash)
 */
import { Redis } from '@upstash/redis';
import { kv } from '@vercel/kv';
import { LeaderboardEntry } from './leaderboard';

const MAX_ENTRIES = 10;
const LEADERBOARD_KEY = 'f1_leaderboard';

/**
 * Get Redis client - uses @vercel/kv in production (Vercel environment)
 * or @upstash/redis for manual configuration
 */
function getRedisClient() {
  // Use @vercel/kv if running on Vercel (it auto-configures)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return kv;
  }

  // Fallback to direct Upstash connection if KV_REST_API_URL is not available
  // This is useful for local development or other hosting platforms
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  throw new Error('Redis configuration missing. Please set KV_REST_API_URL and KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.');
}

/**
 * Get all leaderboard entries from database
 */
export async function getLeaderboardFromDb(): Promise<LeaderboardEntry[]> {
  try {
    const redis = getRedisClient();
    const data = await redis.get<LeaderboardEntry[]>(LEADERBOARD_KEY);

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.sort((a, b) => a.reactionTime - b.reactionTime).slice(0, MAX_ENTRIES);
  } catch (error) {
    console.error('Error reading leaderboard from database:', error);
    return [];
  }
}

/**
 * Update leaderboard in database
 * Returns the updated leaderboard and the user's position
 */
export async function updateLeaderboardInDb(
  name: string,
  phone: string,
  reactionTime: number,
  carNumber: number
): Promise<{ leaderboard: LeaderboardEntry[]; position: number | null }> {
  try {
    const redis = getRedisClient();

    // Don't add false starts
    if (reactionTime >= 999) {
      const leaderboard = await getLeaderboardFromDb();
      return { leaderboard, position: null };
    }

    const leaderboard = await getLeaderboardFromDb();

    // Check if user already exists (by name + phone combination)
    const existingEntryIndex = leaderboard.findIndex(
      entry => entry.name === name && entry.phone === phone
    );

    if (existingEntryIndex !== -1) {
      // Update existing entry with new reaction time
      leaderboard[existingEntryIndex] = {
        name,
        phone,
        reactionTime,
        carNumber,
        timestamp: Date.now(),
      };
    } else {
      // Add new entry
      const newEntry: LeaderboardEntry = {
        name,
        phone,
        reactionTime,
        carNumber,
        timestamp: Date.now(),
      };
      leaderboard.push(newEntry);
    }

    // Sort by reaction time (ascending - fastest first)
    leaderboard.sort((a, b) => a.reactionTime - b.reactionTime);

    // Keep only top 3
    const topThree = leaderboard.slice(0, MAX_ENTRIES);

    // Save to Redis
    await redis.set(LEADERBOARD_KEY, topThree);

    // Find position of the current user (1-indexed)
    const position = topThree.findIndex(entry =>
      entry.name === name && entry.phone === phone
    );

    return {
      leaderboard: topThree,
      position: position >= 0 ? position + 1 : null,
    };
  } catch (error) {
    console.error('Error updating leaderboard in database:', error);
    const leaderboard = await getLeaderboardFromDb();
    return { leaderboard, position: null };
  }
}

/**
 * Clear the entire leaderboard
 */
export async function clearLeaderboardInDb(): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.set(LEADERBOARD_KEY, []);
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
  }
}
