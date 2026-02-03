import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Från: ola@lowing.eu
const FROM_USER_ID = '75004a8c-5e9f-413a-9c89-0affbd0eaa33';
const FROM_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f'; // M365 (gamla)

// Till: det andra kontot
const TO_USER_ID = '72f242c2-2dd3-441b-9183-0fe4854f29b4';
const TO_PRODUCT_ID = 'ce52ccee-0cfe-48ed-b785-3679e01c2409'; // M365 (nya)

async function migrateCoachingData() {
  try {
    console.log('🚀 Migrerar coaching data...\n');
    console.log(`Från user: ${FROM_USER_ID}`);
    console.log(`Från product: ${FROM_PRODUCT_ID}`);
    console.log(`Till user: ${TO_USER_ID}`);
    console.log(`Till product: ${TO_PRODUCT_ID}\n`);

    let totalMigrated = 0;

    // 1. Migrate battlecards
    console.log('⚔️  Migrerar battlecards...');
    const { data: bcData, error: bcError } = await supabase
      .from('battlecards')
      .update({
        user_id: TO_USER_ID,
        product_id: TO_PRODUCT_ID
      })
      .eq('user_id', FROM_USER_ID)
      .eq('product_id', FROM_PRODUCT_ID)
      .select();

    if (bcError) {
      console.error('❌ Error migrating battlecards:', bcError);
    } else {
      const count = bcData?.length || 0;
      totalMigrated += count;
      console.log(`✅ Migrerade ${count} battlecards\n`);
    }

    // 2. Migrate objection_handlers
    console.log('⚠️  Migrerar objection_handlers...');
    const { data: ohData, error: ohError } = await supabase
      .from('objection_handlers')
      .update({
        user_id: TO_USER_ID,
        product_id: TO_PRODUCT_ID
      })
      .eq('user_id', FROM_USER_ID)
      .eq('product_id', FROM_PRODUCT_ID)
      .select();

    if (ohError) {
      console.error('❌ Error migrating objection_handlers:', ohError);
    } else {
      const count = ohData?.length || 0;
      totalMigrated += count;
      console.log(`✅ Migrerade ${count} objection handlers\n`);
    }

    // 3. Migrate case_studies
    console.log('📚 Migrerar case_studies...');
    const { data: csData, error: csError } = await supabase
      .from('case_studies')
      .update({
        user_id: TO_USER_ID,
        product_id: TO_PRODUCT_ID
      })
      .eq('user_id', FROM_USER_ID)
      .eq('product_id', FROM_PRODUCT_ID)
      .select();

    if (csError) {
      console.error('❌ Error migrating case_studies:', csError);
    } else {
      const count = csData?.length || 0;
      totalMigrated += count;
      console.log(`✅ Migrerade ${count} case studies\n`);
    }

    // 4. Migrate offers
    console.log('💰 Migrerar offers...');
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .update({
        user_id: TO_USER_ID,
        product_id: TO_PRODUCT_ID
      })
      .eq('user_id', FROM_USER_ID)
      .eq('product_id', FROM_PRODUCT_ID)
      .select();

    if (offerError) {
      console.error('❌ Error migrating offers:', offerError);
    } else {
      const count = offerData?.length || 0;
      totalMigrated += count;
      console.log(`✅ Migrerade ${count} offers\n`);
    }

    console.log(`\n🎉 FÄRDIG! Totalt migrerade ${totalMigrated} items från databasen`);
    console.log('\n⚠️  VIKTIGT: Triggers ligger i localStorage och måste uppdateras manuellt.');
    console.log('Kör följande script i browser console (F12):\n');
    console.log('---');
    console.log(`
// Uppdatera triggers i localStorage
const storeData = localStorage.getItem('b3-coaching-data');
if (storeData) {
  const store = JSON.parse(storeData);
  if (store.state?.triggerPatterns) {
    Object.values(store.state.triggerPatterns).forEach(trigger => {
      if (trigger.productId === '${FROM_PRODUCT_ID}') {
        trigger.productId = '${TO_PRODUCT_ID}';
      }
    });
    localStorage.setItem('b3-coaching-data', JSON.stringify(store));
    console.log('✅ Triggers uppdaterade! Laddar om...');
    setTimeout(() => location.reload(), 1000);
  }
}
    `);
    console.log('---\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

migrateCoachingData();
