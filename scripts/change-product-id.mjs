import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const OLD_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f';
const NEW_PRODUCT_ID = 'ce52ccee-0cfe-48ed-b785-3679e01c2409';

async function changeProductId() {
  try {
    console.log('🚀 Byter product ID...\n');
    console.log(`Från: ${OLD_PRODUCT_ID}`);
    console.log(`Till:  ${NEW_PRODUCT_ID}\n`);

    // Find user
    const userEmail = 'ola@lowing.eu';
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const authUser = authData.users.find(u => u.email === userEmail);
    if (!authUser) throw new Error(`User ${userEmail} not found`);
    const userId = authUser.id;

    // 1. Update product_profiles table - change the ID itself
    console.log('📦 Uppdaterar product_profiles...');
    const { error: productError } = await supabase
      .from('product_profiles')
      .update({ id: NEW_PRODUCT_ID })
      .eq('id', OLD_PRODUCT_ID)
      .eq('user_id', userId);

    if (productError) {
      console.error('❌ Error updating product_profiles:', productError);
      throw productError;
    }
    console.log('✅ Product ID uppdaterat i product_profiles\n');

    // 2. Update battlecards
    console.log('⚔️  Uppdaterar battlecards...');
    const { data: bcData, error: bcError } = await supabase
      .from('battlecards')
      .update({ product_id: NEW_PRODUCT_ID })
      .eq('product_id', OLD_PRODUCT_ID)
      .eq('user_id', userId)
      .select();

    if (bcError) {
      console.error('❌ Error updating battlecards:', bcError);
    } else {
      console.log(`✅ Uppdaterade ${bcData?.length || 0} battlecards\n`);
    }

    // 3. Update objection_handlers
    console.log('⚠️  Uppdaterar objection_handlers...');
    const { data: ohData, error: ohError } = await supabase
      .from('objection_handlers')
      .update({ product_id: NEW_PRODUCT_ID })
      .eq('product_id', OLD_PRODUCT_ID)
      .eq('user_id', userId)
      .select();

    if (ohError) {
      console.error('❌ Error updating objection_handlers:', ohError);
    } else {
      console.log(`✅ Uppdaterade ${ohData?.length || 0} objection handlers\n`);
    }

    // 4. Update case_studies
    console.log('📚 Uppdaterar case_studies...');
    const { data: csData, error: csError } = await supabase
      .from('case_studies')
      .update({ product_id: NEW_PRODUCT_ID })
      .eq('product_id', OLD_PRODUCT_ID)
      .eq('user_id', userId)
      .select();

    if (csError) {
      console.error('❌ Error updating case_studies:', csError);
    } else {
      console.log(`✅ Uppdaterade ${csData?.length || 0} case studies\n`);
    }

    // 5. Update offers
    console.log('💰 Uppdaterar offers...');
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .update({ product_id: NEW_PRODUCT_ID })
      .eq('product_id', OLD_PRODUCT_ID)
      .eq('user_id', userId)
      .select();

    if (offerError) {
      console.error('❌ Error updating offers:', offerError);
    } else {
      console.log(`✅ Uppdaterade ${offerData?.length || 0} offers\n`);
    }

    console.log('✅ Klart! Product ID är nu ändrat i databasen till:', NEW_PRODUCT_ID);
    console.log('\n⚠️  OBS: Du måste också uppdatera localStorage för triggers.');
    console.log('Kör detta script i browser console:\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

changeProductId();
