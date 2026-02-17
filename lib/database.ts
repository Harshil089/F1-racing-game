/**
 * Simple file-based database for leaderboard
 */
import fs from 'fs/promises';
import path from 'path';
import { LeaderboardEntry } from './leaderboard';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'leaderboard.json');
const MAX_ENTRIES = 3;

/**
 * Ensure database directory exists
 */
async function ensureDbExists(): Promise<void> {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      // File doesn't exist, create it
      await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error ensuring database exists:', error);
  }
}

/**
 * Get all leaderboard entries from database
 */
export async function getLeaderboardFromDb(): Promise<LeaderboardEntry[]> {
  try {
    await ensureDbExists();
    const data = await fs.readFile(DB_FILE, 'utf-8');
    const entries = JSON.parse(data) as LeaderboardEntry[];
    return entries.sort((a, b) => a.reactionTime - b.reactionTime).slice(0, MAX_ENTRIES);
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
    await ensureDbExists();

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

    // Save to database
    await fs.writeFile(DB_FILE, JSON.stringify(topThree, null, 2));

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
    await ensureDbExists();
    await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
  }
}
