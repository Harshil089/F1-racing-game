import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboardFromDb } from '@/lib/database';

// Prevent Next.js from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/leaderboard
 * Get current leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const leaderboard = await getLeaderboardFromDb();
    return NextResponse.json({ leaderboard }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}
