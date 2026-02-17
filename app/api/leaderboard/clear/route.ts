import { NextRequest, NextResponse } from 'next/server';
import { clearLeaderboardInDb } from '@/lib/database';

/**
 * POST /api/leaderboard/clear
 * Clear all leaderboard entries
 */
export async function POST(request: NextRequest) {
  try {
    await clearLeaderboardInDb();

    return NextResponse.json(
      { success: true, message: 'Leaderboard cleared successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to clear leaderboard' },
      { status: 500 }
    );
  }
}
