/**
 * Gateway Protocol Type Definitions
 *
 * OpenClaw-inspired WebSocket protocol for real-time sales coaching.
 * All messages follow a consistent structure with type and payload.
 */
// ============================================================================
// ERROR CODES
// ============================================================================
export const ErrorCodes = {
    AUTH_FAILED: 'AUTH_FAILED',
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    INVALID_MESSAGE: 'INVALID_MESSAGE',
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
    SESSION_ALREADY_ACTIVE: 'SESSION_ALREADY_ACTIVE',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
};
