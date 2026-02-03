// Script för att uppdatera alla triggers i localStorage till M365
// Kör detta i browser developer console (F12)

const M365_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f';

// Hämta coaching store från localStorage
const coachingStoreKey = 'coaching-store';
const storeData = localStorage.getItem(coachingStoreKey);

if (!storeData) {
  console.error('❌ Ingen coaching-store hittades i localStorage');
} else {
  try {
    const store = JSON.parse(storeData);
    console.log('📦 Hittade coaching-store:', store);

    // Uppdatera alla triggers
    let updatedCount = 0;
    if (store.state && store.state.triggerPatterns) {
      const triggers = store.state.triggerPatterns;

      Object.keys(triggers).forEach(triggerId => {
        const trigger = triggers[triggerId];

        // Om triggern inte har ett productId eller har null, sätt till M365
        if (!trigger.productId || trigger.productId === null) {
          trigger.productId = M365_PRODUCT_ID;
          updatedCount++;
          console.log(`✅ Uppdaterade trigger: ${triggerId}`);
        }
      });

      // Spara tillbaka till localStorage
      localStorage.setItem(coachingStoreKey, JSON.stringify(store));

      console.log(`\n🎉 Färdig! Uppdaterade ${updatedCount} triggers till M365`);
      console.log('🔄 Ladda om sidan för att se ändringarna');
    } else {
      console.log('⚠️  Inga triggers hittades i store');
    }
  } catch (error) {
    console.error('❌ Fel vid uppdatering:', error);
  }
}
