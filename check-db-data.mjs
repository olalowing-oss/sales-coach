// Check database data (uses service_role key to see ALL data)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jiphhmofozuewfdnjfjy.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcGhobW9mb3p1ZXdmZG5qZmp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ3ODk2MSwiZXhwIjoyMDg1MDU0OTYxfQ.-vkQTVGKFanfBJM1x2R1hyEjYqn6I4Bef08b4Zzwq0k';

// Use service role key to bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkData() {
  console.log('📊 Kollar databas-innehåll (med service_role - ser ALL data)...\n');

  try {

    // Check call_sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('call_sessions')
      .select('*')
      .order('started_at', { ascending: false });

    console.log('=== CALL SESSIONS ===');
    if (sessionsError) {
      console.error('❌ Fel:', sessionsError.message);
    } else if (!sessions || sessions.length === 0) {
      console.log('📭 Inga samtal sparade ännu\n');
    } else {
      console.log(`✅ ${sessions.length} samtal funna:\n`);
      sessions.forEach((session, i) => {
        console.log(`${i + 1}. ${session.customer_name || 'Unnamed'} - ${new Date(session.started_at).toLocaleString('sv-SE')}`);
        console.log(`   Status: ${session.status}, Varaktighet: ${session.duration_seconds}s`);
        if (session.topics && session.topics.length > 0) {
          console.log(`   Topics: ${session.topics.join(', ')}`);
        }
        console.log('');
      });
    }

    // Check transcript_segments
    const { data: segments, error: segmentsError } = await supabase
      .from('transcript_segments')
      .select('*');

    console.log('=== TRANSCRIPT SEGMENTS ===');
    if (segmentsError) {
      console.error('❌ Fel:', segmentsError.message);
    } else if (!segments || segments.length === 0) {
      console.log('📭 Inga transkript-segment sparade ännu\n');
    } else {
      console.log(`✅ ${segments.length} segment funna\n`);
    }

    // Check coaching tips
    const { data: tips, error: tipsError } = await supabase
      .from('session_coaching_tips')
      .select('*');

    console.log('=== COACHING TIPS ===');
    if (tipsError) {
      console.error('❌ Fel:', tipsError.message);
    } else if (!tips || tips.length === 0) {
      console.log('📭 Inga coaching-tips sparade ännu\n');
    } else {
      console.log(`✅ ${tips.length} tips funna\n`);
    }

    // Check trigger_patterns
    const { data: triggers, error: triggersError } = await supabase
      .from('trigger_patterns')
      .select('*');

    console.log('=== TRIGGER PATTERNS ===');
    if (triggersError) {
      console.error('❌ Fel:', triggersError.message);
    } else if (!triggers || triggers.length === 0) {
      console.log('📭 Inga triggers sparade ännu\n');
    } else {
      console.log(`✅ ${triggers.length} triggers funna\n`);
    }

    // Check battlecards
    const { data: battlecards, error: battlecardsError } = await supabase
      .from('battlecards')
      .select('*');

    console.log('=== BATTLECARDS ===');
    if (battlecardsError) {
      console.error('❌ Fel:', battlecardsError.message);
    } else if (!battlecards || battlecards.length === 0) {
      console.log('📭 Inga battlecards sparade ännu\n');
    } else {
      console.log(`✅ ${battlecards.length} battlecards funna\n`);
    }

    // Check objection_handlers
    const { data: objections, error: objectionsError } = await supabase
      .from('objection_handlers')
      .select('*');

    console.log('=== OBJECTION HANDLERS ===');
    if (objectionsError) {
      console.error('❌ Fel:', objectionsError.message);
    } else if (!objections || objections.length === 0) {
      console.log('📭 Inga objection handlers sparade ännu\n');
    } else {
      console.log(`✅ ${objections.length} objection handlers funna\n`);
    }

    // Check case_studies
    const { data: cases, error: casesError } = await supabase
      .from('case_studies')
      .select('*');

    console.log('=== CASE STUDIES ===');
    if (casesError) {
      console.error('❌ Fel:', casesError.message);
    } else if (!cases || cases.length === 0) {
      console.log('📭 Inga case studies sparade ännu\n');
    } else {
      console.log(`✅ ${cases.length} case studies funna\n`);
    }

    // Check offers
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('*');

    console.log('=== OFFERS ===');
    if (offersError) {
      console.error('❌ Fel:', offersError.message);
    } else if (!offers || offers.length === 0) {
      console.log('📭 Inga offers sparade ännu\n');
    } else {
      console.log(`✅ ${offers.length} offers funna\n`);
    }

  } catch (error) {
    console.error('❌ Oväntat fel:', error);
  }
}

checkData();
