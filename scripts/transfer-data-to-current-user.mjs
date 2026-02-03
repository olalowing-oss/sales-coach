import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// User IDs
const OLD_USER_ID = '72f242c2-2dd3-441b-9183-0fe4854f29b4'; // Old account
const NEW_USER_ID = '75004a8c-5e9f-413a-9c89-0affbd0eaa33'; // Current account (ola@lowing.eu)

// Product ID
const M365_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f';

async function transferDataToCurrentUser() {
  try {
    console.log('🚀 Överför all coaching-data till nuvarande användare...\n');
    console.log(`Från user: ${OLD_USER_ID}`);
    console.log(`Till user:  ${NEW_USER_ID} (ola@lowing.eu)\n`);

    // Step 1: Ensure M365 product exists for new user
    console.log('📦 Steg 1: Säkerställer att M365-produkten finns...');

    const { data: existingProduct, error: checkError } = await supabase
      .from('product_profiles')
      .select('id, name, user_id')
      .eq('id', M365_PRODUCT_ID)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Fel vid kontroll av produkt:', checkError);
      throw checkError;
    }

    if (!existingProduct) {
      console.log('   Produkten finns inte, skapar ny...');
      const { error: createError } = await supabase
        .from('product_profiles')
        .insert({
          id: M365_PRODUCT_ID,
          user_id: NEW_USER_ID,
          name: 'M365',
          description: 'Microsoft 365 produktlinje',
          is_active: true
        });

      if (createError) {
        console.error('❌ Kunde inte skapa produkt:', createError);
        throw createError;
      }
      console.log('   ✅ M365 produkt skapad för ny användare');
    } else if (existingProduct.user_id !== NEW_USER_ID) {
      console.log(`   Produkten finns men tillhör user ${existingProduct.user_id}`);
      console.log('   Uppdaterar till ny användare...');

      const { error: updateError } = await supabase
        .from('product_profiles')
        .update({ user_id: NEW_USER_ID })
        .eq('id', M365_PRODUCT_ID);

      if (updateError) {
        console.error('❌ Kunde inte uppdatera produkt:', updateError);
        throw updateError;
      }
      console.log('   ✅ Produkt uppdaterad till ny användare');
    } else {
      console.log('   ✅ Produkten finns redan för rätt användare');
    }

    // Step 2: Transfer triggers
    console.log('\n⚡ Steg 2: Överför triggers...');

    const { data: triggers, error: triggersError } = await supabase
      .from('trigger_patterns')
      .select('*')
      .eq('user_id', OLD_USER_ID);

    if (triggersError) {
      console.error('❌ Kunde inte hämta triggers:', triggersError);
      throw triggersError;
    }

    console.log(`   Hittade ${triggers?.length || 0} triggers att överföra`);

    if (triggers && triggers.length > 0) {
      const { error: updateError } = await supabase
        .from('trigger_patterns')
        .update({ user_id: NEW_USER_ID })
        .eq('user_id', OLD_USER_ID);

      if (updateError) {
        console.error('❌ Kunde inte uppdatera triggers:', updateError);
        throw updateError;
      }
      console.log(`   ✅ ${triggers.length} triggers överförda`);
    }

    // Step 3: Transfer battlecards
    console.log('\n⚔️  Steg 3: Överför battlecards...');

    const { data: battlecards, error: battlecardsError } = await supabase
      .from('battlecards')
      .select('*')
      .eq('user_id', OLD_USER_ID);

    if (!battlecardsError && battlecards && battlecards.length > 0) {
      const { error: updateError } = await supabase
        .from('battlecards')
        .update({ user_id: NEW_USER_ID })
        .eq('user_id', OLD_USER_ID);

      if (updateError) {
        console.error('❌ Kunde inte uppdatera battlecards:', updateError);
      } else {
        console.log(`   ✅ ${battlecards.length} battlecards överförda`);
      }
    } else {
      console.log('   Inga battlecards att överföra');
    }

    // Step 4: Transfer objection handlers
    console.log('\n🚨 Steg 4: Överför invändningar...');

    const { data: objections, error: objectionsError } = await supabase
      .from('objection_handlers')
      .select('*')
      .eq('user_id', OLD_USER_ID);

    if (!objectionsError && objections && objections.length > 0) {
      const { error: updateError } = await supabase
        .from('objection_handlers')
        .update({ user_id: NEW_USER_ID })
        .eq('user_id', OLD_USER_ID);

      if (updateError) {
        console.error('❌ Kunde inte uppdatera invändningar:', updateError);
      } else {
        console.log(`   ✅ ${objections.length} invändningar överförda`);
      }
    } else {
      console.log('   Inga invändningar att överföra');
    }

    // Step 5: Transfer case studies
    console.log('\n📚 Steg 5: Överför kundcase...');

    const { data: cases, error: casesError } = await supabase
      .from('case_studies')
      .select('*')
      .eq('user_id', OLD_USER_ID);

    if (!casesError && cases && cases.length > 0) {
      const { error: updateError } = await supabase
        .from('case_studies')
        .update({ user_id: NEW_USER_ID })
        .eq('user_id', OLD_USER_ID);

      if (updateError) {
        console.error('❌ Kunde inte uppdatera kundcase:', updateError);
      } else {
        console.log(`   ✅ ${cases.length} kundcase överförda`);
      }
    } else {
      console.log('   Inga kundcase att överföra');
    }

    // Step 6: Transfer offers
    console.log('\n💰 Steg 6: Överför erbjudanden...');

    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .eq('user_id', OLD_USER_ID);

    if (!offersError && offers && offers.length > 0) {
      const { error: updateError } = await supabase
        .from('offers')
        .update({ user_id: NEW_USER_ID })
        .eq('user_id', OLD_USER_ID);

      if (updateError) {
        console.error('❌ Kunde inte uppdatera erbjudanden:', updateError);
      } else {
        console.log(`   ✅ ${offers.length} erbjudanden överförda`);
      }
    } else {
      console.log('   Inga erbjudanden att överföra');
    }

    // Step 7: Verify the transfer
    console.log('\n✅ Steg 7: Verifierar överföringen...');

    const { data: verifyTriggers } = await supabase
      .from('trigger_patterns')
      .select('id')
      .eq('user_id', NEW_USER_ID)
      .eq('product_id', M365_PRODUCT_ID);

    console.log(`   Triggers för ny användare med M365: ${verifyTriggers?.length || 0}`);

    const { data: oldUserTriggers } = await supabase
      .from('trigger_patterns')
      .select('id')
      .eq('user_id', OLD_USER_ID);

    console.log(`   Triggers kvar för gammal användare: ${oldUserTriggers?.length || 0}`);

    console.log('\n🎉 KLART!');
    console.log('All coaching-data har överförts till ditt konto (ola@lowing.eu)');
    console.log('\n💡 Nästa steg:');
    console.log('1. Rensa localStorage i webbläsaren:');
    console.log('   localStorage.removeItem("b3-coaching-data");');
    console.log('   setTimeout(() => location.reload(), 1000);');
    console.log('2. Applikationen kommer då ladda triggers från databasen');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

transferDataToCurrentUser();
