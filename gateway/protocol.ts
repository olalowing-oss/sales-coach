/**
 * Gateway Protocol Type Definitions
 *
 * OpenClaw-inspired WebSocket protocol for real-time sales coaching.
 * All messages follow a consistent structure with type and payload.
 */

// ============================================================================
// SHARED TYPES
// ============================================================================

export type MessageType =
  // Connection
  | 'connect'
  | 'connected'
  | 'disconnect'
  | 'error'

  // Session Management
  | 'session.start'
  | 'session.started'
  | 'session.transcript'
  | 'session.end'
  | 'session.ended'

  // Coaching Events
  | 'coaching.tip'
  | 'coaching.objection'
  | 'tip.dismiss'

  // Analysis Events
  | 'analysis.sentiment'
  | 'analysis.silence'
  | 'transcription'

  // Training Mode
  | 'training.customer_reply'
  | 'training.coaching';

export type SessionMode = 'live_call' | 'training' | 'demo';
export type Speaker = 'seller' | 'customer' | 'unknown';

// ============================================================================
// CLIENT → SERVER MESSAGES
// ============================================================================

export interface ConnectMessage {
  type: 'connect';
  payload: {
    userId: string;
    authToken: string;
    device?: {
      id?: string;
      name: string;
      type: 'desktop' | 'mobile' | 'web';
    };
  };
}

export interface SessionStartMessage {
  type: 'session.start';
  payload: {
    customer?: {
      company: string;
      name?: string;
      role?: string;
    };
    mode: SessionMode;
    scenarioId?: string;
    productId?: string;
  };
}

export interface SessionTranscriptMessage {
  type: 'session.transcript';
  payload: {
    sessionId: string;
    text: string;
    isFinal: boolean;
    speaker: Speaker;
    confidence: number;
  };
}

export interface SessionEndMessage {
  type: 'session.end';
  payload: {
    sessionId: string;
  };
}

export interface TipDismissMessage {
  type: 'tip.dismiss';
  payload: {
    sessionId: string;
    tipId: string;
  };
}

export type ClientMessage =
  | ConnectMessage
  | SessionStartMessage
  | SessionTranscriptMessage
  | SessionEndMessage
  | TipDismissMessage;

// ============================================================================
// SERVER → CLIENT MESSAGES
// ============================================================================

export interface ConnectedMessage {
  type: 'connected';
  payload: {
    connectionId: string;
    timestamp: number;
    serverVersion: string;
  };
}

export interface SessionStartedMessage {
  type: 'session.started';
  payload: {
    sessionId: string;
    status: 'recording';
    startedAt: string;
    mode: SessionMode;
  };
}

export interface TranscriptionMessage {
  type: 'transcription';
  payload: {
    sessionId: string;
    segment: {
      id: string;
      text: string;
      speaker: Speaker;
      timestamp: number;
      confidence: number;
      isFinal: boolean;
    };
  };
}

export interface CoachingTipMessage {
  type: 'coaching.tip';
  payload: {
    sessionId: string;
    tip: {
      id: string;
      title: string;
      content: string;
      type: 'suggestion' | 'battlecard' | 'objection' | 'offer' | 'case' | 'warning';
      priority: 'high' | 'medium' | 'low';
      trigger?: string;
      talkingPoints?: string[];
      fullContext?: string; // Full document context for expandable view (RAG)
      relatedOffer?: {
        id: string;
        name: string;
        duration?: string;
        priceRange?: string;
      };
      relatedCase?: {
        id: string;
        customer: string;
        results?: string[];
        quote?: string;
      };
      timestamp: number;
    };
  };
}

export interface CoachingObjectionMessage {
  type: 'coaching.objection';
  payload: {
    sessionId: string;
    objection: {
      id: string;
      type: string;
      category: 'price' | 'timing' | 'competition' | 'trust' | 'need';
      originalText: string;
      responseShort: string;
      responseDetailed?: string;
      followupQuestions?: string[];
      timestamp: number;
    };
  };
}

export interface AnalysisSentimentMessage {
  type: 'analysis.sentiment';
  payload: {
    sessionId: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    interestLevel: number; // 0-100
    confidence: number; // 0-1
    timestamp: number;
  };
}

export interface AnalysisSilenceMessage {
  type: 'analysis.silence';
  payload: {
    sessionId: string;
    duration: number; // seconds
    suggestion: string;
    examples?: string[];
    timestamp: number;
  };
}

export interface TrainingCustomerReplyMessage {
  type: 'training.customer_reply';
  payload: {
    sessionId: string;
    reply: string;
    sentiment: string;
    interestLevel: number;
    shouldEndConversation: boolean;
    timestamp: number;
  };
}

export interface TrainingCoachingMessage {
  type: 'training.coaching';
  payload: {
    sessionId: string;
    whatWentWell: string[];
    whatToImprove: string[];
    nextBestAction: string;
    coachingTips: string[];
    timestamp: number;
  };
}

export interface SessionEndedMessage {
  type: 'session.ended';
  payload: {
    sessionId: string;
    summary: {
      duration: number;
      totalSegments: number;
      topicsDiscussed: string[];
      interestLevel: number;
      nextSteps?: string[];
    };
    timestamp: number;
  };
}

export interface ErrorMessage {
  type: 'error';
  payload: {
    code: string;
    message: string;
    details?: any;
    timestamp: number;
  };
}

export type ServerMessage =
  | ConnectedMessage
  | SessionStartedMessage
  | TranscriptionMessage
  | CoachingTipMessage
  | CoachingObjectionMessage
  | AnalysisSentimentMessage
  | AnalysisSilenceMessage
  | TrainingCustomerReplyMessage
  | TrainingCoachingMessage
  | SessionEndedMessage
  | ErrorMessage;

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface GatewayConfig {
  authToken?: string;
  maxConnectionsPerUser?: number;
  messageRateLimit?: number; // messages per second
  sessionTimeout?: number; // milliseconds
  compactionInterval?: number; // number of messages
  compactionKeepRecent?: number; // number of recent messages to keep
}

export interface ConnectionInfo {
  id: string;
  userId: string;
  connectedAt: Date;
  lastActivity: Date;
  activeSessionId?: string;
  device?: {
    id?: string;
    name: string;
    type: string;
  };
}

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
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
