import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function linkDataToM365() {
  try {
    console.log('🚀 Starting data linking to M365...\n');

    // 1. Find user
    const userEmail = 'ola@lowing.eu';
    console.log(`📧 Looking for user: ${userEmail}`);

    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const authUser = authData.users.find(u => u.email === userEmail);
    if (!authUser) throw new Error(`User ${userEmail} not found`);

    const userId = authUser.id;
    console.log(`✅ Found user: ${userId}\n`);

    // 2. Find M365 product
    console.log('📦 Looking for M365 product...');
    const { data: product, error: productError } = await supabase
      .from('product_profiles')
      .select('id, name')
      .eq('name', 'M365')
      .eq('user_id', userId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error('M365 product not found');

    const m365Id = product.id;
    console.log(`✅ Found M365: ${m365Id}\n`);

    // 3. Update all coaching data with null productId to M365
    console.log('🔄 Updating coaching data...\n');

    // Update battlecards
    const { data: bcData, error: bcError } = await supabase
      .from('battlecards')
      .update({ product_id: m365Id })
      .is('product_id', null)
      .eq('user_id', userId)
      .select();

    if (bcError) {
      console.error('❌ Error updating battlecards:', bcError);
    } else {
      console.log(`✅ Updated ${bcData?.length || 0} battlecards`);
    }

    // Update objection_handlers
    const { data: ohData, error: ohError } = await supabase
      .from('objection_handlers')
      .update({ product_id: m365Id })
      .is('product_id', null)
      .eq('user_id', userId)
      .select();

    if (ohError) {
      console.error('❌ Error updating objection_handlers:', ohError);
    } else {
      console.log(`✅ Updated ${ohData?.length || 0} objection handlers`);
    }

    // Update case_studies
    const { data: csData, error: csError } = await supabase
      .from('case_studies')
      .update({ product_id: m365Id })
      .is('product_id', null)
      .eq('user_id', userId)
      .select();

    if (csError) {
      console.error('❌ Error updating case_studies:', csError);
    } else {
      console.log(`✅ Updated ${csData?.length || 0} case studies`);
    }

    // Update offers
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .update({ product_id: m365Id })
      .is('product_id', null)
      .eq('user_id', userId)
      .select();

    if (offerError) {
      console.error('❌ Error updating offers:', offerError);
    } else {
      console.log(`✅ Updated ${offerData?.length || 0} offers`);
    }

    console.log('\n✅ All database coaching data linked to M365!');
    console.log('\n⚠️  Note: Triggers are stored in localStorage and need to be updated in the UI');
    console.log('   You can do this by:');
    console.log('   1. Go to CoachingAdminPanel');
    console.log('   2. Select each trigger and save it with M365 selected');
    console.log('   OR regenerate triggers using "Generera från produktdokument"');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

linkDataToM365();
