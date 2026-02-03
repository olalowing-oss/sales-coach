# AI-Generering av Coaching-Data från Produktdokument

## Översikt

Systemet kan nu automatiskt generera **alla typer av coaching-data** baserat på uppladdade produktdokument med hjälp av AI (GPT-4o):

1. **Triggers** - Automatisk identifiering av nyckelord och mönster
2. **Battlecards** - Konkurrensanalyser mot relevanta konkurrenter
3. **Invändningar** - Vanliga invändningar med professionella svar
4. **Kundcase** - Realistiska framgångshistorier
5. **Erbjudanden** - Strukturerade säljpaket

## API Endpoints

Alla endpoints följer samma mönster:

### POST /api/generate-triggers
Genererar 5 trigger-mönster baserat på produktdokumentation.

**Request:**
```json
{
  "productId": "uuid-of-product",
  "count": 5
}
```

**Response:**
```json
{
  "success": true,
  "productName": "Produktnamn",
  "triggers": [
    {
      "id": "unique-trigger-id",
      "keywords": ["nyckelord 1", "nyckelord 2"],
      "response": "objection",
      "category": "price"
    }
  ]
}
```

### POST /api/generate-battlecards
Genererar 3 battlecards för de vanligaste konkurrenterna.

**Request:**
```json
{
  "productId": "uuid-of-product",
  "count": 3
}
```

**Response:**
```json
{
  "success": true,
  "productName": "Produktnamn",
  "battlecards": [
    {
      "competitor": "Konkurrentens namn",
      "theirStrengths": ["Styrka 1", "Styrka 2"],
      "theirWeaknesses": ["Svaghet 1", "Svaghet 2"],
      "ourAdvantages": ["Vår fördel 1", "Vår fördel 2"],
      "talkingPoints": ["Argument 1", "Argument 2"],
      "commonObjections": ["Invändning 1", "Invändning 2"]
    }
  ]
}
```

### POST /api/generate-objections
Genererar 5 vanliga invändningar med professionella svar.

**Request:**
```json
{
  "productId": "uuid-of-product",
  "count": 5
}
```

**Response:**
```json
{
  "success": true,
  "productName": "Produktnamn",
  "objections": [
    {
      "objection": "Invändningen som kunden säger",
      "triggers": ["trigger 1", "trigger 2"],
      "category": "price",
      "responses": {
        "short": "Kort svar (1-2 meningar)",
        "detailed": "Detaljerat svar (2-3 paragrafer)",
        "followUpQuestions": ["Fråga 1?", "Fråga 2?"]
      }
    }
  ]
}
```

### POST /api/generate-cases
Genererar 3 kundcase baserat på produktinformation.

**Request:**
```json
{
  "productId": "uuid-of-product",
  "count": 3
}
```

**Response:**
```json
{
  "success": true,
  "productName": "Produktnamn",
  "cases": [
    {
      "customer": "Företagsnamn AB",
      "industry": "Bransch/sektor",
      "challenge": "Beskriv utmaningen...",
      "solution": "Förklara lösningen...",
      "results": ["50% minskning av X", "30% ökning i Y"],
      "quote": "Citat från kunden",
      "isPublic": true
    }
  ]
}
```

### POST /api/generate-offers
Genererar 3-5 erbjudanden baserat på produktdokumentation.

**Request:**
```json
{
  "productId": "uuid-of-product",
  "count": 3
}
```

**Response:**
```json
{
  "success": true,
  "productName": "Produktnamn",
  "offers": [
    {
      "name": "Erbjudandets namn",
      "shortDescription": "Kort beskrivning",
      "fullDescription": "Detaljerad beskrivning...",
      "deliverables": ["Leverabel 1", "Leverabel 2"],
      "duration": "3 månader",
      "priceRange": {
        "min": 50000,
        "max": 100000,
        "unit": "fixed"
      },
      "targetAudience": ["Målgrupp 1", "Målgrupp 2"]
    }
  ]
}
```

## Användning i UI

### Steg-för-steg Guide

1. **Ladda upp produktdokument först**:
   - Gå till RAG Tester eller använd document upload
   - Ladda upp PDF/DOCX med produktinformation
   - Säkerställ att dokumenten är kopplade till rätt `product_id`
   - Vänta tills dokumenten är processade (`processing_status = 'completed'`)

2. **Öppna Coaching Admin**:
   - Klicka på hamburgare-menyn (☰)
   - Välj "Hantera coachning"
   - Välj önskad tab (Triggers, Battlecards, Invändningar, Kundcase, eller Erbjudanden)

3. **Generera coaching-data**:
   - Klicka på **"Generera från produktdokument"** (lila knapp med blixt-ikon)
   - Välj produkt i dropdown
   - Klicka **"Generera"** (triggers/battlecards/invändningar/etc.)
   - Vänta medan AI analyserar (10-30 sekunder)

4. **Granska och spara**:
   - Se genererade förslag
   - Klicka **"Spara"** på individuella items du vill behålla
   - ELLER klicka **"Spara alla"** för att spara samtliga
   - Sparade items kopplas automatiskt till den valda produkten

## AI-prompts och Logik

### Triggers
AI:n identifierar:
- Nyckelord som signalerar specifika kundbehov
- Lämplig kategori (price, timing, competition, need, trust, expansion)
- Korrekt responstyp (objection, battlecard, offer, solution, expand)
- Unika trigger-ID:n i kebab-case format

### Battlecards
AI:n skapar:
- Identifierar relevanta konkurrenter baserat på produktinformation
- Listar konkurrentens styrkor (3-5 punkter)
- Listar konkurrentens svagheter (3-5 punkter)
- Identifierar våra fördelar (3-5 punkter)
- Ger konkreta argumentationspunkter (3-5 punkter)
- Listar vanliga invändningar vid jämförelse (2-4 punkter)

### Invändningar
AI:n genererar:
- Realistiska invändningar kunder ofta framför
- Trigger-ord för att identifiera invändningen (3-5 ord)
- Korrekt kategori (price, timing, competition, trust, need)
- Kort svar (1-2 meningar)
- Detaljerat svar (2-3 paragrafer)
- Uppföljningsfrågor för att fördjupa samtalet (2-3 frågor)

### Kundcase
AI:n skapar:
- Realistiska kunder (kan vara fiktiva men trovärdiga)
- Specifik bransch/sektor
- Konkret utmaning kunden hade
- Tydlig beskrivning av hur produkten löste utmaningen
- Mätbara resultat (siffror, procent, förbättringar) (3-5 punkter)
- Autentiskt citat från "kunden"

### Erbjudanden
AI:n skapar:
- Varierade erbjudanden för olika användarfall
- Konkreta leverabler
- Realistiska priser i SEK
- Professionell ton och struktur
- Tydlig målgrupp

## Tekniska Detaljer

### Dependencies
- **OpenAI GPT-4o**: För AI-generering av alla datatyper
- **Supabase**: För att hämta produkter och dokument
- **React State**: För att hantera modal och genererade förslag

### Filplacering
**API Endpoints:**
- `/api/generate-triggers.ts` - Genererar triggers
- `/api/generate-battlecards.ts` - Genererar battlecards
- `/api/generate-objections.ts` - Genererar invändningar
- `/api/generate-cases.ts` - Genererar kundcase
- `/api/generate-offers.ts` - Genererar erbjudanden

**Server:**
- `/server.mjs` - Lokalt API server som mountar alla endpoints

**UI:**
- `/src/components/CoachingAdminPanel.tsx` - Alla tabs med AI-generering

### Felhantering
- Om produkt saknas: Felmeddelande
- Om inga dokument finns: "No documents found for this product"
- Om AI-generering misslyckas: Försök igen-meddelande
- Om JSON-parsing misslyckas: Loggar raw response för debugging

## AI-prompt Struktur

Alla endpoints följer samma mönster:

1. **Produktkontext**: Produktnamn, beskrivning
2. **Dokumentation**: Max 10 senaste dokument (3000 tecken vardera)
3. **Instruktioner**: Specifika för varje datatyp
4. **JSON-format**: Strukturerad output för enkel parsing

Exempel prompt-struktur:
```
Du är en expert på [område].

PRODUKTINFORMATION:
Produktnamn: [namn]
Beskrivning: [beskrivning]

DOKUMENTATION:
[dokumentinnehåll]

DIN UPPGIFT:
Generera [antal] [datatyp] baserat på produktinformationen ovan.
[Specifika krav för datatypen]

Svara ENDAST med en giltig JSON-array.
```

## Prestanda

| Endpoint | Responstid | Token-användning | Kostnad per generering |
|----------|------------|------------------|----------------------|
| Triggers | ~10-20 sek | ~1500-2500 tokens | ~$0.01-0.02 |
| Battlecards | ~15-25 sek | ~2000-3500 tokens | ~$0.02-0.03 |
| Objections | ~15-30 sek | ~2500-4000 tokens | ~$0.02-0.04 |
| Cases | ~15-25 sek | ~2000-3500 tokens | ~$0.02-0.03 |
| Offers | ~10-30 sek | ~2000-4000 tokens | ~$0.02-0.04 |

*Baserat på GPT-4o pricing (ca $0.01 per 1000 tokens)*

## Säkerhet

- ✅ Använder Supabase Service Role Key (backend only)
- ✅ RLS policies säkerställer att användare bara ser sin egen data
- ✅ Produktkoppling automatisk vid sparande
- ✅ Ingen känslig data exponeras till klienten

## Begränsningar och Förbättringsmöjligheter

### Nuvarande begränsningar
- Maximalt 10 dokument analyseras per generering
- Varje dokument trunkeras till 3000 tecken
- Endast svenska coaching-data genereras
- Kräver att dokument är uppladdade och processade

### Framtida förbättringar
- [ ] Möjlighet att välja antal items att generera (1-10)
- [ ] Redigera genererade items innan sparande
- [ ] Välja specifika dokument att basera på
- [ ] Generera på andra språk
- [ ] Spara genererade förslag som drafts
- [ ] A/B-testning av olika AI-prompts
- [ ] Använd embeddings för mer relevant dokumentsökning
- [ ] Cachea genererade items för snabbare åtkomst
- [ ] Batch-generering för flera produkter samtidigt

## Felsökning

### "No documents found for this product"
**Problem**: Produkten har inga uppladdade dokument
**Lösning**: Ladda upp dokument först via document upload-funktionen

### AI genererar ostrukturerad data
**Problem**: JSON parsing misslyckas
**Lösning**: Kontrollera AI-responsen i console.logs, justera prompt om nödvändigt

### Timeout vid generering
**Problem**: API tar för lång tid
**Lösning**: Reducera antal dokument eller dokumentlängd i API:et

### Items sparas med fel produktkoppling
**Problem**: `productId` inte satt korrekt
**Lösning**: Verifiera att `selectedProductForGeneration` används korrekt

## Exempel på Genererade Data

### Trigger
```typescript
{
  id: "microsoft-teams-integration",
  keywords: ["Teams", "Microsoft Teams", "integration", "integrationer"],
  response: "solution",
  category: "features"
}
```

### Battlecard
```typescript
{
  competitor: "Atea",
  theirStrengths: [
    "Stor etablerad aktör i Norden",
    "Brett produktutbud",
    "Många befintliga kundrelationer"
  ],
  theirWeaknesses: [
    "Mindre flexibla i kundanpassning",
    "Långsammare implementation",
    "Högre priser för småföretag"
  ],
  ourAdvantages: [
    "AI-driven personalisering",
    "Snabbare implementation (2 veckor vs 2 månader)",
    "Dedikerad support inkluderad"
  ],
  talkingPoints: [
    "Vi fokuserar på snabb ROI och konkreta resultat",
    "Vår AI-teknologi anpassar sig automatiskt till era processer",
    "Inkluderad onboarding och träning i priset"
  ],
  commonObjections: [
    "Atea är mer etablerade och trygga",
    "Vi har redan ett befintligt avtal med Atea"
  ]
}
```

### Invändning
```typescript
{
  objection: "Det här är för dyrt för oss just nu",
  triggers: ["för dyrt", "dyrt", "priset", "kostar för mycket"],
  category: "price",
  responses: {
    short: "Jag förstår att priset är viktigt. Låt oss titta på värdet och ROI istället för endast kostnaden.",
    detailed: "Jag förstår absolut att budget är en viktig faktor. Många av våra kunder hade samma tankar initialt, men upptäckte att investeringen betalade sig själv inom 3-6 månader genom ökad produktivitet och minskad administration.\n\nLåt mig ge dig ett konkret exempel: En av våra kunder sparade 15 timmar per vecka i manuellt arbete, vilket motsvarade över 300 000 kr per år. Det är betydligt mer än vår årliga kostnad.\n\nVad skulle 15 extra timmar per vecka vara värt för er organisation?",
    followUpQuestions: [
      "Vad är er nuvarande kostnad för den här typen av uppgifter?",
      "Hur mycket tid lägger teamet på manuellt arbete idag?",
      "Vad skulle ni kunna åstadkomma med mer tid och bättre verktyg?"
    ]
  }
}
```

### Kundcase
```typescript
{
  customer: "Logistik Nordic AB",
  industry: "Transport & Logistik",
  challenge: "Företaget hade svårigheter med att hålla koll på sina säljares prestationer och kunde inte ge riktad coaching i rätt tid. Detta ledde till missade affärsmöjligheter och varierande kvalitet i kundmöten.",
  solution: "Genom att implementera AI Sales Coach Pro fick Logistik Nordic realtidsinsikter i säljsamtal och automatisk identifiering av förbättringsområden. Systemet gav konkreta coachingsförslag direkt efter varje samtal.",
  results: [
    "45% ökning i genomsnittlig deal-storlek inom 6 månader",
    "30% minskning av säljcykel-längd",
    "85% av säljarna uppnådde sina kvartalsmål (jämfört med 60% tidigare)",
    "92% av teamet rapporterade förbättrad självkänsla i säljsamtal"
  ],
  quote: "AI Sales Coach har revolutionerat vårt sätt att utveckla våra säljare. Vi kan nu ge personlig coaching i stor skala, vilket tidigare var omöjligt.",
  isPublic: true
}
```

### Erbjudande
```typescript
{
  name: "Premium Onboarding & Training",
  shortDescription: "Komplett introduktions- och utbildningspaket för nya kunder",
  fullDescription: "Detta erbjudande inkluderar en omfattande onboarding-process med personlig coach, anpassad utbildning för teamet, och 3 månaders uppföljningsstöd. Vi säkerställer att hela organisationen får maximal nytta av produkten från dag ett.",
  deliverables: [
    "Kickoff-möte med stakeholders",
    "3 utbildningstillfällen (á 2 timmar)",
    "Anpassat utbildningsmaterial",
    "Dedikerad kontaktperson i 3 månader",
    "Månatliga uppföljningsmöten"
  ],
  duration: "3 månader",
  priceRange: {
    min: 75000,
    max: 125000,
    unit: "fixed"
  },
  targetAudience: [
    "Medelstora företag (50-200 anställda)",
    "Organisationer som vill maximera ROI",
    "Team som behöver strukturerad utbildning"
  ]
}
```

## Support och Feedback

Vid problem eller frågor:
1. Kontrollera console logs i webbläsaren
2. Verifiera att dokument är uppladdade och processade
3. Testa med en annan produkt
4. Kontakta support med felmeddelande och produktinformation
