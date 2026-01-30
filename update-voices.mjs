import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateVoices() {
  console.log('🎤 Updating voice assignments for training scenarios...\n');

  try {
    // Update male personas to Mattias voice
    console.log('1. Updating male personas to Mattias voice...');
    const malePersonas = ['Erik Lundström', 'Robert Ek', 'Alexander Nordström', 'Lars Andersson'];

    const { data: maleUpdates, error: maleError } = await supabase
      .from('training_scenarios')
      .update({ voice_name: 'sv-SE-MattiasNeural' })
      .in('persona_name', malePersonas)
      .eq('is_global', true)
      .select('persona_name, voice_name');

    if (maleError) {
      console.error('   ❌ Error:', maleError.message);
    } else {
      console.log(`   ✅ Updated ${maleUpdates?.length || 0} male personas`);
      maleUpdates?.forEach(s => console.log(`      👨 ${s.persona_name} → ${s.voice_name}`));
    }

    // Update Linda Karlsson to Hillevi voice (formal female)
    console.log('\n2. Updating formal female persona to Hillevi voice...');
    const { data: formalUpdates, error: formalError } = await supabase
      .from('training_scenarios')
      .update({ voice_name: 'sv-SE-HilleviNeural' })
      .eq('persona_name', 'Linda Karlsson')
      .eq('is_global', true)
      .select('persona_name, voice_name');

    if (formalError) {
      console.error('   ❌ Error:', formalError.message);
    } else {
      console.log(`   ✅ Updated ${formalUpdates?.length || 0} formal persona`);
      formalUpdates?.forEach(s => console.log(`      👩‍💼 ${s.persona_name} → ${s.voice_name}`));
    }

    // Female personas already have Sofie (default), but let's verify
    console.log('\n3. Female personas with Sofie voice (no update needed):');
    const { data: femaleData, error: femaleError } = await supabase
      .from('training_scenarios')
      .select('persona_name, voice_name')
      .in('persona_name', ['Emma Lindberg', 'Maria Nilsson', 'Sofia Bergström'])
      .eq('is_global', true);

    if (!femaleError && femaleData) {
      femaleData.forEach(s => console.log(`      👩 ${s.persona_name} → ${s.voice_name}`));
    }

    // Final verification
    console.log('\n4. Final verification - all scenarios:');
    const { data: allScenarios, error: verifyError } = await supabase
      .from('training_scenarios')
      .select('persona_name, voice_name')
      .eq('is_global', true)
      .order('persona_name');

    if (verifyError) {
      console.error('   ❌ Error:', verifyError.message);
    } else if (allScenarios) {
      console.log('');
      allScenarios.forEach(s => {
        const voice = s.voice_name || 'NULL';
        const emoji = voice.includes('Mattias') ? '👨' : voice.includes('Hillevi') ? '👩‍💼' : '👩';
        console.log(`   ${emoji} ${s.persona_name.padEnd(25)} → ${voice}`);
      });
    }

    console.log('\n✅ Voice assignments updated successfully!\n');
    console.log('Next steps:');
    console.log('1. Test training mode with different scenarios');
    console.log('2. Verify male personas use Mattias voice');
    console.log('3. Verify female personas use Sofie/Hillevi voice');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateVoices();
