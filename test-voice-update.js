// Test script to verify voice_name updates work
// Copy this code and run it in browser console (F12) when on the app

async function testVoiceUpdate() {
  const { createClient } = await import('./src/lib/supabase.ts');
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  console.log('🧪 Testing voice_name update...');

  // 1. Get first scenario
  const { data: scenarios, error: fetchError } = await supabase
    .from('training_scenarios')
    .select('*')
    .limit(1);

  if (fetchError) {
    console.error('❌ Failed to fetch scenario:', fetchError);
    return;
  }

  if (!scenarios || scenarios.length === 0) {
    console.error('❌ No scenarios found');
    return;
  }

  const scenario = scenarios[0];
  console.log('📋 Current scenario:', {
    id: scenario.id,
    name: scenario.name,
    voice_name: scenario.voice_name
  });

  // 2. Try to update voice_name
  const newVoice = scenario.voice_name === 'sv-SE-SofieNeural'
    ? 'sv-SE-MattiasNeural'
    : 'sv-SE-SofieNeural';

  console.log(`🔄 Updating voice_name to: ${newVoice}`);

  const { data: updated, error: updateError } = await supabase
    .from('training_scenarios')
    .update({ voice_name: newVoice })
    .eq('id', scenario.id)
    .select();

  if (updateError) {
    console.error('❌ Update failed:', updateError);
    return;
  }

  console.log('✅ Update successful!', {
    id: updated[0].id,
    name: updated[0].name,
    old_voice: scenario.voice_name,
    new_voice: updated[0].voice_name
  });

  // 3. Verify the change persisted
  const { data: verified, error: verifyError } = await supabase
    .from('training_scenarios')
    .select('id, name, voice_name')
    .eq('id', scenario.id)
    .single();

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError);
    return;
  }

  console.log('🔍 Verification:', {
    voice_name_matches: verified.voice_name === newVoice,
    current_voice: verified.voice_name
  });

  if (verified.voice_name === newVoice) {
    console.log('✅ All tests passed! voice_name updates work correctly.');
  } else {
    console.error('❌ Test failed: voice_name did not persist');
  }
}

// Run the test
testVoiceUpdate();
