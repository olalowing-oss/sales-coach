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

async function checkMigrations() {
  console.log('🔍 Checking RAG migrations...\n');

  // Check if document_query column exists
  console.log('1️⃣ Checking document_query column in trigger_patterns...');
  const { data: triggers, error: triggerError } = await supabase
    .from('trigger_patterns')
    .select('id, keywords, document_query')
    .limit(1);

  if (triggerError) {
    console.log('❌ Migration 003 NOT applied:', triggerError.message);
    console.log('   → Run supabase/migrations/003_add_document_query_to_triggers.sql\n');
  } else {
    console.log('✅ Migration 003 applied! document_query column exists\n');
  }

  // Check if match_documents function exists
  console.log('2️⃣ Checking match_documents() function...');
  const { data: funcData, error: funcError } = await supabase.rpc('match_documents', {
    query_embedding: new Array(1536).fill(0.1),
    match_threshold: 0.5,
    match_count: 1
  });

  if (funcError) {
    console.log('❌ Migration 004 NOT applied:', funcError.message);
    console.log('   → Run supabase/migrations/004_create_vector_search_function.sql\n');
  } else {
    console.log('✅ Migration 004 applied! Vector search function exists');
    console.log(`   Found ${funcData?.length || 0} test results\n`);
  }

  // Check if documents table exists with embeddings
  console.log('3️⃣ Checking documents and embeddings...');
  const { data: docs, error: docsError } = await supabase
    .from('documents')
    .select('id, name, status')
    .limit(3);

  if (docsError) {
    console.log('⚠️  No documents table found:', docsError.message);
  } else {
    console.log(`✅ Documents table exists (${docs?.length || 0} documents found)`);
    
    if (docs && docs.length > 0) {
      docs.forEach(doc => {
        console.log(`   - ${doc.name} (${doc.status})`);
      });
    }
  }

  const { data: embeddings, error: embError } = await supabase
    .from('document_embeddings')
    .select('id')
    .limit(1);

  if (embError) {
    console.log('⚠️  No embeddings table:', embError.message);
  } else {
    const { count } = await supabase
      .from('document_embeddings')
      .select('id', { count: 'exact', head: true });
    console.log(`✅ Document embeddings table exists (${count || 0} embeddings)\n`);
  }

  console.log('📝 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const migration003 = !triggerError;
  const migration004 = !funcError;
  const hasDocuments = docs && docs.length > 0;

  if (migration003 && migration004) {
    console.log('✅ RAG migrations applied successfully!');
    
    if (!hasDocuments) {
      console.log('\n⏭️  Next steps:');
      console.log('   1. Upload documents via ProductAdminPanel');
      console.log('   2. Create RAG triggers with document_query');
      console.log('   3. Test RAG coaching in live call');
      console.log('\n📖 See: scripts/test-rag-example.md for testing guide');
    } else {
      console.log('\n✅ Documents uploaded! Ready to test RAG coaching');
      console.log('📖 See: scripts/test-rag-example.md for testing guide');
    }
  } else {
    console.log('❌ Some migrations missing. Run them in Supabase Dashboard:');
    if (!migration003) console.log('   → supabase/migrations/003_add_document_query_to_triggers.sql');
    if (!migration004) console.log('   → supabase/migrations/004_create_vector_search_function.sql');
  }
}

checkMigrations().catch(console.error);
