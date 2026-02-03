import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDemoScripts() {
  try {
    console.log('🔍 Kollar alla demo-scripts i databasen...\n');

    // Check all scripts without any filters (using service key to bypass RLS)
    const { data: allScripts, error } = await supabase
      .from('demo_scripts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Fel vid hämtning:', error);
      throw error;
    }

    console.log(`📊 Totalt antal demo-scripts: ${allScripts?.length || 0}\n`);

    if (allScripts && allScripts.length > 0) {
      console.log('Scripts:');
      allScripts.forEach((script, idx) => {
        console.log(`\n${idx + 1}. ${script.name}`);
        console.log(`   ID: ${script.id}`);
        console.log(`   User ID: ${script.user_id}`);
        console.log(`   Product ID: ${script.product_id}`);
        console.log(`   Active: ${script.is_active}`);
        console.log(`   Created: ${script.created_at}`);
      });
    } else {
      console.log('⚠️  Tabellen är tom - inga demo-scripts finns i databasen.');
      console.log('\n💡 Du kan skapa nya demo-scripts via admin-panelen i appen.');
    }

    // Check current user
    console.log('\n---\n');
    const CURRENT_USER_ID = '75004a8c-5e9f-413a-9c89-0affbd0eaa33';
    const M365_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f';

    const { data: userScripts, error: userError } = await supabase
      .from('demo_scripts')
      .select('*')
      .eq('user_id', CURRENT_USER_ID)
      .eq('product_id', M365_PRODUCT_ID);

    if (userError) {
      console.error('❌ Fel vid hämtning för user:', userError);
    } else {
      console.log(`👤 Demo-scripts för ${CURRENT_USER_ID} (ola@lowing.eu) med M365:`);
      console.log(`   Antal: ${userScripts?.length || 0}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

checkDemoScripts();
