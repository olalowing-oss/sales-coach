/**
 * Gateway WebSocket Client SDK
 *
 * Type-safe WebSocket client for Sales Coach Gateway.
 * Supports auto-reconnection, event streaming, and message queueing.
 */

import type {
  ClientMessage,
  ServerMessage,
  GatewayEvent,
  GatewayEventMap,
  EventHandler,
  ConnectPayload,
  SessionStartPayload,
  SessionTranscriptPayload,
  SessionEndPayload,
  TipDismissPayload,
} from './gateway-types';

// ============================================================================
// TYPES
// ============================================================================

export interface GatewayConfig {
  url: string;
  authToken: string;
  userId: string;
  reconnectInterval?: number; // ms
  maxReconnectAttempts?: number;
  debug?: boolean;
}

export interface GatewayStats {
  connected: boolean;
  reconnectAttempts: number;
  messagesSent: number;
  messagesReceived: number;
  lastError?: string;
}

// ============================================================================
// GATEWAY CLIENT
// ============================================================================

export class GatewayClient {
  private config: Required<GatewayConfig>;
  private ws: WebSocket | null = null;
  private eventHandlers: Map<GatewayEvent, Set<EventHandler>> = new Map();
  private messageQueue: ClientMessage[] = [];
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private stats: GatewayStats = {
    connected: false,
    reconnectAttempts: 0,
    messagesSent: 0,
    messagesReceived: 0,
  };

  constructor(config: GatewayConfig) {
    this.config = {
      url: config.url,
      authToken: config.authToken,
      userId: config.userId,
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      debug: config.debug || false,
    };
  }

  // --------------------------------------------------------------------------
  // CONNECTION MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Connect to Gateway
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.log('Already connected');
      return;
    }

    this.log(`Connecting to ${this.config.url}...`);

    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        this.log('WebSocket connected');
        this.stats.connected = true;
        this.reconnectAttempts = 0;

        // Send connect message
        this.sendConnect();

        // Process queued messages
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as ServerMessage;
          this.handleMessage(message);
        } catch (error) {
          this.error('Failed to parse message:', error);
        }
      };

      this.ws.onerror = (event) => {
        this.error('WebSocket error:', event);
        this.stats.lastError = 'Connection error';
      };

      this.ws.onclose = (event) => {
        this.log(`WebSocket closed: ${event.code} ${event.reason}`);
        this.stats.connected = false;
        this.ws = null;

        // Emit disconnect event
        this.emit('disconnect', undefined);

        // Auto-reconnect if not intentional close
        if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      this.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from Gateway
   */
  disconnect(): void {
    this.log('Disconnecting...');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.stats.connected = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    this.stats.reconnectAttempts = this.reconnectAttempts;

    this.log(`Reconnecting in ${this.config.reconnectInterval}ms (attempt ${this.reconnectAttempts})...`);

    // Emit reconnecting event
    this.emit('reconnecting', undefined);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.config.reconnectInterval);
  }

  /**
   * Send connect message
   */
  private sendConnect(): void {
    const payload: ConnectPayload = {
      userId: this.config.userId,
      authToken: this.config.authToken,
      device: {
        name: navigator.userAgent,
        type: 'desktop', // TODO: Detect mobile/tablet
      },
    };

    this.send({ type: 'connect', payload });
  }

  // --------------------------------------------------------------------------
  // MESSAGE HANDLING
  // --------------------------------------------------------------------------

  /**
   * Send message to Gateway
   */
  send(message: ClientMessage): void {
    // Queue message if not connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log('Queuing message (not connected):', message.type);
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
      this.stats.messagesSent++;
      this.log('Sent:', message.type);
    } catch (error) {
      this.error('Failed to send message:', error);
      this.messageQueue.push(message);
    }
  }

  /**
   * Process queued messages
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    this.log(`Flushing ${this.messageQueue.length} queued messages...`);

    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of queue) {
      this.send(message);
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: ServerMessage): void {
    this.stats.messagesReceived++;
    this.log('Received:', message.type);

    // Emit type-specific event
    this.emit(message.type as GatewayEvent, message.payload);

    // Special handling for reconnected
    if (message.type === 'connected' && this.reconnectAttempts > 0) {
      this.emit('reconnected', undefined);
    }
  }

  // --------------------------------------------------------------------------
  // EVENT EMITTER
  // --------------------------------------------------------------------------

  /**
   * Register event handler
   */
  on<E extends GatewayEvent>(event: E, handler: EventHandler<GatewayEventMap[E]>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Unregister event handler
   */
  off<E extends GatewayEvent>(event: E, handler: EventHandler<GatewayEventMap[E]>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event to all registered handlers
   */
  private emit<E extends GatewayEvent>(event: E, payload: GatewayEventMap[E]): void {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        handler(payload);
      } catch (error) {
        this.error(`Error in ${event} handler:`, error);
      }
    }
  }

  // --------------------------------------------------------------------------
  // CONVENIENCE METHODS
  // --------------------------------------------------------------------------

  /**
   * Start a new session
   */
  startSession(payload: SessionStartPayload): void {
    this.send({ type: 'session.start', payload });
  }

  /**
   * Send transcript segment
   */
  sendTranscript(payload: SessionTranscriptPayload): void {
    this.send({ type: 'session.transcript', payload });
  }

  /**
   * End session
   */
  endSession(payload: SessionEndPayload): void {
    this.send({ type: 'session.end', payload });
  }

  /**
   * Dismiss coaching tip
   */
  dismissTip(payload: TipDismissPayload): void {
    this.send({ type: 'tip.dismiss', payload });
  }

  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.stats.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get client stats
   */
  getStats(): GatewayStats {
    return { ...this.stats };
  }

  // --------------------------------------------------------------------------
  // LOGGING
  // --------------------------------------------------------------------------

  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[GatewayClient]', ...args);
    }
  }

  private error(...args: any[]): void {
    console.error('[GatewayClient]', ...args);
  }
}

// ============================================================================
// SINGLETON INSTANCE (optional)
// ============================================================================

let instance: GatewayClient | null = null;

/**
 * Get or create singleton Gateway client
 */
export function getGatewayClient(config?: GatewayConfig): GatewayClient {
  if (!instance && config) {
    instance = new GatewayClient(config);
  }

  if (!instance) {
    throw new Error('GatewayClient not initialized. Call with config first.');
  }

  return instance;
}

/**
 * Reset singleton (for testing)
 */
export function resetGatewayClient(): void {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}
