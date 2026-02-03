import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  CallSession,
  CoachingTip,
  TranscriptSegment,
  SessionStatus,
  CustomerInfo,
  CallAnalysis
} from '../types';
import { generateCoachingTips, CoachingData } from '../utils/triggers';
import { useCoachingStore } from './coachingStore';
import {
  saveSessionToDb,
  saveSegmentToDb,
  saveTipToDb,
  saveSessionAnalysisToDb
} from '../lib/supabaseOperations';
import { updateAnalysisWithNewText } from '../utils/analysisExtractor';
import { analyzeTranscriptWithAI, isAIAnalysisAvailable } from '../utils/aiAnalyzer';
import { GatewayClient } from '../lib/gateway-client';
import { supabase } from '../lib/supabase';

interface SessionState {
  // Session state
  session: CallSession | null;
  status: SessionStatus;

  // Transkription
  segments: TranscriptSegment[];
  interimText: string;

  // Coaching
  coachingTips: CoachingTip[];
  dismissedTipIds: string[];

  // Context för AI
  conversationContext: string[];

  // Live analysis
  liveAnalysis: Partial<CallAnalysis>;

  // Gateway WebSocket
  gatewayClient: GatewayClient | null;
  isGatewayEnabled: boolean;
  isGatewayConnected: boolean;

  // User's active product (loaded from user_products)
  userProductId: string | null;

  // Speaker tracking
  currentSpeaker: 'seller' | 'customer';

  // Actions
  startSession: (customer?: CustomerInfo) => void;
  stopSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;

  // Speaker control
  setCurrentSpeaker: (speaker: 'seller' | 'customer') => void;

  // Transkription
  addInterimTranscript: (text: string) => void;
  addFinalTranscript: (text: string, confidence: number, speaker?: 'seller' | 'customer') => void;
  clearTranscript: () => void;

  // Coaching
  processTranscriptForCoaching: (text: string) => void;
  addCoachingTip: (tip: Omit<CoachingTip, 'id' | 'timestamp' | 'dismissed'>) => void;
  dismissTip: (tipId: string) => void;
  clearAllTips: () => void;

  // Analysis
  updateLiveAnalysis: (analysis: Partial<CallAnalysis>) => void;

  // Gateway
  initGateway: (authToken: string, userId: string) => void;
  disconnectGateway: () => void;

  // Export
  getSessionSummary: () => string;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  session: null,
  status: 'idle',
  segments: [],
  interimText: '',
  coachingTips: [],
  dismissedTipIds: [],
  conversationContext: [],
  liveAnalysis: { probability: 50, isAnalyzed: false },
  gatewayClient: null,
  isGatewayEnabled: false,
  isGatewayConnected: false,
  userProductId: null,
  currentSpeaker: 'customer', // Default to customer (most common for coaching)

  // === SESSION ACTIONS ===

  startSession: (customer?: CustomerInfo) => {
    const sessionId = uuidv4();
    const now = new Date();

    const newSession: CallSession = {
      id: sessionId,
      status: 'recording',
      startedAt: now,
      customer,
      transcript: {
        segments: [],
        fullText: '',
        duration: 0
      },
      coachingTips: [],
      analytics: {
        totalDuration: 0,
        talkRatio: { seller: 50, customer: 50 },
        topicsDiscussed: [],
        objectionsHandled: [],
        offersPresented: []
      }
    };

    set({
      session: newSession,
      status: 'recording',
      segments: [],
      interimText: '',
      coachingTips: [],
      dismissedTipIds: [],
      conversationContext: [],
      liveAnalysis: { probability: 50, isAnalyzed: false }
    });

    // If Gateway is connected, start session via Gateway
    const { gatewayClient, isGatewayConnected, userProductId } = get();
    if (isGatewayConnected && gatewayClient) {
      gatewayClient.startSession({
        customer: customer ? {
          company: customer.company || '',
          name: customer.name,
          role: customer.role
        } : undefined,
        mode: 'live_call',
        productId: userProductId || undefined
      });
    } else {
      // Fallback: Spara sessionen till databasen direkt
      saveSessionToDb(newSession).catch(err =>
        console.error('Failed to save initial session to DB:', err)
      );
    }
  },

  stopSession: () => {
    const { session, segments, liveAnalysis, gatewayClient, isGatewayConnected } = get();
    if (!session) return;

    const updatedSession: CallSession = {
      ...session,
      status: 'stopped',
      endedAt: new Date(),
      transcript: {
        ...session.transcript,
        segments,
        fullText: segments.map(s => s.text).join(' '),
        duration: (Date.now() - session.startedAt.getTime()) / 1000
      }
    };

    set({
      status: 'stopped',
      session: updatedSession
    });

    // End Gateway session if connected
    if (isGatewayConnected && gatewayClient) {
      gatewayClient.endSession({ sessionId: session.id });
    } else {
      // Fallback: Spara session till databas (asynkront, blockerar inte UI)
      saveSessionToDb(updatedSession).catch(err =>
        console.error('Failed to save session to DB:', err)
      );

      // Spara live-analysen till databasen om det finns någon data
      const hasAnalysisData =
        liveAnalysis.industry ||
        liveAnalysis.companySize ||
        liveAnalysis.callPurpose ||
        liveAnalysis.callOutcome ||
        (liveAnalysis.productsDiscussed && liveAnalysis.productsDiscussed.length > 0);

      if (hasAnalysisData) {
        saveSessionAnalysisToDb(session.id, {
          ...liveAnalysis,
          isAnalyzed: true,
          analyzedAt: new Date()
        }).catch(err =>
          console.error('Failed to save analysis to DB:', err)
        );
      }
    }
  },

  pauseSession: () => {
    set({ status: 'paused' });
  },

  resumeSession: () => {
    set({ status: 'recording' });
  },

  setCurrentSpeaker: (speaker: 'seller' | 'customer') => {
    set({ currentSpeaker: speaker });
    console.log(`🎤 Speaker changed to: ${speaker}`);
  },

  // === TRANSKRIPTION ===

  addInterimTranscript: (text: string) => {
    set({ interimText: text });
  },

  addFinalTranscript: (text: string, confidence: number, speaker?: 'seller' | 'customer') => {
    const { segments, session, liveAnalysis, gatewayClient, isGatewayConnected, currentSpeaker } = get();

    // Use speaker from diarization if available, otherwise fallback to currentSpeaker
    const finalSpeaker = speaker || currentSpeaker;

    const newSegment: TranscriptSegment = {
      id: uuidv4(),
      text: text.trim(),
      timestamp: session ? Date.now() - session.startedAt.getTime() : Date.now(),
      speaker: finalSpeaker, // Use speaker from diarization or fallback to manual state
      confidence,
      isFinal: true
    };

    set({
      segments: [...segments, newSegment],
      interimText: ''
    });

    // Send to Gateway if connected
    if (isGatewayConnected && gatewayClient && session?.id) {
      gatewayClient.sendTranscript({
        sessionId: session.id,
        text: text.trim(),
        isFinal: true,
        speaker: finalSpeaker, // Use speaker from diarization or fallback
        confidence
      });
    } else {
      // Fallback: Save segment to database and run local coaching
      if (session?.id) {
        saveSegmentToDb(session.id, newSegment).catch(err =>
          console.error('Failed to save segment to DB:', err)
        );
      }

      // Trigga coaching-analys (only if not using Gateway)
      get().processTranscriptForCoaching(text);
    }

    // Uppdatera live-analys baserat på ny text
    // Använd AI om tillgängligt, annars fallback till pattern matching
    const updatedSegments = get().segments;
    const fullText = updatedSegments.map(s => s.text).join(' ');

    if (isAIAnalysisAvailable()) {
      // AI-baserad analys (asynkron) - kör i bakgrunden
      analyzeTranscriptWithAI(fullText, liveAnalysis)
        .then(aiAnalysis => {
          if (Object.keys(aiAnalysis).length > 0) {
            console.log('🤖 AI Analysis applied:', aiAnalysis);

            // Uppdatera live-analys
            set({ liveAnalysis: { ...get().liveAnalysis, ...aiAnalysis } });

            // Om AI identifierade ett företagsnamn, uppdatera session customer info
            const companyName = (aiAnalysis as any).companyName;
            if (companyName && session) {
              const updatedSession = {
                ...session,
                customer: {
                  name: session.customer?.name || '',
                  company: companyName,
                  role: session.customer?.role
                }
              };
              set({ session: updatedSession });

              // Uppdatera också i databasen
              saveSessionToDb(updatedSession).catch(err =>
                console.error('Failed to update session with company name:', err)
              );
            }
          }
        })
        .catch(error => {
          console.error('❌ AI analysis failed, using pattern matching:', error);
          const patternAnalysis = updateAnalysisWithNewText(get().liveAnalysis, text);
          set({ liveAnalysis: patternAnalysis });
        });
    } else {
      // Fallback: Pattern matching (synkron)
      console.log('📋 Using pattern matching (AI not configured)');
      const updatedAnalysis = updateAnalysisWithNewText(liveAnalysis, text);
      set({ liveAnalysis: updatedAnalysis });
    }
  },

  clearTranscript: () => {
    set({ segments: [], interimText: '' });
  },

  // === COACHING ===

  processTranscriptForCoaching: (text: string) => {
    const { dismissedTipIds, coachingTips, conversationContext, session } = get();

    // Hämta coachning-data från store
    const coachingStore = useCoachingStore.getState();
    const coachingData: CoachingData = {
      triggerPatterns: coachingStore.triggerPatterns,
      battlecards: coachingStore.battlecards,
      objectionHandlers: coachingStore.objectionHandlers,
      caseStudies: coachingStore.caseStudies
    };

    // Generera nya tips baserat på texten
    const existingIds = [...coachingTips.map(t => t.id), ...dismissedTipIds];
    const newTips = generateCoachingTips(text, existingIds, coachingData);

    if (newTips.length > 0) {
      // Lägg till nya tips, behåll max 5 aktiva
      const updatedTips = [...newTips, ...coachingTips]
        .filter(t => !t.dismissed)
        .slice(0, 5);

      set({
        coachingTips: updatedTips,
        // Uppdatera konversationskontext (behåll senaste 10)
        conversationContext: [...conversationContext, text].slice(-10)
      });

      // Spara nya tips till databas
      if (session?.id) {
        newTips.forEach(tip => {
          saveTipToDb(session.id, tip).catch(err =>
            console.error('Failed to save tip to DB:', err)
          );
        });
      }
    }
  },

  addCoachingTip: (tipData) => {
    const tip: CoachingTip = {
      ...tipData,
      id: uuidv4(),
      timestamp: Date.now(),
      dismissed: false
    };
    
    set(state => ({
      coachingTips: [tip, ...state.coachingTips].slice(0, 5)
    }));
  },

  dismissTip: (tipId: string) => {
    const { session, gatewayClient, isGatewayConnected } = get();

    set(state => ({
      coachingTips: state.coachingTips.filter(t => t.id !== tipId),
      dismissedTipIds: [...state.dismissedTipIds, tipId]
    }));

    // Notify Gateway if connected
    if (isGatewayConnected && gatewayClient && session?.id) {
      gatewayClient.dismissTip({
        sessionId: session.id,
        tipId
      });
    }
  },

  clearAllTips: () => {
    set({ coachingTips: [] });
  },

  // === ANALYSIS ===

  updateLiveAnalysis: (analysis: Partial<CallAnalysis>) => {
    set({ liveAnalysis: analysis });
  },

  // === GATEWAY ===

  initGateway: async (authToken: string, userId: string) => {
    const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || 'ws://localhost:3001/ws';

    // Load user's active product
    let userProductId: string | null = null;
    try {
      // Query products table to get user's first product
      const { data, error } = await (supabase as any)
        .from('products')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        userProductId = data.id;
        console.log('✅ Loaded user product:', userProductId);
      } else {
        console.log('ℹ️ No product found for user');
      }
    } catch (err) {
      console.error('Failed to load user product:', err);
    }

    set({ userProductId });

    // Reload coaching data with the detected product
    if (userProductId) {
      console.log('🔄 Reloading coaching data for product:', userProductId);
      const { useCoachingStore } = await import('./coachingStore');
      await useCoachingStore.getState().initializeFromDb();
    }

    // Gateway is not yet deployed - disable for now
    // TODO: Enable when gateway server is running
    const GATEWAY_ENABLED = false;

    let client: GatewayClient | null = null;

    if (GATEWAY_ENABLED) {
      client = new GatewayClient({
        url: gatewayUrl,
        authToken,
        userId,
        debug: import.meta.env.DEV,
      });

      // Setup event handlers
      client.on('connected', () => {
        console.log('✅ Gateway connected');
        set({ isGatewayConnected: true });
      });

      client.on('disconnect', () => {
        console.log('🔌 Gateway disconnected');
        set({ isGatewayConnected: false });
      });

      client.on('session.started', (payload) => {
      console.log('📝 Gateway session started:', payload.sessionId);
      const { session } = get();
      if (session) {
        // Update session with Gateway session ID
        set({
          session: {
            ...session,
            id: payload.sessionId,
          }
        });
      }
    });

    client.on('transcription', (payload) => {
      const segment = payload.segment;
      console.log(`[${segment.speaker}] ${segment.text}`);

      // Add segment to store
      set(state => ({
        segments: [...state.segments, {
          id: segment.id,
          text: segment.text,
          timestamp: segment.timestamp,
          speaker: segment.speaker,
          confidence: segment.confidence,
          isFinal: segment.isFinal
        }]
      }));
    });

    client.on('coaching.tip', (payload) => {
      const gatewayTip = payload.tip;

      // Convert Gateway tip format to store format
      const tip: CoachingTip = {
        id: gatewayTip.id,
        type: gatewayTip.type,
        priority: gatewayTip.priority,
        title: gatewayTip.title,
        content: gatewayTip.content,
        trigger: gatewayTip.trigger,
        talkingPoints: gatewayTip.talkingPoints,
        timestamp: gatewayTip.timestamp,
        dismissed: false
      };

      console.log('💡 Coaching tip:', tip.title);

      set(state => ({
        coachingTips: [tip, ...state.coachingTips].slice(0, 5)
      }));
    });

    client.on('coaching.objection', (payload) => {
      const objection = payload.objection;

      console.log('❗ Objection detected:', objection.type);

      // Create tip from objection
      const tip: CoachingTip = {
        id: objection.id,
        type: 'objection',
        priority: 'high',
        title: `Invändning: ${objection.category}`,
        content: objection.responseShort,
        trigger: objection.type,
        talkingPoints: [
          objection.responseDetailed,
          ...(objection.followupQuestions || []).map(q => `Följdfråga: ${q}`)
        ].filter(Boolean) as string[],
        timestamp: objection.timestamp,
        dismissed: false
      };

      set(state => ({
        coachingTips: [tip, ...state.coachingTips].slice(0, 5)
      }));
    });

    client.on('analysis.sentiment', (payload) => {
      console.log(`💭 Sentiment: ${payload.sentiment} (interest: ${payload.interestLevel}%)`);

      set(state => ({
        liveAnalysis: {
          ...state.liveAnalysis,
          probability: payload.interestLevel
        }
      }));
    });

    client.on('analysis.silence', (payload) => {
      console.log(`🔇 Silence detected: ${payload.duration}s - ${payload.suggestion}`);

      // Create silence tip
      const tip: CoachingTip = {
        id: `silence-${payload.timestamp}`,
        type: 'warning',
        priority: 'medium',
        title: 'Tystnad detekterad',
        content: payload.suggestion,
        trigger: 'silence',
        talkingPoints: payload.examples,
        timestamp: payload.timestamp,
        dismissed: false
      };

      set(state => ({
        coachingTips: [tip, ...state.coachingTips].slice(0, 5)
      }));
    });

    client.on('session.ended', (payload) => {
      console.log('✅ Gateway session ended:', payload.summary);
    });

      client.on('error', (payload) => {
        console.error('❌ Gateway error:', payload.message);
      });

      // Connect to Gateway
      client.connect();

      set({
        gatewayClient: client,
        isGatewayEnabled: true
      });

      console.log('🔌 Gateway initialized:', gatewayUrl);
    } else {
      console.log('⚠️  Gateway disabled (not yet deployed)');
      set({
        gatewayClient: null,
        isGatewayEnabled: false,
        isGatewayConnected: false
      });
    }
  },

  disconnectGateway: () => {
    const { gatewayClient } = get();
    if (gatewayClient) {
      gatewayClient.disconnect();
      set({
        gatewayClient: null,
        isGatewayEnabled: false,
        isGatewayConnected: false
      });
    }
  },

  // === EXPORT ===

  getSessionSummary: () => {
    const { session, segments, coachingTips } = get();
    if (!session) return '';
    
    const duration = session.endedAt 
      ? Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 1000 / 60)
      : Math.round((Date.now() - session.startedAt.getTime()) / 1000 / 60);
    
    const fullTranscript = segments.map(s => s.text).join('\n');
    const usedTips = coachingTips.filter(t => !t.dismissed);
    
    return `
# Samtalssammanfattning

**Datum:** ${session.startedAt.toLocaleDateString('sv-SE')}
**Tid:** ${session.startedAt.toLocaleTimeString('sv-SE')} - ${session.endedAt?.toLocaleTimeString('sv-SE') || 'Pågående'}
**Längd:** ${duration} minuter
${session.customer ? `**Kund:** ${session.customer.name} (${session.customer.company})` : ''}

## Transkription
${fullTranscript || 'Ingen transkription'}

## Coaching-tips som visades
${usedTips.map(t => `- **${t.title}**: ${t.content}`).join('\n') || 'Inga tips visades'}

## Nästa steg
- [ ] Följ upp med kunden
- [ ] Skicka sammanfattning
- [ ] Boka uppföljningsmöte
    `.trim();
  }
}));

// === SELECTORS ===

export const selectActiveTips = (state: SessionState) => 
  state.coachingTips.filter(t => !t.dismissed);

export const selectHighPriorityTips = (state: SessionState) =>
  state.coachingTips.filter(t => t.priority === 'high' && !t.dismissed);

export const selectFullTranscript = (state: SessionState) =>
  state.segments.map(s => s.text).join(' ');

export const selectIsRecording = (state: SessionState) =>
  state.status === 'recording';
