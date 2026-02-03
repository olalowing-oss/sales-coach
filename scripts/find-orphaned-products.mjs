#!/usr/bin/env node

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

async function findOrphanedProducts() {
  console.log('🔍 Looking for orphaned product_id references...\n');

  const tables = ['trigger_patterns', 'battlecards', 'objection_handlers', 'case_studies', 'offers'];

  // Get all valid product IDs
  const { data: products } = await supabase
    .from('products')
    .select('id, name, user_id');

  const validProductIds = new Set(products?.map(p => p.id) || []);
  console.log(`✅ Valid products: ${validProductIds.size}\n`);

  products?.forEach(p => {
    console.log(`   - ${p.id.substring(0, 8)}... (${p.name})`);
  });

  console.log('\n🔍 Checking for orphaned product_id references...\n');

  for (const table of tables) {
    const { data: items } = await supabase
      .from(table)
      .select('id, user_id, product_id');

    if (!items || items.length === 0) continue;

    const orphaned = items.filter(item =>
      item.product_id && !validProductIds.has(item.product_id)
    );

    if (orphaned.length > 0) {
      console.log(`❌ ${table}: ${orphaned.length} items with invalid product_id`);

      // Group by product_id
      const byProductId = {};
      orphaned.forEach(item => {
        const pid = item.product_id;
        if (!byProductId[pid]) {
          byProductId[pid] = [];
        }
        byProductId[pid].push(item);
      });

      for (const [productId, items] of Object.entries(byProductId)) {
        console.log(`   - product_id: ${productId.substring(0, 8)}... (${items.length} items)`);

        // Show user_ids
        const userIds = new Set(items.map(i => i.user_id));
        userIds.forEach(uid => {
          console.log(`      user_id: ${uid?.substring(0, 8) || 'NULL'}...`);
        });
      }
      console.log('');
    }
  }

  console.log('\n💡 Solution:');
  console.log('   These product_ids reference deleted products.');
  console.log('   Options:');
  console.log('   1. Set product_id to NULL (make them global)');
  console.log('   2. Link to an existing product');
  console.log('   3. Create the missing product\n');
}

findOrphanedProducts().catch(console.error);
