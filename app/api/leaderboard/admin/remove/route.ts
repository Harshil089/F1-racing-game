import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboardFromDb } from '@/lib/database';
import { validateAdminKey } from '@/lib/gameToken';
import { Redis } from '@upstash/redis';
import { kv } from '@vercel/kv';
import { LeaderboardEntry } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

const LEADERBOARD_KEY = 'f1_leaderboard';

function getRedisClient() {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        return kv;
    }
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        return new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
    throw new Error('Redis configuration missing.');
}

/**
 * POST /api/leaderboard/admin/remove
 * Remove a specific entry from the leaderboard by name
 * 
 * SECURITY: Requires admin API key
 * Body: { name: string } or { name: string, phone: string }
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
        const body = await request.json();
        const { name, phone } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Name is required to identify the entry to remove' },
                { status: 400 }
            );
        }

        const leaderboard = await getLeaderboardFromDb();

        // Filter out the entry matching name (and optionally phone)
        const filtered = leaderboard.filter((entry: LeaderboardEntry) => {
            if (phone) {
                return !(entry.name === name && entry.phone === phone);
            }
            return entry.name !== name;
        });

        const removed = leaderboard.length - filtered.length;

        if (removed === 0) {
            return NextResponse.json(
                { error: `No entry found with name "${name}"`, leaderboard },
                { status: 404 }
            );
        }

        // Save filtered leaderboard back to Redis
        const redis = getRedisClient();
        await redis.set(LEADERBOARD_KEY, filtered);

        return NextResponse.json({
            success: true,
            message: `Removed ${removed} entry/entries for "${name}"`,
            leaderboard: filtered,
        });
    } catch (error) {
        console.error('Error removing leaderboard entry:', error);
        return NextResponse.json(
            { error: 'Failed to remove entry', details: String(error) },
            { status: 500 }
        );
    }
}
