import { NextRequest, NextResponse } from 'next/server';
import { updateLeaderboardInDb } from '@/lib/database';
import { validateGameToken, checkRateLimit, MAX_REACTION_TIME_MS } from '@/lib/gameToken';

// Prevent Next.js from caching this route
export const dynamic = 'force-dynamic';

/**
 * POST /api/leaderboard/update
 * Update leaderboard with new score
 * 
 * SECURITY:
 * - Requires a valid game token (issued by /api/game/start)
 * - Validates reaction time is within humanly possible bounds
 * - Rate limited per IP
 * - Tokens are single-use (prevents replay attacks)
 */
export async function POST(request: NextRequest) {
  try {
    // --- Rate Limiting ---
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${Math.ceil((rateCheck.retryAfterMs || 0) / 1000)} seconds.` },
        { status: 429 }
      );
    }

    // --- Parse Body ---
    const body = await request.json();
    const { name, phone, reactionTime, carNumber, gameToken } = body;

    // --- Game Token Validation ---
    if (!gameToken || typeof gameToken !== 'string') {
      return NextResponse.json(
        { error: 'Missing game token. You must play the game to submit a score.' },
        { status: 403 }
      );
    }

    const tokenValidation = validateGameToken(gameToken, reactionTime);
    if (!tokenValidation.valid) {
      console.warn(`[SECURITY] Invalid token from IP ${ip}: ${tokenValidation.error}`);
      return NextResponse.json(
        { error: tokenValidation.error },
        { status: 403 }
      );
    }

    // --- Input Validation ---
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

    if (typeof reactionTime !== 'number' || reactionTime < 0 || reactionTime >= MAX_REACTION_TIME_MS) {
      return NextResponse.json(
        { error: `Reaction time must be a valid positive number under ${MAX_REACTION_TIME_MS}ms` },
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

    // --- Update Leaderboard ---
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
