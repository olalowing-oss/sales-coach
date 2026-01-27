import { supabase, isSupabaseConfigured, signInAnonymously } from './supabase';
import type { CallSession, TranscriptSegment, CoachingTip } from '../types';
import type { Database } from '../types/database';

type DbSession = Database['public']['Tables']['call_sessions']['Row'];
type DbSessionInsert = Database['public']['Tables']['call_sessions']['Insert'];
type DbSegment = Database['public']['Tables']['transcript_segments']['Insert'];
type DbTip = Database['public']['Tables']['session_coaching_tips']['Insert'];

// ============================================
// SESSION OPERATIONS
// ============================================

export async function saveSessionToDb(session: CallSession): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    await signInAnonymously();

    const sessionData: DbSessionInsert = {
      id: session.id,
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
    await signInAnonymously();

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
      isFinal: seg.is_final
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

// ============================================
// COACHING DATA OPERATIONS
// ============================================

export async function loadTriggerPatternsFromDb() {
  if (!isSupabaseConfigured()) return null;

  try {
    await signInAnonymously();

    const { data, error } = await supabase
      .from('trigger_patterns')
      .select('*');

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
        category: row.category
      };
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
    await signInAnonymously();

    // Delete existing
    await supabase.from('trigger_patterns').delete().neq('id', '');

    // Insert new
    const insertData = Object.entries(patterns).map(([id, pattern]) => ({
      id,
      keywords: pattern.keywords,
      response_type: pattern.response,
      category: pattern.category || null
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

export async function loadBattlecardsFromDb() {
  if (!isSupabaseConfigured()) return null;

  try {
    await signInAnonymously();

    const { data, error } = await supabase
      .from('battlecards')
      .select('*');

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
      commonObjections: row.common_objections || []
    }));
  } catch (error) {
    console.error('Error in loadBattlecardsFromDb:', error);
    return null;
  }
}

export async function syncBattlecardsToDb(battlecards: any[]) {
  if (!isSupabaseConfigured()) return false;

  try {
    await signInAnonymously();

    // Delete existing
    await supabase.from('battlecards').delete().neq('id', '');

    // Insert new
    const insertData = battlecards.map(bc => ({
      id: bc.id,
      competitor: bc.competitor,
      their_strengths: bc.theirStrengths,
      their_weaknesses: bc.theirWeaknesses,
      our_advantages: bc.ourAdvantages,
      talking_points: bc.talkingPoints,
      common_objections: bc.commonObjections || []
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

export async function loadObjectionHandlersFromDb() {
  if (!isSupabaseConfigured()) return null;

  try {
    await signInAnonymously();

    const { data, error } = await supabase
      .from('objection_handlers')
      .select('*');

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
      }
    }));
  } catch (error) {
    console.error('Error in loadObjectionHandlersFromDb:', error);
    return null;
  }
}

export async function syncObjectionHandlersToDb(handlers: any[]) {
  if (!isSupabaseConfigured()) return false;

  try {
    await signInAnonymously();

    // Delete existing
    await supabase.from('objection_handlers').delete().neq('id', '');

    // Insert new
    const insertData = handlers.map(oh => ({
      id: oh.id,
      objection: oh.objection,
      triggers: oh.triggers,
      category: oh.category,
      response_short: oh.responses.short,
      response_detailed: oh.responses.detailed,
      followup_questions: oh.responses.followUpQuestions
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

export async function loadCaseStudiesFromDb() {
  if (!isSupabaseConfigured()) return null;

  try {
    await signInAnonymously();

    const { data, error } = await supabase
      .from('case_studies')
      .select('*');

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
      isPublic: row.is_public
    }));
  } catch (error) {
    console.error('Error in loadCaseStudiesFromDb:', error);
    return null;
  }
}

export async function syncCaseStudiesToDb(cases: any[]) {
  if (!isSupabaseConfigured()) return false;

  try {
    await signInAnonymously();

    // Delete existing
    await supabase.from('case_studies').delete().neq('id', '');

    // Insert new
    const insertData = cases.map(cs => ({
      id: cs.id,
      customer: cs.customer,
      industry: cs.industry,
      challenge: cs.challenge,
      solution: cs.solution,
      results: cs.results,
      quote: cs.quote || null,
      is_public: cs.isPublic
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

export async function loadOffersFromDb() {
  if (!isSupabaseConfigured()) return null;

  try {
    await signInAnonymously();

    const { data, error } = await supabase
      .from('offers')
      .select('*');

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
      relatedCases: row.related_cases || []
    }));
  } catch (error) {
    console.error('Error in loadOffersFromDb:', error);
    return null;
  }
}

export async function syncOffersToDb(offers: any[]) {
  if (!isSupabaseConfigured()) return false;

  try {
    await signInAnonymously();

    // Delete existing
    await supabase.from('offers').delete().neq('id', '');

    // Insert new
    const insertData = offers.map(offer => ({
      id: offer.id,
      name: offer.name,
      short_description: offer.shortDescription,
      full_description: offer.fullDescription,
      deliverables: offer.deliverables,
      duration: offer.duration,
      price_min: offer.priceRange.min,
      price_max: offer.priceRange.max,
      price_unit: offer.priceRange.unit,
      target_audience: offer.targetAudience || [],
      related_cases: offer.relatedCases || []
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
