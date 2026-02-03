/**
 * useGateway Hook
 *
 * React hook for Gateway WebSocket connection management.
 * Provides connection state, message sending, and event listening.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GatewayClient } from '../lib/gateway-client';
import type {
  GatewayConfig,
  GatewayStats,
} from '../lib/gateway-client';
import type {
  GatewayEvent,
  GatewayEventMap,
  EventHandler,
  SessionStartPayload,
  SessionTranscriptPayload,
  SessionEndPayload,
  TipDismissPayload,
} from '../lib/gateway-types';

// ============================================================================
// HOOK CONFIG
// ============================================================================

export interface UseGatewayOptions {
  url?: string;
  authToken: string;
  userId: string;
  autoConnect?: boolean;
  debug?: boolean;
}

export interface UseGatewayReturn {
  // Connection state
  isConnected: boolean;
  isReconnecting: boolean;
  stats: GatewayStats;

  // Connection control
  connect: () => void;
  disconnect: () => void;

  // Message sending
  startSession: (payload: SessionStartPayload) => void;
  sendTranscript: (payload: SessionTranscriptPayload) => void;
  endSession: (payload: SessionEndPayload) => void;
  dismissTip: (payload: TipDismissPayload) => void;

  // Event listening
  on: <E extends GatewayEvent>(event: E, handler: EventHandler<GatewayEventMap[E]>) => void;
  off: <E extends GatewayEvent>(event: E, handler: EventHandler<GatewayEventMap[E]>) => void;

  // Client instance (for advanced usage)
  client: GatewayClient | null;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for Gateway WebSocket connection
 *
 * @example
 * ```tsx
 * const gateway = useGateway({
 *   authToken: user.authToken,
 *   userId: user.id,
 *   autoConnect: true
 * });
 *
 * useEffect(() => {
 *   gateway.on('coaching.tip', (payload) => {
 *     console.log('New tip:', payload.tip);
 *   });
 * }, [gateway.isConnected]);
 *
 * const handleStart = () => {
 *   gateway.startSession({
 *     customer: { company: 'Acme Inc' },
 *     mode: 'live_call'
 *   });
 * };
 * ```
 */
export function useGateway(options: UseGatewayOptions): UseGatewayReturn {
  const {
    url = import.meta.env.VITE_GATEWAY_URL || 'ws://localhost:3001/ws',
    authToken,
    userId,
    autoConnect = true,
    debug = import.meta.env.DEV,
  } = options;

  const clientRef = useRef<GatewayClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [stats, setStats] = useState<GatewayStats>({
    connected: false,
    reconnectAttempts: 0,
    messagesSent: 0,
    messagesReceived: 0,
  });

  // --------------------------------------------------------------------------
  // CLIENT LIFECYCLE
  // --------------------------------------------------------------------------

  /**
   * Initialize Gateway client
   */
  useEffect(() => {
    const config: GatewayConfig = {
      url,
      authToken,
      userId,
      debug,
    };

    const client = new GatewayClient(config);
    clientRef.current = client;

    // Connection state handlers
    client.on('connected', () => {
      setIsConnected(true);
      setIsReconnecting(false);
      setStats(client.getStats());
    });

    client.on('disconnect', () => {
      setIsConnected(false);
      setStats(client.getStats());
    });

    client.on('reconnecting', () => {
      setIsReconnecting(true);
      setStats(client.getStats());
    });

    client.on('reconnected', () => {
      setIsReconnecting(false);
      setStats(client.getStats());
    });

    // Auto-connect
    if (autoConnect) {
      client.connect();
    }

    // Cleanup on unmount
    return () => {
      client.disconnect();
    };
  }, [url, authToken, userId, autoConnect, debug]);

  // --------------------------------------------------------------------------
  // CONNECTION CONTROL
  // --------------------------------------------------------------------------

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  // --------------------------------------------------------------------------
  // MESSAGE SENDING
  // --------------------------------------------------------------------------

  const startSession = useCallback((payload: SessionStartPayload) => {
    clientRef.current?.startSession(payload);
  }, []);

  const sendTranscript = useCallback((payload: SessionTranscriptPayload) => {
    clientRef.current?.sendTranscript(payload);
  }, []);

  const endSession = useCallback((payload: SessionEndPayload) => {
    clientRef.current?.endSession(payload);
  }, []);

  const dismissTip = useCallback((payload: TipDismissPayload) => {
    clientRef.current?.dismissTip(payload);
  }, []);

  // --------------------------------------------------------------------------
  // EVENT LISTENING
  // --------------------------------------------------------------------------

  const on = useCallback(
    <E extends GatewayEvent>(event: E, handler: EventHandler<GatewayEventMap[E]>) => {
      clientRef.current?.on(event, handler);
    },
    []
  );

  const off = useCallback(
    <E extends GatewayEvent>(event: E, handler: EventHandler<GatewayEventMap[E]>) => {
      clientRef.current?.off(event, handler);
    },
    []
  );

  // --------------------------------------------------------------------------
  // RETURN
  // --------------------------------------------------------------------------

  return {
    isConnected,
    isReconnecting,
    stats,
    connect,
    disconnect,
    startSession,
    sendTranscript,
    endSession,
    dismissTip,
    on,
    off,
    client: clientRef.current,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for listening to specific Gateway event
 *
 * @example
 * ```tsx
 * useGatewayEvent(gateway, 'coaching.tip', (payload) => {
 *   setTips(prev => [payload.tip, ...prev]);
 * });
 * ```
 */
export function useGatewayEvent<E extends GatewayEvent>(
  gateway: UseGatewayReturn,
  event: E,
  handler: EventHandler<GatewayEventMap[E]>,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    if (!gateway.isConnected) return;

    gateway.on(event, handler);

    return () => {
      gateway.off(event, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway.isConnected, event, ...deps]);
}
