/**
 * useRealtimeCoaching Hook
 *
 * React hook for real-time coaching events from Gateway.
 * Aggregates coaching tips, objections, sentiment, and silence alerts.
 */

import { useState, useCallback } from 'react';
import type { UseGatewayReturn } from './useGateway';
import { useGatewayEvent } from './useGateway';
import type {
  CoachingTip,
  ObjectionDetected,
  SentimentPayload,
  SilencePayload,
  TranscriptSegment,
} from '../lib/gateway-types';

// ============================================================================
// TYPES
// ============================================================================

export interface CoachingState {
  // Active coaching items
  tips: CoachingTip[];
  objections: ObjectionDetected[];
  sentiment: SentimentPayload | null;
  silenceAlert: SilencePayload | null;

  // Transcript
  transcript: TranscriptSegment[];

  // Stats
  totalTips: number;
  totalObjections: number;
}

export interface UseRealtimeCoachingReturn {
  // State
  state: CoachingState;

  // Actions
  dismissTip: (tipId: string) => void;
  clearTips: () => void;
  clearObjections: () => void;
  clearSilenceAlert: () => void;
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for real-time coaching events
 *
 * @example
 * ```tsx
 * const gateway = useGateway({ authToken, userId });
 * const coaching = useRealtimeCoaching(gateway, sessionId);
 *
 * // Display coaching tips
 * {coaching.state.tips.map(tip => (
 *   <CoachingTip
 *     key={tip.id}
 *     tip={tip}
 *     onDismiss={() => coaching.dismissTip(tip.id)}
 *   />
 * ))}
 *
 * // Display sentiment
 * {coaching.state.sentiment && (
 *   <SentimentIndicator sentiment={coaching.state.sentiment} />
 * )}
 * ```
 */
export function useRealtimeCoaching(
  gateway: UseGatewayReturn,
  sessionId: string | null
): UseRealtimeCoachingReturn {
  const [state, setState] = useState<CoachingState>({
    tips: [],
    objections: [],
    sentiment: null,
    silenceAlert: null,
    transcript: [],
    totalTips: 0,
    totalObjections: 0,
  });

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------

  /**
   * Handle coaching tip event
   */
  useGatewayEvent(
    gateway,
    'coaching.tip',
    useCallback(
      (payload) => {
        if (!sessionId || payload.sessionId !== sessionId) return;

        setState((prev) => ({
          ...prev,
          tips: [payload.tip, ...prev.tips].slice(0, 10), // Keep max 10
          totalTips: prev.totalTips + 1,
        }));
      },
      [sessionId]
    ),
    [sessionId]
  );

  /**
   * Handle objection detected event
   */
  useGatewayEvent(
    gateway,
    'coaching.objection',
    useCallback(
      (payload) => {
        if (!sessionId || payload.sessionId !== sessionId) return;

        setState((prev) => ({
          ...prev,
          objections: [payload.objection, ...prev.objections].slice(0, 10), // Keep max 10
          totalObjections: prev.totalObjections + 1,
        }));
      },
      [sessionId]
    ),
    [sessionId]
  );

  /**
   * Handle sentiment analysis event
   */
  useGatewayEvent(
    gateway,
    'analysis.sentiment',
    useCallback(
      (payload) => {
        if (!sessionId || payload.sessionId !== sessionId) return;

        setState((prev) => ({
          ...prev,
          sentiment: payload,
        }));
      },
      [sessionId]
    ),
    [sessionId]
  );

  /**
   * Handle silence detection event
   */
  useGatewayEvent(
    gateway,
    'analysis.silence',
    useCallback(
      (payload) => {
        if (!sessionId || payload.sessionId !== sessionId) return;

        setState((prev) => ({
          ...prev,
          silenceAlert: payload,
        }));

        // Auto-clear after 10 seconds
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            silenceAlert: prev.silenceAlert?.timestamp === payload.timestamp ? null : prev.silenceAlert,
          }));
        }, 10000);
      },
      [sessionId]
    ),
    [sessionId]
  );

  /**
   * Handle transcription event
   */
  useGatewayEvent(
    gateway,
    'transcription',
    useCallback(
      (payload) => {
        if (!sessionId || payload.sessionId !== sessionId) return;

        setState((prev) => ({
          ...prev,
          transcript: [...prev.transcript, payload.segment].slice(-50), // Keep last 50
        }));
      },
      [sessionId]
    ),
    [sessionId]
  );

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------

  /**
   * Dismiss a coaching tip
   */
  const dismissTip = useCallback(
    (tipId: string) => {
      if (!sessionId) return;

      // Remove from state
      setState((prev) => ({
        ...prev,
        tips: prev.tips.filter((tip) => tip.id !== tipId),
      }));

      // Notify Gateway
      gateway.dismissTip({ sessionId, tipId });
    },
    [gateway, sessionId]
  );

  /**
   * Clear all tips
   */
  const clearTips = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tips: [],
    }));
  }, []);

  /**
   * Clear all objections
   */
  const clearObjections = useCallback(() => {
    setState((prev) => ({
      ...prev,
      objections: [],
    }));
  }, []);

  /**
   * Clear silence alert
   */
  const clearSilenceAlert = useCallback(() => {
    setState((prev) => ({
      ...prev,
      silenceAlert: null,
    }));
  }, []);

  /**
   * Reset all coaching state
   */
  const reset = useCallback(() => {
    setState({
      tips: [],
      objections: [],
      sentiment: null,
      silenceAlert: null,
      transcript: [],
      totalTips: 0,
      totalObjections: 0,
    });
  }, []);

  // --------------------------------------------------------------------------
  // RETURN
  // --------------------------------------------------------------------------

  return {
    state,
    dismissTip,
    clearTips,
    clearObjections,
    clearSilenceAlert,
    reset,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for tracking interest level changes
 *
 * @example
 * ```tsx
 * const interestLevel = useInterestLevel(gateway, sessionId);
 * ```
 */
export function useInterestLevel(
  gateway: UseGatewayReturn,
  sessionId: string | null
): number | null {
  const [interestLevel, setInterestLevel] = useState<number | null>(null);

  useGatewayEvent(
    gateway,
    'analysis.sentiment',
    useCallback(
      (payload) => {
        if (!sessionId || payload.sessionId !== sessionId) return;
        setInterestLevel(payload.interestLevel);
      },
      [sessionId]
    ),
    [sessionId]
  );

  return interestLevel;
}

/**
 * Hook for tracking customer sentiment
 *
 * @example
 * ```tsx
 * const sentiment = useSentiment(gateway, sessionId);
 * ```
 */
export function useSentiment(
  gateway: UseGatewayReturn,
  sessionId: string | null
): 'positive' | 'neutral' | 'negative' | null {
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative' | null>(null);

  useGatewayEvent(
    gateway,
    'analysis.sentiment',
    useCallback(
      (payload) => {
        if (!sessionId || payload.sessionId !== sessionId) return;
        setSentiment(payload.sentiment);
      },
      [sessionId]
    ),
    [sessionId]
  );

  return sentiment;
}
