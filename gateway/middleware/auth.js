/**
 * Authentication Middleware for Gateway
 *
 * Verifies user authentication tokens for WebSocket connections.
 * For now, uses simple token validation - can be extended to JWT later.
 */
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Initialize Supabase client with service role (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);
/**
 * Verify authentication token
 *
 * For MVP: Simple token check against environment variable
 * For production: Verify JWT token with Supabase Auth
 */
export async function verifyAuthToken(authToken) {
    // Simple token validation for MVP
    // In production, this should verify JWT tokens from Supabase Auth
    const gatewayToken = process.env.GATEWAY_AUTH_TOKEN || 'dev-token-123';
    if (authToken === gatewayToken) {
        return {
            success: true,
            userId: 'system-user', // For MVP, use system user
        };
    }
    // Try to verify as Supabase JWT
    try {
        const { data: { user }, error } = await supabase.auth.getUser(authToken);
        if (error || !user) {
            return {
                success: false,
                error: 'Invalid authentication token',
            };
        }
        return {
            success: true,
            userId: user.id,
        };
    }
    catch (error) {
        return {
            success: false,
            error: 'Authentication failed',
        };
    }
}
/**
 * Verify user has access to a specific session
 */
export async function verifySessionAccess(userId, sessionId) {
    try {
        const { data, error } = await supabase
            .from('call_sessions')
            .select('user_id')
            .eq('id', sessionId)
            .single();
        if (error || !data) {
            return false;
        }
        return data.user_id === userId;
    }
    catch (error) {
        console.error('[Auth] Session access check failed:', error);
        return false;
    }
}
const rateLimits = new Map();
export function checkRateLimit(userId, maxRequests = 50, windowMs = 1000) {
    const now = Date.now();
    const entry = rateLimits.get(userId);
    if (!entry || now > entry.resetAt) {
        rateLimits.set(userId, {
            count: 1,
            resetAt: now + windowMs,
        });
        return true;
    }
    if (entry.count >= maxRequests) {
        return false;
    }
    entry.count++;
    return true;
}
/**
 * Cleanup expired rate limit entries (call periodically)
 */
export function cleanupRateLimits() {
    const now = Date.now();
    for (const [userId, entry] of rateLimits.entries()) {
        if (now > entry.resetAt) {
            rateLimits.delete(userId);
        }
    }
}
