# AI-Genererade Erbjudanden från Produktdokument

## Översikt

Systemet kan nu automatiskt generera säljerbj udanden baserat på uppladdade produktdokument med hjälp av AI (GPT-4).

## Hur det fungerar

### 1. Backend (API)

**Endpoint**: `/api/generate-offers`

**Flöde**:
1. Tar emot `productId` och antal erbjudanden att generera (`count`, default 3)
2. Hämtar produktinformation från `product_profiles`
3. Hämtar alla uppladdade dokument för produkten från `knowledge_base`
4. Bygger kontext från dokumentens innehåll och sammanfattningar
5. Använder GPT-4 för att analysera produktinformationen och generera erbjudanden
6. Returnerar 3-5 strukturerade erbjudandeförslag

**Request**:
```json
{
  "productId": "uuid-of-product",
  "count": 3
}
```

**Response**:
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

### 2. Frontend (UI)

**Plats**: Coachning Admin Panel → Erbjudanden-tab

**Funktioner**:
- **"Generera från produktdokument"-knapp** (lila med blixt-ikon)
- **Modal-dialog** med två lägen:
  1. **Välj produkt**: Dropdown för att välja vilken produkt att generera för
  2. **Granska förslag**: Visar genererade erbjudanden med möjlighet att:
     - Spara individuella erbjudanden
     - Spara alla erbjudanden samtidigt
     - Generera nya förslag
     - Stäng utan att spara

## Användning

### Steg-för-steg

1. **Ladda upp produktdokument först**:
   - Gå till RAG Tester eller använd document upload
   - Ladda upp PDF/DOCX med produktinformation
   - Säkerställ att dokumenten är kopplade till rätt `product_id`
   - Vänta tills dokumenten är processade (`processing_status = 'completed'`)

2. **Öppna Coaching Admin**:
   - Klicka på hamburgare-menyn (☰)
   - Välj "Hantera coachning"
   - Gå till "Erbjudanden"-tab

3. **Generera erbjudanden**:
   - Klicka "Generera från produktdokument"
   - Välj produkt i dropdown
   - Klicka "Generera erbjudanden"
   - Vänta medan AI analyserar (10-30 sekunder)

4. **Granska och spara**:
   - Se genererade förslag
   - Klicka "Spara" på individuella erbjudanden du vill behålla
   - ELLER klicka "Spara alla" för att spara samtliga
   - Sparade erbjudanden kopplas automatiskt till den valda produkten

## AI-prompt och logik

AI:n får följande instruktioner:

1. **Analysera produktinformation** från:
   - Produktnamn och beskrivning
   - Uppladdade dokument (max 10 senaste)
   - Dokumentsammanfattningar

2. **Generera varierade erbjudanden**:
   - Olika användarfall och målgrupper
   - Konkreta leverabler
   - Realistiska priser i SEK
   - Professionell ton

3. **Strukturera som JSON** för enkel parsing

## Tekniska detaljer

### Dependencies
- **OpenAI GPT-4o**: För AI-generering
- **Supabase**: För att hämta produkter och dokument
- **React State**: För att hantera modal och genererade förslag

### Filplacering
- **API**: `/api/generate-offers.ts`
- **UI**: `/src/components/CoachingAdminPanel.tsx` (OffersTab)
- **Types**: Använder befintliga `Offer`-interface

### Felhantering
- Om produkt saknas: Felmeddelande
- Om inga dokument finns: "No documents found for this product"
- Om AI-generering misslyckas: Försök igen-meddelande
- Om JSON-parsing misslyckas: Loggar raw response för debugging

## Exempel på genererat erbjudande

```json
{
  "name": "Premium Onboarding & Training",
  "shortDescription": "Komplett introduktions- och utbildningspaket för nya kunder",
  "fullDescription": "Detta erbjudande inkluderar en omfattande onboarding-process med personlig coach, anpassad utbildning för teamet, och 3 månaders uppföljningsstöd. Vi säkerställer att hela organisationen får maximal nytta av produkten från dag ett.",
  "deliverables": [
    "Kickoff-möte med stakeholders",
    "3 utbildningstillfällen (á 2 timmar)",
    "Anpassat utbildningsmaterial",
    "Dedikerad kontaktperson i 3 månader",
    "Månatliga uppföljningsmöten"
  ],
  "duration": "3 månader",
  "priceRange": {
    "min": 75000,
    "max": 125000,
    "unit": "fixed"
  },
  "targetAudience": [
    "Medelstora företag (50-200 anställda)",
    "Organisationer som vill maximera ROI",
    "Team som behöver strukturerad utbildning"
  ]
}
```

## Begränsningar och förbättringsmöjligheter

### Nuvarande begränsningar
- Maximalt 10 dokument analyseras
- Varje dokument trunkeras till 3000 tecken
- Endast svenska erbjudanden genereras
- Kräver att dokument är uppladdade och processade

### Framtida förbättringar
- [ ] Möjlighet att välja antal erbjudanden att generera (1-10)
- [ ] Redigera genererade erbjudanden innan sparande
- [ ] Välja specifika dokument att basera på
- [ ] Generera erbjudanden på andra språk
- [ ] Spara genererade förslag som drafts
- [ ] A/B-testning av olika AI-prompts
- [ ] Använd embeddings för mer relevant dokumentsökning
- [ ] Cachea genererade erbjudanden för snabbare åtkomst

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

### Erbjudanden sparas med fel produktkoppling
**Problem**: `productId` inte satt korrekt
**Lösning**: Verifiera att `selectedProductForGeneration` används i `offersWithProductId`

## Säkerhet

- ✅ Använder Supabase Service Role Key (backend only)
- ✅ RLS policies säkerställer att användare bara ser sin egen data
- ✅ Produktkoppling automatisk vid sparande
- ✅ Ingen känslig data exponeras till klienten

## Prestanda

- **API-anrop**: ~10-30 sekunder beroende på antal dokument
- **Token-användning**: ~2000-4000 tokens per generering (GPT-4)
- **Kostnad**: ~$0.02-0.04 per generering
