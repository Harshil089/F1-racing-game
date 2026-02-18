import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboardFromDb } from '@/lib/database';
import { validateAdminKey } from '@/lib/gameToken';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboard/debug
 * Debug endpoint to see leaderboard data
 * 
 * SECURITY: Requires admin API key. No longer leaks raw phone numbers.
 */
export async function GET(request: NextRequest) {
    // Validate admin access
    if (!validateAdminKey(request)) {
        return NextResponse.json(
            { error: 'Unauthorized. Admin API key required.' },
            { status: 401 }
        );
    }

    try {
        const leaderboard = await getLeaderboardFromDb();

        return NextResponse.json({
            count: leaderboard.length,
            entries: leaderboard.map((entry, index) => ({
                position: index + 1,
                name: entry.name,
                phone: `****${entry.phone.slice(-4)}`, // Mask phone number
                reactionTime: entry.reactionTime,
                carNumber: entry.carNumber,
                timestamp: new Date(entry.timestamp).toISOString(),
            })),
            // REMOVED: raw leaderboard data was leaking full phone numbers
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
