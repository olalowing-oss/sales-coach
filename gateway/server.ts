/**
 * Sales Coach Gateway Server
 *
 * WebSocket server for real-time coaching events.
 * Inspired by OpenClaw's Gateway architecture.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { randomUUID } from 'crypto';
import type {
  ClientMessage,
  ServerMessage,
  ConnectMessage,
  SessionStartMessage,
  SessionTranscriptMessage,
  SessionEndMessage,
  TipDismissMessage,
  GatewayConfig,
  ConnectionInfo,
  ErrorCode,
} from './protocol.js';
import { ErrorCodes } from './protocol.js';
import { verifyAuthToken, checkRateLimit, cleanupRateLimits } from './middleware/auth.js';
import { SessionManager } from './session-manager.js';
import { CoachingEngine } from './coaching-engine.js';

// ============================================================================
// TYPES
// ============================================================================

interface ActiveConnection extends ConnectionInfo {
  ws: WebSocket;
}

// ============================================================================
// GATEWAY SERVER
// ============================================================================

export class GatewayServer {
  private wss: WebSocketServer;
  private connections: Map<string, ActiveConnection> = new Map();
  private userConnections: Map<string, Set<string>> = new Map();
  private sessionManager: SessionManager;
  private coachingEngine: CoachingEngine;
  private config: Required<GatewayConfig>;

  constructor(httpServer: HTTPServer, config: GatewayConfig = {}) {
    this.config = {
      authToken: config.authToken || process.env.GATEWAY_AUTH_TOKEN || 'dev-token-123',
      maxConnectionsPerUser: config.maxConnectionsPerUser || 5,
      messageRateLimit: config.messageRateLimit || 50,
      sessionTimeout: config.sessionTimeout || 30 * 60 * 1000, // 30 minutes
      compactionInterval: config.compactionInterval || 10,
      compactionKeepRecent: config.compactionKeepRecent || 20,
    };

    // Initialize SessionManager
    this.sessionManager = new SessionManager();

    // Initialize CoachingEngine
    this.coachingEngine = new CoachingEngine({
      openaiApiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '',
      supabaseUrl: process.env.VITE_SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    });

    // Create WebSocket server
    this.wss = new WebSocketServer({
      server: httpServer,
      path: '/ws',
    });

    this.setupServer();
    this.startCleanupInterval();

    console.log('[Gateway] WebSocket server initialized on /ws');
  }

  // --------------------------------------------------------------------------
  // SERVER SETUP
  // --------------------------------------------------------------------------

  private setupServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const connectionId = randomUUID();
      let isAuthenticated = false;
      let userId: string | null = null;
      let authTimeout: NodeJS.Timeout;

      console.log(`[Gateway] New connection: ${connectionId}`);

      // Set auth timeout (5 seconds to send connect message)
      authTimeout = setTimeout(() => {
        if (!isAuthenticated) {
          this.sendError(ws, ErrorCodes.AUTH_REQUIRED, 'Authentication required within 5 seconds');
          ws.close(4001, 'Authentication timeout');
        }
      }, 5000);

      // Handle incoming messages
      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as ClientMessage;

          // First message MUST be connect
          if (!isAuthenticated) {
            if (message.type === 'connect') {
              clearTimeout(authTimeout);
              const result = await this.handleConnect(ws, connectionId, message as ConnectMessage);
              isAuthenticated = result.success;
              userId = result.userId || null;

              if (!isAuthenticated) {
                ws.close(4003, 'Authentication failed');
              }
            } else {
              this.sendError(ws, ErrorCodes.AUTH_REQUIRED, 'First message must be connect');
              ws.close(4002, 'Protocol violation');
            }
            return;
          }

          // Check rate limit
          if (userId && !checkRateLimit(userId, this.config.messageRateLimit)) {
            this.sendError(ws, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded');
            return;
          }

          // Route authenticated messages
          await this.handleMessage(connectionId, userId!, message);

        } catch (error) {
          console.error(`[Gateway] Message parse error:`, error);
          this.sendError(ws, ErrorCodes.INVALID_MESSAGE, 'Invalid message format');
        }
      });

      // Handle close
      ws.on('close', () => {
        clearTimeout(authTimeout);
        this.handleDisconnect(connectionId);
      });

      // Handle error
      ws.on('error', (error) => {
        console.error(`[Gateway] WebSocket error for ${connectionId}:`, error);
      });
    });
  }

  // --------------------------------------------------------------------------
  // CONNECTION HANDLER
  // --------------------------------------------------------------------------

  private async handleConnect(
    ws: WebSocket,
    connectionId: string,
    message: ConnectMessage
  ): Promise<{ success: boolean; userId?: string }> {
    const { userId, authToken, device } = message.payload;

    // Verify authentication
    const authResult = await verifyAuthToken(authToken);
    if (!authResult.success) {
      this.sendError(ws, ErrorCodes.AUTH_FAILED, authResult.error || 'Authentication failed');
      return { success: false };
    }

    const authenticatedUserId = authResult.userId || userId;

    // Check max connections per user
    const userConns = this.userConnections.get(authenticatedUserId) || new Set();
    if (userConns.size >= this.config.maxConnectionsPerUser) {
      this.sendError(
        ws,
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        `Maximum ${this.config.maxConnectionsPerUser} connections per user`
      );
      return { success: false };
    }

    // Create connection record
    const connection: ActiveConnection = {
      id: connectionId,
      userId: authenticatedUserId,
      connectedAt: new Date(),
      lastActivity: new Date(),
      device,
      ws,
    };

    this.connections.set(connectionId, connection);

    if (!this.userConnections.has(authenticatedUserId)) {
      this.userConnections.set(authenticatedUserId, new Set());
    }
    this.userConnections.get(authenticatedUserId)!.add(connectionId);

    // Send connected message
    this.sendMessage(ws, {
      type: 'connected',
      payload: {
        connectionId,
        timestamp: Date.now(),
        serverVersion: '1.0.0',
      },
    });

    console.log(`[Gateway] User authenticated: ${authenticatedUserId} (${connectionId})`);
    return { success: true, userId: authenticatedUserId };
  }

  // --------------------------------------------------------------------------
  // MESSAGE ROUTER
  // --------------------------------------------------------------------------

  private async handleMessage(
    connectionId: string,
    userId: string,
    message: ClientMessage
  ): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.lastActivity = new Date();

    try {
      switch (message.type) {
        case 'session.start':
          await this.handleSessionStart(connection, message as SessionStartMessage);
          break;

        case 'session.transcript':
          await this.handleSessionTranscript(connection, message as SessionTranscriptMessage);
          break;

        case 'session.end':
          await this.handleSessionEnd(connection, message as SessionEndMessage);
          break;

        case 'tip.dismiss':
          await this.handleTipDismiss(connection, message as TipDismissMessage);
          break;

        default:
          this.sendError(
            connection.ws,
            ErrorCodes.INVALID_MESSAGE,
            `Unknown message type: ${message.type}`
          );
      }
    } catch (error) {
      console.error(`[Gateway] Error handling message:`, error);
      this.sendError(
        connection.ws,
        ErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Internal server error'
      );
    }
  }

  // --------------------------------------------------------------------------
  // SESSION HANDLERS
  // --------------------------------------------------------------------------

  private async handleSessionStart(
    connection: ActiveConnection,
    message: SessionStartMessage
  ): Promise<void> {
    const { customer, mode, scenarioId, productId } = message.payload;

    // Create session via SessionManager
    const session = this.sessionManager.createSession({
      userId: connection.userId,
      mode,
      customerCompany: customer?.company,
      customerName: customer?.name,
      customerRole: customer?.role,
      scenarioId,
      productId,
    });

    connection.activeSessionId = session.id;

    console.log(`[Gateway] Session started: ${session.id} (mode: ${mode})`);

    // Send session.started event
    this.sendMessage(connection.ws, {
      type: 'session.started',
      payload: {
        sessionId: session.id,
        status: 'recording',
        startedAt: session.startedAt.toISOString(),
        mode,
      },
    });
  }

  private async handleSessionTranscript(
    connection: ActiveConnection,
    message: SessionTranscriptMessage
  ): Promise<void> {
    const { sessionId, text, isFinal, speaker, confidence } = message.payload;

    // Add segment to session manager
    const segment = await this.sessionManager.addSegment(
      sessionId,
      text,
      speaker,
      isFinal,
      confidence
    );

    console.log(`[Gateway] Transcript: [${speaker}] ${text.substring(0, 50)}...`);

    // Send transcription event
    this.sendMessage(connection.ws, {
      type: 'transcription',
      payload: {
        sessionId,
        segment: {
          id: segment.id,
          text: segment.text,
          speaker: segment.speaker,
          timestamp: segment.timestamp,
          confidence: segment.confidence,
          isFinal: segment.isFinal,
        },
      },
    });

    // Real-time coaching analysis (Phase 3)
    if (isFinal) {
      await this.analyzeAndCoach(connection, sessionId, text, speaker);
    }
  }

  /**
   * Analyze transcript and stream coaching events
   */
  private async analyzeAndCoach(
    connection: ActiveConnection,
    sessionId: string,
    text: string,
    speaker: 'seller' | 'customer' | 'unknown'
  ): Promise<void> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) return;

    try {
      // 1. Trigger detection → Coaching tips
      const tips = await this.coachingEngine.detectTriggersAndGenerateTips(text, speaker, session);
      for (const tip of tips) {
        this.sendMessage(connection.ws, {
          type: 'coaching.tip',
          payload: { sessionId, tip },
        });

        // Update session context
        if (tip.type === 'objection') {
          this.sessionManager.addObjection(sessionId, tip.title);
        }
      }

      // 2. Objection detection → Structured objection event
      // Analyze customer and unknown speakers (no speaker diarization yet)
      if (speaker !== 'seller') {
        const objection = this.coachingEngine.detectObjection(text);
        if (objection) {
          this.sendMessage(connection.ws, {
            type: 'coaching.objection',
            payload: { sessionId, objection },
          });

          this.sessionManager.addObjection(sessionId, objection.type);
        }
      }

      // 3. Sentiment analysis (async, throttled)
      // Analyze customer and unknown speakers (no speaker diarization yet)
      if (speaker !== 'seller') {
        const conversationHistory = this.sessionManager.getConversationHistory(sessionId, 10);
        const sentiment = await this.coachingEngine.analyzeSentiment(
          sessionId,
          text,
          conversationHistory
        );

        if (sentiment) {
          this.sendMessage(connection.ws, {
            type: 'analysis.sentiment',
            payload: {
              sessionId,
              sentiment: sentiment.sentiment,
              interestLevel: sentiment.interestLevel,
              confidence: sentiment.confidence,
              timestamp: Date.now(),
            },
          });

          // Update session metrics
          this.sessionManager.updateInterestLevel(sessionId, sentiment.interestLevel);
          this.sessionManager.updateSentiment(sessionId, sentiment.sentiment);
        }
      }

      // 4. Extract pain points & buying signals
      const painPoints = this.coachingEngine.extractPainPoints(text);
      for (const painPoint of painPoints) {
        this.sessionManager.addPainPoint(sessionId, painPoint);
      }

      const buyingSignals = this.coachingEngine.detectBuyingSignals(text);
      for (const signal of buyingSignals) {
        this.sessionManager.addBuyingSignal(sessionId, signal);

        // Send tip for buying signal
        this.sendMessage(connection.ws, {
          type: 'coaching.tip',
          payload: {
            sessionId,
            tip: {
              id: randomUUID(),
              type: 'suggestion',
              priority: 'high',
              trigger: 'buying_signal',
              title: 'Köpsignal detekterad!',
              content: signal,
              talkingPoints: [
                'Föreslå nästa konkreta steg',
                'Fråga om beslutsprocess',
                'Boka uppföljningsmöte',
              ],
              timestamp: Date.now(),
            },
          },
        });
      }
    } catch (error) {
      console.error('[Gateway] Coaching analysis error:', error);
    }
  }

  private async handleSessionEnd(
    connection: ActiveConnection,
    message: SessionEndMessage
  ): Promise<void> {
    const { sessionId } = message.payload;

    // End session via SessionManager
    const summary = await this.sessionManager.endSession(sessionId);

    console.log(`[Gateway] Session ended: ${sessionId}`);

    connection.activeSessionId = undefined;

    // Send session.ended event
    this.sendMessage(connection.ws, {
      type: 'session.ended',
      payload: {
        sessionId,
        summary,
        timestamp: Date.now(),
      },
    });
  }

  private async handleTipDismiss(
    connection: ActiveConnection,
    message: TipDismissMessage
  ): Promise<void> {
    const { sessionId, tipId } = message.payload;

    // TODO: Phase 2 - Mark tip as dismissed in session state

    console.log(`[Gateway] Tip dismissed: ${tipId} in session ${sessionId}`);
  }

  // --------------------------------------------------------------------------
  // DISCONNECT HANDLER
  // --------------------------------------------------------------------------

  private handleDisconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from user connections
    const userConns = this.userConnections.get(connection.userId);
    if (userConns) {
      userConns.delete(connectionId);
      if (userConns.size === 0) {
        this.userConnections.delete(connection.userId);
      }
    }

    this.connections.delete(connectionId);

    console.log(`[Gateway] Connection closed: ${connectionId}`);
  }

  // --------------------------------------------------------------------------
  // HELPER METHODS
  // --------------------------------------------------------------------------

  private sendMessage(ws: WebSocket, message: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, code: ErrorCode, message: string, details?: any): void {
    this.sendMessage(ws, {
      type: 'error',
      payload: {
        code,
        message,
        details,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Broadcast message to all connections for a user
   */
  public broadcastToUser(userId: string, message: ServerMessage): void {
    const connectionIds = this.userConnections.get(userId);
    if (!connectionIds) return;

    for (const connId of connectionIds) {
      const conn = this.connections.get(connId);
      if (conn) {
        this.sendMessage(conn.ws, message);
      }
    }
  }

  /**
   * Send message to specific session
   */
  public sendToSession(sessionId: string, message: ServerMessage): void {
    for (const conn of this.connections.values()) {
      if (conn.activeSessionId === sessionId) {
        this.sendMessage(conn.ws, message);
      }
    }
  }

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------

  private startCleanupInterval(): void {
    // Clean up rate limits every minute
    setInterval(() => {
      cleanupRateLimits();
    }, 60 * 1000);

    // Clean up stale sessions every 5 minutes
    setInterval(() => {
      this.sessionManager.cleanupOldSessions(this.config.sessionTimeout);
    }, 5 * 60 * 1000);

    // Silence detection - check every 10 seconds
    setInterval(() => {
      this.checkForSilence();
    }, 10 * 1000);
  }

  /**
   * Check all active sessions for silence (>20s since last activity)
   */
  private checkForSilence(): void {
    const now = Date.now();

    for (const conn of this.connections.values()) {
      if (!conn.activeSessionId) continue;

      const session = this.sessionManager.getSession(conn.activeSessionId);
      if (!session || session.status !== 'active') continue;

      const silenceDuration = Math.floor((now - session.lastActivityAt.getTime()) / 1000);

      // Send silence event for >20 seconds
      if (silenceDuration >= 20 && silenceDuration < 25) {
        const suggestion = this.coachingEngine.generateSilenceSuggestion(silenceDuration);

        this.sendMessage(conn.ws, {
          type: 'analysis.silence',
          payload: {
            sessionId: conn.activeSessionId,
            duration: silenceDuration,
            suggestion: suggestion.suggestion,
            examples: suggestion.examples,
            timestamp: now,
          },
        });
      }
    }
  }

  /**
   * Close all connections and shut down server
   */
  public async close(): Promise<void> {
    console.log('[Gateway] Shutting down...');

    for (const conn of this.connections.values()) {
      conn.ws.close(1001, 'Server shutting down');
    }

    this.wss.close();
    console.log('[Gateway] Server closed');
  }

  // --------------------------------------------------------------------------
  // STATS
  // --------------------------------------------------------------------------

  public getStats() {
    const sessionStats = this.sessionManager.getStats();
    return {
      totalConnections: this.connections.size,
      uniqueUsers: this.userConnections.size,
      activeSessions: sessionStats.activeSessions,
      totalSessions: sessionStats.totalSessions,
    };
  }
}
