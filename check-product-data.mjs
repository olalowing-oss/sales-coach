import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env from current directory
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
  const { data, error, count } = await supabase
    .from(tableName)
    .select('id, product_id, user_id', { count: 'exact' });

  if (error) {
    console.error(`❌ Error querying ${tableName}:`, error.message);
    return;
  }

  const totalItems = count || 0;
  const nullProductItems = data?.filter(item => item.product_id === null).length || 0;
  const withProductItems = totalItems - nullProductItems;

  console.log(`\n📊 ${tableName}:`);
  console.log(`   Total items: ${totalItems}`);
  console.log(`   With product_id: ${withProductItems}`);
  console.log(`   product_id IS NULL (global): ${nullProductItems}`);

  if (nullProductItems > 0) {
    console.log(`   ✅ Has global data that should be visible to all users`);
  }

  // Show breakdown by user if there are items
  if (totalItems > 0 && data) {
    const userCounts = {};
    data.forEach(item => {
      const userId = item.user_id || 'no-user';
      if (!userCounts[userId]) {
        userCounts[userId] = { total: 0, withProduct: 0, global: 0 };
      }
      userCounts[userId].total++;
      if (item.product_id) {
        userCounts[userId].withProduct++;
      } else {
        userCounts[userId].global++;
      }
    });

    console.log(`\n   Per-user breakdown:`);
    for (const [userId, counts] of Object.entries(userCounts)) {
      const userIdShort = userId.substring(0, 8);
      console.log(`   - User ${userIdShort}: ${counts.total} total (${counts.withProduct} with product, ${counts.global} global)`);
    }
  }
}

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, user_id, name');

  if (error) {
    console.error('❌ Error querying products:', error.message);
    return;
  }

  console.log('\n📦 Products:');
  console.log(`   Total products: ${data?.length || 0}`);

  if (data && data.length > 0) {
    data.forEach(product => {
      const userIdShort = product.user_id?.substring(0, 8) || 'no-user';
      console.log(`   - ${product.name} (${product.id.substring(0, 8)}...) → User ${userIdShort}`);
    });
  }
}

async function main() {
  console.log('🔍 Checking product-specific data in database...\n');

  await checkProducts();
  await checkTable('trigger_patterns');
  await checkTable('battlecards');
  await checkTable('objection_handlers');
  await checkTable('case_studies');
  await checkTable('offers');

  console.log('\n✅ Done!\n');
}

main().catch(console.error);
