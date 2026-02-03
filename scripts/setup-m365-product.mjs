import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupM365Product() {
  try {
    console.log('🚀 Starting M365 product setup...\n');

    // 1. Find user in auth.users
    const userEmail = 'ola@lowing.eu';
    console.log(`📧 Looking for user: ${userEmail}`);

    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error checking auth users:', authError);
      throw authError;
    }

    const authUser = authData.users.find(u => u.email === userEmail);

    if (!authUser) {
      throw new Error(`User ${userEmail} not found. Please sign up first.`);
    }

    const userId = authUser.id;
    console.log(`✅ Found user: ${userId} (${authUser.email})`)

    // 2. Create M365 product
    console.log('\n📦 Creating M365 product...');

    const { data: existingProduct, error: checkError } = await supabase
      .from('product_profiles')
      .select('id, name')
      .eq('name', 'M365')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing product:', checkError);
      throw checkError;
    }

    let productId;

    if (existingProduct && existingProduct.length > 0) {
      productId = existingProduct[0].id;
      console.log(`✅ Product M365 already exists: ${productId}`);
    } else {
      const { data: newProduct, error: productError } = await supabase
        .from('product_profiles')
        .insert({
          name: 'M365',
          description: 'Microsoft 365 produktlinje',
          user_id: userId,
          is_active: true
        })
        .select()
        .single();

      if (productError) {
        console.error('❌ Error creating product:', productError);
        throw productError;
      }

      productId = newProduct.id;
      console.log(`✅ Created M365 product: ${productId}`);
    }

    // 3. Update coaching data - triggers (stored in localStorage/Zustand, not DB)
    console.log('\n🔄 Note: Triggers are stored in localStorage/Zustand, not in database');
    console.log('   They will need to be manually re-saved with the new productId');

    // 4. Check for battlecards, objections, cases, offers tables
    console.log('\n🔍 Checking for coaching data in database...');

    // Note: Based on the codebase, coaching data appears to be stored in Zustand/localStorage
    // rather than in the database. Let's check if there are any database tables for these.

    const tables = ['battlecards', 'objection_handlers', 'case_studies', 'offers'];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .is('product_id', null);

        if (!error) {
          console.log(`   ${table}: ${count || 0} items with null product_id found`);

          if (count && count > 0) {
            // Update items with null product_id
            const { error: updateError } = await supabase
              .from(table)
              .update({ product_id: productId })
              .is('product_id', null);

            if (updateError) {
              console.error(`   ❌ Error updating ${table}:`, updateError);
            } else {
              console.log(`   ✅ Updated ${count} items in ${table}`);
            }
          }
        } else if (error.code === '42P01') {
          console.log(`   ⚠️  Table ${table} does not exist (data likely in localStorage)`);
        } else {
          console.error(`   ❌ Error checking ${table}:`, error);
        }
      } catch (err) {
        console.log(`   ⚠️  Could not access ${table} table:`, err.message);
      }
    }

    console.log('\n✅ M365 product setup complete!');
    console.log('\n📋 Summary:');
    console.log(`   User ID: ${userId}`);
    console.log(`   Product ID: ${productId}`);
    console.log(`   Product Name: M365`);
    console.log('\n💡 Next steps:');
    console.log('   1. If coaching data is in localStorage, it needs to be re-saved');
    console.log('   2. You can now use the ProductAdminPanel to manage M365 coaching data');
    console.log('   3. Upload product documentation for M365 to enable AI generation');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

setupM365Product();
