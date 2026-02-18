/**
 * Server-side game token system for anti-cheat protection.
 * 
 * Flow:
 * 1. Client calls /api/game/start -> server returns a signed gameToken + serverTimestamp
 * 2. Client plays the game and measures reactionTime on the client
 * 3. Client submits score with the gameToken
 * 4. Server validates: token is valid, not expired, not reused, and reaction time is plausible
 */
import crypto from 'crypto';

const GAME_SECRET = process.env.GAME_SECRET || 'f1-racing-game-secret-change-in-production-' + Date.now();

// No minimum reaction time enforced — some players are genuinely fast!
// Only reject negative values and false starts (>=999ms)
export const MIN_REACTION_TIME_MS = 0;

// Maximum valid reaction time (false start threshold)
export const MAX_REACTION_TIME_MS = 999;

// Token validity window: how long after /start a score can be submitted (60 seconds)
const TOKEN_EXPIRY_MS = 60_000;

// In-memory set of used tokens to prevent replay attacks
// In production, use Redis for this
const usedTokens = new Set<string>();

// Clean up old tokens periodically (every 5 minutes)
setInterval(() => {
    usedTokens.clear(); // Simple approach: clear all. Expired tokens would fail validation anyway.
}, 5 * 60 * 1000);

interface GameTokenPayload {
    sessionId: string;
    issuedAt: number; // server timestamp when game started
    lightsOutAt: number; // server timestamp when lights went out (estimated)
}

/**
 * Generate a signed game token when the game starts.
 * Returns the token and the server timestamp.
 */
export function generateGameToken(): { token: string; serverTimestamp: number; sessionId: string } {
    const sessionId = crypto.randomUUID();
    const issuedAt = Date.now();

    const payload: GameTokenPayload = {
        sessionId,
        issuedAt,
        lightsOutAt: 0, // Will be set when lights go out
    };

    const payloadStr = JSON.stringify(payload);
    const payloadB64 = Buffer.from(payloadStr).toString('base64url');
    const signature = crypto
        .createHmac('sha256', GAME_SECRET)
        .update(payloadB64)
        .digest('base64url');

    const token = `${payloadB64}.${signature}`;

    return { token, serverTimestamp: issuedAt, sessionId };
}

/**
 * Validate a game token and reaction time.
 * Returns the decoded payload if valid, or an error message.
 */
export function validateGameToken(
    token: string,
    reactionTime: number
): { valid: true; payload: GameTokenPayload } | { valid: false; error: string } {
    // Check if token has been used (replay attack prevention)
    if (usedTokens.has(token)) {
        return { valid: false, error: 'Token already used. Each game session can only submit once.' };
    }

    // Parse token
    const parts = token.split('.');
    if (parts.length !== 2) {
        return { valid: false, error: 'Invalid token format' };
    }

    const [payloadB64, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', GAME_SECRET)
        .update(payloadB64)
        .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return { valid: false, error: 'Invalid token signature — tampered or forged' };
    }

    // Decode payload
    let payload: GameTokenPayload;
    try {
        payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    } catch {
        return { valid: false, error: 'Invalid token payload' };
    }

    // Check expiry
    const now = Date.now();
    if (now - payload.issuedAt > TOKEN_EXPIRY_MS) {
        return { valid: false, error: 'Token expired. Game session took too long.' };
    }

    // Validate reaction time: only reject negative values
    if (reactionTime < 0) {
        return {
            valid: false,
            error: 'Invalid reaction time — cannot be negative',
        };
    }

    if (reactionTime >= MAX_REACTION_TIME_MS) {
        return { valid: false, error: 'False start — reaction time too high' };
    }

    // Mark token as used (prevent replay)
    usedTokens.add(token);

    // Schedule cleanup of this specific token after expiry
    setTimeout(() => {
        usedTokens.delete(token);
    }, TOKEN_EXPIRY_MS);

    return { valid: true, payload };
}

/**
 * Validate admin API key for sensitive endpoints (clear, debug)
 */
export function validateAdminKey(request: Request): boolean {
    const adminKey = process.env.ADMIN_API_KEY;

    // If no admin key is configured, block all admin access in production
    if (!adminKey) {
        const isDev = process.env.NODE_ENV === 'development';
        return isDev; // Allow in development, block in production
    }

    const providedKey = request.headers.get('x-admin-key') ||
        new URL(request.url).searchParams.get('admin_key');

    if (!providedKey) return false;

    // Use timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(providedKey),
            Buffer.from(adminKey)
        );
    } catch {
        return false; // Different lengths
    }
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 submissions per minute per IP

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        // New window
        rateLimitMap.set(ip, { count: 1, windowStart: now });
        return { allowed: true };
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
        return { allowed: false, retryAfterMs };
    }

    entry.count++;
    return { allowed: true };
}

// Clean up rate limit entries periodically
setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    rateLimitMap.forEach((entry, ip) => {
        if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
            keysToDelete.push(ip);
        }
    });
    keysToDelete.forEach(ip => rateLimitMap.delete(ip));
}, RATE_LIMIT_WINDOW_MS);
