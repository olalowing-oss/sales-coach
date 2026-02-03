// Browser console debug script
// Copy and paste this into your browser console (F12) while viewing the ProductAdminPanel

(function debugTriggerFiltering() {
  console.log('🔍 Debug: Trigger Filtering\n');

  // Get store from localStorage
  const storeKey = 'b3-coaching-data';
  const storeData = localStorage.getItem(storeKey);

  if (!storeData) {
    console.error('❌ No store data found in localStorage');
    return;
  }

  const store = JSON.parse(storeData);
  const triggers = store.state?.triggerPatterns || {};

  console.log(`📊 Total triggers in store: ${Object.keys(triggers).length}`);

  // Check product IDs
  const productIds = new Set();
  Object.values(triggers).forEach(t => {
    productIds.add(t.productId || 'null/undefined');
  });

  console.log('\n📦 Unique product IDs in triggers:');
  productIds.forEach(pid => {
    const count = Object.values(triggers).filter(t =>
      (t.productId || 'null/undefined') === pid
    ).length;
    console.log(`  ${pid}: ${count} triggers`);
  });

  // Show sample triggers
  console.log('\n📝 Sample triggers (first 3):');
  Object.entries(triggers).slice(0, 3).forEach(([id, trigger]) => {
    console.log(`  ${id}:`);
    console.log(`    productId: ${trigger.productId}`);
    console.log(`    keywords: ${trigger.keywords?.slice(0, 2).join(', ')}...`);
  });

  // Check what product is selected
  const EXPECTED_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f';

  console.log(`\n🎯 Expected product ID: ${EXPECTED_PRODUCT_ID}`);

  const matchingTriggers = Object.entries(triggers).filter(([_, t]) =>
    t.productId === EXPECTED_PRODUCT_ID ||
    t.productId === null ||
    t.productId === undefined
  );

  console.log(`✅ Triggers matching filter logic: ${matchingTriggers.length}`);

  // Test the exact filter from ProductAdminPanel
  const testFilter = (selectedProductId) => {
    return Object.entries(triggers).filter(([_, t]) =>
      t.productId === selectedProductId || t.productId === null || t.productId === undefined
    );
  };

  console.log(`\n🧪 Test filter with expected product ID: ${testFilter(EXPECTED_PRODUCT_ID).length}`);

  // Check for data type mismatches
  console.log('\n🔬 Data type check:');
  const sampleTrigger = Object.values(triggers)[0];
  if (sampleTrigger) {
    console.log(`  productId type: ${typeof sampleTrigger.productId}`);
    console.log(`  productId value: "${sampleTrigger.productId}"`);
    console.log(`  Expected type: string`);
    console.log(`  Expected value: "${EXPECTED_PRODUCT_ID}"`);
    console.log(`  Strict equality: ${sampleTrigger.productId === EXPECTED_PRODUCT_ID}`);
  }

  // Check other coaching data types
  console.log('\n📚 Other coaching data:');
  console.log(`  Battlecards: ${store.state?.battlecards?.length || 0}`);
  console.log(`  Objections: ${store.state?.objectionHandlers?.length || 0}`);
  console.log(`  Cases: ${store.state?.caseStudies?.length || 0}`);
  console.log(`  Offers: ${store.state?.offers?.length || 0}`);

  if (store.state?.battlecards?.length > 0) {
    const bc = store.state.battlecards[0];
    console.log(`  Sample battlecard productId: ${bc.productId} (type: ${typeof bc.productId})`);
  }

})();
