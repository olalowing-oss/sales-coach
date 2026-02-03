// Script för att ändra product ID i localStorage från gammalt till nytt
// Kör detta i browser developer console (F12)

const OLD_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f';
const NEW_PRODUCT_ID = 'ce52ccee-0cfe-48ed-b785-3679e01c2409';

const coachingStoreKey = 'b3-coaching-data';
const storeData = localStorage.getItem(coachingStoreKey);

if (!storeData) {
  console.error('❌ Ingen coaching-store hittades i localStorage');
} else {
  try {
    const store = JSON.parse(storeData);
    console.log('📦 Hittade coaching-store:', store);

    let totalUpdated = 0;

    // Uppdatera Triggers
    if (store.state && store.state.triggerPatterns) {
      const triggers = store.state.triggerPatterns;
      let triggerCount = 0;

      Object.keys(triggers).forEach(triggerId => {
        const trigger = triggers[triggerId];
        if (trigger.productId === OLD_PRODUCT_ID) {
          trigger.productId = NEW_PRODUCT_ID;
          triggerCount++;
          console.log(`✅ Trigger: ${trigger.pattern || triggerId}`);
        }
      });

      totalUpdated += triggerCount;
      console.log(`\n✅ Uppdaterade ${triggerCount} triggers till nytt product ID`);
    }

    // Spara tillbaka till localStorage
    localStorage.setItem(coachingStoreKey, JSON.stringify(store));

    console.log(`\n🎉 FÄRDIG! Totalt uppdaterade ${totalUpdated} items`);
    console.log(`Gammalt ID: ${OLD_PRODUCT_ID}`);
    console.log(`Nytt ID: ${NEW_PRODUCT_ID}`);
    console.log('\n🔄 Laddar om sidan om 2 sekunder...');

    setTimeout(() => {
      location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ Fel vid uppdatering:', error);
  }
}
