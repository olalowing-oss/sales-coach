/**
 * Meeting Assistant AI Services
 *
 * Integrates CoachingEngine, OpenAI, and RAG for intelligent meeting assistance.
 */

import OpenAI from 'openai';
import { supabase } from './supabase';
import type { MeetingNote, DiscoveryItem } from '../store/meetingAssistantStore';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// ============================================================================
// ENTITY DETECTION (Enhanced with OpenAI)
// ============================================================================

export interface DetectedEntities {
  budget?: number;
  timeline?: string;
  painPoint?: string;
  competitor?: string;
  decision_maker?: string;
  key_requirement?: string;
}

export async function detectEntities(text: string): Promise<DetectedEntities | undefined> {
  try {
    // First try simple regex patterns (fast)
    const simpleEntities = detectEntitiesSimple(text);

    // If we found something significant, return it
    if (simpleEntities && (simpleEntities.budget || simpleEntities.decision_maker)) {
      return simpleEntities;
    }

    // For complex text, use OpenAI (more accurate but slower)
    const aiEntities = await detectEntitiesWithAI(text);

    // Merge results
    return {
      ...simpleEntities,
      ...aiEntities
    };
  } catch (error) {
    console.error('[MeetingAI] Entity detection error:', error);
    return detectEntitiesSimple(text);
  }
}

function detectEntitiesSimple(text: string): DetectedEntities | undefined {
  const entities: DetectedEntities = {};
  const lowerText = text.toLowerCase();

  // Budget detection
  const budgetMatch = text.match(/(\d+[\s,]*\d*)\s*(kr|kronor|sek|tkr|miljoner?)/i);
  if (budgetMatch) {
    let amount = parseInt(budgetMatch[1].replace(/[\s,]/g, ''));
    const unit = budgetMatch[2].toLowerCase();

    if (unit.includes('tkr')) amount *= 1000;
    if (unit.includes('miljon')) amount *= 1000000;

    entities.budget = amount;
  }

  // Timeline detection
  const timelineKeywords = ['q1', 'q2', 'q3', 'q4', 'kvartal'];
  const timelineMatch = text.match(/(q[1-4]|kvartal \d|inom \d+ (vecko|månad|år))/i);
  if (timelineMatch || timelineKeywords.some(kw => lowerText.includes(kw))) {
    entities.timeline = timelineMatch ? timelineMatch[0] : text.substring(0, 50);
  }

  // Pain point detection
  const painKeywords = ['problem', 'utmaning', 'svårt', 'manuell', 'tidskrävande', 'ineffektiv'];
  if (painKeywords.some(kw => lowerText.includes(kw))) {
    entities.painPoint = text;
  }

  // Competitor detection
  const competitors = ['salesforce', 'hubspot', 'pipedrive', 'dynamics', 'zendesk', 'intercom'];
  const competitor = competitors.find(c => lowerText.includes(c));
  if (competitor) {
    entities.competitor = competitor;
  }

  // Decision maker detection
  const decisionMakerPatterns = [
    /\b(cto|ceo|vd|it-chef|ekonomichef|cfo)\b/i,
    /(beslutsfattare|beslut fattas av|ansvarig)/i
  ];
  for (const pattern of decisionMakerPatterns) {
    const match = text.match(pattern);
    if (match) {
      entities.decision_maker = match[0];
      break;
    }
  }

  return Object.keys(entities).length > 0 ? entities : undefined;
}

async function detectEntitiesWithAI(text: string): Promise<DetectedEntities> {
  // Use OpenAI for complex entity extraction
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Extract structured information from meeting notes. Return JSON with:
- budget (number): Budget amount in SEK if mentioned
- timeline (string): Timeline/deadline if mentioned
- painPoint (string): Customer pain point if mentioned
- competitor (string): Competitor name if mentioned
- decision_maker (string): Decision maker role if mentioned
- key_requirement (string): Key requirement if mentioned

Return only valid JSON, no other text.`
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.1,
    max_tokens: 200,
    response_format: { type: 'json_object' }
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');

  // Filter out null/empty values
  return Object.fromEntries(
    Object.entries(result).filter(([_, v]) => v != null && v !== '')
  ) as DetectedEntities;
}

// ============================================================================
// TRIGGER DETECTION (from CoachingEngine patterns)
// ============================================================================

interface TriggerMatch {
  type: 'objection' | 'battlecard' | 'opportunity';
  category: string;
  keywords: string[];
  confidence: number;
}

export async function detectTriggers(
  text: string,
  productId: string,
  userId: string
): Promise<TriggerMatch[]> {
  const matches: TriggerMatch[] = [];
  const lowerText = text.toLowerCase();

  // Load triggers from database
  const { data: triggers } = await supabase
    .from('trigger_patterns')
    .select('*')
    .or(`product_id.eq.${productId},product_id.is.null`)
    .eq('user_id', userId);

  if (!triggers) return matches;

  // Check each trigger pattern
  for (const trigger of triggers) {
    const keywords = trigger.keywords || [];
    const matchedKeywords = keywords.filter((kw: string) => lowerText.includes(kw.toLowerCase()));

    if (matchedKeywords.length > 0) {
      matches.push({
        type: trigger.response_type === 'objection' ? 'objection' :
              trigger.response_type === 'battlecard' ? 'battlecard' :
              'opportunity',
        category: trigger.category || 'General',
        keywords: matchedKeywords,
        confidence: matchedKeywords.length / keywords.length
      });
    }
  }

  return matches;
}

// ============================================================================
// RAG SEARCH (Document retrieval)
// ============================================================================

export interface RAGResult {
  content: string;
  wordCount: number;
  sources: Array<{
    id: string;
    title: string;
    similarity: number;
  }>;
}

export async function searchDocumentsForContext(
  query: string,
  productId: string,
  userId: string
): Promise<RAGResult | null> {
  try {
    // 1. Create embedding for search query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 2. Vector similarity search
    // @ts-expect-error - RPC function not in types
    const result = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.78,
      match_count: 3,
      filter_product_id: productId,
      filter_user_id: userId
    });
    const { data: matches, error } = result as { data: any[] | null; error: any };

    if (error) {
      console.error('[MeetingAI] RAG search error:', error);
      return null;
    }

    if (!matches || matches.length === 0) {
      console.log('[MeetingAI] No relevant documents found');
      return null;
    }

    // 3. Combine results
    const combinedContent = matches.map((m: any) => m.content).join('\n\n');
    const wordCount = combinedContent.split(' ').length;

    const sources = matches.map((m: any) => ({
      id: m.id,
      title: m.title || 'Untitled',
      similarity: m.similarity
    }));

    console.log(`[MeetingAI] Found ${matches.length} relevant documents`);

    return {
      content: combinedContent,
      wordCount,
      sources
    };
  } catch (error) {
    console.error('[MeetingAI] RAG search failed:', error);
    return null;
  }
}

// ============================================================================
// AI SUMMARIZATION (for long RAG results)
// ============================================================================

export async function summarizeDocumentContext(
  documentContext: string,
  customerQuestion: string,
  wordCount: number
): Promise<{ content: string; fullContext?: string }> {
  // If short, return directly
  if (wordCount < 150) {
    return { content: documentContext };
  }

  // For long texts, summarize with AI
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Du är en säljassistent som hjälper säljare under kundmöten.
Sammanfatta dokumentinnehållet koncist på svenska med bullet points.
Fokusera på information som svarar på kundens fråga.
Var konkret och inkludera siffror/fakta när möjligt.
Max 4 punkter.`
        },
        {
          role: 'user',
          content: `Kundens fråga: "${customerQuestion}"\n\nDokument:\n${documentContext}`
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const summary = completion.choices[0].message.content || documentContext;

    return {
      content: summary,
      fullContext: documentContext
    };
  } catch (error) {
    console.error('[MeetingAI] Summarization failed:', error);
    return { content: documentContext };
  }
}

// ============================================================================
// QUESTION GENERATION (Context-aware)
// ============================================================================

export interface SuggestedQuestion {
  id: string;
  text: string;
  rationale: string;
  type: 'BANT' | 'Pain' | 'Product' | 'SPIN';
  priority: number;
}

export async function generateSuggestedQuestions(
  notes: MeetingNote[],
  discoveryStatus: Record<DiscoveryItem, any>,
  _productId: string
): Promise<SuggestedQuestion[]> {
  const questions: SuggestedQuestion[] = [];

  // Priority 1: Missing BANT items
  if (!discoveryStatus.budget?.completed) {
    questions.push({
      id: crypto.randomUUID(),
      text: 'Vilken budget har ni avsatt för att lösa detta problem?',
      rationale: 'Viktigt att kvalificera budget tidigt i processen',
      type: 'BANT',
      priority: 1
    });
  }

  if (!discoveryStatus.authority?.completed) {
    questions.push({
      id: crypto.randomUUID(),
      text: 'Vem är beslutsfattare för denna typ av investering?',
      rationale: 'Identifiera rätt beslutsfattare för att kunna avsluta',
      type: 'BANT',
      priority: 1
    });
  }

  if (!discoveryStatus.need?.completed) {
    questions.push({
      id: crypto.randomUUID(),
      text: 'Vilka utmaningar ser ni med er nuvarande lösning?',
      rationale: 'Förstå kundens verkliga behov och pain points',
      type: 'BANT',
      priority: 1
    });
  }

  if (!discoveryStatus.timeline?.completed) {
    questions.push({
      id: crypto.randomUUID(),
      text: 'När behöver ni ha en lösning på plats?',
      rationale: 'Fastställ tidsplan för att prioritera rätt',
      type: 'BANT',
      priority: 1
    });
  }

  // Priority 2: Quantify pain points
  const latestPainPoint = notes
    .filter(n => n.detectedEntities?.painPoint)
    .slice(-1)[0];

  if (latestPainPoint && questions.length < 3) {
    questions.push({
      id: crypto.randomUUID(),
      text: 'Hur mycket kostar er detta problem i tid eller pengar?',
      rationale: 'Kvantifiera pain point för att kunna visa ROI',
      type: 'Pain',
      priority: 2
    });

    questions.push({
      id: crypto.randomUUID(),
      text: 'Vad händer om ni inte löser detta problem?',
      rationale: 'Öka urgency genom att förstå konsekvenser',
      type: 'SPIN',
      priority: 2
    });
  }

  // Priority 3: Product fit questions
  const recentNotes = notes.slice(-3);
  const mentionedCompetitor = recentNotes.find(n => n.detectedEntities?.competitor);

  if (mentionedCompetitor && questions.length < 3) {
    const competitor = mentionedCompetitor.detectedEntities!.competitor!;
    questions.push({
      id: crypto.randomUUID(),
      text: `Vad fungerar bra med ${competitor} och vad skulle ni vilja förbättra?`,
      rationale: 'Förstå competitive positioning och differentiera',
      type: 'Product',
      priority: 3
    });
  }

  // Return top 3 questions
  return questions.slice(0, 3);
}

// ============================================================================
// COACHING TIP GENERATION (from triggers)
// ============================================================================

export interface CoachingTip {
  id: string;
  type: 'suggestion' | 'battlecard' | 'objection' | 'offer' | 'case' | 'warning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  content: string;
  talkingPoints?: string[];
  fullContext?: string;
  trigger?: string;
  timestamp: number;
}

export async function generateCoachingTips(
  text: string,
  speaker: 'customer' | 'seller' | 'observation',
  productId: string,
  userId: string
): Promise<CoachingTip[]> {
  const tips: CoachingTip[] = [];

  // Only analyze customer speech for triggers
  if (speaker !== 'customer') {
    return tips;
  }

  // Detect triggers
  const triggers = await detectTriggers(text, productId, userId);

  for (const trigger of triggers) {
    if (trigger.type === 'objection') {
      // Load objection handler
      const { data: objections } = await supabase
        .from('objection_handlers')
        .select('*')
        .or(`product_id.eq.${productId},product_id.is.null`)
        .eq('user_id', userId)
        .ilike('category', `%${trigger.category}%`)
        .limit(1)
        .single();

      if (objections) {
        tips.push({
          id: crypto.randomUUID(),
          type: 'objection',
          priority: 'high',
          title: `Invändning: ${trigger.category}`,
          content: objections.response_short || objections.response_detailed || '',
          talkingPoints: objections.response_detailed
            ? [objections.response_short, objections.response_detailed]
            : [objections.response_short],
          trigger: trigger.keywords.join(', '),
          timestamp: Date.now()
        });
      }
    } else if (trigger.type === 'battlecard') {
      // Load battlecard
      const { data: battlecard } = await supabase
        .from('battlecards')
        .select('*')
        .or(`product_id.eq.${productId},product_id.is.null`)
        .eq('user_id', userId)
        .ilike('competitor', `%${trigger.category}%`)
        .limit(1)
        .single();

      if (battlecard) {
        tips.push({
          id: crypto.randomUUID(),
          type: 'battlecard',
          priority: 'medium',
          title: `vs ${battlecard.competitor}`,
          content: battlecard.talking_points?.join('\n') || '',
          talkingPoints: battlecard.talking_points,
          trigger: trigger.keywords.join(', '),
          timestamp: Date.now()
        });
      }
    }
  }

  return tips;
}

// ============================================================================
// EXTRACT BULLET POINTS (from text)
// ============================================================================

export function extractBulletPoints(text: string): string[] {
  const lines = text.split('\n');
  const bulletPoints: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Match various bullet point formats
    const bulletMatch = trimmed.match(/^[•\-\*]\s*(.+)$/);
    if (bulletMatch) {
      bulletPoints.push(bulletMatch[1]);
      continue;
    }

    // Match numbered lists
    const numberedMatch = trimmed.match(/^\d+\.\s*(.+)$/);
    if (numberedMatch) {
      bulletPoints.push(numberedMatch[1]);
      continue;
    }
  }

  // If no bullets found, split by periods (max 5 sentences)
  if (bulletPoints.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  return bulletPoints;
}

// ============================================================================
// MEETING SUMMARY GENERATION (Final AI-generated summary)
// ============================================================================

export interface MeetingSummary {
  overview: {
    duration: number;
    noteCount: number;
    company: string;
    contactPerson?: string;
  };
  qualification: {
    budget?: {
      amount?: number;
      status: 'confirmed' | 'estimated' | 'unknown';
    };
    authority?: {
      decisionMaker?: string;
      status: 'confirmed' | 'pending' | 'unknown';
    };
    need?: {
      painPoints: string[];
      requirements: string[];
    };
    timeline?: {
      deadline?: string;
      urgency: 'high' | 'medium' | 'low';
    };
    completionRate: number;
  };
  keyInsights: string[];
  topicsDiscussed: string[];
  competitorsMentioned: string[];
  nextSteps: string[];
  dealScore: number;
  recommendedActions: string[];
  fullTranscript: string;
}

export async function generateMeetingSummary(
  notes: MeetingNote[],
  discoveryStatus: Record<DiscoveryItem, any>,
  customer: { company: string; contactPerson?: string; role?: string },
  duration: number
): Promise<MeetingSummary> {
  try {
    // Prepare context for AI
    const transcript = notes
      .map(n => `[${n.speaker.toUpperCase()}] ${n.text}`)
      .join('\n');

    const discoveryInfo = `
BANT Status:
- Budget: ${discoveryStatus.budget?.completed ? `✓ ${discoveryStatus.budget.value || 'Identified'}` : '✗ Not identified'}
- Authority: ${discoveryStatus.authority?.completed ? `✓ ${discoveryStatus.authority.value || 'Identified'}` : '✗ Not identified'}
- Need: ${discoveryStatus.need?.completed ? `✓ ${discoveryStatus.need.value || 'Identified'}` : '✗ Not identified'}
- Timeline: ${discoveryStatus.timeline?.completed ? `✓ ${discoveryStatus.timeline.value || 'Identified'}` : '✗ Not identified'}
`;

    // Call OpenAI for comprehensive summary
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Du är en säljassistent som analyserar kundmöten och skapar professionella sammanfattningar.

Analysera mötesanteckningarna och skapa en strukturerad sammanfattning med:
1. Key Insights (3-5 viktiga insikter från mötet)
2. Topics Discussed (ämnen som diskuterades)
3. Competitors Mentioned (konkurrenter som nämndes)
4. Next Steps (konkreta nästa steg, 3-5 punkter)
5. Recommended Actions (rekommenderade åtgärder för säljaren)
6. Deal Score (0-100, baserat på intresse, budget, beslutsmakt, timeline)

Svara ENDAST med valid JSON i detta format:
{
  "keyInsights": ["insight 1", "insight 2", ...],
  "topicsDiscussed": ["topic 1", "topic 2", ...],
  "competitorsMentioned": ["competitor 1", ...],
  "nextSteps": ["step 1", "step 2", ...],
  "recommendedActions": ["action 1", "action 2", ...],
  "dealScore": 75
}

Var konkret och specifik. Använd svenska.`
        },
        {
          role: 'user',
          content: `Möte med: ${customer.company}${customer.contactPerson ? ` - ${customer.contactPerson}` : ''}
Längd: ${Math.floor(duration / 60)} minuter

${discoveryInfo}

Anteckningar:
${transcript}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const aiSummary = JSON.parse(completion.choices[0].message.content || '{}');

    // Extract entities from notes
    const painPoints: string[] = [];
    const requirements: string[] = [];
    let budgetAmount: number | undefined;
    let decisionMaker: string | undefined;
    let timeline: string | undefined;

    for (const note of notes) {
      if (note.detectedEntities) {
        if (note.detectedEntities.painPoint) {
          painPoints.push(note.detectedEntities.painPoint);
        }
        if (note.detectedEntities.key_requirement) {
          requirements.push(note.detectedEntities.key_requirement);
        }
        if (note.detectedEntities.budget && !budgetAmount) {
          budgetAmount = note.detectedEntities.budget;
        }
        if (note.detectedEntities.decision_maker && !decisionMaker) {
          decisionMaker = note.detectedEntities.decision_maker;
        }
        if (note.detectedEntities.timeline && !timeline) {
          timeline = note.detectedEntities.timeline;
        }
      }
    }

    // Calculate discovery completion rate
    const completedItems = Object.values(discoveryStatus).filter(
      (item: any) => item?.completed
    ).length;
    const completionRate = (completedItems / 4) * 100;

    // Determine timeline urgency
    const timelineUrgency: 'high' | 'medium' | 'low' = timeline
      ? timeline.toLowerCase().includes('omedelbart') || timeline.toLowerCase().includes('akut')
        ? 'high'
        : timeline.toLowerCase().includes('q1') || timeline.toLowerCase().includes('snart')
        ? 'medium'
        : 'low'
      : 'low';

    return {
      overview: {
        duration,
        noteCount: notes.length,
        company: customer.company,
        contactPerson: customer.contactPerson
      },
      qualification: {
        budget: budgetAmount
          ? {
              amount: budgetAmount,
              status: discoveryStatus.budget?.completed ? 'confirmed' : 'estimated'
            }
          : { status: 'unknown' },
        authority: decisionMaker
          ? {
              decisionMaker,
              status: discoveryStatus.authority?.completed ? 'confirmed' : 'pending'
            }
          : { status: 'unknown' },
        need: {
          painPoints: [...new Set(painPoints)],
          requirements: [...new Set(requirements)]
        },
        timeline: timeline
          ? {
              deadline: timeline,
              urgency: timelineUrgency
            }
          : { urgency: 'low' },
        completionRate
      },
      keyInsights: aiSummary.keyInsights || [],
      topicsDiscussed: aiSummary.topicsDiscussed || [],
      competitorsMentioned: aiSummary.competitorsMentioned || [],
      nextSteps: aiSummary.nextSteps || [],
      dealScore: aiSummary.dealScore || 50,
      recommendedActions: aiSummary.recommendedActions || [],
      fullTranscript: transcript
    };
  } catch (error) {
    console.error('[MeetingAI] Summary generation failed:', error);

    // Fallback to simple summary
    const painPoints = notes
      .filter(n => n.detectedEntities?.painPoint)
      .map(n => n.detectedEntities!.painPoint!);

    const completedItems = Object.values(discoveryStatus).filter(
      (item: any) => item?.completed
    ).length;

    return {
      overview: {
        duration,
        noteCount: notes.length,
        company: customer.company,
        contactPerson: customer.contactPerson
      },
      qualification: {
        budget: { status: 'unknown' },
        authority: { status: 'unknown' },
        need: {
          painPoints: [...new Set(painPoints)],
          requirements: []
        },
        timeline: { urgency: 'low' },
        completionRate: (completedItems / 4) * 100
      },
      keyInsights: ['Mötet genomfört', 'Anteckningar sparade'],
      topicsDiscussed: [],
      competitorsMentioned: [],
      nextSteps: ['Följ upp med kunden'],
      dealScore: 50,
      recommendedActions: ['Komplettera BANT-kvalificering'],
      fullTranscript: notes.map(n => `[${n.speaker}] ${n.text}`).join('\n')
    };
  }
}
