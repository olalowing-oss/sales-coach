// Test Supabase connection
// Kör: node test-supabase.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jiphhmofozuewfdnjfjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcGhobW9mb3p1ZXdmZG5qZmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0Nzg5NjEsImV4cCI6MjA4NTA1NDk2MX0.PC2gdUjWHireuJYM-sNXn_eGshkaeb4MrD6VE4i_ZyY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔗 Testar Supabase-anslutning...\n');

  try {
    // Test 1: Anonymous sign-in
    console.log('1️⃣ Testar anonymous sign-in...');
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

    if (authError) {
      console.error('❌ Anonymous sign-in misslyckades:', authError.message);
      console.log('\n💡 Aktivera Anonymous sign-in:');
      console.log('   1. Gå till https://supabase.com/dashboard');
      console.log('   2. Välj ditt projekt');
      console.log('   3. Authentication → Providers');
      console.log('   4. Aktivera "Anonymous Sign-ins"\n');
      return;
    }
    console.log('✅ Anonymous sign-in fungerar!');
    console.log('   User ID:', authData.user?.id.substring(0, 8) + '...\n');

    // Test 2: Kolla tabeller
    console.log('2️⃣ Kontrollerar databastabeller...');

    const { data: sessions, error: sessionError } = await supabase
      .from('call_sessions')
      .select('*')
      .limit(1);

    if (sessionError) {
      console.error('❌ Kunde inte läsa call_sessions:', sessionError.message);
      console.log('\n💡 Kör SQL-schemat:');
      console.log('   1. Öppna SQL Editor i Supabase');
      console.log('   2. Kopiera innehållet från supabase-schema.sql');
      console.log('   3. Kör scriptet\n');
      return;
    }
    console.log('✅ Tabeller finns och fungerar!');
    console.log('   Befintliga sessioner:', sessions?.length || 0, '\n');

    // Test 3: Skapa test-session
    console.log('3️⃣ Skapar test-session...');
    const { data: newSession, error: insertError } = await supabase
      .from('call_sessions')
      .insert({
        user_id: authData.user?.id,
        status: 'stopped',
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        customer_name: 'Test Kund',
        customer_company: 'Test AB',
        duration_seconds: 120,
        sentiment: 'positive'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Kunde inte skapa session:', insertError.message);
      return;
    }
    console.log('✅ Test-session skapad!');
    console.log('   Session ID:', newSession.id.substring(0, 8) + '...\n');

    // Test 4: Ta bort test-session
    console.log('4️⃣ Rensar upp test-data...');
    await supabase.from('call_sessions').delete().eq('id', newSession.id);
    console.log('✅ Test-data borttagen\n');

    console.log('🎉 Alla tester lyckades! Supabase är korrekt konfigurerad.\n');

  } catch (error) {
    console.error('❌ Oväntat fel:', error);
  }
}

testConnection();
