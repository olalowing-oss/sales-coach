#!/usr/bin/env node

/**
 * Create default products for existing users
 *
 * This script creates a default product for each user who has coaching data
 * but no products yet. It then links their coaching data to the new product.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials (need SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUsersWithData() {
  const tables = ['trigger_patterns', 'battlecards', 'objection_handlers', 'case_studies', 'offers'];
  const userIds = new Set();

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('user_id');

    if (error) {
      console.error(`❌ Error querying ${table}:`, error.message);
      continue;
    }

    data?.forEach(row => {
      if (row.user_id) {
        userIds.add(row.user_id);
      }
    });
  }

  return Array.from(userIds);
}

async function getUserEmail(userId) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data.user) {
    return 'unknown@example.com';
  }
  return data.user.email || 'unknown@example.com';
}

async function createDefaultProduct(userId, email) {
  console.log(`\n📦 Creating default product for user ${userId.substring(0, 8)}... (${email})`);

  // Check if user already has a product
  const { data: existing, error: checkError } = await supabase
    .from('products')
    .select('id, name')
    .eq('user_id', userId)
    .maybeSingle();

  if (checkError) {
    console.error(`   ❌ Error checking existing products:`, checkError.message);
    return null;
  }

  if (existing) {
    console.log(`   ✅ User already has product: "${existing.name}"`);
    return existing.id;
  }

  // Create new product
  const productName = email.split('@')[0] + ' Product'; // e.g., "ola Product"

  const { data: newProduct, error: createError } = await supabase
    .from('products')
    .insert({
      user_id: userId,
      name: productName,
      description: 'Default product created automatically'
    })
    .select()
    .single();

  if (createError) {
    console.error(`   ❌ Error creating product:`, createError.message);
    return null;
  }

  console.log(`   ✅ Created product: "${newProduct.name}" (${newProduct.id.substring(0, 8)}...)`);
  return newProduct.id;
}

async function linkCoachingDataToProduct(userId, productId) {
  const tables = [
    'trigger_patterns',
    'battlecards',
    'objection_handlers',
    'case_studies',
    'offers'
  ];

  console.log(`\n🔗 Linking coaching data to product ${productId.substring(0, 8)}...`);

  for (const table of tables) {
    // Only update items that belong to this user and have NULL product_id
    const { data, error: updateError } = await supabase
      .from(table)
      .update({ product_id: productId })
      .eq('user_id', userId)
      .is('product_id', null)
      .select('id');

    if (updateError) {
      console.error(`   ❌ Error updating ${table}:`, updateError.message);
      continue;
    }

    const count = data?.length || 0;
    if (count > 0) {
      console.log(`   ✅ Updated ${count} items in ${table}`);
    }
  }
}

async function main() {
  console.log('🚀 Creating default products for existing users...\n');

  // Get all users who have coaching data
  const userIds = await getUsersWithData();
  console.log(`📊 Found ${userIds.length} users with coaching data`);

  for (const userId of userIds) {
    const email = await getUserEmail(userId);
    const productId = await createDefaultProduct(userId, email);

    if (productId) {
      await linkCoachingDataToProduct(userId, productId);
    }
  }

  console.log('\n✅ Done! Default products created and linked.\n');
  console.log('💡 Next steps:');
  console.log('   1. Reload the app in browser');
  console.log('   2. Check that coaching data is now filtered by product');
  console.log('   3. Users can rename their products in ProductAdminPanel\n');
}

main().catch(console.error);
