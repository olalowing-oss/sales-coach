import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Current logged in user
const USER_ID = '72f242c2-2dd3-441b-9183-0fe4854f29b4';
const PRODUCT_ID = 'ce52ccee-0cfe-48ed-b785-3679e01c2409';

async function createM365Product() {
  try {
    console.log('🚀 Skapar M365 produkt...\n');
    console.log(`User ID: ${USER_ID}`);
    console.log(`Product ID: ${PRODUCT_ID}\n`);

    // Check if product already exists
    const { data: existing, error: checkError } = await supabase
      .from('product_profiles')
      .select('*')
      .eq('id', PRODUCT_ID)
      .single();

    if (existing) {
      console.log('✅ Produkten finns redan!');
      console.log(`   Namn: ${existing.name}`);
      console.log(`   User ID: ${existing.user_id}`);

      if (existing.user_id !== USER_ID) {
        console.log('\n⚠️  Men den tillhör en annan användare!');
        console.log(`   Befintlig user: ${existing.user_id}`);
        console.log(`   Önskad user: ${USER_ID}`);
        console.log('\n🔄 Uppdaterar product owner...');

        const { error: updateError } = await supabase
          .from('product_profiles')
          .update({ user_id: USER_ID })
          .eq('id', PRODUCT_ID);

        if (updateError) {
          console.error('❌ Kunde inte uppdatera:', updateError);
        } else {
          console.log('✅ Product owner uppdaterad till rätt användare!');
        }
      }
    } else {
      console.log('📦 Produkten finns inte, skapar ny...');

      const { error: insertError } = await supabase
        .from('product_profiles')
        .insert({
          id: PRODUCT_ID,
          user_id: USER_ID,
          name: 'M365',
          description: 'Microsoft 365 produktlinje'
        });

      if (insertError) {
        console.error('❌ Kunde inte skapa produkt:', insertError);
      } else {
        console.log('✅ M365 produkt skapad!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createM365Product();
