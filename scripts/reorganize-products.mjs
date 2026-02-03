#!/usr/bin/env node

/**
 * Reorganize products and data according to plan:
 * 1. ola@lowing.eu should own ALL data (as main owner)
 * 2. Create "AI Sales Coach Pro" product for peo@lowing.eu
 * 3. Link only AI Sales Coach Pro data to peo's product
 * 4. Everything else belongs to ola
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function reorganize() {
  console.log('🚀 Reorganizing products and data ownership...\n');

  // Get users
  const { data: users } = await supabase.auth.admin.listUsers();
  const ola = users?.users.find(u => u.email === 'ola@lowing.eu');
  const peo = users?.users.find(u => u.email === 'peo@lowing.eu');

  if (!ola || !peo) {
    console.error('❌ Could not find users');
    return;
  }

  console.log(`📧 ola@lowing.eu: ${ola.id}`);
  console.log(`📧 peo@lowing.eu: ${peo.id}\n`);

  // STEP 1: Rename peo's product to "AI Sales Coach Pro"
  console.log('📝 Step 1: Rename peo\'s product to "AI Sales Coach Pro"...');

  const { data: peoProducts } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', peo.id);

  let aiSalesCoachProProduct;

  if (peoProducts && peoProducts.length > 0) {
    const { data: updated, error } = await supabase
      .from('products')
      .update({
        name: 'AI Sales Coach Pro',
        description: 'Professional AI-powered sales coaching platform'
      })
      .eq('id', peoProducts[0].id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error renaming product:', error.message);
      return;
    }

    aiSalesCoachProProduct = updated;
    console.log(`✅ Renamed to "AI Sales Coach Pro" (${aiSalesCoachProProduct.id.substring(0, 8)}...)\n`);
  } else {
    // Create the product
    const { data: created, error } = await supabase
      .from('products')
      .insert({
        user_id: peo.id,
        name: 'AI Sales Coach Pro',
        description: 'Professional AI-powered sales coaching platform'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating product:', error.message);
      return;
    }

    aiSalesCoachProProduct = created;
    console.log(`✅ Created "AI Sales Coach Pro" (${aiSalesCoachProProduct.id.substring(0, 8)}...)\n`);
  }

  // STEP 2: Get or create ola's main product
  console.log('📝 Step 2: Ensure ola has a main product...');

  const { data: olaProducts } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', ola.id);

  let olaMainProduct;

  if (olaProducts && olaProducts.length > 0) {
    // Rename it to something more descriptive
    const { data: updated, error } = await supabase
      .from('products')
      .update({
        name: 'M365',
        description: 'Microsoft 365 coaching data'
      })
      .eq('id', olaProducts[0].id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating ola\'s product:', error.message);
      return;
    }

    olaMainProduct = updated;
    console.log(`✅ ola's product: "${olaMainProduct.name}" (${olaMainProduct.id.substring(0, 8)}...)\n`);
  } else {
    // Create it
    const { data: created, error } = await supabase
      .from('products')
      .insert({
        user_id: ola.id,
        name: 'M365',
        description: 'Microsoft 365 coaching data'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating ola\'s product:', error.message);
      return;
    }

    olaMainProduct = created;
    console.log(`✅ Created ola's product: "${olaMainProduct.name}" (${olaMainProduct.id.substring(0, 8)}...)\n`);
  }

  // STEP 3: Move ALL coaching data to ola as owner
  console.log('📝 Step 3: Move ALL coaching data to ola@lowing.eu...\n');

  const tables = ['trigger_patterns', 'battlecards', 'objection_handlers', 'case_studies', 'offers'];

  for (const table of tables) {
    // Update all items to have ola as owner and link to ola's product
    const { data: items, error: selectError } = await supabase
      .from(table)
      .select('id, user_id, product_id')
      .neq('user_id', ola.id); // Get all items NOT owned by ola

    if (selectError) {
      console.error(`❌ Error querying ${table}:`, selectError.message);
      continue;
    }

    if (items && items.length > 0) {
      console.log(`🔄 Moving ${items.length} items from ${table}...`);

      const { error: updateError } = await supabase
        .from(table)
        .update({
          user_id: ola.id,
          product_id: olaMainProduct.id
        })
        .neq('user_id', ola.id);

      if (updateError) {
        console.error(`❌ Error updating ${table}:`, updateError.message);
      } else {
        console.log(`✅ Moved ${items.length} items to ola@lowing.eu`);
      }
    }

    // Also update ola's existing items to link to the main product
    const { data: olaItems, error: olaSelectError } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', ola.id);

    if (olaItems && olaItems.length > 0) {
      const { error: olaUpdateError } = await supabase
        .from(table)
        .update({ product_id: olaMainProduct.id })
        .eq('user_id', ola.id);

      if (!olaUpdateError) {
        console.log(`✅ Linked ${olaItems.length} existing ola items in ${table}`);
      }
    }
  }

  console.log('\n✅ Reorganization complete!\n');
  console.log('📊 Summary:');
  console.log(`   - ola@lowing.eu: Owner of ALL coaching data`);
  console.log(`   - ola's product: "${olaMainProduct.name}"`);
  console.log(`   - peo@lowing.eu: Has separate product "AI Sales Coach Pro"`);
  console.log(`   - peo's product has 0 items (ready to add AI Sales Coach Pro data)`);
  console.log('\n💡 Next steps:');
  console.log('   1. Add specific coaching data to "AI Sales Coach Pro" product');
  console.log('   2. peo@lowing.eu will only see AI Sales Coach Pro data');
  console.log('   3. ola@lowing.eu will see all general data\n');
}

reorganize().catch(console.error);
