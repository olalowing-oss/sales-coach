import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listScenarios() {
  console.log('📋 Listing all training scenarios...\n');

  const { data, error } = await supabase
    .from('training_scenarios')
    .select('*')
    .order('persona_name');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No scenarios found in database!');
    return;
  }

  console.log(`Found ${data.length} scenarios:\n`);

  data.forEach((s, i) => {
    console.log(`${i + 1}. ${s.name}`);
    console.log(`   ID: ${s.id}`);
    console.log(`   Persona: ${s.persona_name}`);
    console.log(`   Voice: ${s.voice_name || 'NULL'}`);
    console.log(`   Is Global: ${s.is_global}`);
    console.log(`   User ID: ${s.user_id || 'NULL'}`);
    console.log('');
  });
}

listScenarios();
