// === TRANSKRIPTION ===
export interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  speaker: 'seller' | 'customer' | 'unknown';
  confidence: number;
  isFinal: boolean;
}

export interface Transcript {
  segments: TranscriptSegment[];
  fullText: string;
  duration: number;
}

// === COACHING ===
export type TipType = 'suggestion' | 'battlecard' | 'objection' | 'offer' | 'case' | 'warning';
export type TipPriority = 'high' | 'medium' | 'low';

export interface CoachingTip {
  id: string;
  type: TipType;
  priority: TipPriority;
  trigger: string;
  title: string;
  content: string;
  talkingPoints?: string[];
  relatedOffer?: Offer;
  relatedCase?: CaseStudy;
  timestamp: number;
  dismissed: boolean;
}

export interface CoachingState {
  activeTips: CoachingTip[];
  dismissedTips: string[];
  conversationContext: string[];
}

// === KUNSKAPSBAS ===
export type DocumentCategory = 'offer' | 'battlecard' | 'objection' | 'case' | 'pricing';

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: DocumentCategory;
  tags: string[];
  embedding?: number[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author?: string;
  };
}

export interface Offer {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  deliverables: string[];
  duration: string;
  priceRange: {
    min: number;
    max: number;
    unit: 'fixed' | 'hourly' | 'daily';
  };
  targetAudience: string[];
  relatedCases: string[];
}

export interface Battlecard {
  id: string;
  competitor: string;
  theirStrengths: string[];
  theirWeaknesses: string[];
  ourAdvantages: string[];
  talkingPoints: string[];
  commonObjections: string[];
}

export type ObjectionCategory = 'price' | 'timing' | 'competition' | 'trust' | 'need';

export interface ObjectionHandler {
  id: string;
  objection: string;
  triggers: string[];
  category: ObjectionCategory;
  responses: {
    short: string;
    detailed: string;
    followUpQuestions: string[];
  };
}

export interface CaseStudy {
  id: string;
  customer: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  quote?: string;
  isPublic: boolean;
}

// === TRIGGERS ===
export interface TriggerPattern {
  keywords: string[];
  response: 'objection' | 'battlecard' | 'offer' | 'solution' | 'expand';
  category?: string;
}

export interface DetectedTrigger {
  pattern: string;
  matchedKeyword: string;
  position: number;
  type: TriggerPattern['response'];
  confidence: number;
}

// === SESSIONSHANTERING ===
export type SessionStatus = 'idle' | 'recording' | 'paused' | 'stopped';

export interface CustomerInfo {
  name: string;
  company: string;
  role?: string;
}

export interface CallSession {
  id: string;
  status: SessionStatus;
  startedAt: Date;
  endedAt?: Date;
  customer?: CustomerInfo;
  transcript: Transcript;
  coachingTips: CoachingTip[];
  analytics: CallAnalytics;
}

export interface CallAnalytics {
  totalDuration: number;
  talkRatio: {
    seller: number;
    customer: number;
  };
  topicsDiscussed: string[];
  objectionsHandled: string[];
  offersPresented: string[];
  nextSteps?: string;
}

// === SPEECH SERVICE ===
export interface SpeechConfig {
  subscriptionKey: string;
  region: string;
  language: string;
}

export interface SpeechRecognitionEvent {
  type: 'recognizing' | 'recognized' | 'error' | 'sessionStarted' | 'sessionStopped';
  text?: string;
  confidence?: number;
  error?: string;
}

// === STORE STATE ===
export interface SessionStore {
  // State
  session: CallSession | null;
  isRecording: boolean;
  currentTranscript: string;
  interimTranscript: string;
  coachingTips: CoachingTip[];
  
  // Actions
  startSession: (customer?: CustomerInfo) => void;
  stopSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  addTranscript: (text: string, isFinal: boolean) => void;
  addCoachingTip: (tip: Omit<CoachingTip, 'id' | 'timestamp' | 'dismissed'>) => void;
  dismissTip: (tipId: string) => void;
  clearTips: () => void;
}

// === API RESPONSES ===
export interface CoachingRequest {
  transcript: string;
  context: string[];
  sessionId: string;
  customerId?: string;
}

export interface CoachingResponse {
  tips: CoachingTip[];
  updatedContext: string[];
  processingTime: number;
}

export interface SearchRequest {
  query: string;
  categories?: DocumentCategory[];
  topK?: number;
}

export interface SearchResult {
  document: KnowledgeDocument;
  score: number;
  highlights: string[];
}

export interface SearchResponse {
  results: SearchResult[];
}
