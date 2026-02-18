import { NextRequest, NextResponse } from 'next/server';
import { clearLeaderboardInDb } from '@/lib/database';
import { validateAdminKey } from '@/lib/gameToken';

/**
 * POST /api/leaderboard/clear
 * Clear all leaderboard entries
 * 
 * SECURITY: Requires admin API key
 */
export async function POST(request: NextRequest) {
  // Validate admin access
  if (!validateAdminKey(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin API key required.' },
      { status: 401 }
    );
  }

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
