import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Applying voice_name migration...\n');

  try {
    // Step 1: Add voice_name column (if it doesn't exist)
    console.log('1. Adding voice_name column...');

    // Note: ALTER TABLE must be run via Supabase SQL Editor or CLI
    // This script only updates the data

    console.log('   ⚠️  Please run this SQL in Supabase SQL Editor first:');
    console.log('   ALTER TABLE training_scenarios');
    console.log('   ADD COLUMN IF NOT EXISTS voice_name VARCHAR(50) DEFAULT \'sv-SE-SofieNeural\';');
    console.log('');
    console.log('   Press Enter to continue after running the SQL...');

    // Wait for user input
    await new Promise((resolve) => {
      process.stdin.once('data', resolve);
    });

    // Step 2: Update existing male personas
    console.log('\n2. Updating male personas to Mattias voice...');
    const { data: maleUpdates, error: maleError } = await supabase
      .from('training_scenarios')
      .update({ voice_name: 'sv-SE-MattiasNeural' })
      .in('persona_name', ['Erik Lundström', 'Robert Ek', 'Alexander Nordström', 'Lars Andersson'])
      .eq('is_global', true)
      .select('id, persona_name, voice_name');

    if (maleError) {
      console.error('   ❌ Error updating male personas:', maleError);
    } else {
      console.log(`   ✅ Updated ${maleUpdates?.length || 0} male personas`);
      maleUpdates?.forEach(s => console.log(`      - ${s.persona_name} → ${s.voice_name}`));
    }

    // Step 3: Update formal female persona (Linda Karlsson) to Hillevi
    console.log('\n3. Updating formal female persona to Hillevi voice...');
    const { data: formalUpdates, error: formalError } = await supabase
      .from('training_scenarios')
      .update({ voice_name: 'sv-SE-HilleviNeural' })
      .eq('persona_name', 'Linda Karlsson')
      .eq('is_global', true)
      .select('id, persona_name, voice_name');

    if (formalError) {
      console.error('   ❌ Error updating formal persona:', formalError);
    } else {
      console.log(`   ✅ Updated ${formalUpdates?.length || 0} formal persona`);
      formalUpdates?.forEach(s => console.log(`      - ${s.persona_name} → ${s.voice_name}`));
    }

    // Step 4: Ensure all female personas have Sofie (should be default)
    console.log('\n4. Verifying female personas have Sofie voice...');
    const { data: femaleUpdates, error: femaleError } = await supabase
      .from('training_scenarios')
      .update({ voice_name: 'sv-SE-SofieNeural' })
      .in('persona_name', ['Emma Lindberg', 'Maria Nilsson', 'Sofia Bergström'])
      .eq('is_global', true)
      .select('id, persona_name, voice_name');

    if (femaleError) {
      console.error('   ❌ Error updating female personas:', femaleError);
    } else {
      console.log(`   ✅ Verified ${femaleUpdates?.length || 0} female personas`);
      femaleUpdates?.forEach(s => console.log(`      - ${s.persona_name} → ${s.voice_name}`));
    }

    // Step 5: Verify all scenarios
    console.log('\n5. Verifying all scenarios...');
    const { data: allScenarios, error: verifyError } = await supabase
      .from('training_scenarios')
      .select('id, persona_name, voice_name')
      .eq('is_global', true)
      .order('persona_name');

    if (verifyError) {
      console.error('   ❌ Error fetching scenarios:', verifyError);
    } else {
      console.log(`   ✅ Total scenarios: ${allScenarios?.length || 0}`);
      console.log('\n   Voice assignments:');
      allScenarios?.forEach(s => {
        const voice = s.voice_name || 'NO VOICE SET';
        const emoji = voice.includes('Mattias') ? '👨' : voice.includes('Hillevi') ? '👩‍💼' : '👩';
        console.log(`      ${emoji} ${s.persona_name}: ${voice}`);
      });
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test training mode with different scenarios');
    console.log('2. Verify voices match persona genders');
    console.log('3. Test ScenariosAdmin voice selection dropdown');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
applyMigration().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
