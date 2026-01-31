# User Isolation Test Guide

Detta dokument beskriver hur du testar att user isolation fungerar korrekt.

## Förutsättningar

1. Kör den nya migrationen i Supabase
2. Ha två olika användarkonton (User A och User B)

## Steg 1: Kör Migration i Supabase

Gå till Supabase SQL Editor och kör:

```sql
-- Kopiera hela innehållet från:
-- supabase-migrations/20260131_add_user_isolation.sql
```

**Verifiera migration:**

```sql
-- Kontrollera att user_id kolumnen skapades
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'product_profiles'
AND column_name = 'user_id';

-- Kontrollera RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'product_profiles';
```

**Förväntat resultat:**
- `user_id` kolumn finns i product_profiles
- 4 RLS policies för user isolation (SELECT, INSERT, UPDATE, DELETE)

## Steg 2: Skapa Testanvändare

Du behöver två olika användare för att testa isolation:

**Alternativ A: Använd befintliga konton**
- User A: ditt primära konto
- User B: skapa nytt konto i Supabase Auth

**Alternativ B: Skapa test-användare via Supabase Dashboard**

1. Gå till **Authentication → Users**
2. Klicka **Add user**
3. Email: `test-user-a@example.com`, Password: `TestPass123!`
4. Klicka **Add user**
5. Email: `test-user-b@example.com`, Password: `TestPass123!`

## Steg 3: Test Scenario - User A

### Logga in som User A

1. Öppna appen: http://localhost:3003/
2. Logga in med User A
3. Navigera till **Säljträning → Kunskapsbas**

### Skapa Produkt för User A

1. Klicka **"Välj produkt"**
2. Klicka **"Skapa ny produkt"**
3. Fyll i:
   - **Namn:** `SaaS Produkt A`
   - **Bransch:** `B2B SaaS`
   - **Beskrivning:** `Detta är User A:s produkt`
   - **Nyckelfunktioner:**
     ```
     Funktion A1
     Funktion A2
     Funktion A3
     ```
4. Klicka **"Spara"**
5. Välj produkten

### Ladda upp Material för User A

1. Välj **"Klistra in text"** fliken
2. **Titel:** `User A Material`
3. **Innehåll:**
   ```
   Detta är material för User A:s produkt.
   Endast User A ska kunna se detta.
   ```
4. Klicka **"Lägg till text"**
5. Verifiera att dokumentet dyker upp i listan

### Verifiera i Supabase (User A)

Kör i SQL Editor:

```sql
-- Se User A:s produkter (byt ut USER_A_ID med faktiskt UUID)
SELECT id, name, user_id, created_at
FROM product_profiles
WHERE user_id = 'USER_A_ID';

-- Se User A:s dokument
SELECT kb.id, kb.title, kb.content, pp.name as product_name
FROM knowledge_base kb
JOIN product_profiles pp ON kb.product_id = pp.id
WHERE pp.user_id = 'USER_A_ID';
```

**Förväntat resultat:**
- 1 produkt: "SaaS Produkt A"
- 1 dokument: "User A Material"

## Steg 4: Test Scenario - User B

### Logga ut och Logga in som User B

1. Klicka på användarmeny (uppe till höger)
2. Klicka **"Logga ut"**
3. Logga in med User B

### Verifiera Isolation

1. Navigera till **Säljträning → Kunskapsbas**
2. Klicka **"Välj produkt"**

**Förväntat resultat:**
- ❌ User B ska **INTE** se "SaaS Produkt A"
- ✅ Produktlistan ska vara **tom** för User B

### Skapa Produkt för User B

1. Klicka **"Skapa ny produkt"**
2. Fyll i:
   - **Namn:** `E-handel Produkt B`
   - **Bransch:** `E-commerce`
   - **Beskrivning:** `Detta är User B:s produkt`
   - **Nyckelfunktioner:**
     ```
     Funktion B1
     Funktion B2
     ```
3. Klicka **"Spara"**
4. Välj produkten

### Ladda upp Material för User B

1. Välj **"Klistra in text"** fliken
2. **Titel:** `User B Material`
3. **Innehåll:**
   ```
   Detta är material för User B:s produkt.
   Endast User B ska kunna se detta.
   ```
4. Klicka **"Lägg till text"**

### Verifiera i Supabase (User B)

```sql
-- Se User B:s produkter
SELECT id, name, user_id, created_at
FROM product_profiles
WHERE user_id = 'USER_B_ID';

-- Verifiera att User B INTE kan se User A:s data
SELECT COUNT(*) as total_products
FROM product_profiles;
-- Ska returnera 2 (User A + User B)

-- Men när User B querier via RLS:
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'USER_B_ID';
SELECT COUNT(*) as visible_products
FROM product_profiles;
-- Ska returnera 1 (endast User B:s produkt)
```

## Steg 5: Verifiera RLS Policies

### Test 1: User A kan inte se User B:s data

Logga in som User A och verifiera:

```sql
-- I Supabase SQL Editor (som User A)
SELECT id, name, user_id
FROM product_profiles;
```

**Förväntat resultat:**
- Endast User A:s produkter visas
- User B:s produkter **visas INTE**

### Test 2: User A kan inte uppdatera User B:s data

Försök uppdatera User B:s produkt:

```sql
-- Detta ska MISSLYCKAS (ingen rad uppdateras)
UPDATE product_profiles
SET name = 'Hackat!'
WHERE user_id = 'USER_B_ID';
-- Returns: UPDATE 0 (ingen rad påverkad)
```

### Test 3: User A kan inte ta bort User B:s data

```sql
-- Detta ska MISSLYCKAS (ingen rad tas bort)
DELETE FROM product_profiles
WHERE user_id = 'USER_B_ID';
-- Returns: DELETE 0
```

## Steg 6: Verifiera Knowledge Base Isolation

### Test: Knowledge base entries ärver isolation

```sql
-- User A ska bara se sina dokument
SELECT kb.id, kb.title, pp.name as product_name, pp.user_id
FROM knowledge_base kb
JOIN product_profiles pp ON kb.product_id = pp.id;
-- Returnerar endast User A:s dokument när User A querier
```

## Steg 7: Test Training Scenarios Isolation

### Global Scenarios (is_global = true)

Global scenarios ska vara synliga för alla användare:

```sql
-- Skapa ett globalt scenario
INSERT INTO training_scenarios (
  name,
  difficulty,
  description,
  persona_name,
  persona_role,
  company_name,
  company_size,
  industry,
  pain_points,
  budget,
  decision_timeframe,
  personality,
  objectives,
  competitors,
  opening_line,
  success_criteria,
  common_mistakes,
  is_global
) VALUES (
  'Global Test Scenario',
  'easy',
  'Detta är ett globalt scenario',
  'Test Persona',
  'CEO',
  'Test AB',
  '10-50',
  'Tech',
  '{}',
  '100000-500000',
  '3-6 månader',
  'Professionell',
  '{}',
  '{}',
  'Hej!',
  '{}',
  '{}',
  true  -- Global scenario
);

-- Verifiera att båda användare kan se det
-- (Logga in som User A, sedan User B och query)
SELECT id, name, is_global, user_id, product_id
FROM training_scenarios
WHERE is_global = true;
-- Båda användare ska se detta scenario
```

### User-Specific Scenarios

```sql
-- Skapa user-specifikt scenario för User A
INSERT INTO training_scenarios (
  name,
  difficulty,
  description,
  persona_name,
  persona_role,
  company_name,
  company_size,
  industry,
  pain_points,
  budget,
  decision_timeframe,
  personality,
  objectives,
  competitors,
  opening_line,
  success_criteria,
  common_mistakes,
  is_global,
  user_id
) VALUES (
  'User A Private Scenario',
  'medium',
  'Detta är User A:s privata scenario',
  'Private Persona',
  'CTO',
  'Private AB',
  '50-200',
  'SaaS',
  '{}',
  '500000-1000000',
  '1-3 månader',
  'Teknisk',
  '{}',
  '{}',
  'Hej, jag är intresserad',
  '{}',
  '{}',
  false,  -- Inte globalt
  'USER_A_ID'  -- User A:s ID
);

-- User B ska INTE kunna se detta
```

## Förväntade Resultat - Sammanfattning

### ✅ User A:

- Ser endast sin egen produkt: "SaaS Produkt A"
- Ser endast sitt eget material: "User A Material"
- Kan skapa, uppdatera, ta bort sina egna produkter
- Kan INTE se, uppdatera eller ta bort User B:s produkter
- Ser globala träningsscenarier
- Ser sina egna user-specifika scenarier

### ✅ User B:

- Ser endast sin egen produkt: "E-handel Produkt B"
- Ser endast sitt eget material: "User B Material"
- Kan skapa, uppdatera, ta bort sina egna produkter
- Kan INTE se, uppdatera eller ta bort User A:s produkter
- Ser globala träningsscenarier
- Ser sina egna user-specifika scenarier

### ✅ RLS Enforcement:

- Policies enforced på databas-nivå
- Ingen användare kan bypassa isolation via API calls
- CASCADE DELETE vid user-borttagning
- Automatisk user_id-sättning vid INSERT

## Felsökning

### Problem: User A kan se User B:s produkter

**Lösning:**
```sql
-- Verifiera att RLS är aktiverat
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'product_profiles';
-- rowsecurity ska vara 't' (true)

-- Verifiera policies
SELECT * FROM pg_policies
WHERE tablename = 'product_profiles';
```

### Problem: Kan inte skapa produkter

**Lösning:**
```sql
-- Kontrollera att trigger finns
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgrelid = 'product_profiles'::regclass
AND tgname = 'set_product_user_id_trigger';
```

### Problem: user_id är NULL efter insert

**Lösning:**
Triggern ska sätta user_id automatiskt. Verifiera att:
1. Användaren är inloggad (auth.uid() returnerar UUID)
2. Triggern är enabled
3. Funktionen `set_product_user_id()` finns

## Support

Vid problem:
- Kontrollera Supabase logs: **Database → Logs**
- Kör verification queries ovan
- Testa med Supabase SQL Editor först (direkt databas-access)

---

**Status**: User isolation implementerat och redo för testning
**Branch**: `platform-development`
**Migration**: `20260131_add_user_isolation.sql`
