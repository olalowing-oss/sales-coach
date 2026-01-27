// Sync default coaching data to database
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = 'https://jiphhmofozuewfdnjfjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcGhobW9mb3p1ZXdmZG5qZmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0Nzg5NjEsImV4cCI6MjA4NTA1NDk2MX0.PC2gdUjWHireuJYM-sNXn_eGshkaeb4MrD6VE4i_ZyY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncData() {
  console.log('🔗 Ansluter till Supabase...\n');

  try {
    // Sign in anonymously and get user ID
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

    if (authError) {
      console.error('❌ Autentisering misslyckades:', authError.message);
      return;
    }

    const userId = authData.user.id;
    console.log(`✅ Inloggad som: ${userId}\n`);

    // === TRIGGER PATTERNS ===
    console.log('📤 Synkar trigger patterns...');

    const triggerData = [
      {
        id: 'competitor-mention',
        user_id: userId,
        keywords: ['konkurrent', 'jämförelse', 'alternativ', 'andra lösningar'],
        response_type: 'battlecard',
        category: 'competitive'
      },
      {
        id: 'pricing-question',
        user_id: userId,
        keywords: ['pris', 'kostnad', 'budget', 'investering'],
        response_type: 'offer',
        category: 'pricing'
      },
      {
        id: 'objection-raised',
        user_id: userId,
        keywords: ['inte säker', 'tveksam', 'problem', 'fungerar inte'],
        response_type: 'objection',
        category: 'objection'
      },
      {
        id: 'solution-request',
        user_id: userId,
        keywords: ['lösning', 'hur fungerar', 'vad kan ni', 'features'],
        response_type: 'solution',
        category: 'product'
      }
    ];

    const { error: triggerError } = await supabase
      .from('trigger_patterns')
      .insert(triggerData);

    if (triggerError) {
      console.error('❌ Fel vid synkning av triggers:', triggerError.message);
    } else {
      console.log(`✅ ${triggerData.length} trigger patterns synkade\n`);
    }

    // === BATTLECARDS ===
    console.log('📤 Synkar battlecards...');

    const battlecardData = [{
      id: randomUUID(),
      user_id: userId,
      competitor: 'Generisk konkurrent',
      their_strengths: ['Lägre pris', 'Etablerat varumärke'],
      their_weaknesses: ['Mindre flexibilitet', 'Sämre support'],
      our_advantages: ['Bättre anpassning', '24/7 support', 'Modern teknik'],
      talking_points: ['Vi fokuserar på långsiktig värdeskapande', 'Vår lösning skalas med er verksamhet'],
      common_objections: ['För dyrt', 'För komplext']
    }];

    const { error: battlecardsError } = await supabase
      .from('battlecards')
      .insert(battlecardData);

    if (battlecardsError) {
      console.error('❌ Fel vid synkning av battlecards:', battlecardsError.message);
    } else {
      console.log(`✅ ${battlecardData.length} battlecards synkade\n`);
    }

    // === OBJECTION HANDLERS ===
    console.log('📤 Synkar objection handlers...');

    const objectionData = [
      {
        id: randomUUID(),
        user_id: userId,
        objection: 'För dyrt',
        triggers: ['dyrt', 'pris', 'budget', 'kostnad'],
        category: 'price',
        response_short: 'Jag förstår att priset är en viktig faktor. Låt oss titta på värdet ni får.',
        response_detailed: 'Vårt pris reflekterar värdet vi levererar. Med vår lösning ser våra kunder i genomsnitt en ROI på 300% inom första året.',
        followup_questions: ['Vad är er budget?', 'Vad är viktigast för er - pris eller värde?']
      },
      {
        id: randomUUID(),
        user_id: userId,
        objection: 'Fel timing',
        triggers: ['inte nu', 'senare', 'nästa år', 'fel tidpunkt'],
        category: 'timing',
        response_short: 'Jag förstår. När skulle vara en bättre tidpunkt?',
        response_detailed: 'Många av våra mest framgångsrika kunder trodde också att timingen var fel, men när de såg resultaten önskade de att de startat tidigare.',
        followup_questions: ['Vad händer om ni väntar?', 'Vad skulle göra timingen rätt?']
      }
    ];

    const { error: objectionsError } = await supabase
      .from('objection_handlers')
      .insert(objectionData);

    if (objectionsError) {
      console.error('❌ Fel vid synkning av objections:', objectionsError.message);
    } else {
      console.log(`✅ ${objectionData.length} objection handlers synkade\n`);
    }

    // === CASE STUDIES ===
    console.log('📤 Synkar case studies...');

    const caseData = [{
      id: randomUUID(),
      user_id: userId,
      customer: 'TechStart AB',
      industry: 'Technology',
      challenge: 'Behövde öka försäljningen med 200%',
      solution: 'Implementerade vår sales coaching-lösning',
      results: ['250% ökning i försäljning efter 6 månader', 'Förbättrad teamkompetens', 'Högre deal close-rate'],
      quote: 'Bästa investeringen vi gjort!',
      is_public: true
    }];

    const { error: casesError } = await supabase
      .from('case_studies')
      .insert(caseData);

    if (casesError) {
      console.error('❌ Fel vid synkning av cases:', casesError.message);
    } else {
      console.log(`✅ ${caseData.length} case studies synkade\n`);
    }

    console.log('🎉 All default-data har synkats till databasen!');

  } catch (error) {
    console.error('❌ Oväntat fel:', error);
  }
}

syncData();
