import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export type MeetingSpeaker = 'customer' | 'seller' | 'observation';
export type DiscoveryItem = 'budget' | 'authority' | 'need' | 'timeline';

export interface MeetingNote {
  id: string;
  timestamp: Date;
  speaker: MeetingSpeaker;
  text: string;
  tags: string[]; // AI-generated tags + quick tags
  detectedEntities?: {
    budget?: number;
    timeline?: string;
    painPoint?: string;
    competitor?: string;
    decision_maker?: string;
    key_requirement?: string;
  };
}

export interface DiscoveryStatus {
  budget: {
    completed: boolean;
    value?: string;
    confidence: number;
    sourceNoteId?: string;
  };
  authority: {
    completed: boolean;
    value?: string;
    confidence: number;
    sourceNoteId?: string;
  };
  need: {
    completed: boolean;
    value?: string;
    confidence: number;
    sourceNoteId?: string;
  };
  timeline: {
    completed: boolean;
    value?: string;
    confidence: number;
    sourceNoteId?: string;
  };
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  rationale: string;
  type: 'BANT' | 'Pain' | 'Product' | 'SPIN';
  priority: number;
}

export interface QuickTag {
  id: string;
  label: string;
  icon: string;
  category: 'customer_question' | 'pain_point' | 'custom';
  autoTriggers?: {
    showBattlecard?: string;
    ragSearch?: string;
    suggestFollowUp?: string[];
    updateDiscovery?: DiscoveryItem;
  };
  detailPrompt?: string;
  usageCount: number;
  lastUsed?: Date;
}

export interface MeetingSummary {
  duration: number; // seconds
  noteCount: number;
  discoveryCompletionRate: number; // 0-100
  topicsDiscussed: string[];
  painPoints: string[];
  interestLevel: number; // 0-100
  nextSteps?: string[];
}

export interface AIAnswer {
  id: string;
  question: string;
  answer: string;
  sources: Array<{ title: string; excerpt: string }>;
  confidence: 'high' | 'medium' | 'low';
  timestamp: Date;
}

// ============================================================================
// DEFAULT QUICK TAGS
// ============================================================================

export const DEFAULT_QUICK_TAGS: QuickTag[] = [
  {
    id: 'price',
    label: 'Pris',
    icon: '💰',
    category: 'customer_question',
    autoTriggers: {
      showBattlecard: 'pricing-overview',
      suggestFollowUp: [
        'Vad är er budget för detta?',
        'Vill ni ha en ROI-kalkyl baserat på er situation?'
      ],
      updateDiscovery: 'budget'
    },
    usageCount: 0
  },
  {
    id: 'integration',
    label: 'Integration',
    icon: '🔌',
    category: 'customer_question',
    detailPrompt: 'Vilket system? (Salesforce, Dynamics, HubSpot...)',
    autoTriggers: {
      ragSearch: 'integration {detail} setup configuration',
      suggestFollowUp: [
        'Vilka system använder ni idag?',
        'Hur kritisk är integration för er?'
      ]
    },
    usageCount: 0
  },
  {
    id: 'timeline',
    label: 'Tidsplan',
    icon: '⏰',
    category: 'customer_question',
    autoTriggers: {
      showBattlecard: 'implementation-timeline',
      suggestFollowUp: [
        'När behöver ni ha lösningen live?',
        'Finns det en deadline ni måste hålla?'
      ],
      updateDiscovery: 'timeline'
    },
    usageCount: 0
  },
  {
    id: 'features',
    label: 'Funktioner',
    icon: '⚙️',
    category: 'customer_question',
    detailPrompt: 'Vilken funktion? (eller skriv i text field)',
    autoTriggers: {
      showBattlecard: 'product-features',
      suggestFollowUp: [
        'Vilken funktion är viktigast för er?',
        'Vill ni se en demo av specifika features?'
      ]
    },
    usageCount: 0
  },
  {
    id: 'support',
    label: 'Support/SLA',
    icon: '🆘',
    category: 'customer_question',
    autoTriggers: {
      ragSearch: 'SLA support servicenivå responstid',
      showBattlecard: 'support-sla',
      suggestFollowUp: [
        'Vilken supportnivå behöver ni? (standard/premium)',
        'Hur kritisk är 24/7 support för er verksamhet?'
      ]
    },
    usageCount: 0
  },
  {
    id: 'security',
    label: 'Säkerhet',
    icon: '🔒',
    category: 'customer_question',
    autoTriggers: {
      showBattlecard: 'security-certifications',
      suggestFollowUp: [
        'Vilka säkerhetskrav har ni?',
        'Behöver ni specifika certifieringar?'
      ]
    },
    usageCount: 0
  },
  {
    id: 'references',
    label: 'Referenser',
    icon: '👥',
    category: 'customer_question',
    autoTriggers: {
      showBattlecard: 'case-studies',
      suggestFollowUp: [
        'Vill ni prata med en kund i er bransch?',
        'Vilken typ av use case är mest relevant för er?'
      ]
    },
    usageCount: 0
  },
  {
    id: 'contract',
    label: 'Avtal',
    icon: '📄',
    category: 'customer_question',
    autoTriggers: {
      showBattlecard: 'contract-terms',
      suggestFollowUp: [
        'Finns det specifika avtalsvillkor ni behöver?',
        'Hur lång avtalstid föredrar ni?'
      ]
    },
    usageCount: 0
  }
];

// ============================================================================
// STORE STATE
// ============================================================================

interface MeetingAssistantState {
  // Session
  sessionId: string | null;
  isActive: boolean;
  startedAt: Date | null;

  // Meeting info
  customer: {
    company: string;
    contactPerson?: string;
    role?: string;
  } | null;
  productId: string | null;
  userId: string | null;

  // Notes
  notes: MeetingNote[];

  // Discovery
  discoveryStatus: DiscoveryStatus;

  // AI Suggestions
  suggestedQuestions: SuggestedQuestion[];
  coachingTips: any[]; // Reuse CoachingTip type

  // AI Answers (RAG-based)
  aiAnswers: AIAnswer[];
  isLoadingAnswer: boolean;

  // Quick Tags
  quickTags: QuickTag[];
  activeTag: QuickTag | null; // Currently clicked tag waiting for detail

  // Summary
  liveSummary: MeetingSummary;

  // UI State
  showDetailPrompt: boolean;
  detailPromptMessage: string;

  // Actions
  startMeeting: (customer: { company: string; contactPerson?: string; role?: string }, productId: string, userId: string) => Promise<void>;
  endMeeting: () => Promise<MeetingSummary>;
  addNote: (text: string, speaker: MeetingSpeaker, tags?: string[]) => Promise<void>;
  updateNote: (noteId: string, text: string) => void;
  deleteNote: (noteId: string) => void;
  handleQuickTag: (tagId: string, detail?: string) => Promise<void>;
  useSuggestedQuestion: (questionId: string) => void;
  updateDiscoveryItem: (item: DiscoveryItem, value: string, noteId: string) => void;
  addCustomTag: (tag: Omit<QuickTag, 'usageCount'>) => void;
  askQuestion: (question: string) => Promise<void>;

  // Internal helpers
  updateLiveSummary: () => void;
  detectEntities: (text: string) => Promise<MeetingNote['detectedEntities']>;
  generateSuggestedQuestions: () => Promise<void>;
  generateCoachingTips: (text: string, speaker: MeetingSpeaker) => Promise<void>;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useMeetingAssistantStore = create<MeetingAssistantState>((set, get) => ({
  // Initial state
  sessionId: null,
  isActive: false,
  startedAt: null,
  customer: null,
  productId: null,
  userId: null,
  notes: [],
  discoveryStatus: {
    budget: { completed: false, confidence: 0 },
    authority: { completed: false, confidence: 0 },
    need: { completed: false, confidence: 0 },
    timeline: { completed: false, confidence: 0 }
  },
  suggestedQuestions: [],
  coachingTips: [],
  aiAnswers: [],
  isLoadingAnswer: false,
  quickTags: DEFAULT_QUICK_TAGS,
  activeTag: null,
  liveSummary: {
    duration: 0,
    noteCount: 0,
    discoveryCompletionRate: 0,
    topicsDiscussed: [],
    painPoints: [],
    interestLevel: 50
  },
  showDetailPrompt: false,
  detailPromptMessage: '',

  // ============================================================================
  // START MEETING
  // ============================================================================
  startMeeting: async (customer, productId, userId) => {
    const startedAt = new Date();

    // Create session in database
    const { data: session, error } = await supabase
      .from('call_sessions')
      .insert({
        user_id: userId,
        customer_company: customer.company,
        customer_name: customer.contactPerson,
        customer_role: customer.role,
        status: 'recording',
        started_at: startedAt.toISOString(),
        notes: JSON.stringify([]), // Store notes as JSON string
        topics: []
      })
      .select()
      .single();

    if (error) {
      console.error('[MeetingAssistant] Failed to create session:', error);
      throw error;
    }

    set({
      sessionId: session.id,
      isActive: true,
      startedAt,
      customer,
      productId,
      userId,
      notes: [],
      discoveryStatus: {
        budget: { completed: false, confidence: 0 },
        authority: { completed: false, confidence: 0 },
        need: { completed: false, confidence: 0 },
        timeline: { completed: false, confidence: 0 }
      },
      suggestedQuestions: [],
      coachingTips: []
    });

    // Generate initial questions
    await get().generateSuggestedQuestions();

    console.log('[MeetingAssistant] Meeting started:', session.id);
  },

  // ============================================================================
  // END MEETING
  // ============================================================================
  endMeeting: async () => {
    const { sessionId, notes, discoveryStatus, customer } = get();

    if (!sessionId) {
      throw new Error('No active meeting session');
    }

    if (!customer) {
      throw new Error('No customer information');
    }

    const endedAt = new Date();
    const duration = get().startedAt
      ? Math.floor((endedAt.getTime() - get().startedAt!.getTime()) / 1000)
      : 0;

    // Generate comprehensive AI summary
    let aiSummary;
    try {
      const { generateMeetingSummary } = await import('../lib/meetingAI');
      aiSummary = await generateMeetingSummary(notes, discoveryStatus, customer, duration);
      console.log('[MeetingAssistant] AI summary generated');
    } catch (error) {
      console.error('[MeetingAssistant] AI summary generation failed:', error);
      // Fallback to simple summary
      aiSummary = null;
    }

    // Create final summary (backward compatible)
    const finalSummary: MeetingSummary = {
      duration,
      noteCount: notes.length,
      discoveryCompletionRate: (Object.values(discoveryStatus).filter((item: any) => item.completed).length / 4) * 100,
      topicsDiscussed: aiSummary?.topicsDiscussed || [...new Set(notes.flatMap(n => n.tags))].slice(0, 5),
      painPoints: aiSummary?.qualification?.need?.painPoints || notes.filter(n => n.detectedEntities?.painPoint).map(n => n.detectedEntities!.painPoint!),
      interestLevel: aiSummary ? aiSummary.dealScore : 50,
      nextSteps: aiSummary?.nextSteps
    };

    // Update session in database with full AI summary
    const { error } = await supabase
      .from('call_sessions')
      .update({
        status: 'stopped',
        ended_at: endedAt.toISOString(),
        duration_seconds: duration,
        notes: JSON.stringify(notes), // Store notes as JSON string
        ai_summary: aiSummary ? JSON.stringify(aiSummary) : null,
        topics: finalSummary.topicsDiscussed,
        pain_points: finalSummary.painPoints,
        next_steps: aiSummary?.nextSteps.join('\n') || null,
        interest_level: finalSummary.interestLevel >= 70 ? 'Hög' : finalSummary.interestLevel >= 40 ? 'Medel' : 'Låg',
        is_analyzed: true,
        analyzed_at: endedAt.toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('[MeetingAssistant] Failed to end session:', error);
    }

    set({
      isActive: false
    });

    console.log('[MeetingAssistant] Meeting ended:', sessionId);

    return finalSummary;
  },

  // ============================================================================
  // ADD NOTE
  // ============================================================================
  addNote: async (text, speaker, tags = []) => {
    const note: MeetingNote = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      speaker,
      text,
      tags,
      detectedEntities: await get().detectEntities(text)
    };

    set(state => ({
      notes: [...state.notes, note]
    }));

    // Update discovery if entities detected
    const entities = note.detectedEntities;
    if (entities) {
      if (entities.budget && !get().discoveryStatus.budget.completed) {
        get().updateDiscoveryItem('budget', `Budget: ${entities.budget} kr`, note.id);
      }
      if (entities.timeline && !get().discoveryStatus.timeline.completed) {
        get().updateDiscoveryItem('timeline', entities.timeline, note.id);
      }
      if (entities.painPoint && !get().discoveryStatus.need.completed) {
        get().updateDiscoveryItem('need', entities.painPoint, note.id);
      }
    }

    // Update live summary
    get().updateLiveSummary();

    // Generate coaching tips (for customer speech)
    if (speaker === 'customer') {
      await get().generateCoachingTips(text, speaker);
    }

    // Generate new suggested questions based on context
    await get().generateSuggestedQuestions();

    // Auto-save notes to database
    const sessionId = get().sessionId;
    if (sessionId) {
      await supabase
        .from('call_sessions')
        .update({
          notes: JSON.stringify(get().notes)
        })
        .eq('id', sessionId);
    }

    console.log('[MeetingAssistant] Note added:', note);
  },

  // ============================================================================
  // UPDATE NOTE
  // ============================================================================
  updateNote: (noteId, text) => {
    set(state => ({
      notes: state.notes.map(note =>
        note.id === noteId ? { ...note, text } : note
      )
    }));
  },

  // ============================================================================
  // DELETE NOTE
  // ============================================================================
  deleteNote: (noteId) => {
    set(state => ({
      notes: state.notes.filter(note => note.id !== noteId)
    }));
    get().updateLiveSummary();
  },

  // ============================================================================
  // HANDLE QUICK TAG
  // ============================================================================
  handleQuickTag: async (tagId, detail) => {
    const tag = get().quickTags.find(t => t.id === tagId);
    if (!tag) return;

    // If tag requires detail and no detail provided, show prompt
    if (tag.detailPrompt && !detail) {
      set({
        activeTag: tag,
        showDetailPrompt: true,
        detailPromptMessage: tag.detailPrompt
      });
      return;
    }

    // Build note text
    const noteText = detail ? `${tag.label} (${detail})` : tag.label;
    const noteTags = [tag.id, ...(detail ? [detail.toLowerCase()] : [])];

    // Add note
    await get().addNote(noteText, 'customer', noteTags);

    // Update tag usage
    set(state => ({
      quickTags: state.quickTags.map(t =>
        t.id === tagId
          ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date() }
          : t
      ),
      activeTag: null,
      showDetailPrompt: false
    }));

    // Execute auto-triggers
    if (tag.autoTriggers) {
      // Update discovery
      if (tag.autoTriggers.updateDiscovery) {
        get().updateDiscoveryItem(
          tag.autoTriggers.updateDiscovery,
          noteText,
          get().notes[get().notes.length - 1].id
        );
      }

      // Add suggested follow-up questions
      if (tag.autoTriggers.suggestFollowUp) {
        const questions: SuggestedQuestion[] = tag.autoTriggers.suggestFollowUp.map((q, i) => ({
          id: crypto.randomUUID(),
          text: q.replace('{detail}', detail || ''),
          rationale: `Follow-up efter ${tag.label}-fråga`,
          type: 'Product' as const,
          priority: i + 1
        }));

        set(state => ({
          suggestedQuestions: [...questions, ...state.suggestedQuestions].slice(0, 3)
        }));
      }

      // RAG search trigger - Generate AI answer
      if (tag.autoTriggers.ragSearch) {
        try {
          // Build question from tag and detail
          const question = detail
            ? `${tag.label}: ${detail}`
            : `Vad kan du berätta om ${tag.label.toLowerCase()}?`;

          // Trigger AI answer generation
          await get().askQuestion(question);

          console.log('[MeetingAssistant] RAG answer requested:', question);
        } catch (error) {
          console.error('[MeetingAssistant] RAG search failed:', error);
        }
      }

      // TODO: Trigger battlecard display (handled by MeetingQuickAccess component)
    }

    console.log('[MeetingAssistant] Quick tag used:', tag.label, detail);
  },

  // ============================================================================
  // USE SUGGESTED QUESTION
  // ============================================================================
  useSuggestedQuestion: (questionId) => {
    const question = get().suggestedQuestions.find(q => q.id === questionId);
    if (!question) return;

    // Add as seller note
    get().addNote(question.text, 'seller');

    // Remove from suggestions
    set(state => ({
      suggestedQuestions: state.suggestedQuestions.filter(q => q.id !== questionId)
    }));
  },

  // ============================================================================
  // UPDATE DISCOVERY ITEM
  // ============================================================================
  updateDiscoveryItem: (item, value, noteId) => {
    set(state => ({
      discoveryStatus: {
        ...state.discoveryStatus,
        [item]: {
          completed: true,
          value,
          confidence: 0.8,
          sourceNoteId: noteId
        }
      }
    }));

    get().updateLiveSummary();
  },

  // ============================================================================
  // ADD CUSTOM TAG
  // ============================================================================
  addCustomTag: (tag) => {
    const newTag: QuickTag = {
      ...tag,
      usageCount: 0
    };

    set(state => ({
      quickTags: [...state.quickTags, newTag]
    }));

    console.log('[MeetingAssistant] Custom tag added:', newTag.label);
  },

  // ============================================================================
  // ASK QUESTION (RAG-based AI Answer)
  // ============================================================================
  askQuestion: async (question: string) => {
    const { productId, notes } = get();

    if (!question.trim()) {
      console.warn('[MeetingAssistant] Empty question');
      return;
    }

    set({ isLoadingAnswer: true });

    try {
      // Build context from recent notes
      const recentNotes = notes.slice(-5);
      const context = recentNotes
        .map(n => `${n.speaker === 'customer' ? 'Kund' : 'Säljare'}: ${n.text}`)
        .join('\n');

      // Call answer-question API
      const response = await fetch('/api/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          productId: productId || undefined,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Create AI answer object
      const aiAnswer: AIAnswer = {
        id: crypto.randomUUID(),
        question,
        answer: data.answer,
        sources: data.sources || [],
        confidence: data.confidence || 'medium',
        timestamp: new Date()
      };

      // Add to answers list (newest first)
      set(state => ({
        aiAnswers: [aiAnswer, ...state.aiAnswers],
        isLoadingAnswer: false
      }));

      console.log('[MeetingAssistant] AI answer generated:', aiAnswer.confidence);

    } catch (error) {
      console.error('[MeetingAssistant] Failed to get AI answer:', error);

      // Add error answer
      const errorAnswer: AIAnswer = {
        id: crypto.randomUUID(),
        question,
        answer: 'Kunde inte hitta svar på den frågan. Försök omformulera eller kontrollera att dokument är uppladdade.',
        sources: [],
        confidence: 'low',
        timestamp: new Date()
      };

      set(state => ({
        aiAnswers: [errorAnswer, ...state.aiAnswers],
        isLoadingAnswer: false
      }));
    }
  },

  // ============================================================================
  // UPDATE LIVE SUMMARY
  // ============================================================================
  updateLiveSummary: () => {
    const { notes, discoveryStatus, startedAt } = get();

    const duration = startedAt
      ? Math.floor((new Date().getTime() - startedAt.getTime()) / 1000)
      : 0;

    const completedItems = Object.values(discoveryStatus).filter(
      item => item.completed
    ).length;
    const discoveryCompletionRate = (completedItems / 4) * 100;

    // Extract topics from tags
    const allTags = notes.flatMap(n => n.tags);
    const topicsDiscussed = [...new Set(allTags)].slice(0, 5);

    // Extract pain points
    const painPoints = notes
      .filter(n => n.detectedEntities?.painPoint)
      .map(n => n.detectedEntities!.painPoint!)
      .filter((v, i, a) => a.indexOf(v) === i);

    // Calculate interest level (simple heuristic)
    const customerNotes = notes.filter(n => n.speaker === 'customer').length;
    const totalNotes = notes.length;
    const interestLevel = totalNotes > 0
      ? Math.min(100, 50 + (customerNotes / totalNotes) * 50)
      : 50;

    set({
      liveSummary: {
        duration,
        noteCount: notes.length,
        discoveryCompletionRate,
        topicsDiscussed,
        painPoints,
        interestLevel
      }
    });
  },

  // ============================================================================
  // DETECT ENTITIES (Enhanced with AI)
  // ============================================================================
  detectEntities: async (text) => {
    // Import AI services dynamically to avoid circular deps
    const { detectEntities } = await import('../lib/meetingAI');
    return detectEntities(text);
  },

  // ============================================================================
  // GENERATE SUGGESTED QUESTIONS (Enhanced with AI)
  // ============================================================================
  generateSuggestedQuestions: async () => {
    const { discoveryStatus, notes, productId } = get();

    if (!productId) {
      console.warn('[MeetingAssistant] Cannot generate questions without productId');
      return;
    }

    try {
      const { generateSuggestedQuestions } = await import('../lib/meetingAI');

      const questions = await generateSuggestedQuestions(
        notes,
        discoveryStatus,
        productId
      );

      set({ suggestedQuestions: questions });

      console.log('[MeetingAssistant] Generated', questions.length, 'questions');
    } catch (error) {
      console.error('[MeetingAssistant] Failed to generate questions:', error);
    }
  },

  // ============================================================================
  // GENERATE COACHING TIPS (From triggers and RAG)
  // ============================================================================
  generateCoachingTips: async (text, speaker) => {
    const { productId, userId } = get();

    if (!productId || !userId) {
      console.warn('[MeetingAssistant] Cannot generate tips without productId/userId');
      return;
    }

    try {
      const { generateCoachingTips } = await import('../lib/meetingAI');

      const tips = await generateCoachingTips(text, speaker, productId, userId);

      if (tips.length > 0) {
        set(state => ({
          coachingTips: [...tips, ...state.coachingTips].slice(0, 5) // Keep max 5
        }));

        console.log('[MeetingAssistant] Generated', tips.length, 'coaching tips');
      }
    } catch (error) {
      console.error('[MeetingAssistant] Failed to generate coaching tips:', error);
    }
  }
}));
