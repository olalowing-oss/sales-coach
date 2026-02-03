#!/usr/bin/env node
/**
 * Test script for RAG answer-question API
 *
 * Usage: node test-rag-answer.mjs
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing RAG Answer API\n');

// Test 1: Check if knowledge_base table has documents
console.log('Test 1: Checking knowledge_base table...');
const { data: docs, error: docsError, count } = await supabase
  .from('knowledge_base')
  .select('id, title, product_id', { count: 'exact' })
  .limit(5);

if (docsError) {
  console.error('❌ Error querying knowledge_base:', docsError.message);
} else {
  console.log(`✅ Found ${count} documents in knowledge_base`);
  if (docs && docs.length > 0) {
    console.log('   First 5 documents:');
    docs.forEach(doc => {
      console.log(`   - ${doc.title} (product: ${doc.product_id || 'none'})`);
    });
  } else {
    console.log('   ⚠️  No documents found! You need to upload documents first.');
  }
}

console.log('');

// Test 2: Check if match_knowledge_base function exists
console.log('Test 2: Testing match_knowledge_base function...');
try {
  // Create a dummy embedding (1536 dimensions for text-embedding-ada-002)
  const dummyEmbedding = Array(1536).fill(0);

  const { data: matches, error: matchError } = await supabase.rpc('match_knowledge_base', {
    query_embedding: dummyEmbedding,
    match_threshold: 0.5,
    match_count: 3,
    filter_product_id: null
  });

  if (matchError) {
    console.error('❌ Error calling match_knowledge_base:', matchError.message);
    console.log('   This function may not exist in your database.');
    console.log('   Run migration: supabase/migrations/004_create_vector_search_function.sql');
  } else {
    console.log('✅ match_knowledge_base function works!');
    console.log(`   Returned ${matches?.length || 0} results`);
  }
} catch (err) {
  console.error('❌ Error testing function:', err.message);
}

console.log('');

// Test 3: Check OpenAI API key
console.log('Test 3: Checking OpenAI API key...');
const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
if (!openaiKey) {
  console.error('❌ OpenAI API key not found!');
  console.log('   Set VITE_OPENAI_API_KEY or OPENAI_API_KEY in .env');
} else {
  console.log('✅ OpenAI API key is set');
  console.log(`   Key starts with: ${openaiKey.substring(0, 10)}...`);
}

console.log('');

// Test 4: Test the API endpoint (if running locally)
console.log('Test 4: Testing /api/answer-question endpoint...');
try {
  const response = await fetch('http://localhost:3000/api/answer-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Vad är SLA för Microsoft 365?',
      productId: null,
      context: ''
    })
  });

  if (!response.ok) {
    console.log(`⚠️  API returned status ${response.status}`);
    const text = await response.text();
    console.log('   Response:', text.substring(0, 200));
  } else {
    const data = await response.json();
    console.log('✅ API endpoint works!');
    console.log('   Answer:', data.answer.substring(0, 100) + '...');
    console.log('   Sources:', data.sources?.length || 0);
    console.log('   Confidence:', data.confidence);
  }
} catch (err) {
  console.log('⚠️  Could not reach local API endpoint');
  console.log('   Make sure dev server is running: npm run dev');
  console.log('   Error:', err.message);
}

console.log('\n=== Summary ===');
console.log('Next steps:');
console.log('1. If no documents found: Upload M365 documents to knowledge_base');
console.log('2. If match_knowledge_base error: Run database migration');
console.log('3. If OpenAI key missing: Add to .env file');
console.log('4. If API error: Check browser console for errors');
