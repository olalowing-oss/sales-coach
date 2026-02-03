# ✅ Multi-Tenant Coaching Data - Klart!

## Vad har gjorts

### 1. TypeScript Types ✅
- `src/types/database.ts` - Alla coaching-tabeller har `product_id`
- `src/types/index.ts` - Alla interfaces har `productId?`

### 2. Database Operations ✅
- `src/lib/supabaseOperations.ts` - Alla load/sync-funktioner hanterar `product_id`

### 3. Admin UI ✅
- `src/components/CoachingAdminPanel.tsx` - Uppdaterad med:
  - `useProducts()` hook för att ladda aktiva produkter
  - Produkt-dropdown i alla formulär:
    - **Triggers**: Ny trigger + Edit trigger
    - **Battlecards**: Ny battlecard + Edit battlecard
    - **Invändningar**: Ny invändning + Edit invändning
    - **Kundcase**: Nytt case + Edit case

### 4. SQL Migration (Måste köras!) ⚠️
Filen: [add-product-id-to-coaching-tables.sql](add-product-id-to-coaching-tables.sql)

## Nästa steg

### 1. Kör SQL-migrationen
Öppna Supabase SQL Editor och kör:
```
add-product-id-to-coaching-tables.sql
```

Detta kommer att:
- Lägga till `product_id` kolumn på alla tabeller
- Skapa RLS-policies för multi-tenant access
- Skapa index för prestanda

### 2. Testa funktionaliteten

#### Test 1: Skapa global coaching data
1. Öppna CoachingAdminPanel
2. Skapa en ny trigger/battlecard/invändning/case
3. Lämna "Produkt" som "Global (alla produkter)"
4. Spara
5. ✅ Ska synas för alla användare oavsett produkttilldelning

#### Test 2: Skapa produktspecifik coaching data
1. Öppna CoachingAdminPanel
2. Skapa en ny trigger/battlecard/invändning/case
3. Välj en specifik produkt i dropdown
4. Spara
5. ✅ Ska bara synas för användare med tillgång till den produkten

#### Test 3: Verifiera RLS-policies
1. Skapa coaching data för "Produkt A"
2. I UserProductsAdmin, sätt användaren till "Produkt B"
3. ✅ Coaching data för Produkt A ska inte synas
4. Aktivera tillgång till "Produkt A" igen
5. ✅ Coaching data för Produkt A ska synas igen

### 3. Verifiera i databasen

Kör dessa queries i Supabase SQL Editor:

```sql
-- Kontrollera att kolumnerna skapades
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('trigger_patterns', 'battlecards', 'case_studies', 'objection_handlers', 'offers')
  AND column_name = 'product_id'
ORDER BY table_name;

-- Kontrollera RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('trigger_patterns', 'battlecards', 'case_studies', 'objection_handlers', 'offers')
ORDER BY tablename, cmd, policyname;
```

## Hur det fungerar

### RLS Policy-logik
```sql
CREATE POLICY "Users can view accessible triggers"
  ON trigger_patterns FOR SELECT
  USING (
    user_id = auth.uid()           -- Användaren äger datan
    OR
    product_id IN (                -- Eller har tillgång via user_products
      SELECT product_id FROM user_products
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
```

Användare kan se coaching data om:
1. De skapade det själva (`user_id = auth.uid()`)
2. Det är kopplat till en produkt de har aktiv tillgång till
3. Det är global data (`product_id = NULL`)

### UI-flöde
1. **Produkt-dropdown visar**: Alla aktiva produkter från `product_profiles`
2. **Val "Global"**: Sparar `product_id = NULL` (tillgänglig för alla)
3. **Val av specifik produkt**: Sparar `product_id = <produkt-id>`
4. **RLS filtrerar automatiskt**: Användaren ser bara relevant data

## Arkitektur

Samma mönster som `training_scenarios`:
- `user_products` tabell definierar användar → produkt tilldelningar
- RLS policies kontrollerar om användaren äger data ELLER har produkttillgång
- Produktval är frivilligt (null = global/delad data)
- Ingen application code behövs för filtrering (RLS gör allt)

## Benefits

✅ Användare ser bara coaching data relevant för deras produkter
✅ Global coaching data (null product_id) synlig för alla
✅ RLS policies automatiskt tvingar access control
✅ Konsekvent med training_scenarios multi-tenancy
✅ Ingen risk för data läckage mellan produkter

## Troubleshooting

### Problem: Coaching data syns inte efter migration
**Lösning**: Befintlig data har `product_id = NULL`, vilket betyder att den är global. Om användaren inte ser den, kontrollera att användaren är autentiserad och att RLS policies skapades korrekt.

### Problem: Kan inte spara produkt-id
**Lösning**: Kontrollera att `supabaseOperations.ts` har `product_id` i både load och sync-funktionerna.

### Problem: TypeScript errors
**Lösning**: Kör `npm run build` för att verifiera att alla types är uppdaterade.
