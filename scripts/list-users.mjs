#!/usr/bin/env node

/**
 * List all users in the database
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

async function listUsers() {
  console.log('👥 Listing all users...\n');

  // Get all users using admin API
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error fetching users:', error.message);
    return;
  }

  if (!data.users || data.users.length === 0) {
    console.log('No users found.');
    return;
  }

  console.log(`Found ${data.users.length} users:\n`);

  for (const user of data.users) {
    const userId = user.id;
    const email = user.email || 'No email';
    const createdAt = new Date(user.created_at).toLocaleDateString('sv-SE');
    const lastSignIn = user.last_sign_in_at
      ? new Date(user.last_sign_in_at).toLocaleDateString('sv-SE')
      : 'Never';

    console.log(`📧 ${email}`);
    console.log(`   ID: ${userId}`);
    console.log(`   Created: ${createdAt}`);
    console.log(`   Last sign in: ${lastSignIn}`);

    // Check if user has products
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .eq('user_id', userId);

    if (products && products.length > 0) {
      console.log(`   Products: ${products.length}`);
      products.forEach(p => {
        console.log(`      - ${p.name} (${p.id.substring(0, 8)}...)`);
      });
    } else {
      console.log(`   Products: 0 (no products)`);
    }

    // Check coaching data count
    const tables = ['trigger_patterns', 'battlecards', 'objection_handlers', 'case_studies', 'offers'];
    let totalCoachingItems = 0;
    const breakdown = {};

    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (count && count > 0) {
        totalCoachingItems += count;
        breakdown[table] = count;
      }
    }

    if (totalCoachingItems > 0) {
      console.log(`   Coaching data: ${totalCoachingItems} items`);
      for (const [table, count] of Object.entries(breakdown)) {
        console.log(`      - ${table}: ${count}`);
      }
    } else {
      console.log(`   Coaching data: 0 items`);
    }

    console.log('');
  }
}

listUsers().catch(console.error);
