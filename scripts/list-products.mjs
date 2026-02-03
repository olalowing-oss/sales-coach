import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listProducts() {
  try {
    console.log('📦 Hämtar alla produkter...\n');

    // Find user
    const userEmail = 'ola@lowing.eu';
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const authUser = authData.users.find(u => u.email === userEmail);
    if (!authUser) throw new Error(`User ${userEmail} not found`);

    const userId = authUser.id;

    // Get all products
    const { data: products, error: productError } = await supabase
      .from('product_profiles')
      .select('id, name, description')
      .eq('user_id', userId)
      .order('name');

    if (productError) throw productError;

    console.log(`Hittade ${products.length} produkter:\n`);

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      if (product.description) {
        console.log(`   Beskrivning: ${product.description}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listProducts();
