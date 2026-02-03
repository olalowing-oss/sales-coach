// Script för att uppdatera ALL coaching data i localStorage till M365
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

    let totalUpdated = 0;

    // Uppdatera Triggers
    if (store.state && store.state.triggerPatterns) {
      const triggers = store.state.triggerPatterns;
      let triggerCount = 0;

      Object.keys(triggers).forEach(triggerId => {
        const trigger = triggers[triggerId];
        if (!trigger.productId || trigger.productId === null) {
          trigger.productId = M365_PRODUCT_ID;
          triggerCount++;
          console.log(`✅ Trigger: ${trigger.pattern || triggerId}`);
        }
      });

      totalUpdated += triggerCount;
      console.log(`\n✅ Uppdaterade ${triggerCount} triggers till M365`);
    }

    // Uppdatera Battlecards
    if (store.state && store.state.battlecards) {
      const battlecards = store.state.battlecards;
      let bcCount = 0;

      battlecards.forEach(bc => {
        if (!bc.productId || bc.productId === null) {
          bc.productId = M365_PRODUCT_ID;
          bcCount++;
          console.log(`✅ Battlecard: ${bc.title || bc.id}`);
        }
      });

      totalUpdated += bcCount;
      console.log(`\n✅ Uppdaterade ${bcCount} battlecards till M365`);
    }

    // Uppdatera Objection Handlers
    if (store.state && store.state.objectionHandlers) {
      const objections = store.state.objectionHandlers;
      let objCount = 0;

      objections.forEach(obj => {
        if (!obj.productId || obj.productId === null) {
          obj.productId = M365_PRODUCT_ID;
          objCount++;
          console.log(`✅ Invändning: ${obj.objection || obj.id}`);
        }
      });

      totalUpdated += objCount;
      console.log(`\n✅ Uppdaterade ${objCount} invändningar till M365`);
    }

    // Uppdatera Case Studies
    if (store.state && store.state.caseStudies) {
      const cases = store.state.caseStudies;
      let caseCount = 0;

      cases.forEach(cs => {
        if (!cs.productId || cs.productId === null) {
          cs.productId = M365_PRODUCT_ID;
          caseCount++;
          console.log(`✅ Kundcase: ${cs.title || cs.company || cs.id}`);
        }
      });

      totalUpdated += caseCount;
      console.log(`\n✅ Uppdaterade ${caseCount} kundcase till M365`);
    }

    // Uppdatera Offers
    if (store.state && store.state.offers) {
      const offers = store.state.offers;
      let offerCount = 0;

      offers.forEach(offer => {
        if (!offer.productId || offer.productId === null) {
          offer.productId = M365_PRODUCT_ID;
          offerCount++;
          console.log(`✅ Erbjudande: ${offer.title || offer.id}`);
        }
      });

      totalUpdated += offerCount;
      console.log(`\n✅ Uppdaterade ${offerCount} erbjudanden till M365`);
    }

    // Spara tillbaka till localStorage
    localStorage.setItem(coachingStoreKey, JSON.stringify(store));

    console.log(`\n🎉 FÄRDIG! Totalt uppdaterade ${totalUpdated} items till M365`);
    console.log('📋 Fördelning:');
    console.log('   - Triggers: Uppdaterade');
    console.log('   - Battlecards: Uppdaterade');
    console.log('   - Invändningar: Uppdaterade');
    console.log('   - Kundcase: Uppdaterade');
    console.log('   - Erbjudanden: Uppdaterade');
    console.log('\n🔄 Laddar om sidan om 2 sekunder...');

    setTimeout(() => {
      location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ Fel vid uppdatering:', error);
  }
}
