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

async function checkMapping() {
  console.log('🔍 Checking user-product mapping...\n');

  // Get the two users
  const { data: users } = await supabase.auth.admin.listUsers();

  const ola = users?.users.find(u => u.email === 'ola@lowing.eu');
  const peo = users?.users.find(u => u.email === 'peo@lowing.eu');

  console.log('📧 ola@lowing.eu:');
  console.log(`   User ID: ${ola?.id}`);

  const { data: olaProducts } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', ola?.id);

  if (olaProducts && olaProducts.length > 0) {
    console.log(`   Products: ${olaProducts.length}`);
    olaProducts.forEach(p => {
      console.log(`      - ${p.name} (${p.id})`);
      console.log(`        user_id in product: ${p.user_id}`);
    });
  } else {
    console.log(`   Products: None`);
  }

  // Check coaching data ownership
  const { data: olaBattlecards } = await supabase
    .from('battlecards')
    .select('id, user_id, product_id')
    .eq('user_id', ola?.id);

  console.log(`   Battlecards: ${olaBattlecards?.length || 0}`);
  if (olaBattlecards && olaBattlecards.length > 0) {
    olaBattlecards.forEach(bc => {
      console.log(`      - ID: ${bc.id.substring(0, 8)}... user_id: ${bc.user_id?.substring(0, 8)}... product_id: ${bc.product_id?.substring(0, 8) || 'NULL'}...`);
    });
  }

  console.log('\n📧 peo@lowing.eu:');
  console.log(`   User ID: ${peo?.id}`);

  const { data: peoProducts } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', peo?.id);

  if (peoProducts && peoProducts.length > 0) {
    console.log(`   Products: ${peoProducts.length}`);
    peoProducts.forEach(p => {
      console.log(`      - ${p.name} (${p.id})`);
      console.log(`        user_id in product: ${p.user_id}`);
    });
  } else {
    console.log(`   Products: None`);
  }

  console.log('\n🤔 Problem du beskriver:');
  console.log('   Du vill att ola@lowing.eu INTE ska ha egen produkt');
  console.log('   Istället ska data kopplas till peo@lowing.eu (72f242c2)?');
  console.log('\n💡 Förslag på lösning:');
  console.log('   1. Ta bort ola@lowing.eu\'s produkt');
  console.log('   2. Flytta ola\'s battlecards till peo\'s user_id OCH peo\'s product');
  console.log('   3. Eller: Låt ola@lowing.eu vara utan produkt helt\n');
}

checkMapping().catch(console.error);
