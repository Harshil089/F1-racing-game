import { NextResponse } from 'next/server';
import { getLeaderboardFromDb } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboard/debug
 * Debug endpoint to see raw leaderboard data
 */
export async function GET() {
    try {
        const leaderboard = await getLeaderboardFromDb();

        return NextResponse.json({
            count: leaderboard.length,
            entries: leaderboard.map((entry, index) => ({
                position: index + 1,
                name: entry.name,
                phone: entry.phone.slice(-4),
                reactionTime: entry.reactionTime,
                carNumber: entry.carNumber,
                timestamp: new Date(entry.timestamp).toISOString(),
            })),
            raw: leaderboard,
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to get debug info', details: String(error) },
            { status: 500 }
        );
    }
}
