import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const OLD_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f'; // Målprodukt (det gamla)
const NEW_PRODUCT_ID = 'ce52ccee-0cfe-48ed-b785-3679e01c2409'; // Nuvarande product ID
const USER_ID = '72f242c2-2dd3-441b-9183-0fe4854f29b4';

async function updateTriggerProductIds() {
  try {
    console.log('🚀 Uppdaterar trigger product IDs...\n');
    console.log(`Från: ${NEW_PRODUCT_ID}`);
    console.log(`Till:  ${OLD_PRODUCT_ID}\n`);

    // First, make sure the old product exists
    const { data: oldProduct, error: checkError } = await supabase
      .from('product_profiles')
      .select('id, name')
      .eq('id', OLD_PRODUCT_ID)
      .single();

    if (checkError || !oldProduct) {
      console.log('📦 Gamla produkten finns inte, skapar den...');

      const { error: createError } = await supabase
        .from('product_profiles')
        .insert({
          id: OLD_PRODUCT_ID,
          user_id: USER_ID,
          name: 'M365',
          description: 'Microsoft 365 produktlinje'
        });

      if (createError) {
        console.error('❌ Kunde inte skapa produkt:', createError);
        throw createError;
      }
      console.log('✅ Produkt skapad!\n');
    } else {
      console.log(`✅ Produkten finns redan: ${oldProduct.name}\n`);
    }

    // Update all triggers
    console.log('🔄 Uppdaterar triggers...');
    const { data, error } = await supabase
      .from('trigger_patterns')
      .update({ product_id: OLD_PRODUCT_ID })
      .eq('product_id', NEW_PRODUCT_ID)
      .eq('user_id', USER_ID)
      .select();

    if (error) {
      console.error('❌ Fel vid uppdatering:', error);
      throw error;
    }

    console.log(`✅ Uppdaterade ${data?.length || 0} triggers\n`);

    // Now delete the new product if it has no data
    console.log('🗑️  Kollar om nya produkten kan tas bort...');

    const { data: remainingData, error: checkRemainingError } = await supabase
      .from('trigger_patterns')
      .select('id')
      .eq('product_id', NEW_PRODUCT_ID)
      .eq('user_id', USER_ID);

    if (!checkRemainingError && (!remainingData || remainingData.length === 0)) {
      console.log('   Inga triggers kvar för nya produkten');

      // Check other tables too
      const { data: bc } = await supabase.from('battlecards').select('id').eq('product_id', NEW_PRODUCT_ID).eq('user_id', USER_ID);
      const { data: oh } = await supabase.from('objection_handlers').select('id').eq('product_id', NEW_PRODUCT_ID).eq('user_id', USER_ID);
      const { data: cs } = await supabase.from('case_studies').select('id').eq('product_id', NEW_PRODUCT_ID).eq('user_id', USER_ID);
      const { data: offers } = await supabase.from('offers').select('id').eq('product_id', NEW_PRODUCT_ID).eq('user_id', USER_ID);

      if ((!bc || bc.length === 0) && (!oh || oh.length === 0) && (!cs || cs.length === 0) && (!offers || offers.length === 0)) {
        console.log('   Ingen annan data heller, tar bort produkten...');

        const { error: deleteError } = await supabase
          .from('product_profiles')
          .delete()
          .eq('id', NEW_PRODUCT_ID);

        if (deleteError) {
          console.log('   ⚠️  Kunde inte ta bort produkt:', deleteError.message);
        } else {
          console.log('   ✅ Nya produkten borttagen');
        }
      } else {
        console.log('   ⚠️  Produkten har annan data, behåller den');
      }
    }

    console.log('\n🎉 KLART!');
    console.log(`Alla triggers använder nu product ID: ${OLD_PRODUCT_ID}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateTriggerProductIds();
