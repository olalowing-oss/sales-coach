// Script för att migrera triggers från localStorage till Supabase
// Kör detta i browser developer console (F12) när du är inloggad

(async function migrateTriggers() {
  console.log('🚀 Startar migrering av triggers till databasen...\n');

  // 1. Läs localStorage
  const coachingStoreKey = 'b3-coaching-data';
  const storeData = localStorage.getItem(coachingStoreKey);

  if (!storeData) {
    console.error('❌ Ingen coaching-store hittades i localStorage');
    return;
  }

  let store;
  try {
    store = JSON.parse(storeData);
  } catch (error) {
    console.error('❌ Kunde inte parse localStorage data:', error);
    return;
  }

  if (!store.state?.triggerPatterns) {
    console.error('❌ Inga triggers hittades i store');
    return;
  }

  const triggers = store.state.triggerPatterns;
  const triggerCount = Object.keys(triggers).length;
  console.log(`📦 Hittade ${triggerCount} triggers i localStorage\n`);

  // 2. Get Supabase client (assumes it's available globally)
  if (typeof window.supabase === 'undefined') {
    // Try to import from the app
    console.log('⚠️  Supabase client inte tillgänglig globalt');
    console.log('Försöker använda från React app...\n');
  }

  // Import Supabase URL and anon key from env or hardcode
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Supabase credentials saknas');
    console.log('\nAnvänd istället server-side scriptet med export från localStorage:');
    console.log('1. Kopiera denna JSON:');
    console.log(JSON.stringify(triggers, null, 2));
    console.log('\n2. Spara som triggers-export.json');
    console.log('3. Kör: node scripts/import-triggers-from-json.mjs triggers-export.json');
    return;
  }

  // Create Supabase client
  const { createClient } = window.supabase || await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 3. Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ Användare inte inloggad:', userError);
    return;
  }

  console.log(`👤 Inloggad som: ${user.email}`);
  console.log(`User ID: ${user.id}\n`);

  // 4. Insert triggers into database
  let successCount = 0;
  let errorCount = 0;

  for (const [triggerId, triggerData] of Object.entries(triggers)) {
    try {
      const dbTrigger = {
        id: triggerId,
        user_id: user.id,
        keywords: triggerData.keywords || [],
        response_type: triggerData.response || 'solution',
        category: triggerData.category || null,
        product_id: triggerData.productId || null
      };

      // Use upsert to avoid duplicates
      const { error } = await supabase
        .from('trigger_patterns')
        .upsert(dbTrigger, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Fel vid sparande av trigger "${triggerId}":`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Sparade trigger: ${triggerId}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Exception för trigger "${triggerId}":`, error);
      errorCount++;
    }
  }

  console.log(`\n🎉 FÄRDIG!`);
  console.log(`✅ Sparade: ${successCount} triggers`);
  if (errorCount > 0) {
    console.log(`❌ Misslyckades: ${errorCount} triggers`);
  }
  console.log('\n💡 Tips: Du kan nu ta bort triggers från localStorage om du vill.');

})();
