import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// User and Product IDs
const CURRENT_USER_ID = '75004a8c-5e9f-413a-9c89-0affbd0eaa33'; // ola@lowing.eu
const M365_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f';

async function updateDemoScripts() {
  try {
    console.log('🚀 Kopplar alla demo-scripts till M365 och ola@lowing.eu...\n');
    console.log(`User:    ${CURRENT_USER_ID} (ola@lowing.eu)`);
    console.log(`Product: ${M365_PRODUCT_ID} (M365)\n`);

    // Step 1: Check if demo_scripts table exists
    console.log('📋 Steg 1: Kontrollerar om demo_scripts tabellen finns...');

    const { data: existingScripts, error: checkError } = await supabase
      .from('demo_scripts')
      .select('id, user_id, product_id, name')
      .limit(100);

    if (checkError) {
      if (checkError.code === '42P01') {
        console.error('❌ Tabellen demo_scripts finns inte ännu!');
        console.log('\n💡 Du måste först köra SQL-migrationen i Supabase Dashboard.');
        console.log('   Se tidigare instruktioner för hur du skapar tabellen.');
        process.exit(1);
      } else {
        console.error('❌ Fel vid kontroll av tabellen:', checkError);
        throw checkError;
      }
    }

    console.log(`   ✅ Hittade ${existingScripts?.length || 0} befintliga demo-scripts`);

    if (!existingScripts || existingScripts.length === 0) {
      console.log('\n⚠️  Inga demo-scripts att uppdatera.');
      console.log('   Tabellen är tom. Du kan skapa nya demo-scripts via admin-panelen.');
      return;
    }

    // Step 2: Show current distribution
    console.log('\n📊 Nuvarande fördelning:');
    const userIds = [...new Set(existingScripts.map(s => s.user_id))];
    const productIds = [...new Set(existingScripts.map(s => s.product_id))];

    console.log(`   Unika användare: ${userIds.length}`);
    userIds.forEach(uid => {
      const count = existingScripts.filter(s => s.user_id === uid).length;
      console.log(`     ${uid}: ${count} scripts`);
    });

    console.log(`   Unika produkter: ${productIds.length}`);
    productIds.forEach(pid => {
      const count = existingScripts.filter(s => s.product_id === pid).length;
      console.log(`     ${pid}: ${count} scripts`);
    });

    // Step 3: Update all demo scripts
    console.log('\n🔄 Steg 2: Uppdaterar alla demo-scripts...');

    const { data: updatedScripts, error: updateError } = await supabase
      .from('demo_scripts')
      .update({
        user_id: CURRENT_USER_ID,
        product_id: M365_PRODUCT_ID
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all (dummy condition)
      .select();

    if (updateError) {
      console.error('❌ Kunde inte uppdatera demo-scripts:', updateError);
      throw updateError;
    }

    console.log(`   ✅ ${updatedScripts?.length || 0} demo-scripts uppdaterade`);

    // Step 4: Verify the update
    console.log('\n✅ Steg 3: Verifierar uppdateringen...');

    const { data: verifyScripts, error: verifyError } = await supabase
      .from('demo_scripts')
      .select('id, user_id, product_id, name')
      .eq('user_id', CURRENT_USER_ID)
      .eq('product_id', M365_PRODUCT_ID);

    if (verifyError) {
      console.error('❌ Kunde inte verifiera:', verifyError);
      throw verifyError;
    }

    console.log(`   Demo-scripts för ${CURRENT_USER_ID} och M365: ${verifyScripts?.length || 0}`);

    if (verifyScripts && verifyScripts.length > 0) {
      console.log('\n   Scripts:');
      verifyScripts.forEach(script => {
        console.log(`     - ${script.name} (${script.id})`);
      });
    }

    console.log('\n🎉 KLART!');
    console.log('Alla demo-scripts är nu kopplade till ditt konto (ola@lowing.eu) och M365-produkten.');
    console.log('\n💡 Nästa steg:');
    console.log('1. Gå till Demo Admin i appen');
    console.log('2. Välj M365 som produkt');
    console.log('3. Du bör nu se alla dina demo-scripts');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

updateDemoScripts();
