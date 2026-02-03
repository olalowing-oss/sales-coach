# RAG-baserad Coaching Guide

## Översikt

**RAG (Retrieval-Augmented Generation)** gör att Sales Coach automatiskt hittar och visar relevant information från dina dokument när kunden ställer frågor under samtal.

## 🎯 Vad löser det?

**Problem:** Kund frågar "Vilka servicenivåer kan ni garantera?" - Säljaren måste komma ihåg eller leta upp SLA-villkor.

**Lösning:** Sales Coach söker automatiskt i dina SLA-dokument och visar svaret direkt i coaching-panelen!

## 🚀 Så här fungerar det

### 1. Ladda upp dokument

```
ProductAdminPanel → Välj produkt (M365) → Upload Document
```

**Exempel på dokument att ladda upp:**
- ✅ Avtal med SLA-villkor (PDF)
- ✅ Tjänstebeskrivningar (PDF)
- ✅ Prisdokument (PDF)
- ✅ Produktspecifikationer (PDF/Word)
- ✅ FAQ-dokument (PDF/Word)

**Vad händer automatiskt:**
1. Text extraheras från PDF
2. Delas upp i chunks (512 tokens vardera)
3. Embeddings skapas med OpenAI (text-embedding-ada-002)
4. Sparas i `document_embeddings` med vector index

### 2. Skapa RAG-triggers

I **CoachingAdminPanel**, skapa triggers med `document_query`:

```typescript
// Trigger för SLA-frågor
{
  keywords: ['sla', 'servicenivå', 'responstid', 'uptid'],
  tip_type: 'suggestion',
  title: 'SLA & Servicenivåer',
  priority: 'high',
  document_query: 'SLA servicenivå support responstid uptime garanti'
}

// Trigger för avtalsfrågor
{
  keywords: ['avtal', 'kontrakt', 'bindningstid', 'uppsägning'],
  tip_type: 'suggestion',
  title: 'Avtalsvillkor',
  priority: 'high',
  document_query: 'avtal villkor bindningstid uppsägning'
}

// Trigger för prisfrågor
{
  keywords: ['pris', 'kostnad', 'vad kostar', 'prismodell'],
  tip_type: 'suggestion',
  title: 'Prissättning',
  priority: 'high',
  document_query: 'pris kostnad licens prismodell'
}
```

### 3. Använd i samtal

```
Kund: "Vilka servicenivåer kan ni garantera för support?"

↓ Trigger matchar "servicenivåer"

↓ RAG-sökning aktiveras

↓ Coaching tip visas:

┌─────────────────────────────────────────────────────────────┐
│ 🎯 SLA & Servicenivåer                                      │
├─────────────────────────────────────────────────────────────┤
│ • Priority 1 (kritiskt): 1h respons, 4h lösning, 24/7      │
│ • Priority 2 (högt): 4h respons, 8h lösning (kontorstid)   │
│ • Priority 3 (normalt): 8h respons, 5 dagar lösning        │
│ • Systemtillgänglighet: 99.9% uptime-garanti               │
│                                                              │
│ 💬 Förslag: "Våra responstider är branschledande -         │
│    kritiska ärenden hanteras inom 1 timme, dygnet runt."   │
│                                                              │
│ [Visa fullständig text från dokument ▼]                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Tekniskt flöde

### Steg 1: Trigger Detection
```typescript
Kund säger: "Vilka servicenivåer har ni?"
  ↓
Keyword matchar: "servicenivåer"
  ↓
Trigger har document_query → Aktivera RAG
```

### Steg 2: Document Search
```typescript
1. Skapa embedding av query: "SLA servicenivå support"
2. Vector similarity search i Supabase:
   - Jämför med document_embeddings
   - Filtrera på user_id + product_id
   - Similarity threshold: 0.78
   - Returnera top 3 chunks
```

### Steg 3: Hybrid Summarization
```typescript
documentContext = "Enligt avsnitt 4.2 i vårt standardavtal..." (300+ ord)

if (wordCount < 150) {
  // Kort text → visa direkt
  return { content: documentContext }
} else {
  // Lång text → sammanfatta med GPT-4
  summary = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    prompt: `Sammanfatta för säljare: "${customerQuestion}"\n${documentContext}`
  })

  return {
    content: summary,        // Koncis sammanfattning
    fullContext: documentContext  // Full text för expandable view
  }
}
```

### Steg 4: Display
```typescript
CoachingPanel visar:
- Title: "SLA & Servicenivåer"
- Content: Sammanfattad text (bullets)
- TalkingPoints: Extraherade punkter
- [Expandable] Full context om användaren vill se allt
```

## 📊 Performance & Kostnad

| Operation | Latency | Kostnad | Kommentar |
|-----------|---------|---------|-----------|
| Embedding creation | ~100ms | $0.0001 | Per query |
| Vector search | ~50ms | Gratis | Supabase |
| AI summarization | ~1.5s | $0.002 | Om > 150 ord |
| **Total (lång text)** | **~1.7s** | **$0.0021** | Per RAG tip |
| **Total (kort text)** | **~150ms** | **$0.0001** | Ingen AI |

**Kostnad per månad (estimat):**
- 100 samtal/månad
- 2 RAG-tips per samtal
- 50% långa texter som behöver sammanfattning
= 100 × 2 × 50% × $0.002 = **$0.20/månad** 💰

## 🔧 Setup-instruktioner

### Steg 1: Kör SQL-migrationer

I **Supabase Dashboard → SQL Editor**:

```sql
-- 1. Lägg till document_query field
-- Kopiera från: supabase/migrations/003_add_document_query_to_triggers.sql

-- 2. Skapa vector search-funktion
-- Kopiera från: supabase/migrations/004_create_vector_search_function.sql
```

### Steg 2: Ladda upp dokument

1. Gå till **ProductAdminPanel**
2. Välj produkt (M365)
3. Klicka "Upload Document"
4. Välj PDF/Word-fil
5. Systemet processar automatiskt:
   - Text extraction
   - Chunking
   - Embedding creation
   - Sparar i `document_embeddings`

### Steg 3: Skapa RAG-triggers

1. Gå till **CoachingAdminPanel**
2. Klicka "Add Trigger Pattern"
3. Fyll i:
   ```
   Keywords: sla, servicenivå, responstid
   Type: suggestion
   Title: SLA & Servicenivåer
   Priority: high
   Document Query: SLA servicenivå support responstid uptime
   ```
4. Spara

### Steg 4: Testa

```bash
# Starta dev server
npm run dev:full

# I browser:
1. Starta samtal
2. Simulera kund som frågar: "Vilka servicenivåer har ni?"
3. Se RAG-tip i coaching-panel
```

## 💡 Best Practices

### Bra document queries

✅ **Bra:**
```
"SLA servicenivå support responstid uptime garanti"
"pris kostnad licens prismodell"
"avtal villkor bindningstid uppsägning"
```

❌ **Dåligt:**
```
"sla"  # För kort, för generellt
"vad kostar din produkt"  # För specifikt, matchar inte dokument
```

### Dokumentstruktur

**Bra dokumentering:**
```
# SLA & Servicenivåer

Priority 1 (Kritiskt):
- Initial respons: 1 timme
- Lösning: 4 timmar
- Tillgänglighet: 24/7

Priority 2 (Högt):
- Initial respons: 4 timmar
- Lösning: 8 timmar (kontorstid)

Systemtillgänglighet:
- 99.9% uptime-garanti
- Månadsrapport om driftstörningar
```

**Mindre bra:**
```
Enligt avsnitt 4.2 paragraf 3 i bilaga A till standardavtalet...
```

### Trigger-keywords

**Tips:**
- Använd vanliga ord som kunder använder
- Inkludera både formella och informella varianter
- Testa med verkliga kundsamtal

**Exempel:**
```typescript
keywords: [
  'sla', 'servicenivå', 'servicenivåer',  // Formellt
  'responstid', 'svarstid',                // Varianter
  'support', 'hjälp', 'assistans'          // Relaterat
]
```

## 🎁 UI-förbättringar (framtida)

### Expandable full context

```typescript
// I CoachingPanel.tsx (förslag)

<div className="coaching-tip">
  <h3>{tip.title}</h3>

  {/* Sammanfattning (default) */}
  <div className="summary">
    {tip.content}
  </div>

  {/* Expandable full context */}
  {tip.fullContext && (
    <details className="mt-2">
      <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
        📄 Visa fullständig text från dokument
      </summary>
      <div className="mt-2 p-3 bg-gray-800 rounded text-sm">
        {tip.fullContext}
      </div>
    </details>
  )}
</div>
```

### Source attribution

```typescript
// Visa vilket dokument informationen kommer från

<div className="text-xs text-gray-500 mt-1">
  📚 Källa: Avtal_B3IT_Standard.pdf (sida 4-5)
</div>
```

## 🔍 Troubleshooting

### "Ingen dokumentation hittades"

**Möjliga orsaker:**
1. Inga dokument uppladdade för produkten
2. Document query matchar inte dokumentinnehåll
3. Similarity threshold för hög (0.78)

**Lösning:**
```typescript
// I CoachingEngine.ts, justera threshold:
match_threshold: 0.70  // Lägre = mer resultat, men lägre precision
```

### Långsam respons (> 3 sekunder)

**Trolig orsak:** AI-sammanfattning för långa texter

**Lösning:**
```typescript
// Använd snabbare modell:
model: 'gpt-4o-mini'  // Istället för gpt-4

// Eller öka threshold för kort text:
if (wordCount < 200) {  // Från 150 till 200
  return { content: documentContext }
}
```

### Irrelevanta resultat

**Trolig orsak:** Document query för generell

**Lösning:**
- Gör query mer specifik: "SLA responstid Priority 1"
- Öka match_threshold till 0.82
- Förbättra dokumentstruktur med tydliga headers

## 📈 Metrics & Monitoring

### Loggar att kolla

```bash
# Backend logs visar:
[CoachingEngine] RAG trigger activated: "SLA & Servicenivåer" for keyword: "sla"
[CoachingEngine] Found 3 document chunks (287 words) for query: "SLA servicenivå"
[CoachingEngine] RAG tip created with 287 words from documents
```

### Framtida analytics

```typescript
// Spara RAG usage stats
{
  trigger_id: uuid,
  query: "SLA servicenivå",
  chunks_found: 3,
  wordCount: 287,
  was_summarized: true,
  latency_ms: 1654,
  user_dismissed: false  // Tracking om tip var användbar
}
```

## 🚀 Nästa steg

1. ✅ Kör SQL-migrationer i Supabase
2. ✅ Ladda upp dina SLA/avtal/tjänstebeskrivningar
3. ✅ Skapa RAG-triggers i CoachingAdminPanel
4. ✅ Testa i ett samtal
5. ✅ Samla feedback från användare

**Framtida förbättringar:**
- Multi-document citations
- Automatic document updates
- Semantic cache för vanliga frågor
- User feedback loop för query refinement

---

**Implementerat:** 2026-02-02
**Status:** ✅ Production-ready
**Dokumentation:** [gateway/coaching-engine.ts](gateway/coaching-engine.ts#L919-L1073)
