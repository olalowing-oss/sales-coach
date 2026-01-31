# Document Processing Test Guide

Detta dokument beskriver hur du testar document processing backend (Phase 3).

## Förutsättningar

1. ✅ Migrationer körda (Phase 1)
2. ✅ User isolation implementerad (Phase 2)
3. ✅ Knowledge Base Manager UI fungerar
4. ✅ OpenAI API-nyckel konfigurerad
5. ✅ Supabase Service Role Key konfigurerad

## Environment Variables

Lägg till i `.env` (eller Vercel Environment Variables för produktion):

```bash
# OpenAI för embeddings och summarization
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Supabase för backend processing
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Hitta i Supabase Dashboard → Settings → API
```

**VIKTIGT:**
`SUPABASE_SERVICE_ROLE_KEY` ger full åtkomst till databasen (bypass RLS).
- ✅ Använd ENDAST i serverless functions (`api/` mappen)
- ❌ Använd ALDRIG i frontend-kod

### Hitta Service Role Key

1. Gå till Supabase Dashboard
2. Välj ditt projekt
3. **Settings → API**
4. Scrolla ner till "Project API keys"
5. Kopiera `service_role` key (secret, dold som default)

## Steg 1: Lokal Utveckling

### Starta Development Server

```bash
npm run dev
```

Appen körs på http://localhost:3003/

### Verifiera API Endpoint

För lokal utveckling fungerar `/api/process-document` automatiskt via Vite proxy.

## Steg 2: Test Document Processing

### Test 1: Text Upload med Processing

1. **Öppna Knowledge Base Manager:**
   - Säljträning → Kunskapsbas

2. **Välj eller skapa produkt**

3. **Ladda upp text:**
   - Klicka "Klistra in text"
   - **Titel:** `Test Processing`
   - **Innehåll:**
     ```
     B3 Sales Coach är en innovativ AI-driven plattform för säljträning.

     Plattformen erbjuder:
     - Realistiska AI-kunder för rollspel
     - Realtids feedback på samtalsteknik
     - Personlig coaching baserad på dina styrkor
     - Detaljerad analys av varje samtal

     Målgrupp: Säljare på alla nivåer och säljledare.
     Bransch: B2B SaaS och teknikförsäljning.

     Priset är konkurrensekraftigt jämfört med traditionell säljträning.
     ```
   - **Klicka "Lägg till text"**

4. **Verifiera upload:**
   - Dokumentet dyker upp med status "Väntar" (gul badge)

5. **Vänta på processing (~5-10 sekunder):**
   - Öppna Browser DevTools → Console
   - Du ska se: `Document processed: {success: true, ...}`
   - Refresh dokumentlistan (klicka refresh-ikonen)

6. **Verifiera completed status:**
   - Status ändras till "Klar" (grön badge)
   - ✅ Summary genererad
   - ✅ Embedding sparad
   - ✅ Content processed

### Test 2: Verifiera i Supabase

Kör i Supabase SQL Editor:

```sql
-- Hämta senaste dokumentet
SELECT
  id,
  title,
  processing_status,
  substring(summary, 1, 100) as summary_preview,
  substring(content, 1, 100) as content_preview,
  length(embedding::text) as embedding_length,
  processed_at,
  processing_error
FROM knowledge_base
ORDER BY created_at DESC
LIMIT 1;
```

**Förväntat resultat:**
- `processing_status` = 'completed'
- `summary` innehåller svensk sammanfattning
- `embedding_length` > 0 (JSON array med 1536 siffror)
- `processed_at` har timestamp
- `processing_error` är NULL

### Test 3: URL Upload med Processing

1. **Välj "Från URL"**
2. **URL:** `https://example.com`
3. **Klicka "Hämta från URL"**
4. **Vänta på processing**
5. **Verifiera:**
   - Content scrapad från HTML
   - Summary genererad
   - Embedding sparad

**OBS:** URL scraping är basic och fungerar bäst med enkla webbsidor.

### Test 4: Multiple Documents

Testa att ladda upp flera dokument samtidigt:

1. Ladda upp 3 textdokument
2. Alla ska processas i bakgrunden
3. Refresh för att se status-uppdateringar
4. Verifiera att alla får status "completed"

## Steg 3: Test Embedding Quality

### Verifiera Embedding Dimensions

```sql
-- Kontrollera embedding format
SELECT
  id,
  title,
  jsonb_array_length(embedding::jsonb) as embedding_dimensions,
  substring(embedding::text, 1, 100) as embedding_sample
FROM knowledge_base
WHERE processing_status = 'completed'
LIMIT 5;
```

**Förväntat:**
`embedding_dimensions` = 1536 (OpenAI ada-002 standard)

### Test Semantic Search

```sql
-- Test match_knowledge_base funktionen
-- Använd ett exempel-embedding (normalt kommer från query)
SELECT
  id,
  title,
  summary,
  1.0 as similarity  -- Placeholder
FROM knowledge_base
WHERE processing_status = 'completed'
LIMIT 5;
```

## Steg 4: Test Error Handling

### Test 1: Invalid Document

Testa med ett tomt dokument:

1. Ladda upp text med tomt innehåll
2. Processing ska misslyckas gracefully
3. Status: "Misslyckades" (röd badge)
4. `processing_error` ska ha felmeddelande

```sql
-- Verifiera felhantering
SELECT id, title, processing_status, processing_error
FROM knowledge_base
WHERE processing_status = 'failed';
```

### Test 2: OpenAI API Error

Om OpenAI API misslyckas (t.ex. invalid key):

1. Dokument sätts till "failed" status
2. `processing_error` visar API error message
3. UI visar röd badge

## Steg 5: Performance Testing

### Test Processing Time

```sql
-- Mät processing-tid
SELECT
  title,
  created_at,
  processed_at,
  EXTRACT(EPOCH FROM (processed_at - created_at)) as processing_seconds
FROM knowledge_base
WHERE processing_status = 'completed'
ORDER BY created_at DESC
LIMIT 10;
```

**Förväntat:**
- Små dokument (<1000 ord): 3-5 sekunder
- Medelstora dokument (1000-3000 ord): 5-10 sekunder
- Stora dokument (>3000 ord): 10-15 sekunder

### Test Concurrent Processing

1. Ladda upp 5 dokument samtidigt
2. Alla ska processas parallellt
3. Ingen ska fastna i "processing" status

## Steg 6: Vercel Deployment Test

### Deploy till Vercel

```bash
# Pusha till GitHub (auto-deploy om Vercel är kopplat)
git push origin platform-development

# Eller deploy manuellt
vercel --prod
```

### Konfigurera Environment Variables i Vercel

1. Gå till Vercel Dashboard → Settings → Environment Variables
2. Lägg till:
   - `VITE_OPENAI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy

### Test Production API

1. Ladda upp dokument på production URL
2. Verifiera att processing fungerar
3. Kolla Vercel Function Logs:
   - Vercel Dashboard → Functions → Logs
   - Se processing-logs

## Felsökning

### Problem: "Document processed: {success: false}"

**Orsak:** API endpoint misslyckades

**Lösning:**
1. Kolla Browser Console för fel
2. Verifiera environment variables
3. Kolla Supabase logs
4. Test OpenAI API-nyckel:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $VITE_OPENAI_API_KEY"
   ```

### Problem: Dokument stannar i "processing" status

**Orsak:** API endpoint crashed eller timeout

**Lösning:**
```sql
-- Manuellt sätt tillbaka till pending för retry
UPDATE knowledge_base
SET processing_status = 'pending'
WHERE id = 'DOCUMENT_ID';
```

Trigga sedan processing manuellt via Browser Console:
```javascript
fetch('/api/process-document', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ documentId: 'DOCUMENT_ID' })
})
```

### Problem: "Service Role Key" error

**Orsak:** Saknas eller felaktig SUPABASE_SERVICE_ROLE_KEY

**Lösning:**
1. Hitta korrekt key i Supabase Dashboard → Settings → API
2. Lägg till i `.env` (lokal) eller Vercel Env Vars (produktion)
3. Restart development server eller redeploy

### Problem: OpenAI API Rate Limit

**Orsak:** För många requests till OpenAI

**Lösning:**
1. Vänta 1 minut
2. Retry processing
3. Överväg att öka rate limits (betald plan)

### Problem: Embedding är NULL

**Orsak:** Embedding generation misslyckades

**Lösning:**
```sql
-- Hitta dokument utan embeddings
SELECT id, title, processing_status, processing_error
FROM knowledge_base
WHERE processing_status = 'completed'
AND embedding IS NULL;
```

Trigga reprocessing för dessa dokument.

## Verifiering - Checklista

Efter alla tester, verifiera:

- [ ] Text upload → processing → completed
- [ ] URL upload → scraping → processing → completed
- [ ] Summaries genereras på svenska
- [ ] Embeddings har 1536 dimensions
- [ ] Processing tar <15 sekunder för normala dokument
- [ ] Error handling fungerar (failed status vid fel)
- [ ] Vercel deployment fungerar
- [ ] Production API processar dokument korrekt
- [ ] Browser console visar processing logs
- [ ] Supabase har korrekt data (summary, embedding)

## Nästa Steg

När document processing fungerar:

**Phase 4: RAG Integration**
- Implementera semantic search i AI-customer
- AI svarar med verklig produktinformation
- Citation av källor

**Phase 5: Auto-Generate Scenarios**
- Skapa träningsscenarier från dokument
- Auto-genererade personas baserat på målgrupp
- Knowledge base-koppling

## Support

Vid problem:
- Kolla Browser DevTools Console
- Kolla Vercel Function Logs (produktion)
- Kolla Supabase Database Logs
- Verifiera all environment variables är satta

---

**Status**: Document processing implementerat och redo för testning
**Branch**: `platform-development`
**API**: `/api/process-document`
**Dependencies**: pdf-parse, mammoth, cheerio, OpenAI
