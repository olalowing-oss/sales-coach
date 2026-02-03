import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const USER_ID = '72f242c2-2dd3-441b-9183-0fe4854f29b4';
const EXPECTED_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f';

async function debugTriggersInDb() {
  try {
    console.log('🔍 Kollar triggers i databasen...\n');

    // Get all triggers for this user
    const { data: triggers, error } = await supabase
      .from('trigger_patterns')
      .select('*')
      .eq('user_id', USER_ID);

    if (error) {
      console.error('❌ Fel vid hämtning:', error);
      return;
    }

    console.log(`📊 Totalt antal triggers: ${triggers.length}\n`);

    // Group by product_id
    const byProduct = {};
    triggers.forEach(t => {
      const pid = t.product_id || 'null';
      if (!byProduct[pid]) byProduct[pid] = [];
      byProduct[pid].push(t);
    });

    console.log('📦 Triggers grupperade per product_id:\n');
    Object.entries(byProduct).forEach(([pid, trigs]) => {
      console.log(`  Product ID: ${pid}`);
      console.log(`  Antal: ${trigs.length}`);
      console.log(`  Match med förväntad? ${pid === EXPECTED_PRODUCT_ID ? '✅ JA' : '❌ NEJ'}\n`);
    });

    // Show a few sample triggers
    console.log('📝 Exempel på triggers:\n');
    triggers.slice(0, 3).forEach((t, i) => {
      console.log(`Trigger ${i + 1}:`);
      console.log(`  ID: ${t.id}`);
      console.log(`  Keywords: ${t.keywords?.slice(0, 3).join(', ')}...`);
      console.log(`  Product ID: ${t.product_id}`);
      console.log(`  Category: ${t.category}`);
      console.log(`  Response type: ${t.response_type}\n`);
    });

    // Check if all have the expected product_id
    const withExpectedProduct = triggers.filter(t => t.product_id === EXPECTED_PRODUCT_ID);
    const withOtherProduct = triggers.filter(t => t.product_id !== EXPECTED_PRODUCT_ID);

    console.log('\n📈 Sammanfattning:');
    console.log(`✅ Med rätt product_id (${EXPECTED_PRODUCT_ID}): ${withExpectedProduct.length}`);
    console.log(`❌ Med annat product_id: ${withOtherProduct.length}`);

    if (withOtherProduct.length > 0) {
      console.log('\n⚠️  Triggers med fel product_id:');
      withOtherProduct.forEach(t => {
        console.log(`  - ${t.id}: product_id = ${t.product_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugTriggersInDb();
