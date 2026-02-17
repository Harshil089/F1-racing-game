import { NextRequest, NextResponse } from 'next/server';
import { updateLeaderboardInDb } from '@/lib/database';

// Prevent Next.js from caching this route
export const dynamic = 'force-dynamic';

/**
 * POST /api/leaderboard/update
 * Update leaderboard with new score
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, reactionTime, carNumber } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json(
        { error: 'Phone is required' },
        { status: 400 }
      );
    }

    if (typeof reactionTime !== 'number' || reactionTime < 0) {
      return NextResponse.json(
        { error: 'Valid reaction time is required' },
        { status: 400 }
      );
    }

    const carNum = parseInt(carNumber, 10);
    if (isNaN(carNum) || carNum < 1 || carNum > 99) {
      return NextResponse.json(
        { error: 'Car number must be between 1 and 99' },
        { status: 400 }
      );
    }

    // Update leaderboard
    const result = await updateLeaderboardInDb(
      name.trim(),
      phone.trim(),
      reactionTime,
      carNum
    );

    return NextResponse.json(
      {
        success: true,
        leaderboard: result.leaderboard,
        position: result.position,
        isCurrentTime: result.isCurrentTime,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to update leaderboard' },
      { status: 500 }
    );
  }
}
