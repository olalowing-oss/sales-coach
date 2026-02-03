import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking which user is currently authenticated...\n');
console.log('Note: This uses the ANON key, so it will show "No user authenticated"');
console.log('You need to check the browser console instead.\n');

console.log('📋 Copy and paste this into your BROWSER CONSOLE (F12):\n');
console.log('─'.repeat(60));
console.log(`
(async function checkCurrentUser() {
  // Get Supabase client from the window (should be available in your app)
  const supabaseUrl = '${supabaseUrl}';
  const supabaseAnonKey = '${supabaseAnonKey}';

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('❌ No user authenticated or error:', error);
    console.log('\\n💡 Make sure you are logged in to the app');
    return;
  }

  console.log('\\n👤 Current authenticated user:');
  console.log('  Email:', user.email);
  console.log('  User ID:', user.id);

  const EXPECTED_USER_ID = '72f242c2-2dd3-441b-9183-0fe4854f29b4';
  const EXPECTED_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f';

  console.log('\\n🎯 Expected user ID:', EXPECTED_USER_ID);
  console.log('  Match:', user.id === EXPECTED_USER_ID ? '✅ YES' : '❌ NO');

  if (user.id !== EXPECTED_USER_ID) {
    console.log('\\n⚠️  YOU ARE LOGGED IN AS THE WRONG USER!');
    console.log('\\nThe triggers belong to user:', EXPECTED_USER_ID);
    console.log('But you are logged in as:', user.id);
    console.log('\\n💡 Solution: You need to either:');
    console.log('  1. Log out and log in with the correct account');
    console.log('  2. OR: Update the triggers in the database to use your current user ID');
  } else {
    console.log('\\n✅ You are logged in with the correct user account!');
    console.log('\\nLet\\'s check if triggers exist for this user...');

    const { data: triggers, error: triggerError } = await supabase
      .from('trigger_patterns')
      .select('*')
      .eq('user_id', user.id);

    if (triggerError) {
      console.error('❌ Error fetching triggers:', triggerError);
    } else {
      console.log(\`\\n📊 Found \${triggers.length} triggers for your user ID\`);

      if (triggers.length > 0) {
        const productIds = [...new Set(triggers.map(t => t.product_id || 'null'))];
        console.log('\\n📦 Product IDs in your triggers:');
        productIds.forEach(pid => {
          const count = triggers.filter(t => (t.product_id || 'null') === pid).length;
          console.log(\`  \${pid}: \${count} triggers\`);
        });

        const matchingProduct = triggers.filter(t => t.product_id === EXPECTED_PRODUCT_ID);
        console.log(\`\\n🎯 Triggers with expected product ID (\${EXPECTED_PRODUCT_ID}): \${matchingProduct.length}\`);
      } else {
        console.log('\\n⚠️  No triggers found for your user. Database might be empty for this account.');
      }
    }
  }
})();
`);
console.log('─'.repeat(60));
