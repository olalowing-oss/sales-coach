/**
 * Gateway Protocol Types
 *
 * Frontend-compatible types for WebSocket Gateway communication.
 * Mirrors backend gateway/protocol.ts types.
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export type SessionMode = 'live_call' | 'training' | 'demo';
export type Speaker = 'seller' | 'customer' | 'unknown';
export type SessionStatus = 'recording' | 'paused' | 'stopped';

// ============================================================================
// CLIENT → SERVER MESSAGES
// ============================================================================

export interface ConnectPayload {
  userId: string;
  authToken: string;
  device?: {
    name: string;
    type: 'desktop' | 'mobile' | 'tablet';
  };
}

export interface SessionStartPayload {
  customer?: {
    company: string;
    name?: string;
    role?: string;
  };
  mode: SessionMode;
  scenarioId?: string;
  productId?: string;
}

export interface SessionTranscriptPayload {
  sessionId: string;
  text: string;
  isFinal: boolean;
  speaker: Speaker;
  confidence: number;
}

export interface SessionEndPayload {
  sessionId: string;
}

export interface TipDismissPayload {
  sessionId: string;
  tipId: string;
}

export type ClientMessage =
  | { type: 'connect'; payload: ConnectPayload }
  | { type: 'session.start'; payload: SessionStartPayload }
  | { type: 'session.transcript'; payload: SessionTranscriptPayload }
  | { type: 'session.end'; payload: SessionEndPayload }
  | { type: 'tip.dismiss'; payload: TipDismissPayload };

// ============================================================================
// SERVER → CLIENT MESSAGES
// ============================================================================

export interface ConnectedPayload {
  connectionId: string;
  timestamp: number;
  serverVersion: string;
}

export interface SessionStartedPayload {
  sessionId: string;
  status: SessionStatus;
  startedAt: string;
  mode: SessionMode;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  speaker: Speaker;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export interface TranscriptionPayload {
  sessionId: string;
  segment: TranscriptSegment;
}

export interface CoachingTip {
  id: string;
  type: 'suggestion' | 'battlecard' | 'objection' | 'offer' | 'case' | 'warning';
  priority: 'high' | 'medium' | 'low';
  trigger: string;
  title: string;
  content: string;
  talkingPoints?: string[];
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
}

export interface CoachingTipPayload {
  sessionId: string;
  tip: CoachingTip;
}

export interface ObjectionDetected {
  id: string;
  type: string;
  category: 'price' | 'timing' | 'competition' | 'trust' | 'need';
  originalText: string;
  responseShort: string;
  responseDetailed?: string;
  followupQuestions?: string[];
  timestamp: number;
}

export interface CoachingObjectionPayload {
  sessionId: string;
  objection: ObjectionDetected;
}

export interface SentimentPayload {
  sessionId: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  interestLevel: number; // 0-100
  confidence: number; // 0-1
  timestamp: number;
}

export interface SilencePayload {
  sessionId: string;
  duration: number; // seconds
  suggestion: string;
  examples?: string[];
  timestamp: number;
}

export interface SessionSummary {
  duration: number; // milliseconds
  totalSegments: number;
  topicsDiscussed: string[];
  interestLevel: number;
  nextSteps?: string[];
  painPoints?: string[];
  objections?: string[];
}

export interface SessionEndedPayload {
  sessionId: string;
  summary: SessionSummary;
  timestamp: number;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export type ServerMessage =
  | { type: 'connected'; payload: ConnectedPayload }
  | { type: 'session.started'; payload: SessionStartedPayload }
  | { type: 'transcription'; payload: TranscriptionPayload }
  | { type: 'coaching.tip'; payload: CoachingTipPayload }
  | { type: 'coaching.objection'; payload: CoachingObjectionPayload }
  | { type: 'analysis.sentiment'; payload: SentimentPayload }
  | { type: 'analysis.silence'; payload: SilencePayload }
  | { type: 'session.ended'; payload: SessionEndedPayload }
  | { type: 'error'; payload: ErrorPayload };

// ============================================================================
// EVENT HANDLERS
// ============================================================================

export type EventHandler<T = any> = (payload: T) => void;

export interface GatewayEventMap {
  connected: ConnectedPayload;
  'session.started': SessionStartedPayload;
  transcription: TranscriptionPayload;
  'coaching.tip': CoachingTipPayload;
  'coaching.objection': CoachingObjectionPayload;
  'analysis.sentiment': SentimentPayload;
  'analysis.silence': SilencePayload;
  'session.ended': SessionEndedPayload;
  error: ErrorPayload;
  disconnect: void;
  reconnecting: void;
  reconnected: void;
}

export type GatewayEvent = keyof GatewayEventMap;
