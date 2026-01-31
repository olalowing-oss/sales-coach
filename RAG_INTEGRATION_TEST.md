# RAG Integration Test Guide

Detta dokument beskriver hur du testar RAG (Retrieval-Augmented Generation) integrationen i träningsläget.

## Vad är RAG?

RAG kombinerar:
- **Retrieval**: Hämta relevant information från kunskapsbasen
- **Augmented**: Berika AI-prompten med hämtad information
- **Generation**: AI genererar svar baserat på verklig produktinformation

**Resultat**: AI-kunden kan nu svara med faktisk produktinformation från dina uppladdade dokument istället för att gissa eller hitta på!

## Förutsättningar

Innan du testar RAG måste följande vara klart:

1. ✅ Phase 1: Database schema (product_profiles, knowledge_base tabeller)
2. ✅ Phase 2: Knowledge Base Manager UI
3. ✅ Phase 3: Document Processing (embeddings genererade)
4. ✅ Phase 4: RAG Integration (denna guide)

## Arkitektur

```
Säljare säger något
    ↓
[Query Embedding Generation] ← OpenAI text-embedding-ada-002
    ↓
[Semantic Search] ← match_knowledge_base() funktion
    ↓
[Retrieve Top Dokument] ← Cosine similarity > 0.7
    ↓
[Inject i AI Prompt] ← "PRODUKTINFORMATION: ..."
    ↓
[AI Genererar Svar] ← GPT-4o-mini med kontext
    ↓
AI-kund svarar med verklig produktinfo
```

## Steg 1: Förbered Test-miljö

### Skapa en Testprodukt

1. **Öppna Knowledge Base Manager:**
   - Säljträning → Kunskapsbas

2. **Skapa ny produkt:**
   - Namn: `AI Sales Coach Pro`
   - Bransch: `B2B SaaS`
   - Beskrivning: `AI-driven plattform för säljträning`
   - Nyckelfunktioner:
     ```
     Realtids AI-kunder för rollspel
     Röst-baserad träning med Azure Speech
     Detaljerad performance-analys
     Personlig coaching feedback
     Kunskapsbaserad träning
     ```
   - Värdeförslag:
     ```
     Träna när du vill utan att boka resurser
     Få omedelbar feedback på din försäljningsteknik
     Mät och förbättra systematiskt
     ```
   - Vanliga invändningar:
     ```
     "Kan AI verkligen ersätta riktiga kunder?" - Nej, men perfekt för träning
     "Är det dyrt?" - Mycket billigare än traditionell säljträning
     "Hur lång tid tar det att lära sig?" - 5 minuter, sen kör du
     ```

3. **Spara produkten**

### Ladda upp Material

1. **Välj produkten i Knowledge Base Manager**

2. **Ladda upp dokument med produktinfo:**

   **Dokument 1: Funktioner**
   - Titel: `AI Sales Coach - Funktioner`
   - Innehåll:
     ```
     AI Sales Coach Pro är en innovativ träningsplattform med följande funktioner:

     1. REALTIDS AI-KUNDER
     - Dynamiska kundpersonas som reagerar realistiskt
     - 8 olika svårighetsgrader och branscher
     - Anpassar sig till din säljstil

     2. RÖST-BASERAD TRÄNING
     - Azure Neural Voices för naturlig dialog
     - Stöd för svenska med Mattias, Sofie och Hillevi röster
     - Speech recognition för hands-free träning

     3. INTELLIGENT COACHING
     - Realtids feedback under samtalet
     - Analys av vad som fungerade bra
     - Konkreta förbättringsförslag
     - Mäter kundens intressenivå i realtid

     4. KUNSKAPSBASERAD TRÄNING
     - Ladda upp ditt eget material (PDF, DOCX, URL, text)
     - AI processerar automatiskt och skapar embeddings
     - Träna på din egen produkt med verklig information

     5. PERFORMANCE TRACKING
     - Spara alla samtal för senare granskning
     - Se progression över tid
     - Identifiera styrkor och svagheter
     ```

   **Dokument 2: Prissättning**
   - Titel: `AI Sales Coach - Prissättning`
   - Innehåll:
     ```
     AI Sales Coach Pro - Prismodell

     STARTUP PLAN
     - 990 SEK/månad
     - 1 användare
     - Obegränsat antal träningssamtal
     - Alla AI-kunder
     - Grundläggande analytics

     TEAM PLAN
     - 4,990 SEK/månad
     - 5 användare
     - Allt i Startup +
     - Team analytics
     - Custom produktprofiler
     - Prioriterad support

     ENTERPRISE PLAN
     - Kontakta oss för offert
     - 20+ användare
     - Allt i Team +
     - Dedikerad success manager
     - Custom AI-utveckling
     - On-premise deployment möjligt

     ROI-KALKYL:
     Traditionell säljträning: 15,000-50,000 SEK/person/dag
     AI Sales Coach: 990 SEK/månad obegränsat
     Återbetalningstid: 1-2 dagar vid aktiv användning

     BETALA ÅRLIGEN: 20% rabatt (792 SEK/månad för Startup)
     ```

   **Dokument 3: Målgrupp**
   - Titel: `AI Sales Coach - Målgrupp och Use Cases`
   - Innehåll:
     ```
     Målgrupp för AI Sales Coach Pro:

     PRIMÄR MÅLGRUPP
     - B2B säljare (tech, SaaS, enterprise)
     - Säljchefer som vill coacha sitt team
     - Startups som inte har råd med extern säljträning
     - Erfarna säljare som vill finslipa sin teknik

     USE CASES
     1. ONBOARDING
        - Nya säljare kan träna på produkten innan kundmöten
        - Lär dig objection handling i trygg miljö
        - Bygg självförtroende

     2. FÖRBEREDELSE
        - Öva inför viktiga möten
        - Testa olika säljpitchar
        - Hantera svåra invändningar

     3. KONTINUERLIG UTVECKLING
        - Daglig träning (15 min/dag rekommenderat)
        - Fokusera på specifika svagheter
        - Mät progression över tid

     4. TEAM COACHING
        - Säljchefer kan skapa custom scenarier
        - Dela best practices
        - Benchmark team performance

     BRANSCHER MED STÖRST NYTTA
     - SaaS och tech-försäljning
     - Konsulttjänster
     - Enterprise software
     - Financial services
     - Medical devices

     SMÄRTPUNKTER VI LÖSER
     - "Våra säljare får inte tillräckligt med övning"
     - "Traditionell träning är för dyr och tidskrävande"
     - "Svårt att mäta och följa upp träning"
     - "Nya säljare tar för lång tid att bli produktiva"
     ```

3. **Vänta på processing:**
   - Alla dokument ska få status "Klar" (grönt)
   - Refresh dokumentlistan efter 10-15 sekunder

4. **Verifiera i Supabase:**
   ```sql
   -- Kontrollera att embeddings skapades
   SELECT
     id,
     title,
     processing_status,
     length(embedding::text) as embedding_length
   FROM knowledge_base
   WHERE product_id = 'PRODUCT_ID'
   ORDER BY created_at DESC;
   ```

   **Förväntat resultat:**
   - 3 dokument
   - Alla med `processing_status = 'completed'`
   - `embedding_length` > 10000 (betyder embeddings finns)

## Steg 2: Koppla Training Scenario till Produkt

Nu behöver vi koppla ett träningsscenario till vår produkt så att RAG aktiveras.

### Alternativ A: Uppdatera via SQL

```sql
-- Hitta ett scenario att uppdatera
SELECT id, name, persona_name, product_id
FROM training_scenarios
WHERE is_global = true
LIMIT 5;

-- Välj ett scenario (t.ex. "Enthusiastic Startup CTO")
-- och koppla det till din produkt
UPDATE training_scenarios
SET product_id = 'PRODUCT_ID_FROM_STEP_1'
WHERE id = 'SCENARIO_ID';

-- Verifiera
SELECT
  ts.name as scenario_name,
  pp.name as product_name,
  ts.product_id
FROM training_scenarios ts
LEFT JOIN product_profiles pp ON ts.product_id = pp.id
WHERE ts.id = 'SCENARIO_ID';
```

### Alternativ B: Skapa nytt scenario med produkt (via Admin)

Om du har Scenarios Admin UI:

1. Skapa nytt scenario
2. Fyll i alla fält som vanligt
3. **Viktigt:** Välj produkten "AI Sales Coach Pro" i produkt-dropdown
4. Spara

## Steg 3: Test RAG i Träningsläge

Nu är allt redo för att testa RAG!

### Test 1: Grundläggande RAG

1. **Starta Training Mode:**
   - Säljträning → Träningsläge

2. **Välj scenariot du kopplade till produkten**

3. **AI-kund öppnar samtalet**

4. **Säljare (du) frågar om funktioner:**
   ```
   "Hej! Berätta lite om vilka funktioner AI Sales Coach har?"
   ```

5. **Förväntat resultat:**
   - AI-kunden svarar med **specifika funktioner** från ditt dokument
   - Exempelvis: "Vi har realtids AI-kunder, röst-baserad träning med Azure..."
   - **INTE** generiska svar som "Det är en bra plattform"

6. **Verifiera i Browser Console:**
   - Öppna DevTools → Console
   - Du ska se något liknande:
   ```
   Document processed: {success: true, ...}
   Matched documents: 2
   Similarity scores: [0.87, 0.82]
   ```

### Test 2: Prisförfrågan

1. **Fortsätt samtalet:**
   ```
   "Det låter intressant! Vad kostar det?"
   ```

2. **Förväntat resultat:**
   - AI-kunden nämner **specifika priser** från prissättningsdokumentet
   - Exempelvis: "Startup-planen kostar 990 SEK/månad..."
   - Kan jämföra med ROI vs traditionell träning

### Test 3: Objection Handling

1. **Testa en invändning:**
   ```
   "Jag är osäker på om AI verkligen kan ersätta riktiga kunder för träning?"
   ```

2. **Förväntat resultat:**
   - AI-kunden svarar baserat på "Vanliga invändningar" från produktprofilen
   - Exempelvis: "Nej, AI ersätter inte riktiga kunder, men det är perfekt för träning..."

### Test 4: Målgruppsanpassning

1. **Fråga om målgrupp:**
   ```
   "Vilka företag passar detta för?"
   ```

2. **Förväntat resultat:**
   - AI nämner **specifika branscher** från målgruppsdokumentet
   - Exempelvis: "Vi ser störst nytta inom SaaS, enterprise software, konsulttjänster..."

## Steg 4: Verifiera RAG Fungerar

### Kontrollera API Logs (Lokal utveckling)

Om du kör lokalt med `npm run dev`:

1. Se terminal output för Vite
2. API calls till `/api/ai-customer` och `/api/ai-customer-quick` ska visa:
   ```
   Processing document: <ID>
   Matched documents: 2-3
   Similarity: 0.75-0.90
   ```

### Kontrollera Vercel Function Logs (Produktion)

1. Gå till Vercel Dashboard
2. Välj projekt → Functions → Logs
3. Filtrera på `ai-customer`
4. Se RAG-relaterade logs:
   ```
   Embedding generated for query
   Retrieved 2 documents with similarity > 0.7
   Knowledge context injected into prompt
   ```

### Verifiera Semantic Search

Testa att semantic search fungerar korrekt:

```sql
-- Skapa en test-embedding (simulerad query)
-- I verkligheten kommer detta från OpenAI

-- Sök dokument manuellt
SELECT
  id,
  title,
  substring(content, 1, 100) as preview
FROM knowledge_base
WHERE product_id = 'PRODUCT_ID'
AND content ILIKE '%pris%'  -- Textbaserad sökning
LIMIT 3;

-- Testa match_knowledge_base funktionen
-- (Kräver ett riktigt embedding från OpenAI)
```

## Steg 5: Test Olika Scenarier

### Scenario A: Ingen produktkoppling (Fallback)

1. Välj ett scenario **utan** product_id
2. Starta träning
3. AI-kunden ska fungera normalt **utan** RAG
4. Svar blir mer generiska men fortfarande realistiska

**Detta testar att systemet är backward-compatible.**

### Scenario B: Tom kunskapsbas

1. Skapa en ny produkt
2. Koppla till scenario **utan** att ladda upp dokument
3. Starta träning
4. RAG körs men hittar inga dokument
5. AI-kunden fungerar normalt med generisk info

**Detta testar error handling.**

### Scenario C: Flera produkter

1. Skapa 2 produkter med olika material
2. Koppla olika scenarier till varje produkt
3. Testa att RAG hämtar rätt info för rätt produkt
4. Verifiera att Product A:s info inte blandas med Product B

**Detta testar multi-tenancy i RAG.**

## Steg 6: Mät RAG-kvalitet

### Relevans-test

Ställ 10 olika frågor och bedöm om AI:s svar är:

1. **Korrekta** (baserat på dokument) - Ja/Nej
2. **Relevanta** (svarar på frågan) - 1-5
3. **Naturliga** (låter som en riktig kund) - 1-5

**Exempel-frågor:**
- "Vilka funktioner har er produkt?"
- "Vad kostar det?"
- "Vilka kunder passar det för?"
- "Hur lång tid tar implementation?"
- "Vad är er största konkurrensfördel?"
- "Kan ni integrera med våra befintliga system?"
- "Hur mäter ni ROI?"
- "Vilken support ingår?"
- "Finns det en gratis trial?"
- "Kan vi anpassa produkten för våra behov?"

### Similarity Score-test

Kolla console logs för similarity scores:

- **0.9-1.0**: Perfekt match (AI använder exakt rätt info)
- **0.7-0.9**: Bra match (AI använder relevant info)
- **0.5-0.7**: Okej match (AI använder relaterad info)
- **< 0.5**: Dålig match (AI gissar, RAG hjälper inte)

**Mål:** Minst 70% av queries ska ha similarity > 0.7

## Steg 7: Performance Testing

### Latency-mätning

Mät hur lång tid RAG lägger till:

1. **Utan RAG** (ingen product_id):
   - Quick response: ~1-2 sekunder
   - Full response: ~3-5 sekunder

2. **Med RAG** (product_id satt):
   - Quick response: ~2-3 sekunder (+1s för embedding + search)
   - Full response: ~4-6 sekunder

**Mål:** RAG ska lägga till max 2 sekunder latency

### Kostnad-mätning

RAG kostar extra pga embedding generation:

- **Utan RAG**: $0.01-0.02 per samtal (endast GPT-4o-mini)
- **Med RAG**: $0.015-0.025 per samtal (+embedding $0.0001/query)

**Embedding är billigt:** 1000 queries = ~10 cent

## Felsökning

### Problem: AI använder inte produktinfo

**Symptom:** AI svarar generiskt trots att RAG är aktivt

**Möjliga orsaker:**
1. `product_id` inte satt på scenariot
2. Inga dokument uppladdade för produkten
3. Dokument inte processade (status != 'completed')
4. Embeddings saknas (NULL i database)
5. Similarity threshold för hög (ingen match)

**Lösning:**
```sql
-- 1. Verifiera scenario har product_id
SELECT id, name, product_id
FROM training_scenarios
WHERE id = 'SCENARIO_ID';

-- 2. Verifiera dokument finns
SELECT COUNT(*), processing_status
FROM knowledge_base
WHERE product_id = 'PRODUCT_ID'
GROUP BY processing_status;

-- 3. Verifiera embeddings finns
SELECT id, title,
  CASE WHEN embedding IS NULL THEN 'Missing' ELSE 'OK' END as embedding_status
FROM knowledge_base
WHERE product_id = 'PRODUCT_ID';

-- 4. Sänk similarity threshold temporärt för debugging
-- I api/ai-customer.ts: match_threshold: 0.5 (från 0.7)
```

### Problem: "match_knowledge_base function does not exist"

**Symptom:** API error när RAG körs

**Orsak:** Migration inte körts i Supabase

**Lösning:**
```sql
-- Kör migration igen:
-- supabase-migrations/20260131_create_knowledge_base.sql

-- Verifiera funktion finns:
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'match_knowledge_base';
```

### Problem: RAG är för långsamt

**Symptom:** >5 sekunder response time med RAG

**Möjliga orsaker:**
1. För många dokument att söka igenom
2. HNSW index inte skapat
3. Embedding generation tar tid

**Lösning:**
```sql
-- 1. Verifiera HNSW index finns
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'knowledge_base'
AND indexname LIKE '%embedding%';

-- 2. Minska match_count för snabbare search
-- I api/ai-customer.ts: match_count: 2 (från 3)
-- I api/ai-customer-quick.ts: match_count: 1 (från 2)

-- 3. Skapa index om det saknas
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

### Problem: Fel produktinfo visas

**Symptom:** AI nämner info från fel produkt

**Orsak:** `filter_product_id` inte fungerar korrekt

**Lösning:**
```sql
-- Verifiera filter fungerar:
SELECT
  kb.id,
  kb.title,
  kb.product_id,
  pp.name as product_name
FROM knowledge_base kb
JOIN product_profiles pp ON kb.product_id = pp.id
WHERE kb.product_id = 'EXPECTED_PRODUCT_ID';

-- Test match_knowledge_base med filter
-- (Kräver ett test-embedding)
```

### Problem: Sources inte visas i UI

**Symptom:** AI använder RAG men källor visas inte

**Orsak:** Frontend visar inte sources field än

**Temporär lösning:**
```javascript
// Kolla i browser console
console.log('AI Response:', data);
console.log('Sources:', data.sources);
```

**Långsiktig lösning:** Lägg till sources-visning i TrainingMode UI

## Verifiering - Checklista

Efter alla tester, verifiera:

- [ ] RAG aktiveras när product_id är satt
- [ ] AI-kunden använder verklig produktinfo från dokument
- [ ] Similarity scores > 0.7 för relevanta queries
- [ ] Sources returneras i API response
- [ ] RAG fungerar i både quick och full endpoint
- [ ] Fallback fungerar (ingen product_id = normalt beteende)
- [ ] Multi-tenancy fungerar (rätt info för rätt produkt)
- [ ] Performance acceptabel (<5 sek total response)
- [ ] Error handling fungerar (tom kunskapsbas osv)
- [ ] Backward compatible (gamla scenarier fungerar fortfarande)

## Nästa Steg

När RAG fungerar:

**Phase 5: UI Förbättringar**
- Visa källor i träningsläge (vilka dokument användes)
- Highlight när RAG är aktivt
- Produktväljare i scenario-setup
- RAG confidence indicator

**Phase 6: Auto-Generate Scenarios**
- Skapa scenarier automatiskt från dokument
- Extrahera personas från målgruppsbeskrivningar
- Auto-genererade objections från FAQ
- Knowledge base-driven scenario creation

**Phase 7: Advanced RAG**
- Hybrid search (keyword + semantic)
- Re-ranking för bättre relevans
- Citation i AI-svar ("Enligt produktblad...")
- Feedback loop för kvalitetsförbättring

## Support

Vid problem:
- Kolla Browser DevTools Console
- Kolla Vercel Function Logs (produktion)
- Kolla Supabase Database Logs
- Verifiera alla environment variables är satta
- Kör verification queries i denna guide

---

**Status**: RAG Integration implementerat och redo för testning
**Branch**: `platform-development`
**API Endpoints**: `/api/ai-customer`, `/api/ai-customer-quick`
**Dependencies**: @supabase/supabase-js, OpenAI embeddings, pgvector
**Database Functions**: `match_knowledge_base()`
