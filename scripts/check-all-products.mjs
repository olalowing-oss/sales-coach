import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllProducts() {
  try {
    console.log('📦 Hämtar ALLA produkter (oavsett user)...\n');

    // Get ALL products (no user filter)
    const { data: products, error: productError } = await supabase
      .from('product_profiles')
      .select('id, name, description, user_id')
      .order('name');

    if (productError) throw productError;

    console.log(`Hittade ${products.length} produkter TOTALT:\n`);

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || '(ingen namn)'}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   User ID: ${product.user_id}`);
      if (product.description) {
        console.log(`   Beskrivning: ${product.description}`);
      }
      console.log('');
    });

    // Now check our specific user
    console.log('\n---\n');
    const userEmail = 'ola@lowing.eu';
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const authUser = authData.users.find(u => u.email === userEmail);
    if (!authUser) throw new Error(`User ${userEmail} not found`);
    const userId = authUser.id;

    console.log(`User ID för ${userEmail}: ${userId}\n`);

    const userProducts = products.filter(p => p.user_id === userId);
    console.log(`Produkter för ${userEmail}: ${userProducts.length}\n`);
    userProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllProducts();
