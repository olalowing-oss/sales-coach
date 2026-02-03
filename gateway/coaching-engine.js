/**
 * Coaching Engine
 *
 * Real-time coaching analysis and event generation.
 * Analyzes transcripts and generates coaching tips, objection handlers,
 * sentiment analysis, and silence detection.
 */
import OpenAI from 'openai';
import { randomUUID } from 'crypto';
// ============================================================================
// TRIGGER PATTERNS (lightweight version for Gateway)
// ============================================================================
const TRIGGER_PATTERNS = {
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
const OBJECTION_HANDLERS = {
    price: {
        response: 'Fokusera på ROI och värde, inte bara pris.',
        detailed: 'Vad kostar det er att inte ha detta? Beräkna värdet av tidsbesparingen och ökad produktivitet.',
        followup: [
            'Vad kostar er nuvarande lösning per månad?',
            'Hur mycket tid skulle ni spara per medarbetare?',
            'Har ni räknat på kostnaden för ineffektivitet?',
        ],
    },
    timing: {
        response: 'Ifrågasätt - vad händer om ni väntar?',
        detailed: 'Förstår att timing är viktig. Men tänk på vad det kostar att vänta - förlorad produktivitet, konkurrensfördelar.',
        followup: [
            'Vad händer med era mål om ni väntar?',
            'Finns det något som hindrar er från att börja nu?',
            'Vad skulle få er att prioritera detta högre?',
        ],
    },
    competition: {
        response: 'Fråga om nuvarande lösning verkligen täcker behoven.',
        detailed: 'Förstår att ni har ett befintligt avtal. Men uppfyller det alla era behov? Kan vi komplettera?',
        followup: [
            'Vad är ni nöjda med i nuvarande lösning?',
            'Finns det något som saknas?',
            'Skulle ni vara öppna för en jämförelse?',
        ],
    },
    need: {
        response: 'Utforska dolda behov - vad är inte synligt ännu?',
        detailed: 'Ofta upptäcker man behovet först när man ser möjligheterna. Låt mig visa ett exempel...',
        followup: [
            'Hur mycket tid lägger ni på [problem]?',
            'Vad skulle hända om ni kunde [värde]?',
            'Har ni jämfört med branschstandard?',
        ],
    },
    trust: {
        response: 'Dela referenser och case studies.',
        detailed: 'Förstår era farhågor. Låt mig dela hur andra liknande organisationer lyckats...',
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
    constructor(config) {
        this.lastAnalysisTime = new Map();
        this.ANALYSIS_THROTTLE_MS = 2000; // Max 1 analysis per 2s per session
        this.openai = new OpenAI({
            apiKey: config.openaiApiKey,
        });
    }
    // --------------------------------------------------------------------------
    // TRIGGER DETECTION
    // --------------------------------------------------------------------------
    /**
     * Detect triggers in text and generate coaching tips
     */
    detectTriggersAndGenerateTips(text, speaker, session) {
        // Only analyze customer speech for objections/battlecards
        // Also analyze 'unknown' speaker since we don't have speaker diarization yet
        if (speaker === 'seller') {
            return [];
        }
        const tips = [];
        const textLower = text.toLowerCase();
        // Check each trigger pattern
        for (const [patternId, pattern] of Object.entries(TRIGGER_PATTERNS)) {
            for (const keyword of pattern.keywords) {
                if (textLower.includes(keyword.toLowerCase())) {
                    const tip = this.createTipFromPattern(patternId, pattern, keyword, text);
                    if (tip) {
                        tips.push(tip);
                    }
                    // Max 2 tips per message to avoid overwhelming
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
    createTipFromPattern(patternId, pattern, keyword, originalText) {
        const timestamp = Date.now();
        switch (pattern.response) {
            case 'objection': {
                const category = pattern.category;
                const handler = OBJECTION_HANDLERS[category];
                if (!handler)
                    return null;
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
    getCategoryLabel(category) {
        const labels = {
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
    detectObjection(text) {
        const textLower = text.toLowerCase();
        // Check for objection keywords
        for (const [category, handler] of Object.entries(OBJECTION_HANDLERS)) {
            const pattern = TRIGGER_PATTERNS[category];
            if (!pattern)
                continue;
            for (const keyword of pattern.keywords) {
                if (textLower.includes(keyword.toLowerCase())) {
                    return {
                        id: randomUUID(),
                        type: category,
                        category: category,
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
    async analyzeSentiment(sessionId, text, conversationHistory) {
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
            if (!content)
                return null;
            // Parse JSON response
            const result = JSON.parse(content);
            return {
                sentiment: result.sentiment,
                interestLevel: Math.max(0, Math.min(100, result.interestLevel)),
                confidence: Math.max(0, Math.min(1, result.confidence)),
            };
        }
        catch (error) {
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
    generateSilenceSuggestion(duration) {
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
    extractPainPoints(text) {
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
        const painPoints = [];
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
    detectBuyingSignals(text) {
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
        const signals = [];
        for (const keyword of buyingSignalKeywords) {
            if (textLower.includes(keyword)) {
                signals.push(`Köpsignal: "${keyword}"`);
            }
        }
        return signals;
    }
}
