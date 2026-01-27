// Fix RLS policies to allow all authenticated users to access coaching data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jiphhmofozuewfdnjfjy.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcGhobW9mb3p1ZXdmZG5qZmp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ3ODk2MSwiZXhwIjoyMDg1MDU0OTYxfQ.-vkQTVGKFanfBJM1x2R1hyEjYqn6I4Bef08b4Zzwq0k';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixPolicies() {
  console.log('🔧 Uppdaterar RLS-policies för single-user mode...\n');

  const tables = [
    'trigger_patterns',
    'battlecards',
    'objection_handlers',
    'case_studies',
    'offers'
  ];

  try {
    for (const table of tables) {
      console.log(`📝 Uppdaterar policies för ${table}...`);

      // Drop old restrictive policies
      await supabase.rpc('exec_sql', {
        sql: `
          DROP POLICY IF EXISTS "Users can view own ${table.slice(0, -1)}" ON ${table};
          DROP POLICY IF EXISTS "Users can insert own ${table.slice(0, -1)}" ON ${table};
          DROP POLICY IF EXISTS "Users can update own ${table.slice(0, -1)}" ON ${table};
          DROP POLICY IF EXISTS "Users can delete own ${table.slice(0, -1)}" ON ${table};
        `
      }).catch(() => {}); // Ignore if policies don't exist

      // Create new permissive policies
      const policies = [
        `CREATE POLICY "Anyone authenticated can view ${table}" ON ${table}
          FOR SELECT USING (auth.role() = 'authenticated');`,

        `CREATE POLICY "Anyone authenticated can insert ${table}" ON ${table}
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');`,

        `CREATE POLICY "Anyone authenticated can update ${table}" ON ${table}
          FOR UPDATE USING (auth.role() = 'authenticated');`,

        `CREATE POLICY "Anyone authenticated can delete ${table}" ON ${table}
          FOR DELETE USING (auth.role() = 'authenticated');`
      ];

      for (const policy of policies) {
        await supabase.rpc('exec_sql', { sql: policy }).catch(err => {
          console.log(`  ⚠️ ${err.message}`);
        });
      }
    }

    console.log('\n✅ RLS-policies uppdaterade!');
    console.log('📌 Nu kan alla autentiserade användare se och ändra coaching-data\n');

  } catch (error) {
    console.error('❌ Fel:', error.message);
    console.log('\n📋 Kör istället SQL-filen manuellt i Supabase SQL Editor:');
    console.log('   1. Gå till Supabase Dashboard → SQL Editor');
    console.log('   2. Öppna fix-rls-policies.sql');
    console.log('   3. Kör scriptet\n');
  }
}

fixPolicies();
