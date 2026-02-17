import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboardFromDb } from '@/lib/database';

/**
 * GET /api/leaderboard
 * Get current leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const leaderboard = await getLeaderboardFromDb();
    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}
