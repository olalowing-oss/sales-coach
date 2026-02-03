# Product Filtering Setup Guide

## Problem

Du ser alla coaching-delar (triggers, battlecards, etc.) för alla produkter istället för bara de som är kopplade till din produkt.

## Root Cause

`products` tabellen fanns inte i databasen, så:
1. User-to-product mapping fungerade inte
2. Coaching data laddades utan filtrering
3. Du såg ALLT från ALLA användare

## Lösning

### Steg 1: Skapa `products` tabellen

Kör migrationen i Supabase Dashboard:

1. Öppna [Supabase Dashboard](https://app.supabase.com)
2. Gå till **SQL Editor**
3. Öppna filen: `supabase/migrations/001_create_products_table.sql`
4. Kör SQL-koden

**Eller** kör via CLI:
```bash
# Om du har Supabase CLI installerat
supabase db push
```

### Steg 2: Skapa default produkter för befintliga användare

Kör detta script för att:
- Skapa en default produkt för varje användare som har coaching data
- Länka befintlig coaching data till den nya produkten

```bash
node scripts/create-default-products.mjs
```

**Output exempel:**
```
🚀 Creating default products for existing users...

📊 Found 3 users with coaching data

📦 Creating default product for user 75004a8c... (user1@example.com)
   ✅ Created product: "user1 Product" (75004a8c...)

🔗 Linking coaching data to product 75004a8c...
   ✅ Updated 64 items in trigger_patterns
   ✅ Updated 22 items in battlecards
   ✅ Updated 3 items in case_studies

📦 Creating default product for user 72f242c2... (ola@example.com)
   ✅ Created product: "ola Product" (72f242c2...)

🔗 Linking coaching data to product 72f242c2...
   ✅ Updated 67 items in trigger_patterns
   ✅ Updated 6 items in case_studies
   ✅ Updated 1 items in objection_handlers
```

### Steg 3: Verifiera att det fungerar

1. **Reload appen** i browsern
2. **Öppna console** (F12)
3. **Leta efter loggar:**
   ```
   ✅ Loaded user product: <product-id>
   🔄 Reloading coaching data for product: <product-id>
   📦 Loading coaching data for product: <product-id>
   ```

4. **Kontrollera CoachingAdminPanel:**
   - Du ska nu bara se triggers, battlecards etc. för DIN produkt
   - PLUS global data (product_id IS NULL)

## Vad händer nu?

### Automatisk produkt-detektion
```typescript
// sessionStore.ts
initGateway: async (authToken, userId) => {
  // 1. Load user's product from database
  const { data } = await supabase
    .from('products')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  userProductId = data?.id;

  // 2. Reload coaching data with product filter
  if (userProductId) {
    await coachingStore.initializeFromDb();
  }
}
```

### Databas-filtrering
```sql
-- Exempel: Ladda triggers för user 72f242c2's product
SELECT * FROM trigger_patterns
WHERE user_id = '72f242c2-...'
AND (
  product_id = '<user-product-id>'  -- Product-specific
  OR product_id IS NULL               -- Global data
);
```

## Data-breakdown efter migration

Efter scriptet har körts kommer varje användare att ha:

### User 72f242c2 (dig)
- **Product**: "ola Product"
- **trigger_patterns**: 67 product-specific + 4 global (från User d285e4e3)
- **objection_handlers**: 1 product-specific + 5 global
- **case_studies**: 6 product-specific
- **offers**: 27 global (product_id IS NULL)
- **battlecards**: 0 (User 75004a8c's data inte synlig)

### User 75004a8c
- **Product**: "user1 Product"
- **trigger_patterns**: 64 product-specific + 4 global
- **battlecards**: 22 product-specific
- **case_studies**: 3 product-specific

### User d285e4e3
- **Product**: "user2 Product"
- **trigger_patterns**: 4 global (visas för ALLA)
- **objection_handlers**: 2 product-specific

## Global vs Product-specific data

**Global data** (`product_id IS NULL`) visas för ALLA användare:
- 4 trigger patterns från User d285e4e3
- 5 objection handlers från User 72f242c2
- 27 offers från User 72f242c2

**Product-specific data** visas endast för ägaren:
- Triggers, battlecards, cases kopplade till specific product_id
- RLS policies säkerställer user isolation

## Troubleshooting

### "Ser fortfarande all data"
1. Kontrollera att `products` tabellen existerar:
   ```sql
   SELECT * FROM products;
   ```

2. Kontrollera att du har en produkt:
   ```sql
   SELECT * FROM products WHERE user_id = auth.uid();
   ```

3. Kontrollera browser console för errors

### "userProductId är null"
- Kör `node scripts/create-default-products.mjs` igen
- Kontrollera att migration kördes korrekt
- Verifiera RLS policies i Supabase Dashboard

### "Coaching data laddas inte"
- Hard refresh browsern (Cmd+Shift+R / Ctrl+Shift+F5)
- Kontrollera Network tab för errors
- Se console logs för `initializeFromDb()` anrop

## Framtida användning

### Hantera produkter
Använd **ProductAdminPanel** i appen för att:
- Skapa nya produkter
- Redigera produkt namn/beskrivning
- Ta bort produkter (flyttar data till NULL/global)

### Multi-user team scenario
När flera användare ska dela coaching data:
1. Skapa gemensam produkt i ProductAdminPanel
2. Länka triggers/battlecards till produkten
3. Varje användare får access till sin egen produkt + global data

## Relaterad dokumentation

- [MULTI-TENANT-COACHING-IMPLEMENTATION.md](MULTI-TENANT-COACHING-IMPLEMENTATION.md)
- [KUNDREGISTER_DESIGN.md](KUNDREGISTER_DESIGN.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

**Skapad**: 2026-02-02
**Problem**: User ser all coaching data från alla produkter
**Fix**: Skapa products tabell + default products för befintliga användare
