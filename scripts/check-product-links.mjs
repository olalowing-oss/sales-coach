#!/usr/bin/env node

/**
 * Check if coaching data is properly linked to products
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

async function checkProductLinks() {
  console.log('🔗 Checking product links for coaching data...\n');

  const tables = ['trigger_patterns', 'battlecards', 'objection_handlers', 'case_studies', 'offers'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('id, user_id, product_id');

    if (error) {
      console.error(`❌ Error querying ${table}:`, error.message);
      continue;
    }

    const total = data?.length || 0;
    const withProduct = data?.filter(item => item.product_id !== null).length || 0;
    const withoutProduct = total - withProduct;

    console.log(`📊 ${table}:`);
    console.log(`   Total: ${total}`);
    console.log(`   Linked to product: ${withProduct} (${Math.round(withProduct/total*100)}%)`);
    console.log(`   NOT linked (product_id IS NULL): ${withoutProduct} (${Math.round(withoutProduct/total*100)}%)`);

    // Show user breakdown
    if (data && data.length > 0) {
      const userBreakdown = {};
      data.forEach(item => {
        const userId = item.user_id?.substring(0, 8) || 'no-user';
        if (!userBreakdown[userId]) {
          userBreakdown[userId] = { total: 0, linked: 0, unlinked: 0 };
        }
        userBreakdown[userId].total++;
        if (item.product_id) {
          userBreakdown[userId].linked++;
        } else {
          userBreakdown[userId].unlinked++;
        }
      });

      console.log('\n   Per user:');
      for (const [userId, stats] of Object.entries(userBreakdown)) {
        console.log(`   - ${userId}: ${stats.total} total (${stats.linked} linked, ${stats.unlinked} unlinked)`);
      }
    }

    console.log('');
  }

  // Summary
  console.log('\n📋 Summary:');
  console.log('If items are NOT linked to products, users will see ALL data.');
  console.log('Run: node scripts/create-default-products.mjs to link existing data.\n');
}

checkProductLinks().catch(console.error);
