/**
 * Leaderboard system for tracking top 3 fastest reaction times
 */

export interface LeaderboardEntry {
  name: string;
  phone: string;
  reactionTime: number;
  carNumber: number;
  timestamp: number;
}

const LEADERBOARD_KEY = 'f1_leaderboard';
const MAX_ENTRIES = 3;

/**
 * Get current leaderboard from localStorage
 */
export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (!stored) return [];

    const leaderboard = JSON.parse(stored) as LeaderboardEntry[];

    // Filter out entries without phone numbers (old data)
    const validEntries = leaderboard.filter(entry => entry.phone && entry.phone.length > 0);

    return validEntries.sort((a, b) => a.reactionTime - b.reactionTime).slice(0, MAX_ENTRIES);
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }
}

/**
 * Check if a time qualifies for the leaderboard
 */
export function qualifiesForLeaderboard(reactionTime: number): boolean {
  // False starts (999ms) don't qualify
  if (reactionTime >= 999) return false;

  const leaderboard = getLeaderboard();

  // If leaderboard has less than 3 entries, always qualify
  if (leaderboard.length < MAX_ENTRIES) return true;

  // Check if time beats the slowest time on leaderboard
  const slowestTime = leaderboard[leaderboard.length - 1].reactionTime;
  return reactionTime < slowestTime;
}

/**
 * Add or update entry on the leaderboard
 * Returns the position (1-3) if qualified, or null if didn't make it
 */
export function updateLeaderboard(
  name: string,
  phone: string,
  reactionTime: number,
  carNumber: number
): number | null {
  // Don't add false starts
  if (reactionTime >= 999) return null;

  const leaderboard = getLeaderboard();

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

  // Save to localStorage
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topThree));
  } catch (error) {
    console.error('Error saving leaderboard:', error);
  }

  // Find position of the current user (1-indexed)
  const position = topThree.findIndex(entry =>
    entry.name === name && entry.phone === phone
  );

  return position >= 0 ? position + 1 : null;
}

/**
 * Clear the entire leaderboard
 */
export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
  }
}

/**
 * Get the position emoji for display
 */
export function getPositionEmoji(position: number): string {
  switch (position) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '🏁';
  }
}
