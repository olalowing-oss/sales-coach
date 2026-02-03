# Produktadministration - Guide

## Översikt

Den nya **Produktadministrationen** samlar all coaching-data på ett smart sätt där du väljer produkt först och sedan ser/hanterar allt kopplat till just den produkten.

## Fördelar med Produktcentrerad Vy

### Tidigare Problem
- Måste välja produkt i varje tab (Triggers, Battlecards, Invändningar, etc.)
- Mycket klickande mellan tabs
- Svårt att få överblick över en produkts totala innehåll
- Krävde många steg för att generera innehåll för en produkt

### Nya Lösningen
✅ **Välj produkt en gång** - All data filtreras automatiskt
✅ **Dashboard med statistik** - Se direkt hur mycket innehåll varje produkt har
✅ **Generera allt på en gång** - En knapp för att skapa all coaching-data
✅ **Expanderbara sektioner** - Kompakt vy med möjlighet att utforska detaljer
✅ **Produktöversikt** - Välj mellan dina produkter visuellt

## Hur Man Använder

### 1. Öppna Produktadministration

1. Klicka på hamburgare-menyn (☰)
2. Välj **"Hantera coachning"**
3. Du kommer nu till den nya produktcentrerade vyn

### 2. Välj Produkt

I toppen ser du alla dina aktiva produkter som kort:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 📦 Produkt 1    │  │   Produkt 2     │  │   Produkt 3     │
│ Beskrivning...  │  │ Beskrivning...  │  │ Beskrivning...  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
     (vald)
```

- Klicka på ett produktkort för att välja det
- Valt kort visas med blå ram
- All data nedan filtreras automatiskt för vald produkt

### 3. Se Statistik-Dashboard

Efter att ha valt produkt ser du en översikt:

```
┌─────────────────────────────────────────────────────────────┐
│ Översikt - AI Sales Coach Pro        [Generera allt AI...]│
├─────────────────────────────────────────────────────────────┤
│  ⚡ Triggers    ⚔️  Battlecards   ⚠️  Invändningar          │
│     5              3                5                      │
│                                                             │
│  📖 Kundcase    💾 Erbjudanden                             │
│     3              3                                        │
└─────────────────────────────────────────────────────────────┘
```

### 4. Generera Allt AI-Innehåll (Rekommenderat)

**Den smartaste funktionen!**

1. Klicka på **"Generera allt AI-innehåll"** (lila knapp med blixt-ikon)
2. Systemet genererar automatiskt:
   - 5 Triggers
   - 3 Battlecards
   - 5 Invändningar
   - 3 Kundcase
   - 3 Erbjudanden
3. Progress visas: "Genererar Triggers..." → "Genererar Battlecards..." etc.
4. När klart får du en bekräftelse: "✅ Alla 5 typer av coaching-data har genererats!"

**Fördelar:**
- Sparar tid - en knapp istället för 5 separata genereringar
- Konsekvent innehåll - allt baserat på samma produktdokumentation
- Komplett paket - direkt användbart i säljsamtal

### 5. Utforska Genererat Innehåll

Varje typ av coaching-data visas som en expanderbar sektion:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Triggers (5)                                          ▶  │
├─────────────────────────────────────────────────────────────┤
│ (klicka för att expandera och se detaljer)                  │
└─────────────────────────────────────────────────────────────┘
```

**När expanderad:**
- Se alla items för den typen
- Varje item visar titel, beskrivning och badges
- Redigera-knapp (✏️) och radera-knapp (🗑️) på varje item

### 6. Hantera Individuella Items

Varje coaching-data item har:
- **Titel** - Huvudnamn/text
- **Beskrivning** - Sammanfattning eller detaljer
- **Badges** - Kategorier, typer, etc.
- **Redigera** - Klicka ✏️ för att ändra
- **Radera** - Klicka 🗑️ för att ta bort

## Användningsscenarier

### Scenario 1: Ny Produkt

**Situation:** Du har precis skapat en ny produkt och laddat upp dokumentation.

**Steg:**
1. Öppna Produktadministration
2. Välj din nya produkt
3. Klicka "Generera allt AI-innehåll"
4. Vänta 1-2 minuter
5. ✅ Produkten har nu komplett coaching-data!

**Resultat:** 19 st coaching-items (5+3+5+3+3) genererade och redo att användas.

---

### Scenario 2: Uppdatera Befintlig Produkt

**Situation:** Du har uppdaterat produktdokumentation och vill komplettera coaching-data.

**Steg:**
1. Välj produkten
2. Se vilka typer som behöver mer innehåll (statistik-dashboard)
3. Gå till den gamla CoachingAdminPanel för att generera specifika typer
4. ELLER generera allt på nytt och radera gamla items

---

### Scenario 3: Jämföra Produkter

**Situation:** Du vill se skillnader i coaching-data mellan produkter.

**Steg:**
1. Välj Produkt 1
2. Notera statistik (5 triggers, 3 battlecards, etc.)
3. Välj Produkt 2
4. Jämför statistik
5. Identifiera vilken produkt behöver mer innehåll

---

### Scenario 4: Snabb Översikt

**Situation:** Du vill snabbt kolla hur mycket innehåll varje produkt har.

**Steg:**
1. Öppna Produktadministration
2. Klicka igenom produktkorten
3. Statistik-dashboarden uppdateras direkt
4. Få direkt överblick utan att expandera sektioner

## Tekniska Detaljer

### Komponenter

**Fil:** `/src/components/ProductAdminPanel.tsx`

**Huvudkomponenter:**
- `ProductAdminPanel` - Huvudkomponent med produktval och dashboard
- `CoachingSection` - Återanvändbar sektion för varje typ av data

**State Management:**
- Använder `useCoachingStore` från Zustand
- Filtrerar data baserat på `selectedProduct.id`
- Hämtar produkter direkt från Supabase

### API Calls för "Generera Allt"

När du klickar "Generera allt AI-innehåll" körs följande sekvens:

```typescript
1. POST /api/generate-triggers    (5 st)
2. POST /api/generate-battlecards (3 st)
3. POST /api/generate-objections  (5 st)
4. POST /api/generate-cases       (3 st)
5. POST /api/generate-offers      (3 st)
```

**Total tid:** ~1-2 minuter
**Total kostnad:** ~$0.10-0.15 per körning

### Datafiltrering

Varje typ av coaching-data filtreras med:

```typescript
const productTriggers = triggerPatterns.filter(
  trigger => trigger.productId === selectedProduct.id
);
```

Detta säkerställer att du bara ser data för den valda produkten.

## Jämförelse: Gammal vs Ny Vy

| Funktion | Gammal Vy (CoachingAdminPanel) | Ny Vy (ProductAdminPanel) |
|----------|--------------------------------|---------------------------|
| Produktval | En gång per tab (5 gånger) | En gång totalt |
| Översikt | Ingen | Dashboard med statistik |
| Generera allt | 5 separata klick | 1 klick |
| Navigation | Tabs mellan typer | Expanderbara sektioner |
| Fokus | Typ-centrerad | Produkt-centrerad |
| Tid att generera | ~5 minuter (manuellt) | ~2 minuter (automatiskt) |

## Framtida Förbättringar

Planerade förbättringar för Produktadministration:

- [ ] **Bulk-export** - Exportera all coaching-data för en produkt som JSON/CSV
- [ ] **Kopiera mellan produkter** - Duplicera coaching-data från en produkt till en annan
- [ ] **Templates** - Skapa mallar för vanliga produkttyper
- [ ] **Versionshantering** - Se historik över ändringar i coaching-data
- [ ] **Delning** - Dela coaching-data mellan teammedlemmar
- [ ] **Analytics** - Se vilken coaching-data som används mest i samtal
- [ ] **AI-förbättringar** - "Förbättra befintlig data" knapp som använder AI för att uppdatera
- [ ] **Produktjämförelse** - Side-by-side vy av flera produkter

## Felsökning

### Ingen data visas efter generering

**Problem:** Klickade "Generera allt" men ser ingen data.

**Lösning:**
1. Kontrollera att produkten har uppladdade dokument
2. Öppna browser console (F12) och kolla efter felmeddelanden
3. Verifiera att generering slutfördes (Success-meddelande)
4. Stäng och öppna Produktadministration igen

---

### Fel: "No documents found for this product"

**Problem:** Produkten har inga dokument att generera från.

**Lösning:**
1. Gå till RAG Tester eller Knowledge Base Manager
2. Ladda upp dokument för produkten
3. Vänta tills dokumenten är processade (status: 'completed')
4. Försök generera igen

---

### Data visas för fel produkt

**Problem:** Ser coaching-data som inte hör till vald produkt.

**Lösning:**
1. Kontrollera att `productId` är satt korrekt i coaching-data
2. Kör SQL i Supabase: `SELECT * FROM triggers WHERE product_id IS NULL;`
3. Data med `product_id = NULL` är global och visas inte i produktvyn
4. Uppdatera data med korrekt `product_id`

---

### "Generera allt" stannar på en typ

**Problem:** Genereringen fastnar på t.ex. "Genererar Battlecards..."

**Lösning:**
1. Vänta 60 sekunder (AI kan ta tid)
2. Om timeout: Öppna console och se felmeddelande
3. Troliga orsaker:
   - För stora dokument (>3000 tecken trunkeras)
   - OpenAI API-fel (kontrollera API-nyckel)
   - Nätverksproblem
4. Försök igen eller generera typen manuellt i gamla vyn

## Best Practices

### 1. Förbered Dokumentation Först
Innan du genererar coaching-data:
- ✅ Ladda upp kvalitativa produktdokument
- ✅ Inkludera både teknisk info och affärsnytta
- ✅ Lägg till konkurrentjämförelser om möjligt
- ✅ Vänta tills alla dokument är processade

### 2. Granska Genererat Innehåll
Efter generering:
- ✅ Expandera varje sektion
- ✅ Läs igenom några exempel
- ✅ Redigera om något är felaktigt
- ✅ Radera irrelevant innehåll

### 3. Iterera och Förbättra
Kontinuerligt arbete:
- 🔄 Uppdatera dokumentation när produkten utvecklas
- 🔄 Regenerera coaching-data vid stora ändringar
- 🔄 Samla feedback från säljare om kvalitet
- 🔄 Komplettera med manuellt innehåll där AI inte räcker

### 4. Organisera per Produkt
Struktur:
- 📦 En produkt = Ett tydligt värdeerbjudande
- 📦 Separata produkter för olika marknader/segment
- 📦 Håll produkter uppdaterade och aktiva
- 📦 Arkivera gamla produkter istället för att radera

## Kontakt & Support

Vid frågor eller problem:
- Öppna GitHub Issue: [b3-sales-coach/issues]
- Email: support@example.com
- Dokumentation: `/AI-GENERERING-COACHING-DATA.md`
