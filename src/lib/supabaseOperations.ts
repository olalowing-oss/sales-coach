import { supabase, isSupabaseConfigured } from './supabase';
import type { CallSession, TranscriptSegment, CoachingTip } from '../types';
import type { Database } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

type DbSession = Database['public']['Tables']['call_sessions']['Row'];
type DbSessionInsert = Database['public']['Tables']['call_sessions']['Insert'];
type DbSegment = Database['public']['Tables']['transcript_segments']['Insert'];
type DbTip = Database['public']['Tables']['session_coaching_tips']['Insert'];

// Helper function to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Helper function to ensure ID is a valid UUID
function ensureUUID(id: string): string {
  return isValidUUID(id) ? id : uuidv4();
}

// ============================================
// SESSION OPERATIONS
// ============================================

export async function saveSessionToDb(session: CallSession): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    const sessionData: DbSessionInsert = {
      id: session.id,
      user_id: user.id,
      status: session.status,
      started_at: session.startedAt.toISOString(),
      ended_at: session.endedAt?.toISOString() || null,
      customer_name: session.customer?.name || null,
      customer_company: session.customer?.company || null,
      customer_role: session.customer?.role || null,
      full_transcript: session.transcript.fullText || null,
      duration_seconds: Math.round(session.transcript.duration || 0),
      sentiment: null, // TODO: Calculate from analytics
      topics: session.analytics.topicsDiscussed || []
    };

    const { data, error } = await supabase
      .from('call_sessions')
      .upsert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Error saving session:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error in saveSessionToDb:', error);
    return null;
  }
}

export async function saveSegmentToDb(
  sessionId: string,
  segment: TranscriptSegment
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const segmentData: DbSegment = {
      id: segment.id,
      session_id: sessionId,
      text: segment.text,
      timestamp_ms: segment.timestamp,
      speaker: segment.speaker,
      confidence: segment.confidence,
      is_final: segment.isFinal
    };

    const { error } = await supabase
      .from('transcript_segments')
      .insert(segmentData);

    if (error) {
      console.error('Error saving segment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveSegmentToDb:', error);
    return false;
  }
}

export async function saveTipToDb(
  sessionId: string,
  tip: CoachingTip
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const tipData: DbTip = {
      id: tip.id,
      session_id: sessionId,
      type: tip.type,
      priority: tip.priority,
      trigger_keyword: tip.trigger,
      title: tip.title,
      content: tip.content,
      talking_points: tip.talkingPoints || null,
      was_dismissed: tip.dismissed,
      related_offer_id: tip.relatedOffer?.id || null,
      related_case_id: tip.relatedCase?.id || null
    };

    const { error } = await supabase
      .from('session_coaching_tips')
      .insert(tipData);

    if (error) {
      console.error('Error saving tip:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveTipToDb:', error);
    return false;
  }
}

export async function loadSessionsFromDb(limit = 50): Promise<DbSession[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    // User is already authenticated via AuthContext

    const { data, error } = await supabase
      .from('call_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error loading sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in loadSessionsFromDb:', error);
    return [];
  }
}

export async function loadSessionSegments(sessionId: string): Promise<TranscriptSegment[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('transcript_segments')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp_ms', { ascending: true });

    if (error) {
      console.error('Error loading segments:', error);
      return [];
    }

    return data.map(seg => ({
      id: seg.id,
      text: seg.text,
      timestamp: seg.timestamp_ms,
      speaker: (seg.speaker as 'seller' | 'customer' | 'unknown') || 'unknown',
      confidence: seg.confidence || 0,
      isFinal: seg.is_final ?? true
    }));
  } catch (error) {
    console.error('Error in loadSessionSegments:', error);
    return [];
  }
}

export async function deleteSessionFromDb(sessionId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('call_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSessionFromDb:', error);
    return false;
  }
}

export async function saveSessionAnalysisToDb(
  sessionId: string,
  analysis: any
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('call_sessions')
      .update({
        industry: analysis.industry || null,
        company_size: analysis.companySize || null,
        call_purpose: analysis.callPurpose || null,
        call_outcome: analysis.callOutcome || null,
        interest_level: analysis.interestLevel || null,
        estimated_value: analysis.estimatedValue || null,
        decision_timeframe: analysis.decisionTimeframe || null,
        probability: analysis.probability || null,
        products_discussed: analysis.productsDiscussed || null,
        competitors_mentioned: analysis.competitorsMentioned || null,
        objections_raised: analysis.objectionsRaised || null,
        pain_points: analysis.painPoints || null,
        next_steps: analysis.nextSteps || null,
        follow_up_date: analysis.followUpDate ? new Date(analysis.followUpDate).toISOString() : null,
        notes: analysis.notes || null,
        ai_summary: analysis.aiSummary || null,
        key_topics: analysis.keyTopics || null,
        analyzed_at: new Date().toISOString(),
        is_analyzed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error saving analysis:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveSessionAnalysisToDb:', error);
    return false;
  }
}

// ============================================
// COACHING DATA OPERATIONS
// ============================================

export async function loadTriggerPatternsFromDb(productId?: string | null) {
  if (!isSupabaseConfigured()) return null;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    let query = supabase
      .from('trigger_patterns')
      .select('*')
      .eq('user_id', user.id);

    // Filter by product if provided
    if (productId) {
      query = query.or(`product_id.eq.${productId},product_id.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading triggers:', error);
      return null;
    }

    // Convert to Record format
    const patterns: Record<string, any> = {};
    data.forEach(row => {
      patterns[row.id] = {
        keywords: row.keywords,
        response: row.response_type,
        category: row.category,
        productId: row.product_id
      };
    });

    // DEBUG: Log loaded trigger data
    console.log('📥 Loaded triggers from DB:', {
      count: data.length,
      sampleRows: data.slice(0, 3).map(row => ({
        id: row.id,
        product_id: row.product_id,
        product_id_type: typeof row.product_id
      })),
      uniqueProductIds: [...new Set(data.map(row => row.product_id || 'null'))]
    });

    return patterns;
  } catch (error) {
    console.error('Error in loadTriggerPatternsFromDb:', error);
    return null;
  }
}

export async function syncTriggerPatternsToDb(patterns: Record<string, any>) {
  if (!isSupabaseConfigured()) return false;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    // Delete existing user's patterns
    await supabase.from('trigger_patterns').delete().eq('user_id', user.id);

    // Insert new - ensure all IDs are valid UUIDs
    const insertData = Object.entries(patterns).map(([id, pattern]) => ({
      id: ensureUUID(id),
      user_id: user.id,
      keywords: pattern.keywords,
      response_type: pattern.response,
      category: pattern.category || null,
      product_id: pattern.productId || null
    }));

    const { error } = await supabase
      .from('trigger_patterns')
      .insert(insertData);

    if (error) {
      console.error('Error syncing triggers:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in syncTriggerPatternsToDb:', error);
    return false;
  }
}

// ============================================
// BATTLECARDS
// ============================================

export async function loadBattlecardsFromDb(productId?: string | null) {
  if (!isSupabaseConfigured()) return null;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    let query = supabase
      .from('battlecards')
      .select('*')
      .eq('user_id', user.id);

    // Filter by product if provided
    if (productId) {
      query = query.or(`product_id.eq.${productId},product_id.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading battlecards:', error);
      return null;
    }

    return data.map(row => ({
      id: row.id,
      competitor: row.competitor,
      theirStrengths: row.their_strengths,
      theirWeaknesses: row.their_weaknesses,
      ourAdvantages: row.our_advantages,
      talkingPoints: row.talking_points,
      commonObjections: row.common_objections || [],
      productId: row.product_id
    }));
  } catch (error) {
    console.error('Error in loadBattlecardsFromDb:', error);
    return null;
  }
}

export async function syncBattlecardsToDb(battlecards: any[]) {
  if (!isSupabaseConfigured()) return false;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    // Delete existing user's battlecards
    await supabase.from('battlecards').delete().eq('user_id', user.id);

    // Insert new - ensure all IDs are valid UUIDs
    const insertData = battlecards.map(bc => ({
      id: ensureUUID(bc.id),
      user_id: user.id,
      competitor: bc.competitor,
      their_strengths: bc.theirStrengths,
      their_weaknesses: bc.theirWeaknesses,
      our_advantages: bc.ourAdvantages,
      talking_points: bc.talkingPoints,
      common_objections: bc.commonObjections || [],
      product_id: bc.productId || null
    }));

    const { error } = await supabase
      .from('battlecards')
      .insert(insertData);

    if (error) {
      console.error('Error syncing battlecards:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in syncBattlecardsToDb:', error);
    return false;
  }
}

// ============================================
// OBJECTION HANDLERS
// ============================================

export async function loadObjectionHandlersFromDb(productId?: string | null) {
  if (!isSupabaseConfigured()) return null;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    let query = supabase
      .from('objection_handlers')
      .select('*')
      .eq('user_id', user.id);

    // Filter by product if provided
    if (productId) {
      query = query.or(`product_id.eq.${productId},product_id.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading objections:', error);
      return null;
    }

    return data.map(row => ({
      id: row.id,
      objection: row.objection,
      triggers: row.triggers,
      category: row.category,
      responses: {
        short: row.response_short,
        detailed: row.response_detailed,
        followUpQuestions: row.followup_questions
      },
      productId: row.product_id
    }));
  } catch (error) {
    console.error('Error in loadObjectionHandlersFromDb:', error);
    return null;
  }
}

export async function syncObjectionHandlersToDb(handlers: any[]) {
  if (!isSupabaseConfigured()) return false;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    // Delete existing user's objection handlers
    await supabase.from('objection_handlers').delete().eq('user_id', user.id);

    // Insert new - ensure all IDs are valid UUIDs
    const insertData = handlers.map(oh => ({
      id: ensureUUID(oh.id),
      user_id: user.id,
      objection: oh.objection,
      triggers: oh.triggers,
      category: oh.category,
      response_short: oh.responses.short,
      response_detailed: oh.responses.detailed,
      followup_questions: oh.responses.followUpQuestions,
      product_id: oh.productId || null
    }));

    const { error } = await supabase
      .from('objection_handlers')
      .insert(insertData);

    if (error) {
      console.error('Error syncing objections:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in syncObjectionHandlersToDb:', error);
    return false;
  }
}

// ============================================
// CASE STUDIES
// ============================================

export async function loadCaseStudiesFromDb(productId?: string | null) {
  if (!isSupabaseConfigured()) return null;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    let query = supabase
      .from('case_studies')
      .select('*')
      .eq('user_id', user.id);

    // Filter by product if provided
    if (productId) {
      query = query.or(`product_id.eq.${productId},product_id.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading cases:', error);
      return null;
    }

    return data.map(row => ({
      id: row.id,
      customer: row.customer,
      industry: row.industry,
      challenge: row.challenge,
      solution: row.solution,
      results: row.results,
      quote: row.quote || undefined,
      isPublic: row.is_public ?? true,
      productId: row.product_id
    }));
  } catch (error) {
    console.error('Error in loadCaseStudiesFromDb:', error);
    return null;
  }
}

export async function syncCaseStudiesToDb(cases: any[]) {
  if (!isSupabaseConfigured()) return false;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    // Delete existing user's case studies
    await supabase.from('case_studies').delete().eq('user_id', user.id);

    // Insert new - ensure all IDs are valid UUIDs
    const insertData = cases.map(cs => ({
      id: ensureUUID(cs.id),
      user_id: user.id,
      customer: cs.customer,
      industry: cs.industry,
      challenge: cs.challenge,
      solution: cs.solution,
      results: cs.results,
      quote: cs.quote || null,
      is_public: cs.isPublic,
      product_id: cs.productId || null
    }));

    const { error } = await supabase
      .from('case_studies')
      .insert(insertData);

    if (error) {
      console.error('Error syncing cases:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in syncCaseStudiesToDb:', error);
    return false;
  }
}

// ============================================
// OFFERS
// ============================================

export async function loadOffersFromDb(productId?: string | null) {
  if (!isSupabaseConfigured()) return null;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    let query = supabase
      .from('offers')
      .select('*')
      .eq('user_id', user.id);

    // Filter by product if provided
    if (productId) {
      query = query.or(`product_id.eq.${productId},product_id.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading offers:', error);
      return null;
    }

    return data.map(row => ({
      id: row.id,
      name: row.name,
      shortDescription: row.short_description,
      fullDescription: row.full_description,
      deliverables: row.deliverables,
      duration: row.duration,
      priceRange: {
        min: row.price_min,
        max: row.price_max,
        unit: row.price_unit
      },
      targetAudience: row.target_audience || [],
      relatedCases: row.related_cases || [],
      productId: row.product_id
    }));
  } catch (error) {
    console.error('Error in loadOffersFromDb:', error);
    return null;
  }
}

export async function syncOffersToDb(offers: any[]) {
  if (!isSupabaseConfigured()) return false;

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    // Delete existing user's offers
    await supabase.from('offers').delete().eq('user_id', user.id);

    // Insert new - ensure all IDs are valid UUIDs
    const insertData = offers.map(offer => ({
      id: ensureUUID(offer.id),
      user_id: user.id,
      name: offer.name,
      short_description: offer.shortDescription,
      full_description: offer.fullDescription,
      deliverables: offer.deliverables,
      duration: offer.duration,
      price_min: offer.priceRange.min,
      price_max: offer.priceRange.max,
      price_unit: offer.priceRange.unit,
      target_audience: offer.targetAudience || [],
      related_cases: offer.relatedCases || [],
      product_id: offer.productId || null
    }));

    const { error } = await supabase
      .from('offers')
      .insert(insertData);

    if (error) {
      console.error('Error syncing offers:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in syncOffersToDb:', error);
    return false;
  }
}
