# Frågeformulär i Samtalsvyn - Integration

## Översikt

Frågeformuläret har nu integrerats i den **vanliga samtalsvyn** (inte bara i demo-läget). Säljare kan nu fylla i kundfrågor i realtid medan de för riktiga kundsamtal.

## Vad har lagts till

### 1. Ny panel: "Kundfrågor"
En tredje panel har lagts till i samtalsvyn:
- **Transkript** (vänster panel)
- **Coaching** (mitten panel)
- **Kundfrågor** (höger panel) ✨ NY

### 2. Toggle-knapp i Kundsamtal-menyn
I "Samtal"-dropdownen finns nu:
- ✅ Visa transkript (PÅ/AV)
- ✅ Visa coaching (PÅ/AV)
- ✨ **Visa kundfrågor (PÅ/AV)** - NY toggle

### 3. Responsiv layout
- **3 paneler synliga**: 3 kolumner på extra stora skärmar (xl), 2 kolumner på stora skärmar (lg), 1 kolumn på mobiler
- **2 paneler synliga**: 2 kolumner på stora skärmar (lg), 1 kolumn på mobiler
- **1 panel synlig**: 1 kolumn
- **Inga paneler**: Dashboard visas

## Hur man använder

### Starta ett samtal med frågeformuläret

1. **Öppna Samtalsvyn**
   - Klicka på den blå **"Samtal"**-knappen i headern
   - Välj "Samtal" i dropdownen

2. **Aktivera Kundfrågor-panelen**
   - Klicka på **"Samtal"**-knappen igen för att öppna menyn
   - Klicka på **"Visa kundfrågor"**
   - Statusen ändras till "PÅ" (grön text)

3. **Starta samtalet**
   - Klicka på **"Börja spela in"** eller använd mikrofon-knappen
   - Samtalet transkriberas live
   - Coaching-tips dyker upp automatiskt

4. **Fyll i kundfrågor under samtalet**
   - Frågeformuläret visas i högra panelen
   - Expandera kategorier (t.ex. "Nuläge & Utmaningar")
   - När kunden berättar viktig information → skriv in det direkt
   - Exempel: Kunden säger "Vi har 200 000 kr i budget" → öppna kategori "Beslutsprocess" → fyll i "Finns det budget avsatt redan?"

5. **Efter samtalet**
   - Stoppa inspelningen
   - Alla ifyllda svar finns kvar i formuläret
   - Gå igenom och komplettera eventuella luckor

## Frågeformulär-kategorier

25 frågor fördelade på 5 kategorier:

### 1. Nuläge & Utmaningar (4 frågor)
- Vilka är de 3 största utmaningarna kunden har idag? **(obligatorisk)**
- Vad kostar dessa problem kunden idag?
- Hur länge har problemet funnits?
- Vad har de provat tidigare för att lösa det?

### 2. Målbild & Krav (5 frågor)
- Vad är den ideala lösningen enligt kunden? **(obligatorisk)**
- Vilka KPI:er använder de för att mäta framgång?
- Vilka funktioner är absolut nödvändiga? **(obligatorisk)**
- Vilka funktioner är önskvärda men inte kritiska?
- Finns det något som skulle stoppa affären helt?

### 3. Beslutsprocess (5 frågor)
- Vem fattar det slutliga beslutet? **(obligatorisk)**
- Vilka andra behöver godkänna?
- Vilka steg ingår i deras inköpsprocess?
- Finns det budget avsatt redan?
- Vad driver tidslinjen för beslutet?

### 4. Konkurrens & Alternativ (4 frågor)
- Vilka alternativ utvärderar de?
- Vad är viktigast vid val av leverantör?
- Har de arbetat med liknande leverantörer tidigare?
- Vad är deras största farhågor/tveksamheter?

### 5. Tekniska & Praktiska Aspekter (5 frågor)
- Vilka system måste lösningen integreras med?
- Hur många användare kommer att använda systemet?
- Vilka avdelningar kommer att påverkas?
- Finns det specifika compliance- eller säkerhetskrav?
- Hur planerar de att rulla ut lösningen?

## Fördelar

### 1. **Inga glömda detaljer**
Fyll i information direkt när kunden säger det - slipp minnas allt efteråt.

### 2. **Bättre kundsamtal**
Formuläret påminner säljaren om viktiga frågor att ställa under samtalet.

### 3. **Komplett kunddata**
Säkerställer att alla kritiska uppgifter fångas för:
- Bättre kvalificering av leads
- Starkare offerter
- Noggrannare prognoser
- Högre vinstprocent

### 4. **Flexibel layout**
Säljare kan välja vilka paneler de vill se:
- Bara transkript
- Bara coaching
- Bara kundfrågor
- Transkript + coaching (2 kolumner)
- Transkript + kundfrågor (2 kolumner)
- Alla tre (3 kolumner på stora skärmar)

### 5. **Sparad inställning**
Panelvalen sparas i localStorage - om du stänger ner webbläsaren och öppnar igen behåller systemet dina val.

## Teknisk implementation

### Modifierade filer

**`/src/components/SalesCoach.tsx`**
- Importerade `ClipboardList`-ikonen och `PostCallQuestionnaire`-komponenten
- Lade till state:
  - `showQuestionnairePanel` (boolean, från localStorage)
  - `questionnaireAnswers` (Record<string, string>)
- Skapade `handleToggleQuestionnaire()` callback
- Uppdaterade grid-layout för att hantera 1-3 paneler responsivt
- Lade till QuestionnairePanel-sektion med header och scrollbar
- Uppdaterade dashboard-villkor för att inkludera `!showQuestionnairePanel`

**`/src/components/KundsamtalDropdown.tsx`**
- Importerade `ClipboardList`-ikonen
- Uppdaterade interface:
  - Lade till `showQuestionnairePanel: boolean`
  - Lade till `onToggleQuestionnaire: () => void`
- Skapade toggle-knapp för "Visa kundfrågor" med PÅ/AV-indikator
- Teal-färgad ikon (matchar teal-temat för frågeformulär)

### Layout-logik

Grid-klasser baserat på antal synliga paneler:

```typescript
const visiblePanels = [showTranscriptPanel, showCoachingPanel, showQuestionnairePanel]
  .filter(Boolean).length;

// 3 paneler: xl:grid-cols-3 lg:grid-cols-2 (3 kolumner på XL-skärmar, 2 på stora, 1 på små)
// 2 paneler: lg:grid-cols-2 (2 kolumner på stora skärmar, 1 på små)
// 1 panel: grid-cols-1 (alltid 1 kolumn)
```

### Panel-rendering

```tsx
{showQuestionnairePanel && (
  <div className="bg-gray-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
    <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
      <ClipboardList className="w-5 h-5 text-teal-400" />
      <h2 className="font-semibold">Kundfrågor</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-4">
      <PostCallQuestionnaire
        onAnswersChange={setQuestionnaireAnswers}
        initialAnswers={questionnaireAnswers}
      />
    </div>
  </div>
)}
```

### LocalStorage-nycklar

- `showQuestionnairePanel` - Boolean (true/false) för om panelen ska visas
- Läses vid sidladdning, sparas vid toggle

## Användningsfall

### Use Case 1: Discovery-samtal
**Scenario**: Första samtalet med en ny prospekt

1. Starta samtal med alla tre paneler synliga
2. Lyssna på kunden, läs transkriptet
3. Se coaching-tips om vilka frågor att ställa
4. Fyll i svar i frågeformuläret parallellt
5. Fokusera på obligatoriska frågor (röd asterisk *)
6. Efter samtalet: granska och komplettera

**Resultat**: 100% av kritisk information dokumenterad direkt

### Use Case 2: Uppföljningssamtal
**Scenario**: Andra eller tredje mötet med kunden

1. Öppna tidigare sparade svar (future feature)
2. Visa bara kundfrågor-panelen (dölj transkript/coaching)
3. Komplettera frågor som inte besvarades förra gången
4. Fokusera på beslutsprocess och tekniska detaljer

**Resultat**: Progressiv datainsamling över flera möten

### Use Case 3: Snabbt samtal
**Scenario**: 15-minuters check-in call

1. Visa bara transkript + kundfrågor (dölj coaching)
2. Anteckna de 2-3 viktigaste sakerna som kommer upp
3. Markera frågor som fortfarande saknar svar

**Resultat**: Effektiv datainsamling även i korta samtal

## Best Practices

### 1. **Aktivera innan samtalet börjar**
Slå på kundfrågor-panelen INNAN du startar inspelningen så att du ser den från början.

### 2. **Fokusera på obligatoriska frågor**
Frågor markerade med röd asterisk (*) är kritiska. Försök få svar på dessa i första samtalet.

### 3. **Skriv medan kunden pratar**
Skriv korta anteckningar i realtid. Du kan alltid utöka/förbättra formuleringar efter samtalet.

### 4. **Använd transkriptet som stöd**
Om du missar något kunden säger - kolla transkriptet och kopiera informationen till frågeformuläret.

### 5. **Anpassa layout efter behov**
- **Discovery-samtal**: Visa alla tre panelerna
- **Demo/presentation**: Dölj kundfrågor, visa bara transkript + coaching
- **Uppföljning**: Visa bara kundfrågor om du redan vet vad kunden behöver

### 6. **Komplettera efter samtalet**
Använd de sista 5 minuterna efter samtalet för att gå igenom formuläret och fylla i eventuella luckor.

## Framtida förbättringar (Planerat)

### 1. **Automatisk sparning till databas**
- Koppla formulärsvar till call_session_id
- Spara automatiskt vid samtalets slut
- Ladda tidigare svar när du öppnar ett uppföljningssamtal

### 2. **AI-förifyllning från transkript**
- AI analyserar transkriptet efter samtalet
- Föreslår svar på frågor baserat på vad kunden sa
- Säljaren granskar och godkänner AI:s förslag

### 3. **Progress-indikator i headern**
- Visa "8/25 frågor besvarade" i headern under samtalet
- Gamification: Uppmuntra till komplett datainsamling

### 4. **Smarta påminnelser**
- Om samtalet håller på att ta slut och viktiga frågor saknas → varning
- "Du har inte frågat om budget än - vill du göra det innan samtalet slutar?"

### 5. **Kategorivis visibility**
- Visa bara relevanta kategorier baserat på samtalsfas
- Discovery-call: Visa "Nuläge & Utmaningar", "Målbild & Krav"
- Demo: Visa "Tekniska & Praktiska Aspekter"
- Closing: Visa "Beslutsprocess", "Konkurrens & Alternativ"

### 6. **Export till CRM**
- Exportera formulärsvar direkt till Salesforce/HubSpot/Dynamics
- Mappa frågor till CRM-fält automatiskt

## Jämförelse: Demo-läge vs Samtalsvy

### Demo-läge (Demosamtal)
- Frågeformuläret i **sidebar** (höger panel)
- Collapsible sektion bland andra verktyg
- Fokus: Samla data under produktdemonstration
- Användningsfall: Interaktiva demo-scripts

### Samtalsvy (Samtal)
- Frågeformuläret som **egen panel** (jämlik med Transkript/Coaching)
- Toggle i Kundsamtal-dropdown
- Fokus: Samla data under riktiga kundsamtal
- Användningsfall: Discovery, uppföljning, alla typer av kundsamtal

**Båda lägena** använder samma `PostCallQuestionnaire`-komponent med 25 frågor.

## Felsökning

### Frågeformuläret visas inte
- Kontrollera att du klickat på "Visa kundfrågor" i Samtal-menyn
- Statusen ska visa "PÅ" (grön text)
- Om panelen fortfarande inte syns: ladda om sidan (F5)

### Svar sparas inte
- **Nuvarande beteende**: Svar sparas i localStorage-minnet
- Svar försvinner om du:
  - Rensar webbläsarens cache
  - Byter dator
  - Öppnar i inkognitoläge
- **Framtida lösning**: Auto-save till databas (planerat)

### Layouten ser konstig ut
- **3 paneler på liten skärm**: Panelerna staplas vertikalt (1 kolumn)
- **Lösning**: Dölj en panel (t.ex. coaching) för mer utrymme på mindre skärmar

### Kan inte scrolla i frågeformuläret
- Kundfrågor-panelen har en fast höjd på 600px med scrollbar
- Om innehållet inte scrollar: testa att ladda om sidan

## Relaterade funktioner

- **Post-Call Questionnaire** ([PostCallQuestionnaire.tsx](src/components/PostCallQuestionnaire.tsx)) - Själva formuläret med 25 frågor
- **Call Analysis Modal** ([CallAnalysisModal.tsx](src/components/CallAnalysisModal.tsx)) - Post-call analys med frågeformulär
- **Demo Mode Questionnaire** ([DEMO_QUESTIONNAIRE_INTEGRATION.md](DEMO_QUESTIONNAIRE_INTEGRATION.md)) - Samma formulär i demo-läge
- **AI Suggested Questions** ([SuggestedQuestions.tsx](src/components/SuggestedQuestions.tsx)) - AI-genererade uppföljningsfrågor

## Tekniska detaljer

### State Management
```typescript
const [showQuestionnairePanel, setShowQuestionnairePanel] = React.useState(() => {
  const saved = localStorage.getItem('showQuestionnairePanel');
  return saved !== null ? saved === 'true' : false;
});

const [questionnaireAnswers, setQuestionnaireAnswers] = React.useState<Record<string, string>>({});
```

### Toggle-funktion
```typescript
const handleToggleQuestionnaire = useCallback(() => {
  setShowQuestionnairePanel(prev => {
    const newValue = !prev;
    localStorage.setItem('showQuestionnairePanel', String(newValue));
    return newValue;
  });
}, []);
```

### Responsiv Grid
```typescript
const visiblePanelsCount = [
  showTranscriptPanel,
  showCoachingPanel,
  showQuestionnairePanel
].filter(Boolean).length;

const gridClass = visiblePanelsCount === 3
  ? 'grid-cols-1 xl:grid-cols-3 lg:grid-cols-2'
  : visiblePanelsCount === 2
  ? 'grid-cols-1 lg:grid-cols-2'
  : 'grid-cols-1';
```

---

**Senast uppdaterad:** 2026-02-01
**Feature-status:** ✅ Live i Development
**Relaterade docs:**
- [CUSTOMER_ANALYSIS_FEATURES.md](CUSTOMER_ANALYSIS_FEATURES.md) - Översikt av alla kundanalysfunktioner
- [DEMO_QUESTIONNAIRE_INTEGRATION.md](DEMO_QUESTIONNAIRE_INTEGRATION.md) - Frågeformulär i demo-läge
