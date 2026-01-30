import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVoiceColumn() {
  console.log('🔍 Checking if voice_name column exists...\n');

  try {
    // Try to fetch one row with voice_name
    const { data, error } = await supabase
      .from('training_scenarios')
      .select('id, persona_name, voice_name')
      .eq('is_global', true)
      .limit(1);

    if (error) {
      console.error('❌ Error:', error.message);

      if (error.message.includes('voice_name')) {
        console.log('\n⚠️  voice_name column does NOT exist in database!\n');
        console.log('📝 To fix this, run this SQL in Supabase SQL Editor:\n');
        console.log('ALTER TABLE training_scenarios');
        console.log('ADD COLUMN voice_name VARCHAR(50) DEFAULT \'sv-SE-SofieNeural\';\n');
      }
      return;
    }

    console.log('✅ voice_name column EXISTS!\n');

    if (data && data.length > 0) {
      console.log('Sample data:');
      console.log(`  ${data[0].persona_name}: ${data[0].voice_name || 'NULL'}\n`);
    }

    // Check all scenarios
    const { data: allData, error: allError } = await supabase
      .from('training_scenarios')
      .select('persona_name, voice_name')
      .eq('is_global', true)
      .order('persona_name');

    if (!allError && allData) {
      console.log('All global scenarios:');
      allData.forEach(s => {
        const voice = s.voice_name || '❌ NULL';
        console.log(`  - ${s.persona_name}: ${voice}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkVoiceColumn();
