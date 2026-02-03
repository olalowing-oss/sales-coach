#!/usr/bin/env node

/**
 * Migrate all data from ola@lowing.eu to peo@lowing.eu
 * This will:
 * 1. Move all battlecards from ola to peo's ownership
 * 2. Link them to peo's product
 * 3. Delete ola's product
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

async function migrate() {
  console.log('🚀 Migrating data from ola@lowing.eu to peo@lowing.eu...\n');

  // Get user IDs
  const { data: users } = await supabase.auth.admin.listUsers();
  const ola = users?.users.find(u => u.email === 'ola@lowing.eu');
  const peo = users?.users.find(u => u.email === 'peo@lowing.eu');

  if (!ola || !peo) {
    console.error('❌ Could not find users');
    return;
  }

  console.log(`📧 ola@lowing.eu: ${ola.id}`);
  console.log(`📧 peo@lowing.eu: ${peo.id}\n`);

  // Get peo's product
  const { data: peoProducts } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', peo.id);

  if (!peoProducts || peoProducts.length === 0) {
    console.error('❌ peo@lowing.eu has no product!');
    return;
  }

  const peoProduct = peoProducts[0];
  console.log(`📦 peo's Product: ${peoProduct.name} (${peoProduct.id})\n`);

  // Move battlecards
  console.log('🔄 Moving battlecards from ola to peo...');
  const { data: movedBattlecards, error: battlecardsError } = await supabase
    .from('battlecards')
    .update({
      user_id: peo.id,
      product_id: peoProduct.id
    })
    .eq('user_id', ola.id)
    .select();

  if (battlecardsError) {
    console.error('❌ Error moving battlecards:', battlecardsError.message);
  } else {
    console.log(`✅ Moved ${movedBattlecards?.length || 0} battlecards to peo@lowing.eu`);
  }

  // Check for other coaching data
  const tables = ['trigger_patterns', 'objection_handlers', 'case_studies', 'offers'];

  for (const table of tables) {
    const { data: items } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', ola.id);

    if (items && items.length > 0) {
      console.log(`\n🔄 Moving ${items.length} items from ${table}...`);
      const { error } = await supabase
        .from(table)
        .update({
          user_id: peo.id,
          product_id: peoProduct.id
        })
        .eq('user_id', ola.id);

      if (error) {
        console.error(`❌ Error moving ${table}:`, error.message);
      } else {
        console.log(`✅ Moved ${items.length} items from ${table}`);
      }
    }
  }

  // Delete ola's product
  console.log('\n🗑️  Deleting ola\'s product...');
  const { data: olaProducts } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', ola.id);

  if (olaProducts && olaProducts.length > 0) {
    for (const product of olaProducts) {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (deleteError) {
        console.error(`❌ Error deleting product ${product.name}:`, deleteError.message);
      } else {
        console.log(`✅ Deleted product: ${product.name}`);
      }
    }
  }

  console.log('\n✅ Migration complete!\n');
  console.log('📊 Summary:');
  console.log('   - All battlecards now owned by peo@lowing.eu');
  console.log('   - All data linked to peo\'s product');
  console.log('   - ola@lowing.eu has no products');
  console.log('   - ola@lowing.eu can still login but will see peo\'s data (if shared)\n');
}

migrate().catch(console.error);
