import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  CallSession,
  CoachingTip,
  TranscriptSegment,
  SessionStatus,
  CustomerInfo
} from '../types';
import { generateCoachingTips, CoachingData } from '../utils/triggers';
import { useCoachingStore } from './coachingStore';
import {
  saveSessionToDb,
  saveSegmentToDb,
  saveTipToDb
} from '../lib/supabaseOperations';

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
  
  // Actions
  startSession: (customer?: CustomerInfo) => void;
  stopSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  
  // Transkription
  addInterimTranscript: (text: string) => void;
  addFinalTranscript: (text: string, confidence: number) => void;
  clearTranscript: () => void;
  
  // Coaching
  processTranscriptForCoaching: (text: string) => void;
  addCoachingTip: (tip: Omit<CoachingTip, 'id' | 'timestamp' | 'dismissed'>) => void;
  dismissTip: (tipId: string) => void;
  clearAllTips: () => void;
  
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
      conversationContext: []
    });

    // Spara sessionen till databasen direkt så att RLS fungerar för segments
    saveSessionToDb(newSession).catch(err =>
      console.error('Failed to save initial session to DB:', err)
    );
  },

  stopSession: () => {
    const { session, segments } = get();
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

    // Spara till databas (asynkront, blockerar inte UI)
    saveSessionToDb(updatedSession).catch(err =>
      console.error('Failed to save session to DB:', err)
    );
  },

  pauseSession: () => {
    set({ status: 'paused' });
  },

  resumeSession: () => {
    set({ status: 'recording' });
  },

  // === TRANSKRIPTION ===

  addInterimTranscript: (text: string) => {
    set({ interimText: text });
  },

  addFinalTranscript: (text: string, confidence: number) => {
    const { segments, session } = get();

    const newSegment: TranscriptSegment = {
      id: uuidv4(),
      text: text.trim(),
      timestamp: session ? Date.now() - session.startedAt.getTime() : Date.now(),
      speaker: 'unknown', // Kan förbättras med speaker diarization
      confidence,
      isFinal: true
    };

    set({
      segments: [...segments, newSegment],
      interimText: ''
    });

    // Spara segment till databas
    if (session?.id) {
      saveSegmentToDb(session.id, newSegment).catch(err =>
        console.error('Failed to save segment to DB:', err)
      );
    }

    // Trigga coaching-analys
    get().processTranscriptForCoaching(text);
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
    set(state => ({
      coachingTips: state.coachingTips.filter(t => t.id !== tipId),
      dismissedTipIds: [...state.dismissedTipIds, tipId]
    }));
  },

  clearAllTips: () => {
    set({ coachingTips: [] });
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
