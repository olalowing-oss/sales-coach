/**
 * Coaching Engine
 *
 * Real-time coaching analysis and event generation.
 * Analyzes transcripts and generates coaching tips, objection handlers,
 * sentiment analysis, and silence detection.
 */

import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import type { SessionState } from './session-manager.js';
import type { Speaker } from './protocol.js';

// ============================================================================
// TYPES
// ============================================================================

export interface CoachingTip {
  id: string;
  type: 'suggestion' | 'battlecard' | 'objection' | 'offer' | 'case' | 'warning';
  priority: 'high' | 'medium' | 'low';
  trigger: string;
  title: string;
  content: string;
  talkingPoints?: string[];
  fullContext?: string; // Full document context for expandable view (RAG)
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

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  interestLevel: number; // 0-100
  confidence: number; // 0-1
}

export interface TriggerPattern {
  keywords: string[];
  response: 'objection' | 'battlecard' | 'offer' | 'solution' | 'expand';
  category?: string;
}

// ============================================================================
// TRIGGER PATTERNS (lightweight version for Gateway)
// ============================================================================

const TRIGGER_PATTERNS: Record<string, TriggerPattern> = {
  // Invändningar
  price: {
    keywords: ['dyrt', 'för dyrt', 'billigare', 'budget', 'kostnad', 'pris', 'har inte råd'],
    response: 'objection',
    category: 'price',
  },
  timing: {
    keywords: ['senare', 'inte nu', 'nästa år', 'inte prioriterat', 'vänta', 'har inte tid'],
    response: 'objection',
    category: 'timing',
  },
  competition: {
    keywords: ['annan leverantör', 'redan avtal', 'ramavtal', 'andra konsulter', 'byter inte'],
    response: 'objection',
    category: 'competition',
  },
  need: {
    keywords: ['behöver inte', 'fungerar bra', 'har redan', 'klarar oss', 'inte aktuellt'],
    response: 'objection',
    category: 'need',
  },
  trust: {
    keywords: ['litar inte på', 'osäkra på', 'fungerar det verkligen', 'hört dåligt om'],
    response: 'objection',
    category: 'trust',
  },

  // Konkurrenter - Battlecards
  atea: { keywords: ['Atea', 'atea'], response: 'battlecard' },
  tieto: { keywords: ['Tieto', 'TietoEVRY'], response: 'battlecard' },
  cgi: { keywords: ['CGI', 'cgi'], response: 'battlecard' },
  google: { keywords: ['Google Workspace', 'Google Drive'], response: 'battlecard' },
  aws: { keywords: ['AWS', 'Amazon'], response: 'battlecard' },

  // Erbjudanden
  teams: { keywords: ['Teams', 'videosamtal', 'videomöte'], response: 'offer' },
  copilot: { keywords: ['Copilot', 'AI-assistent', 'produktivitet'], response: 'offer' },
  sharepoint: { keywords: ['SharePoint', 'intranät', 'dokumenthantering'], response: 'offer' },
};

// Objection handlers
const OBJECTION_HANDLERS: Record<
  string,
  { response: string; detailed: string; followup: string[] }
> = {
  price: {
    response: 'Fokusera på ROI och värde, inte bara pris.',
    detailed:
      'Vad kostar det er att inte ha detta? Beräkna värdet av tidsbesparingen och ökad produktivitet.',
    followup: [
      'Vad kostar er nuvarande lösning per månad?',
      'Hur mycket tid skulle ni spara per medarbetare?',
      'Har ni räknat på kostnaden för ineffektivitet?',
    ],
  },
  timing: {
    response: 'Ifrågasätt - vad händer om ni väntar?',
    detailed:
      'Förstår att timing är viktig. Men tänk på vad det kostar att vänta - förlorad produktivitet, konkurrensfördelar.',
    followup: [
      'Vad händer med era mål om ni väntar?',
      'Finns det något som hindrar er från att börja nu?',
      'Vad skulle få er att prioritera detta högre?',
    ],
  },
  competition: {
    response: 'Fråga om nuvarande lösning verkligen täcker behoven.',
    detailed:
      'Förstår att ni har ett befintligt avtal. Men uppfyller det alla era behov? Kan vi komplettera?',
    followup: [
      'Vad är ni nöjda med i nuvarande lösning?',
      'Finns det något som saknas?',
      'Skulle ni vara öppna för en jämförelse?',
    ],
  },
  need: {
    response: 'Utforska dolda behov - vad är inte synligt ännu?',
    detailed:
      'Ofta upptäcker man behovet först när man ser möjligheterna. Låt mig visa ett exempel...',
    followup: [
      'Hur mycket tid lägger ni på [problem]?',
      'Vad skulle hända om ni kunde [värde]?',
      'Har ni jämfört med branschstandard?',
    ],
  },
  trust: {
    response: 'Dela referenser och case studies.',
    detailed:
      'Förstår era farhågor. Låt mig dela hur andra liknande organisationer lyckats...',
    followup: [
      'Skulle ni vilja prata med någon av våra kunder?',
      'Kan vi göra en pilot för att bevisa värdet?',
      'Vilka garantier skulle göra er tryggare?',
    ],
  },
};

// ============================================================================
// COACHING ENGINE
// ============================================================================

export class CoachingEngine {
  private openai: OpenAI;
  private supabase;
  private lastAnalysisTime: Map<string, number> = new Map();
  private readonly ANALYSIS_THROTTLE_MS = 2000; // Max 1 analysis per 2s per session

  // Cache for product-specific coaching data
  private productTriggersCache: Map<string, any[]> = new Map();
  private productBattlecardsCache: Map<string, any[]> = new Map();
  private productObjectionsCache: Map<string, any[]> = new Map();

  constructor(config: { openaiApiKey: string; supabaseUrl: string; supabaseKey: string }) {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });

    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  // --------------------------------------------------------------------------
  // PRODUCT-SPECIFIC DATA LOADING
  // --------------------------------------------------------------------------

  /**
   * Load triggers for a specific product
   */
  async loadProductTriggers(userId: string, productId?: string): Promise<any[]> {
    if (!productId) return [];

    // Check cache first
    const cacheKey = `${userId}:${productId}`;
    if (this.productTriggersCache.has(cacheKey)) {
      return this.productTriggersCache.get(cacheKey)!;
    }

    // Load from database
    const { data, error } = await this.supabase
      .from('trigger_patterns')
      .select('*')
      .eq('user_id', userId)
      .or(`product_id.eq.${productId},product_id.is.null`); // Include both product-specific and global

    if (error) {
      console.error('[CoachingEngine] Failed to load triggers:', error);
      return [];
    }

    // Cache the result
    this.productTriggersCache.set(cacheKey, data || []);
    return data || [];
  }

  /**
   * Load battlecards for a specific product
   */
  async loadProductBattlecards(userId: string, productId?: string): Promise<any[]> {
    if (!productId) return [];

    const cacheKey = `${userId}:${productId}`;
    if (this.productBattlecardsCache.has(cacheKey)) {
      return this.productBattlecardsCache.get(cacheKey)!;
    }

    const { data, error } = await this.supabase
      .from('battlecards')
      .select('*')
      .eq('user_id', userId)
      .or(`product_id.eq.${productId},product_id.is.null`);

    if (error) {
      console.error('[CoachingEngine] Failed to load battlecards:', error);
      return [];
    }

    this.productBattlecardsCache.set(cacheKey, data || []);
    return data || [];
  }

  /**
   * Load objection handlers for a specific product
   */
  async loadProductObjections(userId: string, productId?: string): Promise<any[]> {
    if (!productId) return [];

    const cacheKey = `${userId}:${productId}`;
    if (this.productObjectionsCache.has(cacheKey)) {
      return this.productObjectionsCache.get(cacheKey)!;
    }

    const { data, error } = await this.supabase
      .from('objection_handlers')
      .select('*')
      .eq('user_id', userId)
      .or(`product_id.eq.${productId},product_id.is.null`);

    if (error) {
      console.error('[CoachingEngine] Failed to load objections:', error);
      return [];
    }

    this.productObjectionsCache.set(cacheKey, data || []);
    return data || [];
  }

  // --------------------------------------------------------------------------
  // TRIGGER DETECTION
  // --------------------------------------------------------------------------

  /**
   * Detect triggers in text and generate coaching tips
   */
  async detectTriggersAndGenerateTips(
    text: string,
    speaker: Speaker,
    session: SessionState
  ): Promise<CoachingTip[]> {
    // Analyze seller speech for coaching
    if (speaker === 'seller') {
      return this.analyzeSellerSpeech(text, session);
    }

    const tips: CoachingTip[] = [];
    const textLower = text.toLowerCase();

    // If productId is set, load product-specific triggers, otherwise use fallback
    let triggersToCheck: Record<string, TriggerPattern> = {};
    let customTriggers: any[] = [];

    if (session.productId) {
      // Load product-specific triggers from database
      customTriggers = await this.loadProductTriggers(session.userId, session.productId);

      // Also check fallback triggers for common cases
      triggersToCheck = TRIGGER_PATTERNS;
    } else {
      // No product selected, use fallback triggers only
      triggersToCheck = TRIGGER_PATTERNS;
    }

    // Check custom triggers from database (product-specific)
    for (const customTrigger of customTriggers) {
      const keywords = customTrigger.keywords || [];
      for (const keyword of keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          // Check if this trigger has document_query (RAG-based coaching)
          if (customTrigger.document_query && session.productId) {
            const ragTip = await this.createRAGTip(
              customTrigger,
              keyword,
              text,
              session
            );
            if (ragTip) {
              tips.push(ragTip);
              // Max 2 tips per message
              if (tips.length >= 2) {
                return tips;
              }
              continue;
            }
          }

          // Standard trigger (no document search)
          const tip: CoachingTip = {
            id: randomUUID(),
            type: customTrigger.tip_type || 'suggestion',
            priority: customTrigger.priority || 'medium',
            trigger: keyword,
            title: customTrigger.title || `Trigger: ${keyword}`,
            content: customTrigger.content || '',
            talkingPoints: customTrigger.talking_points,
            timestamp: Date.now(),
          };
          tips.push(tip);

          // Max 2 tips per message
          if (tips.length >= 2) {
            return tips;
          }
        }
      }
    }

    // Check fallback trigger patterns
    for (const [patternId, pattern] of Object.entries(triggersToCheck)) {
      for (const keyword of pattern.keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          const tip = this.createTipFromPattern(patternId, pattern, keyword, text);
          if (tip) {
            tips.push(tip);
          }

          // Max 2 tips per message
          if (tips.length >= 2) {
            return tips;
          }
        }
      }
    }

    return tips;
  }

  /**
   * Create coaching tip from trigger pattern
   */
  private createTipFromPattern(
    patternId: string,
    pattern: TriggerPattern,
    keyword: string,
    originalText: string
  ): CoachingTip | null {
    const timestamp = Date.now();

    switch (pattern.response) {
      case 'objection': {
        const category = pattern.category as keyof typeof OBJECTION_HANDLERS;
        const handler = OBJECTION_HANDLERS[category];
        if (!handler) return null;

        return {
          id: randomUUID(),
          type: 'objection',
          priority: 'high',
          trigger: keyword,
          title: `Invändning: ${this.getCategoryLabel(category)}`,
          content: handler.response,
          talkingPoints: [handler.detailed, ...handler.followup.map((q) => `Följdfråga: ${q}`)],
          timestamp,
        };
      }

      case 'battlecard': {
        const competitor = patternId.charAt(0).toUpperCase() + patternId.slice(1);
        return {
          id: randomUUID(),
          type: 'battlecard',
          priority: 'high',
          trigger: keyword,
          title: `Konkurrent nämnd: ${competitor}`,
          content: `Kunden nämnde ${competitor}. Fokusera på våra unika styrkor.`,
          talkingPoints: [
            'Fråga vad de är nöjda/missnöjda med',
            'Lyft fram vår specialisering på Microsoft-stacken',
            'Dela relevanta case studies',
          ],
          timestamp,
        };
      }

      case 'offer': {
        return {
          id: randomUUID(),
          type: 'offer',
          priority: 'medium',
          trigger: keyword,
          title: `Intresse för ${keyword}`,
          content: `Kunden visar intresse för ${keyword}. Berätta om våra lösningar.`,
          talkingPoints: [
            'Fråga om deras nuvarande situation',
            'Dela use cases från liknande kunder',
            'Föreslå en demo eller pilot',
          ],
          timestamp,
        };
      }

      default:
        return null;
    }
  }

  /**
   * Get user-friendly category label
   */
  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      price: 'Pris',
      timing: 'Timing',
      competition: 'Konkurrens',
      need: 'Behov',
      trust: 'Förtroende',
    };
    return labels[category] || category;
  }

  /**
   * Detect objection and return structured response
   */
  detectObjection(text: string): ObjectionDetected | null {
    const textLower = text.toLowerCase();

    // Check for objection keywords
    for (const [category, handler] of Object.entries(OBJECTION_HANDLERS)) {
      const pattern = TRIGGER_PATTERNS[category];
      if (!pattern) continue;

      for (const keyword of pattern.keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          return {
            id: randomUUID(),
            type: category,
            category: category as any,
            originalText: text,
            responseShort: handler.response,
            responseDetailed: handler.detailed,
            followupQuestions: handler.followup,
            timestamp: Date.now(),
          };
        }
      }
    }

    return null;
  }

  // --------------------------------------------------------------------------
  // SENTIMENT ANALYSIS (OpenAI)
  // --------------------------------------------------------------------------

  /**
   * Analyze customer sentiment using OpenAI
   */
  async analyzeSentiment(
    sessionId: string,
    text: string,
    conversationHistory: string
  ): Promise<SentimentResult | null> {
    // Throttle analysis - max once per 2 seconds per session
    const lastTime = this.lastAnalysisTime.get(sessionId) || 0;
    const now = Date.now();
    if (now - lastTime < this.ANALYSIS_THROTTLE_MS) {
      return null; // Skip analysis, too soon
    }

    this.lastAnalysisTime.set(sessionId, now);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Du är en expert på att analysera kunders sentiment och köpintresse i säljsamtal.

Analysera kundens senaste uttalande och bedöm:
1. Sentiment: positive, neutral, eller negative
2. Interest level: 0-100 (0 = inget intresse, 100 = mycket hög köpvilja)
3. Confidence: 0-1 (hur säker är du på analysen)

Svara ENDAST med JSON i detta format:
{"sentiment": "positive|neutral|negative", "interestLevel": 0-100, "confidence": 0-1}`,
          },
          {
            role: 'user',
            content: `Tidigare samtalshistorik:
${conversationHistory}

Kundens senaste uttalande:
"${text}"

Analysera sentiment och köpintresse:`,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      // Parse JSON response
      const result = JSON.parse(content);
      return {
        sentiment: result.sentiment,
        interestLevel: Math.max(0, Math.min(100, result.interestLevel)),
        confidence: Math.max(0, Math.min(1, result.confidence)),
      };
    } catch (error) {
      console.error('[CoachingEngine] Sentiment analysis failed:', error);
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // SILENCE DETECTION
  // --------------------------------------------------------------------------

  /**
   * Generate silence suggestion
   */
  generateSilenceSuggestion(duration: number): {
    suggestion: string;
    examples: string[];
  } {
    if (duration < 15) {
      return {
        suggestion: 'Normal paus - låt kunden tänka.',
        examples: [],
      };
    }

    if (duration < 30) {
      return {
        suggestion: 'Längre tystnad - ställ en öppen fråga för att få kunden att prata.',
        examples: [
          'Vad tänker du om det här?',
          'Hur ser era processer ut idag?',
          'Finns det något ni undrar över?',
        ],
      };
    }

    return {
      suggestion: 'Lång tystnad - sammanfatta och fråga om nästa steg.',
      examples: [
        'Låt mig sammanfatta vad vi pratat om...',
        'Vad skulle vara mest värdefullt för er att utforska vidare?',
        'Skulle det vara intressant att boka ett uppföljningsmöte?',
      ],
    };
  }

  // --------------------------------------------------------------------------
  // CONTEXT ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Analyze conversation for pain points
   */
  extractPainPoints(text: string): string[] {
    const painPointKeywords = [
      'problem',
      'utmaning',
      'svårt',
      'tar tid',
      'ineffektivt',
      'frustrerat',
      'inte fungerar',
      'krångligt',
    ];

    const textLower = text.toLowerCase();
    const painPoints: string[] = [];

    for (const keyword of painPointKeywords) {
      if (textLower.includes(keyword)) {
        // Extract sentence containing keyword
        const sentences = text.split(/[.!?]/);
        const matchingSentence = sentences.find((s) => s.toLowerCase().includes(keyword));
        if (matchingSentence && matchingSentence.trim().length > 10) {
          painPoints.push(matchingSentence.trim());
        }
      }
    }

    return painPoints;
  }

  /**
   * Detect buying signals
   */
  detectBuyingSignals(text: string): string[] {
    const buyingSignalKeywords = [
      'hur mycket kostar',
      'när kan vi börja',
      'låter intressant',
      'vill veta mer',
      'kan vi testa',
      'demo',
      'pilot',
      'nästa steg',
      'gå vidare',
      'ska vi boka',
    ];

    const textLower = text.toLowerCase();
    const signals: string[] = [];

    for (const keyword of buyingSignalKeywords) {
      if (textLower.includes(keyword)) {
        signals.push(`Köpsignal: "${keyword}"`);
      }
    }

    return signals;
  }

  // --------------------------------------------------------------------------
  // SELLER COACHING (NEW)
  // --------------------------------------------------------------------------

  /**
   * Analyze seller's speech and provide coaching tips
   */
  async analyzeSellerSpeech(text: string, session: SessionState): Promise<CoachingTip[]> {
    const tips: CoachingTip[] = [];

    // 1. Question technique analysis
    const questionTips = this.analyzeQuestionQuality(text);
    tips.push(...questionTips);

    // 2. Filler words and apologetic language
    const languageTips = this.analyzeLanguagePatterns(text);
    tips.push(...languageTips);

    // 3. Feature vs benefit language
    const benefitTips = this.analyzeValueLanguage(text);
    tips.push(...benefitTips);

    // 4. Talk time balance check
    const balanceTip = this.checkTalkTimeBalance(session);
    if (balanceTip) tips.push(balanceTip);

    // Limit to max 2 tips to avoid overwhelming the seller
    return tips.slice(0, 2);
  }

  /**
   * Analyze question quality (open vs closed questions)
   */
  private analyzeQuestionQuality(text: string): CoachingTip[] {
    const tips: CoachingTip[] = [];
    const textLower = text.toLowerCase();

    // Open question patterns (good)
    const openQuestions = [
      'hur', 'vad', 'varför', 'berätta', 'förklara', 'vilka',
      'på vilket sätt', 'kan du beskriva'
    ];

    // Closed question patterns (less ideal for discovery)
    const closedQuestions = ['är', 'har ni', 'kan ni', 'vill ni', 'skulle ni'];

    const hasOpenQuestion = openQuestions.some(q => textLower.includes(q + ' '));
    const hasClosedQuestion = closedQuestions.some(q => textLower.includes(q));
    const endsWithQuestionMark = text.trim().endsWith('?');

    if (hasOpenQuestion && endsWithQuestionMark) {
      tips.push({
        id: randomUUID(),
        type: 'suggestion',
        priority: 'low',
        trigger: 'open question',
        title: '👍 Bra öppen fråga',
        content: 'Du ställde en öppen fråga som låter kunden utveckla sitt svar.',
        talkingPoints: [
          'Fortsätt ställa "hur", "vad", "varför"-frågor',
          'Lyssna aktivt på svaret'
        ],
        timestamp: Date.now(),
      });
    } else if (hasClosedQuestion && endsWithQuestionMark && !hasOpenQuestion) {
      tips.push({
        id: randomUUID(),
        type: 'suggestion',
        priority: 'medium',
        trigger: 'closed question',
        title: '💡 Överväg öppen fråga',
        content: 'Du ställde en stängd fråga (ja/nej). Överväg en öppen fråga för mer information.',
        talkingPoints: [
          'Istället för "Har ni problem med X?"',
          'Fråga: "Hur ser era utmaningar med X ut?"'
        ],
        timestamp: Date.now(),
      });
    }

    return tips;
  }

  /**
   * Analyze language patterns (filler words, apologetic language)
   */
  private analyzeLanguagePatterns(text: string): CoachingTip[] {
    const tips: CoachingTip[] = [];
    const textLower = text.toLowerCase();

    // Filler words
    const fillerWords = ['eh', 'öhh', 'liksom', 'typ', 'alltså', 'asså'];
    const fillerCount = fillerWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (text.match(regex) || []).length;
    }, 0);

    if (fillerCount >= 3) {
      tips.push({
        id: randomUUID(),
        type: 'warning',
        priority: 'medium',
        trigger: 'filler words',
        title: '⚠️ Många fyllnadsord',
        content: `Du använde ${fillerCount} fyllnadsord (eh, liksom, typ). Pausa istället.`,
        talkingPoints: [
          'Ta en paus istället för "eh" eller "liksom"',
          'Tystnad är okej - det visar eftertanke'
        ],
        timestamp: Date.now(),
      });
    }

    // Apologetic language
    const apologeticPhrases = [
      'ledsen men',
      'tyvärr',
      'kanske',
      'typ som',
      'ganska',
      'lite grann'
    ];

    const hasApologeticLanguage = apologeticPhrases.some(phrase =>
      textLower.includes(phrase)
    );

    if (hasApologeticLanguage) {
      tips.push({
        id: randomUUID(),
        type: 'suggestion',
        priority: 'medium',
        trigger: 'apologetic language',
        title: '💪 Använd självsäkert språk',
        content: 'Undvik apologetiskt språk som "kanske", "tyvärr", "lite grann".',
        talkingPoints: [
          'Istället för: "Det är kanske bra"',
          'Säg: "Det är utmärkt för er situation"'
        ],
        timestamp: Date.now(),
      });
    }

    return tips;
  }

  /**
   * Analyze value language (feature vs benefit)
   */
  private analyzeValueLanguage(text: string): CoachingTip[] {
    const tips: CoachingTip[] = [];
    const textLower = text.toLowerCase();

    // Feature-focused language
    const featureWords = ['vi har', 'vi erbjuder', 'vi kan', 'funktionen', 'egenskapen'];
    const hasFeatureLanguage = featureWords.some(word => textLower.includes(word));

    // Benefit-focused language
    const benefitWords = ['ni får', 'ni kan', 'ni slipper', 'det sparar', 'det ger er'];
    const hasBenefitLanguage = benefitWords.some(word => textLower.includes(word));

    // Technical jargon (might confuse customer)
    const jargonWords = ['api', 'sso', 'sdk', 'saas', 'backend', 'frontend'];
    const hasJargon = jargonWords.some(word => textLower.includes(word));

    if (hasFeatureLanguage && !hasBenefitLanguage) {
      tips.push({
        id: randomUUID(),
        type: 'suggestion',
        priority: 'medium',
        trigger: 'feature language',
        title: '💡 Fokusera på nyttan',
        content: 'Du nämnde en feature. Koppla till kundens affärsnytta.',
        talkingPoints: [
          'Från: "Vi har 99.9% uptime"',
          'Till: "Ni slipper systemavbrott som kostar produktivitet"',
          'Fråga: "Hur påverkar systemavbrott er verksamhet idag?"'
        ],
        timestamp: Date.now(),
      });
    }

    if (hasJargon) {
      tips.push({
        id: randomUUID(),
        type: 'suggestion',
        priority: 'low',
        trigger: 'technical jargon',
        title: '🗣️ Förenkla språket',
        content: 'Du använde teknisk jargong. Förklara i kundens termer.',
        talkingPoints: [
          'Istället för: "Vi har SSO med SAML 2.0"',
          'Säg: "Era medarbetare loggar in en gång och får tillgång till allt"'
        ],
        timestamp: Date.now(),
      });
    }

    return tips;
  }

  /**
   * Check talk time balance (seller should talk ~30%, customer ~70%)
   */
  private checkTalkTimeBalance(session: SessionState): CoachingTip | null {
    const recentSegments = session.segments.slice(-10); // Last 10 segments
    if (recentSegments.length < 5) return null; // Need enough data

    const sellerSegments = recentSegments.filter(s => s.speaker === 'seller');
    const customerSegments = recentSegments.filter(s => s.speaker === 'customer');

    const sellerWords = sellerSegments.reduce((sum, s) => sum + s.text.split(' ').length, 0);
    const customerWords = customerSegments.reduce((sum, s) => sum + s.text.split(' ').length, 0);

    const totalWords = sellerWords + customerWords;
    if (totalWords === 0) return null;

    const sellerPercentage = (sellerWords / totalWords) * 100;

    // Seller is talking too much (> 50%)
    if (sellerPercentage > 50) {
      return {
        id: randomUUID(),
        type: 'warning',
        priority: 'high',
        trigger: 'talk time imbalance',
        title: '⚠️ Du pratar för mycket',
        content: `Du har pratat ${Math.round(sellerPercentage)}% av tiden de senaste meddelandena.`,
        talkingPoints: [
          'Mål: Kunden pratar 70%, du 30%',
          'Ställ en öppen fråga och lyssna aktivt',
          'Låt kunden utveckla sina svar'
        ],
        timestamp: Date.now(),
      };
    }

    // Seller is hardly talking (< 15%)
    if (sellerPercentage < 15) {
      return {
        id: randomUUID(),
        type: 'suggestion',
        priority: 'medium',
        trigger: 'too little talk time',
        title: '💬 Engagera mer i samtalet',
        content: `Du har bara pratat ${Math.round(sellerPercentage)}% av tiden.`,
        talkingPoints: [
          'Dela insights och expertis',
          'Validera kundens utmaningar',
          'Föreslå lösningar baserat på vad du hört'
        ],
        timestamp: Date.now(),
      };
    }

    return null;
  }

  // --------------------------------------------------------------------------
  // RAG (RETRIEVAL-AUGMENTED GENERATION) FOR DOCUMENT-BASED COACHING
  // --------------------------------------------------------------------------

  /**
   * Create a coaching tip based on RAG (document search + AI summarization)
   */
  private async createRAGTip(
    trigger: any,
    keyword: string,
    customerQuestion: string,
    session: SessionState
  ): Promise<CoachingTip | null> {
    try {
      console.log(`[CoachingEngine] RAG trigger activated: "${trigger.title}" for keyword: "${keyword}"`);

      // 1. Search documents for relevant context
      const documentResult = await this.searchDocumentsForContext(
        trigger.document_query,
        session.productId!,
        session.userId
      );

      if (!documentResult) {
        console.log('[CoachingEngine] No documents found, falling back to standard tip');
        // Fallback to standard tip if no documents found
        return {
          id: randomUUID(),
          type: trigger.tip_type || 'suggestion',
          priority: trigger.priority || 'high',
          trigger: keyword,
          title: trigger.title,
          content: trigger.content || 'Ingen dokumentation hittades.',
          timestamp: Date.now(),
        };
      }

      // 2. Summarize context (hybrid approach)
      const summarized = await this.summarizeDocumentContext(
        documentResult.content,
        customerQuestion,
        documentResult.wordCount
      );

      // 3. Create coaching tip with RAG content
      const tip: CoachingTip = {
        id: randomUUID(),
        type: trigger.tip_type || 'suggestion',
        priority: trigger.priority || 'high',
        trigger: keyword,
        title: trigger.title,
        content: summarized.content,
        talkingPoints: this.extractBulletPoints(summarized.content),
        fullContext: summarized.fullContext, // Include full context for expandable view
        timestamp: Date.now(),
      };

      console.log(`[CoachingEngine] RAG tip created with ${documentResult.wordCount} words from documents`);

      return tip;
    } catch (error) {
      console.error('[CoachingEngine] Error creating RAG tip:', error);
      return null;
    }
  }

  /**
   * Search documents for relevant context based on query
   * Uses vector similarity search in Supabase
   */
  async searchDocumentsForContext(
    query: string,
    productId: string,
    userId: string
  ): Promise<{ content: string; wordCount: number } | null> {
    try {
      // 1. Create embedding for the search query
      const embeddingResponse = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query,
      });

      const queryEmbedding = embeddingResponse.data[0].embedding;

      // 2. Vector similarity search in Supabase
      const { data: matches, error } = await this.supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.78,
        match_count: 3,
        filter_product_id: productId,
        filter_user_id: userId,
      });

      if (error) {
        console.error('[CoachingEngine] Document search error:', error);
        return null;
      }

      if (!matches || matches.length === 0) {
        console.log('[CoachingEngine] No relevant documents found for query:', query);
        return null;
      }

      // 3. Combine relevant chunks
      const combinedContent = matches
        .map((m: any) => m.content)
        .join('\n\n');

      const wordCount = combinedContent.split(' ').length;

      console.log(
        `[CoachingEngine] Found ${matches.length} document chunks (${wordCount} words) for query: "${query}"`
      );

      return {
        content: combinedContent,
        wordCount,
      };
    } catch (error) {
      console.error('[CoachingEngine] Error searching documents:', error);
      return null;
    }
  }

  /**
   * Summarize document context using AI (for long texts)
   * Hybrid approach: short texts returned directly, long texts summarized
   */
  async summarizeDocumentContext(
    documentContext: string,
    customerQuestion: string,
    wordCount: number
  ): Promise<{ content: string; fullContext?: string }> {
    // Hybrid approach: If context is short (< 150 words), return directly
    if (wordCount < 150) {
      return {
        content: documentContext,
      };
    }

    // For longer contexts, use AI to summarize
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Du är en säljassistent som hjälper säljare under samtal. Din uppgift är att sammanfatta relevant information från dokument så att säljaren snabbt kan använda den.

Regler:
- Svara på svenska
- Var koncis (max 4 punkter med bullet points)
- Fokusera på det som är mest relevant för kundens fråga
- Använd tydliga, konkreta formuleringar
- Inkludera specifika siffror/detaljer om tillgängliga
- Föreslå ett kort svar säljaren kan ge`,
          },
          {
            role: 'user',
            content: `Kundens fråga: "${customerQuestion}"

Relevant information från dokument:
${documentContext}

Sammanfatta informationen koncist med fokus på kundens fråga.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const summary = completion.choices[0].message.content || documentContext;

      return {
        content: summary,
        fullContext: documentContext, // Include full context for expandable view
      };
    } catch (error) {
      console.error('[CoachingEngine] Error summarizing context:', error);
      // Fallback to raw context if AI fails
      return {
        content: documentContext,
      };
    }
  }

  /**
   * Extract bullet points from text (for talking points)
   */
  private extractBulletPoints(text: string): string[] {
    const lines = text.split('\n');
    const bullets: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Look for lines starting with bullet markers
      if (trimmed.match(/^[•\-\*]\s+/)) {
        bullets.push(trimmed.replace(/^[•\-\*]\s+/, ''));
      }
    }

    // If no bullets found, return first 3 sentences
    if (bullets.length === 0) {
      const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 0);
      return sentences.slice(0, 3).map((s) => s.trim());
    }

    return bullets;
  }
}
