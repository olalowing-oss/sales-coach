# Migration Guide - Platform Development

Detta dokument beskriver hur du applicerar databas-migrationer för plattformsutveckling.

## Översikt

Platform-development branchen lägger till tre nya migrationsfiler för multi-produkt funktionalitet:

1. `20260131_create_product_profiles.sql` - Produktprofiler
2. `20260131_create_knowledge_base.sql` - Kunskapsbas med vector embeddings
3. `20260131_update_training_scenarios_for_platform.sql` - Uppdateringar till träningsscenarier

## Förutsättningar

- Tillgång till Supabase Dashboard
- Supabase projekt för B3 Sales Coach
- PostgreSQL version 14+ (inkluderar pgvector support)

## Metod 1: Supabase Dashboard (Rekommenderad för Development)

### Steg 1: Logga in på Supabase

1. Gå till [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Välj ditt projekt (b3-sales-coach)
3. Navigera till **SQL Editor** i sidomenyn

### Steg 2: Kör migrationer i ordning

**Migration 1: Skapa Product Profiles**

```sql
-- Kopiera hela innehållet från:
-- supabase-migrations/20260131_create_product_profiles.sql
```

1. Öppna filen `supabase-migrations/20260131_create_product_profiles.sql`
2. Kopiera hela innehållet
3. Klistra in i SQL Editor
4. Klicka **Run** (Ctrl/Cmd + Enter)
5. Verifiera: `✓ Success. No rows returned`

**Migration 2: Skapa Knowledge Base**

```sql
-- Kopiera hela innehållet från:
-- supabase-migrations/20260131_create_knowledge_base.sql
```

1. Öppna filen `supabase-migrations/20260131_create_knowledge_base.sql`
2. Kopiera hela innehållet
3. Klistra in i SQL Editor
4. Klicka **Run**
5. Verifiera: `✓ Success. No rows returned`

**VIKTIGT:** Denna migration aktiverar pgvector extension. Om du får fel:
- Se till att pgvector är tillgängligt i ditt Supabase-projekt
- Kontakta Supabase support om extension saknas

**Migration 3: Uppdatera Training Scenarios**

```sql
-- Kopiera hela innehållet från:
-- supabase-migrations/20260131_update_training_scenarios_for_platform.sql
```

1. Öppna filen `supabase-migrations/20260131_update_training_scenarios_for_platform.sql`
2. Kopiera hela innehållet
3. Klistra in i SQL Editor
4. Klicka **Run**
5. Verifiera: `✓ Success. No rows returned`

### Steg 3: Verifiera Tabeller

Kör följande SQL för att verifiera att allt skapades korrekt:

```sql
-- Kontrollera att tabellerna finns
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('product_profiles', 'knowledge_base');

-- Kontrollera nya kolumner i training_scenarios
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'training_scenarios'
AND column_name IN ('product_id', 'auto_generated', 'knowledge_base_refs');

-- Kontrollera att pgvector extension är aktiverad
SELECT * FROM pg_extension WHERE extname = 'vector';
```

Förväntat resultat:
- 2 rader för product_profiles och knowledge_base
- 3 rader för nya kolumner i training_scenarios
- 1 rad för vector extension

## Metod 2: Supabase CLI (För Advanced Users)

### Förutsättningar

```bash
# Installera Supabase CLI
npm install -g supabase

# Logga in
supabase login

# Länka till ditt projekt
supabase link --project-ref ditt-projekt-id
```

### Kör migrationer

```bash
# Kör alla migrationer i ordning
supabase db push

# Eller kör individuellt
psql $DATABASE_URL -f supabase-migrations/20260131_create_product_profiles.sql
psql $DATABASE_URL -f supabase-migrations/20260131_create_knowledge_base.sql
psql $DATABASE_URL -f supabase-migrations/20260131_update_training_scenarios_for_platform.sql
```

## Rollback (Om något går fel)

Om du behöver ångra migrationerna:

```sql
-- Rollback i omvänd ordning

-- 1. Ta bort nya kolumner från training_scenarios
ALTER TABLE training_scenarios
DROP COLUMN IF EXISTS product_id,
DROP COLUMN IF EXISTS auto_generated,
DROP COLUMN IF EXISTS knowledge_base_refs,
DROP COLUMN IF EXISTS generation_prompt,
DROP COLUMN IF EXISTS generation_metadata;

-- 2. Ta bort knowledge_base tabell
DROP TABLE IF EXISTS knowledge_base CASCADE;
DROP FUNCTION IF EXISTS match_knowledge_base;
DROP FUNCTION IF EXISTS update_knowledge_base_updated_at;

-- 3. Ta bort product_profiles tabell
DROP TABLE IF EXISTS product_profiles CASCADE;
DROP FUNCTION IF EXISTS update_product_profiles_updated_at;

-- 4. (Valfritt) Inaktivera pgvector om du inte behöver det
-- DROP EXTENSION IF EXISTS vector;
```

## Seed Data (Test Data)

Efter migrationer kan du lägga till test-data:

```sql
-- Skapa en test-produkt
INSERT INTO product_profiles (
  name,
  description,
  industry,
  key_features,
  value_propositions
) VALUES (
  'B3 Sales Coach',
  'AI-driven säljträningsplattform',
  'SaaS / Sales Tech',
  '["AI-kunder", "Röstanalys", "Realtids coaching"]'::jsonb,
  '["Träna när du vill", "Personlig feedback", "Mätbara resultat"]'::jsonb
);

-- Hämta produkt-ID
SELECT id, name FROM product_profiles WHERE name = 'B3 Sales Coach';

-- Skapa ett test kunskapsbasdokument
INSERT INTO knowledge_base (
  product_id,
  source_type,
  title,
  content,
  processing_status
) VALUES (
  'DITT-PRODUKT-ID-HÄR', -- Byt ut mot faktiskt ID
  'text',
  'B3 Sales Coach - Produktöversikt',
  'B3 Sales Coach är en AI-driven plattform för säljträning...',
  'completed'
);
```

## Vanliga Problem

### Problem: "extension vector does not exist"

**Lösning:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Om det inte fungerar:
- Kontakta Supabase support för att aktivera pgvector
- pgvector kräver Postgres 14+

### Problem: "permission denied"

**Lösning:**
- Se till att du är inloggad som admin/owner i Supabase
- Använd Supabase Dashboard istället för direktanslutning

### Problem: "relation already exists"

**Lösning:**
- Tabellen finns redan (säker att ignorera)
- Eller kör rollback och försök igen

## Verifiering

När alla migrationer är klara, verifiera funktionalitet:

```sql
-- Test: Skapa produkt
INSERT INTO product_profiles (name, description)
VALUES ('Test Product', 'Test description')
RETURNING id, name;

-- Test: Skapa knowledge base entry
INSERT INTO knowledge_base (product_id, source_type, title, content)
VALUES ('PRODUKT-ID', 'text', 'Test', 'Test content')
RETURNING id, title;

-- Test: Uppdatera training scenario med produkt
UPDATE training_scenarios
SET product_id = 'PRODUKT-ID'
WHERE id = 'SCENARIO-ID';

-- Test: Vector search funktion
SELECT match_knowledge_base(
  '[0.1, 0.2, ...]'::vector(1536),  -- Exempel embedding
  0.5,  -- Threshold
  5,    -- Limit
  NULL  -- Filter product_id
);
```

## Nästa Steg

Efter att migrationer är körda:

1. ✅ Databas-schema uppdaterat
2. ⏭️ Bygg Knowledge Base Manager UI
3. ⏭️ Implementera fil-upload
4. ⏭️ Skapa document processing pipeline
5. ⏭️ Integrera RAG i AI-customer endpoint

Se [PLATFORM.md](./PLATFORM.md) för fullständig implementation roadmap.

## Support

Vid problem:
- Kontrollera Supabase logs: **Database → Logs**
- Granska SQL syntax
- Testa queries individuellt
- Fråga i Supabase Discord: https://discord.supabase.com

---

**Status**: Database schema ready för platform development
**Branch**: `platform-development`
**Datum**: 2026-01-31
