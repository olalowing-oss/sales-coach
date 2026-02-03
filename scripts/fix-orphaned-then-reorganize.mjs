#!/usr/bin/env node

/**
 * Fix orphaned product_id references, then reorganize
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

async function fixAndReorganize() {
  console.log('🔧 Fixing orphaned product references...\n');

  // Get all valid product IDs
  const { data: products } = await supabase
    .from('products')
    .select('id');

  const validProductIds = new Set(products?.map(p => p.id) || []);
  console.log(`✅ Valid products: ${validProductIds.size}\n`);

  const tables = ['trigger_patterns', 'battlecards', 'objection_handlers', 'case_studies', 'offers'];

  // STEP 1: Set orphaned product_ids to NULL
  console.log('📝 Step 1: Clearing orphaned product_id references...\n');

  for (const table of tables) {
    const { data: items } = await supabase
      .from(table)
      .select('id, product_id');

    if (!items) continue;

    const orphaned = items.filter(item =>
      item.product_id && !validProductIds.has(item.product_id)
    );

    if (orphaned.length > 0) {
      console.log(`🔄 Clearing ${orphaned.length} orphaned references in ${table}...`);

      const orphanedIds = orphaned.map(i => i.id);

      const { error } = await supabase
        .from(table)
        .update({ product_id: null })
        .in('id', orphanedIds);

      if (error) {
        console.error(`❌ Error clearing ${table}:`, error.message);
      } else {
        console.log(`✅ Cleared ${orphaned.length} orphaned references`);
      }
    }
  }

  console.log('\n🚀 Now reorganizing products and ownership...\n');

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

  // Get products
  const { data: peoProducts } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', peo.id);

  const { data: olaProducts } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', ola.id);

  if (!peoProducts?.[0] || !olaProducts?.[0]) {
    console.error('❌ Products missing');
    return;
  }

  const aiSalesCoachPro = peoProducts[0];
  const m365Product = olaProducts[0];

  console.log(`📦 peo's product: "${aiSalesCoachPro.name}" (${aiSalesCoachPro.id.substring(0, 8)}...)`);
  console.log(`📦 ola's product: "${m365Product.name}" (${m365Product.id.substring(0, 8)}...)\n`);

  // STEP 2: Move all data to ola and link to M365 product
  console.log('📝 Step 2: Moving ALL coaching data to ola@lowing.eu and M365 product...\n');

  for (const table of tables) {
    console.log(`🔄 Processing ${table}...`);

    // Update ALL items to be owned by ola and linked to M365
    const { data: allItems, error: selectError } = await supabase
      .from(table)
      .select('id, user_id, product_id');

    if (selectError) {
      console.error(`❌ Error querying ${table}:`, selectError.message);
      continue;
    }

    if (allItems && allItems.length > 0) {
      const { error: updateError } = await supabase
        .from(table)
        .update({
          user_id: ola.id,
          product_id: m365Product.id
        })
        .in('id', allItems.map(i => i.id));

      if (updateError) {
        console.error(`❌ Error updating ${table}:`, updateError.message);
      } else {
        console.log(`✅ Updated ${allItems.length} items in ${table}`);
      }
    }
  }

  console.log('\n✅ Complete!\n');
  console.log('📊 Final structure:');
  console.log(`   - ola@lowing.eu owns ALL coaching data`);
  console.log(`   - All data linked to "M365" product`);
  console.log(`   - peo@lowing.eu has empty "AI Sales Coach Pro" product`);
  console.log('\n💡 When peo logs in, they will only see AI Sales Coach Pro data (currently empty)');
  console.log('   When ola logs in, they will see all M365 data\n');
}

fixAndReorganize().catch(console.error);
