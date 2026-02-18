import { NextRequest, NextResponse } from 'next/server';
import { generateGameToken } from '@/lib/gameToken';

export const dynamic = 'force-dynamic';

/**
 * POST /api/game/start
 * Called when a new game session begins.
 * Returns a signed game token that must be submitted with the score.
 */
export async function POST(request: NextRequest) {
    try {
        const { token, serverTimestamp, sessionId } = generateGameToken();

        return NextResponse.json(
            {
                gameToken: token,
                serverTimestamp,
                sessionId,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error generating game token:', error);
        return NextResponse.json(
            { error: 'Failed to start game session' },
            { status: 500 }
        );
    }
}
