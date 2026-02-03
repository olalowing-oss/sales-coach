# Test RAG-funktionalitet - Exempel

## Snabbtest i UI

### Förberedelser:

1. **Ladda upp exempel-dokument:**
   - Gå till ProductAdminPanel
   - Välj M365-produkt
   - Ladda upp ett PDF med SLA-information
   - Vänta på processing (embeddings skapas)

2. **Skapa RAG-trigger:**

Gå till CoachingAdminPanel och lägg till:

```
Keywords: sla, servicenivå, responstid, uptime
Type: suggestion
Title: SLA & Servicenivåer
Priority: high
Content: (lämna tom - fylls från dokument)
Document Query: SLA servicenivå support responstid uptime garanti
Product: M365
```

### Test-scenario:

```
1. Starta samtal i Sales Coach

2. Simulera att kunden frågar:
   "Vilka servicenivåer kan ni garantera?"

3. Förväntat resultat:
   - Trigger matchar "servicenivåer"
   - RAG-sökning aktiveras
   - Coaching tip visar:
     * Titel: "SLA & Servicenivåer"
     * Content: Sammanfattning från dokument
     * Talking points: Bullet points med konkreta SLA-nivåer

4. Kontrollera i browser console:
   [CoachingEngine] RAG trigger activated: "SLA & Servicenivåer"
   [CoachingEngine] Found X document chunks...
   [CoachingEngine] RAG tip created with X words from documents
```

## SQL-test (direkt i Supabase)

### Test 1: Kontrollera att migrations körts

```sql
-- Kontrollera document_query column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trigger_patterns'
AND column_name = 'document_query';

-- Förväntat: Ska returnera en rad
```

### Test 2: Kontrollera vector search-funktion

```sql
-- Lista funktioner
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'match_documents';

-- Förväntat: Ska visa match_documents som FUNCTION
```

### Test 3: Test vector search (om du har dokument)

```sql
-- Skapa test-embedding (random, bara för att testa funktionen)
SELECT match_documents(
  ARRAY[0.1, 0.2, 0.3, ...]::vector(1536),  -- Dummy embedding
  0.5,  -- Låg threshold för test
  3,    -- Max 3 resultat
  NULL, -- Alla produkter
  NULL  -- Alla användare
);

-- Förväntat: Returnerar document chunks (om de finns)
```

## Backend-test (via curl)

### Test dokument-upload

```bash
# 1. Få auth token
TOKEN="din-supabase-jwt-token"

# 2. Upload dokument (via API endpoint om tillgänglig)
curl -X POST http://localhost:3001/api/upload-document \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@SLA_dokument.pdf" \
  -F "productId=M365_PRODUCT_ID"

# Förväntat: 200 OK + document ID
```

## Lokal test med Node.js

Skapa `test-rag.mjs`:

```javascript
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testRAG() {
  console.log('🧪 Testing RAG functionality...\n');

  // 1. Create embedding for test query
  const query = "SLA servicenivå support responstid";
  console.log(`Creating embedding for: "${query}"`);

  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });

  const embedding = embeddingResponse.data[0].embedding;
  console.log(`✅ Embedding created (${embedding.length} dimensions)\n`);

  // 2. Search documents
  console.log('Searching documents...');

  const { data: matches, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.78,
    match_count: 3,
  });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Found ${matches?.length || 0} matches\n`);

  if (matches && matches.length > 0) {
    matches.forEach((match, i) => {
      console.log(`Match ${i + 1}:`);
      console.log(`  Similarity: ${(match.similarity * 100).toFixed(1)}%`);
      console.log(`  Content: ${match.content.substring(0, 100)}...`);
      console.log('');
    });

    // 3. Test summarization
    const combined = matches.map(m => m.content).join('\n\n');
    const wordCount = combined.split(' ').length;

    console.log(`Combined content: ${wordCount} words`);

    if (wordCount > 150) {
      console.log('\nTesting AI summarization...');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sammanfatta koncist på svenska med bullet points.'
          },
          {
            role: 'user',
            content: `Kundens fråga: "Vilka servicenivåer har ni?"\n\n${combined}`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      const summary = completion.choices[0].message.content;
      console.log('\n📝 Summary:');
      console.log(summary);
    }
  } else {
    console.log('ℹ️  No documents found. Upload some documents first!');
  }

  console.log('\n✅ RAG test complete!');
}

testRAG().catch(console.error);
```

Kör test:

```bash
node test-rag.mjs
```

## Förväntat output

```
🧪 Testing RAG functionality...

Creating embedding for: "SLA servicenivå support responstid"
✅ Embedding created (1536 dimensions)

Searching documents...
✅ Found 3 matches

Match 1:
  Similarity: 89.2%
  Content: Priority 1 (Kritiskt): Initial respons inom 1 timme, lösning inom 4 timmar. Tillgängligt dygnet...

Match 2:
  Similarity: 85.7%
  Content: Priority 2 (Högt): Initial respons inom 4 timmar under kontorstid, lösning inom 8 timmar...

Match 3:
  Similarity: 82.3%
  Content: Systemtillgänglighet: 99.9% uptime-garanti. Månadsrapport om driftstörningar skickas...

Combined content: 287 words

Testing AI summarization...

📝 Summary:
• Priority 1 (kritiskt): 1h respons, 4h lösning, 24/7
• Priority 2 (högt): 4h respons, 8h lösning (kontorstid)
• Priority 3 (normalt): 8h respons, 5 dagar lösning
• 99.9% uptime-garanti med månadsrapportering

✅ RAG test complete!
```

## Troubleshooting

### "Could not find the function match_documents"

**Lösning:** Kör migration 004_create_vector_search_function.sql i Supabase Dashboard

### "No documents found"

**Lösning:**
1. Ladda upp dokument via ProductAdminPanel
2. Vänta på processing (kan ta 30 sekunder för stort dokument)
3. Kontrollera att embeddings skapats:

```sql
SELECT COUNT(*) FROM document_embeddings;
```

### "Similarity too low"

**Lösning:** Sänk threshold:

```javascript
match_threshold: 0.70  // Istället för 0.78
```

---

**Tips:** Börja med att testa SQL-funktionerna först, sedan backend-test, och sist UI-test.
