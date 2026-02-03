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

async function checkProducts() {
  console.log('📦 Checking all products in detail...\n');

  const { data: products } = await supabase
    .from('products')
    .select('*');

  if (!products || products.length === 0) {
    console.log('No products found.');
    return;
  }

  for (const product of products) {
    const { data: userData } = await supabase.auth.admin.getUserById(product.user_id);
    const email = userData?.user?.email || 'No email';

    console.log(`📦 ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Owner: ${email} (${product.user_id.substring(0, 8)}...)`);
    console.log(`   Description: ${product.description || 'None'}`);
    console.log(`   Created: ${new Date(product.created_at).toLocaleDateString('sv-SE')}`);

    // Count coaching data for this product
    const tables = ['trigger_patterns', 'battlecards', 'objection_handlers', 'case_studies', 'offers'];
    const dataCounts = {};

    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('product_id', product.id);

      if (count && count > 0) {
        dataCounts[table] = count;
      }
    }

    const totalItems = Object.values(dataCounts).reduce((sum, count) => sum + count, 0);

    if (totalItems > 0) {
      console.log(`   Coaching data: ${totalItems} items`);
      for (const [table, count] of Object.entries(dataCounts)) {
        console.log(`      - ${table}: ${count}`);
      }
    } else {
      console.log(`   Coaching data: 0 items`);
    }

    console.log('');
  }

  console.log('\n💡 Tips:');
  console.log('   - Byt namn på "peo Product" till "AI Sales Coach Pro"');
  console.log('   - Flytta all data från peo till ola som owner');
  console.log('   - Låt peo\'s produkt "AI Sales Coach Pro" vara separat\n');
}

checkProducts().catch(console.error);
