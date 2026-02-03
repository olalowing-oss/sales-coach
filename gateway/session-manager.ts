/**
 * Session Manager
 *
 * Manages coaching session state with OpenClaw-style compaction.
 * In-memory storage with Supabase persistence.
 */

import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import type { SessionMode, Speaker } from './protocol.js';

// ============================================================================
// TYPES
// ============================================================================

export interface TranscriptSegment {
  id: string;
  text: string;
  speaker: Speaker;
  timestamp: number; // milliseconds since session start
  confidence: number;
  isFinal: boolean;
}

export interface SessionContext {
  painPoints: string[];
  objections: string[];
  productsDiscussed: string[];
  competitorsMentioned: string[];
  buyingSignals: string[];
  topicsDiscussed: string[];
}

export interface SessionState {
  // Metadata
  id: string;
  userId: string;
  mode: SessionMode;
  status: 'active' | 'ended';

  // Customer info
  customerCompany?: string;
  customerName?: string;
  customerRole?: string;

  // Training mode
  scenarioId?: string;
  productId?: string;

  // Timing
  startedAt: Date;
  endedAt?: Date;
  lastActivityAt: Date;

  // Transcript (with compaction)
  segments: TranscriptSegment[];
  compactedSummary?: string;
  compactedAt?: Date;
  compactionCount: number;

  // Context tracking
  context: SessionContext;

  // Metrics
  interestLevel: number; // 0-100
  sentiment: 'positive' | 'neutral' | 'negative';
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

// ============================================================================
// SESSION MANAGER
// ============================================================================

export class SessionManager {
  private sessions: Map<string, SessionState> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();

  // Compaction settings (OpenClaw-style)
  private readonly COMPACTION_INTERVAL = 10; // Compact every 10 messages
  private readonly KEEP_RECENT = 20; // Keep last 20 segments after compaction

  // Supabase client
  private supabase;

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[SessionManager] Supabase not configured - persistence disabled');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  // --------------------------------------------------------------------------
  // SESSION LIFECYCLE
  // --------------------------------------------------------------------------

  /**
   * Create new session
   */
  createSession(params: {
    userId: string;
    mode: SessionMode;
    customerCompany?: string;
    customerName?: string;
    customerRole?: string;
    scenarioId?: string;
    productId?: string;
  }): SessionState {
    const session: SessionState = {
      id: randomUUID(),
      userId: params.userId,
      mode: params.mode,
      status: 'active',
      customerCompany: params.customerCompany,
      customerName: params.customerName,
      customerRole: params.customerRole,
      scenarioId: params.scenarioId,
      productId: params.productId,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      segments: [],
      compactionCount: 0,
      context: {
        painPoints: [],
        objections: [],
        productsDiscussed: params.productId ? [params.productId] : [],
        competitorsMentioned: [],
        buyingSignals: [],
        topicsDiscussed: [],
      },
      interestLevel: 50,
      sentiment: 'neutral',
    };

    this.sessions.set(session.id, session);

    // Track by user
    if (!this.userSessions.has(params.userId)) {
      this.userSessions.set(params.userId, new Set());
    }
    this.userSessions.get(params.userId)!.add(session.id);

    console.log(`[SessionManager] Session created: ${session.id} (mode: ${params.mode})`);

    // Save to Supabase
    this.saveSessionToDb(session).catch((err) =>
      console.error('[SessionManager] Failed to save session:', err)
    );

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions for a user
   */
  getSessionsForUser(userId: string): SessionState[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];

    return Array.from(sessionIds)
      .map((id) => this.sessions.get(id))
      .filter((s): s is SessionState => s !== undefined && s.status === 'active');
  }

  /**
   * End session
   */
  async endSession(sessionId: string): Promise<SessionSummary> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.status = 'ended';
    session.endedAt = new Date();

    const summary: SessionSummary = {
      duration: session.endedAt.getTime() - session.startedAt.getTime(),
      totalSegments: session.segments.length + session.compactionCount * this.COMPACTION_INTERVAL,
      topicsDiscussed: session.context.topicsDiscussed,
      interestLevel: session.interestLevel,
      nextSteps: [],
      painPoints: session.context.painPoints,
      objections: session.context.objections,
    };

    console.log(`[SessionManager] Session ended: ${sessionId} (${summary.duration}ms)`);

    // Save final state to Supabase
    await this.saveSessionToDb(session);

    return summary;
  }

  // --------------------------------------------------------------------------
  // TRANSCRIPT MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Add transcript segment
   */
  async addSegment(
    sessionId: string,
    text: string,
    speaker: Speaker,
    isFinal: boolean,
    confidence: number
  ): Promise<TranscriptSegment> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const timestamp = Date.now() - session.startedAt.getTime();

    const segment: TranscriptSegment = {
      id: randomUUID(),
      text,
      speaker,
      timestamp,
      confidence,
      isFinal,
    };

    session.segments.push(segment);
    session.lastActivityAt = new Date();

    // Save segment to DB (async, don't block)
    if (isFinal) {
      this.saveSegmentToDb(sessionId, segment).catch((err) =>
        console.error('[SessionManager] Failed to save segment:', err)
      );
    }

    // Check if compaction needed
    if (session.segments.length >= this.COMPACTION_INTERVAL + this.KEEP_RECENT) {
      await this.compactSession(sessionId);
    }

    return segment;
  }

  /**
   * Get conversation history for prompts (with compaction support)
   */
  getConversationHistory(sessionId: string, maxSegments: number = 20): string {
    const session = this.sessions.get(sessionId);
    if (!session) return '';

    const parts: string[] = [];

    // Include compacted summary if exists
    if (session.compactedSummary) {
      parts.push('=== TIDIGARE I SAMTALET ===');
      parts.push(session.compactedSummary);
      parts.push('');
      parts.push('=== SENASTE MEDDELANDEN ===');
    }

    // Recent segments
    const recentSegments = session.segments.slice(-maxSegments);
    for (const segment of recentSegments) {
      const speakerLabel = segment.speaker === 'seller' ? 'SÄLJARE' : 'KUND';
      parts.push(`[${speakerLabel}]: ${segment.text}`);
    }

    return parts.join('\n');
  }

  // --------------------------------------------------------------------------
  // COMPACTION (OpenClaw-style)
  // --------------------------------------------------------------------------

  /**
   * Compact session - summarize older segments, keep recent ones
   */
  private async compactSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const totalSegments = session.segments.length;
    if (totalSegments <= this.KEEP_RECENT) return;

    console.log(
      `[SessionManager] Compacting session ${sessionId}: ${totalSegments} segments → keep ${this.KEEP_RECENT}`
    );

    // Keep recent segments
    const recentSegments = session.segments.slice(-this.KEEP_RECENT);
    const oldSegments = session.segments.slice(0, -this.KEEP_RECENT);

    // Create summary of old segments
    const summary = this.summarizeSegments(oldSegments, session.context);

    // Update session
    session.segments = recentSegments;
    session.compactedSummary = summary;
    session.compactedAt = new Date();
    session.compactionCount++;

    // Save compacted state to DB
    await this.saveSessionToDb(session);

    console.log(
      `[SessionManager] Compaction complete: ${oldSegments.length} segments → summary (${summary.length} chars)`
    );
  }

  /**
   * Summarize segments into text summary
   */
  private summarizeSegments(segments: TranscriptSegment[], context: SessionContext): string {
    const sellerCount = segments.filter((s) => s.speaker === 'seller').length;
    const customerCount = segments.filter((s) => s.speaker === 'customer').length;

    const parts = [
      `Tidigare i samtalet (${segments.length} meddelanden - ${sellerCount} säljare, ${customerCount} kund):`,
    ];

    if (context.painPoints.length > 0) {
      parts.push(`- Pain points: ${context.painPoints.join(', ')}`);
    }

    if (context.objections.length > 0) {
      parts.push(`- Invändningar: ${context.objections.join(', ')}`);
    }

    if (context.productsDiscussed.length > 0) {
      parts.push(`- Produkter: ${context.productsDiscussed.join(', ')}`);
    }

    if (context.buyingSignals.length > 0) {
      parts.push(`- Köpsignaler: ${context.buyingSignals.join(', ')}`);
    }

    // Include some key phrases from the conversation
    const keyPhrases = segments
      .filter((s) => s.text.length > 30)
      .slice(0, 5)
      .map((s) => {
        const speaker = s.speaker === 'seller' ? 'Säljare' : 'Kund';
        const preview = s.text.substring(0, 100);
        return `[${speaker}]: "${preview}${s.text.length > 100 ? '...' : ''}"`;
      });

    if (keyPhrases.length > 0) {
      parts.push('');
      parts.push('Nyckeluttalanden:');
      parts.push(...keyPhrases);
    }

    return parts.join('\n');
  }

  // --------------------------------------------------------------------------
  // CONTEXT MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Add pain point to session context
   */
  addPainPoint(sessionId: string, painPoint: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (!session.context.painPoints.includes(painPoint)) {
      session.context.painPoints.push(painPoint);
    }
  }

  /**
   * Add objection to session context
   */
  addObjection(sessionId: string, objection: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (!session.context.objections.includes(objection)) {
      session.context.objections.push(objection);
    }
  }

  /**
   * Add buying signal
   */
  addBuyingSignal(sessionId: string, signal: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.context.buyingSignals.push(signal);
  }

  /**
   * Update interest level
   */
  updateInterestLevel(sessionId: string, level: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.interestLevel = Math.max(0, Math.min(100, level));
  }

  /**
   * Update sentiment
   */
  updateSentiment(sessionId: string, sentiment: 'positive' | 'neutral' | 'negative'): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.sentiment = sentiment;
  }

  // --------------------------------------------------------------------------
  // SUPABASE PERSISTENCE
  // --------------------------------------------------------------------------

  /**
   * Save session to Supabase
   */
  private async saveSessionToDb(session: SessionState): Promise<void> {
    try {
      const sessionData = {
        id: session.id,
        user_id: session.userId,
        status: session.status === 'active' ? 'recording' : 'stopped',
        started_at: session.startedAt.toISOString(),
        ended_at: session.endedAt?.toISOString() || null,
        customer_name: session.customerName || null,
        customer_company: session.customerCompany || null,
        customer_role: session.customerRole || null,
        full_transcript: this.getConversationHistory(session.id),
        duration_seconds: session.endedAt
          ? Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 1000)
          : null,
        sentiment: session.sentiment,
        topics: session.context.topicsDiscussed,
        pain_points: session.context.painPoints,
        objections_raised: session.context.objections,
        competitors_mentioned: session.context.competitorsMentioned,
        products_discussed: session.context.productsDiscussed,
        interest_level: session.interestLevel >= 70 ? 'Hög' : session.interestLevel >= 40 ? 'Medel' : 'Låg',
      };

      const { error } = await this.supabase.from('call_sessions').upsert(sessionData);

      if (error) {
        console.error('[SessionManager] Error saving session to DB:', error);
      }
    } catch (error) {
      console.error('[SessionManager] Failed to save session:', error);
    }
  }

  /**
   * Save transcript segment to Supabase
   */
  private async saveSegmentToDb(sessionId: string, segment: TranscriptSegment): Promise<void> {
    try {
      const segmentData = {
        id: segment.id,
        session_id: sessionId,
        text: segment.text,
        timestamp_ms: segment.timestamp,
        speaker: segment.speaker,
        confidence: segment.confidence,
        is_final: segment.isFinal,
      };

      const { error } = await this.supabase.from('transcript_segments').insert(segmentData);

      if (error) {
        console.error('[SessionManager] Error saving segment to DB:', error);
      }
    } catch (error) {
      console.error('[SessionManager] Failed to save segment:', error);
    }
  }

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------

  /**
   * Clean up old inactive sessions
   */
  cleanupOldSessions(maxAgeMs: number = 30 * 60 * 1000): number {
    const now = Date.now();
    let removed = 0;

    for (const [id, session] of this.sessions.entries()) {
      const age = now - session.lastActivityAt.getTime();

      if (session.status === 'ended' && age > maxAgeMs) {
        this.sessions.delete(id);

        // Remove from user sessions
        const userSessionSet = this.userSessions.get(session.userId);
        if (userSessionSet) {
          userSessionSet.delete(id);
          if (userSessionSet.size === 0) {
            this.userSessions.delete(session.userId);
          }
        }

        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[SessionManager] Cleaned up ${removed} old sessions`);
    }

    return removed;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalSessions: this.sessions.size,
      activeSessions: Array.from(this.sessions.values()).filter((s) => s.status === 'active')
        .length,
      uniqueUsers: this.userSessions.size,
    };
  }
}
