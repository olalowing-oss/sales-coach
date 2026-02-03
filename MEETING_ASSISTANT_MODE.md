# Meeting Assistant Mode - Design Specification

## Översikt

Ett textbaserat mötesassistent-läge optimerat för diskreta fysiska/video-möten där säljaren dokumenterar samtalet och får realtids-stöd utan röstinspelning.

---

## 🎯 Användningsscenarier

### Scenario 1: Fysiskt möte
**Kontext:** Säljare sitter med laptop i kundmöte hos Volvo AB

**Behov:**
- Diskret dokumentation av vad kunden säger
- Förslag på nästa fråga utan att det syns
- Snabb access till svar på kundens frågor
- Strukturerad discovery (BANT-checklist)

**Flow:**
1. Startar Meeting Assistant innan möte
2. Under möte: snabba anteckningar när kunden pratar
3. AI föreslår nästa fråga baserat på context
4. Kunden ställer fråga → sök battlecard → svara
5. Efter möte: AI-genererad sammanfattning

### Scenario 2: Videosamtal
**Kontext:** Säljare har Teams/Zoom på en skärm, Sales Coach på andra skärmen

**Behov:**
- Samma som fysiskt möte
- Möjlighet att copy-paste från chat
- Export för att dela med team

---

## 🎨 UI-komponenter

### Layout: Split-screen

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Meeting Assistant - [Company] ([Product])           │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                   │
│  LEFT PANEL              │  RIGHT PANEL                      │
│  Meeting Notes           │  AI Suggestions & Coaching        │
│                          │                                   │
│  - Quick input field     │  - Suggested Questions (top 3)    │
│  - Timeline of notes     │  - Coaching Tips (triggers)       │
│  - Discovery checklist   │  - Quick Access (search)          │
│  - Meeting summary       │  - Recent battlecards             │
│                          │                                   │
└──────────────────────────┴──────────────────────────────────┘
```

### Komponenter i detalj

#### 1. Quick Input Field med Quick Tags

```tsx
<div className="quick-input">
  {/* Quick Tag Buttons - Vanliga kundfrågor */}
  <div className="quick-tags">
    <div className="tag-label">Kunden frågar om:</div>
    <div className="tag-buttons">
      <button className="tag-btn" onClick={() => handleQuickTag('price')}>
        💰 Pris
      </button>
      <button className="tag-btn" onClick={() => handleQuickTag('integration')}>
        🔌 Integration
      </button>
      <button className="tag-btn" onClick={() => handleQuickTag('timeline')}>
        ⏰ Tidsplan
      </button>
      <button className="tag-btn" onClick={() => handleQuickTag('features')}>
        ⚙️ Funktioner
      </button>
      <button className="tag-btn" onClick={() => handleQuickTag('support')}>
        🆘 Support/SLA
      </button>
      <button className="tag-btn" onClick={() => handleQuickTag('security')}>
        🔒 Säkerhet
      </button>
      <button className="tag-btn" onClick={() => handleQuickTag('references')}>
        👥 Referenser
      </button>
      <button className="tag-btn" onClick={() => handleQuickTag('contract')}>
        📄 Avtal
      </button>
    </div>
  </div>

  {/* Separator */}
  <div className="input-separator">
    <span>eller skriv egen anteckning:</span>
  </div>

  {/* Free-text Input */}
  <textarea
    placeholder="Kunden säger..."
    onKeyDown={(e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        addNote();
      }
    }}
  />
  <div className="input-actions">
    <button>💬 Kund</button>
    <button>🎯 Du</button>
    <button>📝 Notering</button>
  </div>
  <small>Ctrl+Enter för att lägga till, eller klicka tag-knapp ovan</small>
</div>
```

**Funktion:**

**Quick Tags (Fördefinierade knappar):**
- **1-klick registrering** av vanliga kundfrågor
- Klicka "💰 Pris" → Loggar "Kund frågar om pris" + triggar pris-battlecard automatiskt
- Klicka "🔌 Integration" → Loggar + visar integration-battlecard
- **Auto-trigger:** Rätt battlecard/svar dyker upp direkt i höger panel
- **Analytics:** Spårar vilka frågor som är vanligast

**Free-text Input:**
- För unika frågor eller detaljer
- Categorize note: Kund-citat, Din fråga, eller Observation
- Keyboard shortcuts för snabbhet

**Kombo-användning:**
```
1. Kunden frågar: "Hur fungerar er Salesforce-integration?"
2. Du klickar: "🔌 Integration"
3. AI loggar: "Kund frågar om integration (Salesforce)"
4. Battlecard för Salesforce dyker upp i Quick Access
5. Du kompletterar med: "Specifikt Salesforce" i text field
6. Resultat: Strukturerad data + full kontext
```

#### 2. Meeting Timeline
```tsx
<div className="meeting-timeline">
  <div className="note-item speaker-customer">
    <div className="note-header">
      <span className="time">14:32</span>
      <span className="speaker">💬 Kund</span>
      <button className="edit">✏️</button>
    </div>
    <div className="note-content">
      "Vi har problem med manuella Excel-processer
       för sales tracking"
    </div>
    <div className="note-tags">
      <span className="tag">Pain Point: Manuella processer</span>
    </div>
  </div>

  <div className="note-item speaker-seller">
    <span className="time">14:33</span>
    <span className="speaker">🎯 Du</span>
    <div className="note-content">
      "Hur många säljare påverkas av detta?"
    </div>
  </div>
</div>
```

**Funktion:**
- Kronologisk logg av alla anteckningar
- Visuell separation mellan talare
- AI auto-tagging (pain points, budget mentions, etc.)
- Editerbar efter att ha lagts till

#### 3. Discovery Checklist
```tsx
<div className="discovery-checklist">
  <h3>✓ Discovery Status (BANT)</h3>

  <div className="checklist-item completed">
    ✅ <strong>Budget:</strong> ~500k identifierat
  </div>

  <div className="checklist-item completed">
    ✅ <strong>Authority:</strong> CTO nämndes som beslutsfattare
  </div>

  <div className="checklist-item completed">
    ✅ <strong>Need:</strong> Excel-problem (pain point)
  </div>

  <div className="checklist-item pending">
    ⏳ <strong>Timeline:</strong> Ej fastställd
    <button className="suggest-question">
      Föreslå fråga →
    </button>
  </div>
</div>
```

**Funktion:**
- Auto-uppdateras när relevant info nämns
- Klickbar för att få förslag på frågor
- Visuell progress (X/4 completed)

#### 4. Suggested Questions Panel
```tsx
<div className="suggested-questions">
  <h3>🎯 Suggested Questions</h3>
  <p className="context">Baserat på: "Manuella processer" nämndes</p>

  <div className="question-card">
    <div className="question-text">
      "Hur mycket tid går åt till dessa manuella processer
       per säljare och vecka?"
    </div>
    <div className="question-rationale">
      📊 Kvantifiera pain point för ROI-diskussion
    </div>
    <button className="use-question">Använd fråga →</button>
  </div>

  <div className="question-card">
    <div className="question-text">
      "Har ni räknat på vad denna tid kostar er årligen?"
    </div>
    <div className="question-rationale">
      💰 Koppla till budget-diskussion
    </div>
    <button className="use-question">Använd fråga →</button>
  </div>
</div>
```

**Funktion:**
- AI genererar 2-3 relevanta frågor baserat på senaste anteckningen
- Rationale (varför denna fråga är relevant)
- "Använd fråga" → läggs till i timeline som "Du"
- Uppdateras kontinuerligt baserat på kontext

#### 5. Quick Access Search
```tsx
<div className="quick-access">
  <h3>📚 Quick Access</h3>

  <input
    type="text"
    placeholder="Sök battlecards, objections, cases..."
    onChange={handleQuickSearch}
  />

  <div className="quick-results">
    <div className="result-item battlecard">
      <strong>Salesforce Integration</strong>
      <p>Ja, native integration via REST API. Setup tar 2-3 dagar...</p>
      <button>Visa full battlecard</button>
    </div>

    <div className="result-item objection">
      <strong>Pris-invändning</strong>
      <p>"Jämfört med manuell tid: 25 säljare × 2h/dag × 250 dagar...</p>
      <button>Visa hantering</button>
    </div>
  </div>
</div>
```

**Funktion:**
- Snabbsökning i battlecards, objections, cases, offers
- Fuzzy search (matching på keywords)
- Expandable för full info
- Copy-to-clipboard för snabb användning

#### 6. Live Meeting Summary
```tsx
<div className="meeting-summary">
  <h3>📊 Meeting Summary (live)</h3>

  <div className="summary-stat">
    <span className="label">Längd:</span>
    <span className="value">18 min</span>
  </div>

  <div className="summary-stat">
    <span className="label">Intressenivå:</span>
    <span className="value">🟢 Hög (85%)</span>
  </div>

  <div className="summary-topics">
    <span className="label">Topics:</span>
    <div className="tags">
      <span className="tag">Sales automation</span>
      <span className="tag">Excel replacement</span>
      <span className="tag">M365 integration</span>
    </div>
  </div>

  <div className="summary-pain-points">
    <span className="label">Pain Points:</span>
    <ul>
      <li>Manuella Excel-processer (2h/dag per säljare)</li>
      <li>Ingen central visibility för ledning</li>
    </ul>
  </div>

  <button className="generate-next-steps">
    Generera next steps →
  </button>
</div>
```

**Funktion:**
- Uppdateras i realtid under mötet
- AI-genererad sentiment/interest level
- Auto-extracted topics och pain points
- Generate next steps vid mötets slut

---

## 🏷️ Quick Tag System - Snabb kundfråge-loggning

### Koncept

När kunden ställer en fråga kan du **logga den med 1 klick** istället för att skriva. Systemet:
1. Registrerar frågan strukturerat
2. Triggar automatiskt rätt battlecard/svar
3. Föreslår följdfrågor
4. Bygger upp analytics om vanliga frågor

### Visual Design

```
┌──────────────────────────────────────────────────────────────┐
│ 🏷️ Kunden frågar om:                                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  [💰 Pris]  [🔌 Integration]  [⏰ Tidsplan]  [⚙️ Funktioner] │
│                                                               │
│  [🆘 Support/SLA]  [🔒 Säkerhet]  [👥 Referenser]  [📄 Avtal]│
│                                                               │
│  [+ Custom tag...]                                           │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│ eller skriv egen anteckning:                                 │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ Kunden säger...                                        │   │
│ └────────────────────────────────────────────────────────┘   │
│ [💬 Kund] [🎯 Du] [📝 Notering]   Ctrl+Enter för att lägga till│
└──────────────────────────────────────────────────────────────┘
```

### Tag Categories & Auto-Responses

#### 💰 Pris
**När klickad:**
```typescript
{
  tag: 'price',
  noteText: 'Kund frågar om pris',
  autoTrigger: [
    'Show price battlecard',
    'Show relevant offer',
    'Suggest ROI-question'
  ],
  suggestedFollowUp: [
    'Vad är er budget för detta?',
    'Vill ni ha en ROI-kalkyl baserat på er situation?'
  ]
}
```

**Quick Access visar:**
- Prislista för produkten
- ROI-kalkylator
- Prisinvändnings-hantering
- Relevanta erbjudanden

#### 🔌 Integration
**När klickad:**
```typescript
{
  tag: 'integration',
  noteText: 'Kund frågar om integration',
  autoTrigger: [
    'Show integration battlecards',
    'Ask which system'
  ],
  modalPrompt: 'Vilket system? (Salesforce, Dynamics, HubSpot...)',
  suggestedFollowUp: [
    'Vilka system använder ni idag?',
    'Hur kritisk är integration för er?'
  ]
}
```

**Quick Access visar:**
- Integration-battlecards (top 5: Salesforce, Dynamics, etc.)
- API-dokumentation
- Customer cases med liknande integration

**Smart enhancement:**
Om user skriver "Salesforce" efter att ha klickat tag:
→ Automatiskt visa Salesforce-specifik battlecard

#### ⏰ Tidsplan
**När klickad:**
```typescript
{
  tag: 'timeline',
  noteText: 'Kund frågar om tidsplan/implementation',
  autoTrigger: [
    'Show implementation timeline',
    'Update Discovery: Timeline mentioned'
  ],
  suggestedFollowUp: [
    'När behöver ni ha lösningen live?',
    'Finns det en deadline ni måste hålla?'
  ]
}
```

**Quick Access visar:**
- Standard implementation timeline
- Onboarding-process
- Customer cases: "från uppstart till go-live"

#### ⚙️ Funktioner
**När klickad:**
```typescript
{
  tag: 'features',
  noteText: 'Kund frågar om funktioner',
  modalPrompt: 'Vilken funktion? (eller skriv i text field)',
  autoTrigger: [
    'Show product features overview',
    'Show demo script'
  ],
  suggestedFollowUp: [
    'Vilken funktion är viktigast för er?',
    'Vill ni se en demo av specifika features?'
  ]
}
```

**Quick Access visar:**
- Feature-lista med beskrivningar
- Demo scripts
- Feature comparison (vs competitors)

#### 🆘 Support/SLA
**När klickad:**
```typescript
{
  tag: 'support',
  noteText: 'Kund frågar om support/SLA',
  autoTrigger: [
    'RAG search: SLA documents',
    'Show support battlecard'
  ],
  suggestedFollowUp: [
    'Vilken supportnivå behöver ni? (standard/premium)',
    'Hur kritisk är 24/7 support för er verksamhet?'
  ]
}
```

**Quick Access visar:**
- SLA-nivåer (från dokument via RAG)
- Support-paket & pricing
- Responstider & garantier

#### 🔒 Säkerhet
**När klickad:**
```typescript
{
  tag: 'security',
  noteText: 'Kund frågar om säkerhet',
  autoTrigger: [
    'Show security battlecard',
    'Show certifications (ISO, GDPR, etc.)'
  ],
  suggestedFollowUp: [
    'Vilka säkerhetskrav har ni?',
    'Behöver ni specifika certifieringar?'
  ]
}
```

**Quick Access visar:**
- Security overview
- Certifieringar (ISO 27001, SOC 2, GDPR)
- Data residency options
- Penetration test results

#### 👥 Referenser
**När klickad:**
```typescript
{
  tag: 'references',
  noteText: 'Kund frågar om referenser/case studies',
  autoTrigger: [
    'Show case studies',
    'Filter by industry if known'
  ],
  suggestedFollowUp: [
    'Vill ni prata med en kund i er bransch?',
    'Vilken typ av use case är mest relevant för er?'
  ]
}
```

**Quick Access visar:**
- Case studies (filtrerat på product & industry)
- Customer testimonials
- ROI-results från kunder

#### 📄 Avtal
**När klickad:**
```typescript
{
  tag: 'contract',
  noteText: 'Kund frågar om avtal/villkor',
  autoTrigger: [
    'Show contract templates',
    'Show standard terms'
  ],
  suggestedFollowUp: [
    'Finns det specifika avtalsvillkor ni behöver?',
    'Hur lång avtalstid föredrar ni?'
  ]
}
```

**Quick Access visar:**
- Standard contract terms
- SLA agreements
- Uppsägningstid & villkor

### Custom Tags

User kan lägga till egna tags för produktspecifika frågor:

```tsx
<button className="add-custom-tag" onClick={openCustomTagModal}>
  + Custom tag...
</button>

// Modal:
┌────────────────────────────────────┐
│ Skapa Custom Tag                   │
├────────────────────────────────────┤
│ Tag namn: [_________________]      │
│ Icon: [🔍] ← välj emoji            │
│                                    │
│ Auto-trigger:                      │
│ ☑ Visa battlecard: [välj...]      │
│ ☑ RAG-sök dokument: [query...]    │
│ ☑ Föreslå fråga: [text...]        │
│                                    │
│ [Spara]  [Avbryt]                  │
└────────────────────────────────────┘
```

**Exempel custom tags:**
- 🏭 Manufacturing-specifik fråga
- 🚚 Logistik-integration
- 📊 Rapportering & Analytics
- 🌍 Multi-country deployment

### Tag Analytics Dashboard

Efter möten - visa statistik:

```
┌─────────────────────────────────────────────────────┐
│ 📊 Vanligaste kundfrågor (senaste 30 dagarna)       │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 1. 💰 Pris                    47 gånger (38%)       │
│ 2. 🔌 Integration             32 gånger (26%)       │
│ 3. ⏰ Tidsplan                21 gånger (17%)       │
│ 4. 🆘 Support/SLA             15 gånger (12%)       │
│ 5. 👥 Referenser               9 gånger (7%)        │
│                                                      │
│ 💡 Insight: "Integration" frågas oftare i          │
│    Discovery-möten (45%) vs Demos (12%)             │
│                                                      │
│ 🎯 Rekommendation: Förbered integration-info       │
│    redan i första samtalet                          │
└─────────────────────────────────────────────────────┘
```

### Multi-Tag Selection

Om kunden ställer komplex fråga, klicka flera tags:

```
Kund: "Vad kostar det och hur lång är implementeringen?"

User klickar:
  [💰 Pris] + [⏰ Tidsplan]

System loggar:
  "Kund frågar om pris OCH tidsplan"

Quick Access visar:
  - Pricing + implementation timeline tillsammans
  - Combined battlecard: "Cost & timeline overview"
```

### Tag + Text Combo

Vanligaste användning - klicka tag + lägg till detalj:

```
User flow:
1. Kund: "Hur fungerar er Salesforce-integration?"
2. User klickar: [🔌 Integration]
3. User skriver: "Salesforce" i text field
4. Ctrl+Enter

Resultat i timeline:
  14:35 💬 Kund: "Integration (Salesforce)"
  Tags: Integration, Salesforce

Quick Access:
  → Salesforce-specific battlecard visas direkt
  → Related: "Salesforce API setup guide"
```

### Smart Tag Suggestions

AI föreslår tags baserat på kontext:

```tsx
// Om user börjar skriva i text field:
"Hur mycket kostar..."

// System visar suggestion:
<div className="tag-suggestion">
  💡 Förslag: <button>[💰 Pris]</button>
</div>

// User kan klicka suggestion istället för att skriva klart
```

---

## 🔄 Användarflöden

### Flow 1: Starta Meeting Assistant

```
User Action: Klickar "Starta möte"
↓
Modal: Välj mode
  ○ Live Call
  ○ Training
  ● Meeting Assistant ← väljer denna
↓
Input: Företag, kontaktperson (optional)
Select: Produkt (M365)
↓
[Starta Meeting Assistant]
↓
Meeting Assistant UI öppnas
  - Left panel: Redo för anteckningar
  - Right panel: Inledande frågor föreslagna
    (ex: "Berätta om er nuvarande process för...")
```

### Flow 2: Dokumentera under möte

```
User: Lyssnar på kund
↓
Kund säger: "Vi har 25 säljare som spenderar 2h/dag i Excel"
↓
User: Skriver i Quick Input: "25 säljare, 2h/dag Excel-arbete"
Väljer: 💬 Kund
Ctrl+Enter
↓
AI Processing:
  - Detekterar: Pain Point (manuella processer)
  - Detekterar: Quantified (25 säljare, 2h/dag)
  - Uppdaterar: Discovery checklist (Need ✅)
  - Beräknar: Cost (25 × 2h × 250 days = 12,500h/år)
↓
Timeline uppdateras:
  14:35 💬 Kund: "25 säljare, 2h/dag Excel-arbete"
  Tags: Pain Point, Quantified
↓
Suggested Questions uppdateras:
  1. "Vad kostar er en säljares tid per timme?"
     (→ kan räkna total kostnad)
  2. "Vad händer när någon glömmer uppdatera Excel?"
     (→ ytterligare pain point)
  3. "Har ni testat automatisera detta tidigare?"
     (→ tidigare lösningar, competitors)
```

### Flow 3: Använda Suggested Question

```
User: Ser suggested question som är relevant
↓
Clicks: [Använd fråga] på
  "Vad kostar er en säljares tid per timme?"
↓
Timeline uppdateras:
  14:36 🎯 Du: "Vad kostar er en säljares tid per timme?"
↓
User: Ställer frågan till kund i verkligheten
Kund: Svarar "Cirka 600 kr/h"
↓
User: Skriver i Quick Input: "600 kr/h"
Väljer: 💬 Kund
↓
AI Processing:
  - Detekterar: Budget-relaterad info
  - Beräknar: Total cost = 12,500h × 600kr = 7.5M kr/år
  - Genererar coaching tip:
    "💡 ROI-argument: Vårt pris (500k) är 6.7% av deras nuvarande kostnad"
↓
Coaching Tips panel uppdateras med ROI-argument
```

### Flow 4: Kund ställer fråga (Quick Tag Method)

```
Kund: "Kan ni integrera med Dynamics 365?"
↓
User: Klickar [🔌 Integration]
↓
System prompt: "Vilket system?" (modal eller inline input)
User skriver: "Dynamics 365"
↓
AI Processing:
  - Loggar: "Kund frågar om integration (Dynamics 365)"
  - Tag: Integration, Dynamics 365
  - Auto-trigger: Search battlecards för "Dynamics 365"
↓
Quick Access auto-visar:
  📌 Battlecard: "Dynamics 365 Integration"
  "Ja, native connector för Dynamics 365 Sales..."
  Setup-tid: 1-2 dagar
  Pricing: Ingår i standard
  Case: "Scania använder vår Dynamics-integration"
↓
User: Svarar kund direkt från battlecard
Timeline uppdateras:
  14:38 💬 Kund: "Integration (Dynamics 365)"
  Tags: Integration, Dynamics 365

Coaching tip:
  💡 "Fråga om deras Dynamics-version och vilka moduler de använder"
```

**Alternativ - endast text method:**
```
Kund: "Kan ni integrera med Dynamics 365?"
↓
User: Börjar skriva "dynamics" i Quick Access search
↓
AI: Instant search results:
  📌 Battlecard: "Dynamics 365 Integration"
  "Ja, vi har native connector för Dynamics 365 Sales..."
↓
User: Clicks [Visa full battlecard]
↓
Battlecard expanderas med:
  - Tekniska detaljer
  - Setup-tid (1-2 dagar)
  - Pricing (ingår i standard)
  - Customer case: "Scania använder vår Dynamics-integration"
↓
User: Svarar kund baserat på battlecard
Dokumenterar: "Bekräftade Dynamics 365 integration"
```

### Flow 5: Avsluta möte

```
User: Möte tar slut
Clicks: [Avsluta möte]
↓
AI: Genererar sammanfattning
Modal visas:

  📊 Meeting Summary

  Företag: Volvo AB
  Kontakt: Anna Svensson (CTO)
  Längd: 42 minuter
  Datum: 2026-02-02 14:00-14:42

  🎯 Discovery Summary (BANT):
    ✅ Budget: ~500k identifierat (Total cost: 7.5M/år)
    ✅ Authority: CTO närvarande, CFO involveras i beslut
    ✅ Need: Manuella Excel-processer (25 säljare, 2h/dag)
    ✅ Timeline: Beslut inom Q1, implementation Q2

  💡 Key Pain Points:
    • Manuella Excel-processer (7.5M kr/år i kostnad)
    • Ingen central visibility för ledning
    • Risk för fel vid manuell datainmatning

  🎁 Mentioned Interests:
    • M365 integration (viktigt)
    • Dynamics 365 connector (önskas)
    • Mobile access för säljare i fält

  🚀 Suggested Next Steps:
    1. Skicka demo-länk för M365 integration
    2. Boka teknisk demo med CTO & CFO (nästa vecka)
    3. Förbered ROI-kalkyl (7.5M cost vs 500k investment)
    4. Kontakta reference customer (Scania - liknande use case)

  [Export PDF] [Skicka email] [Spara till CRM]
↓
User: Väljer action
  - Export PDF → sparas lokalt
  - Skicka email → pre-filled email template
  - Spara till CRM → sparas i accounts/interactions
```

---

## 🧠 AI-funktionalitet

### 1. Auto-Detection (NLP på anteckningar)

**Budget-detection:**
```typescript
Input: "Budget cirka 500k"
AI detects:
  - Type: Budget
  - Amount: 500000
  - Certainty: "cirka" → 80% confidence
Action:
  - Update Discovery checklist: Budget ✅
  - Tag note: "Budget"
  - Suggest follow-up: "Är detta budget för år 1 eller total?"
```

**Authority-detection:**
```typescript
Input: "CTO är beslutsfattare, men CFO måste godkänna"
AI detects:
  - Primary decision maker: CTO
  - Approval needed: CFO
  - Decision process: Multi-level
Action:
  - Update Discovery: Authority ✅
  - Tag: "Decision Maker"
  - Suggest: "När kan vi boka möte med både CTO och CFO?"
```

**Pain Point-detection:**
```typescript
Input: "Problem med manuella processer i Excel, tar 2h/dag"
AI detects:
  - Pain: Manual processes
  - Quantified: 2h/day
  - Tool: Excel (competitor)
Action:
  - Update Discovery: Need ✅
  - Tag: "Pain Point", "Quantified"
  - Calculate cost if hourly rate known
  - Suggest: ROI-focused questions
```

### 2. Question Suggestion Algorithm

**Context-based:**
```typescript
function suggestQuestions(meetingContext: MeetingContext): Question[] {
  const uncoveredBANT = getUncoveredBANT(meetingContext);
  const latestPainPoint = getLatestPainPoint(meetingContext);
  const productFeatures = getProductFeatures(meetingContext.productId);

  const questions = [];

  // Priority 1: Uncover missing BANT
  if (!uncoveredBANT.includes('Budget')) {
    questions.push({
      text: "Vilken budget har ni avsatt för att lösa detta problem?",
      rationale: "Viktigt att kvalificera budget tidigt",
      type: "BANT-Budget"
    });
  }

  // Priority 2: Quantify pain points
  if (latestPainPoint && !latestPainPoint.quantified) {
    questions.push({
      text: `Hur mycket kostar er detta problem i tid/pengar?`,
      rationale: "Kvantifiera för ROI-diskussion",
      type: "Pain-Quantify"
    });
  }

  // Priority 3: Product fit questions
  questions.push(
    ...generateProductFitQuestions(latestPainPoint, productFeatures)
  );

  return questions.slice(0, 3); // Top 3
}
```

**SPIN-based (advanced):**
```typescript
// SPIN = Situation, Problem, Implication, Need-payoff

function generateSPINQuestions(stage: string, context: MeetingContext) {
  switch(stage) {
    case 'Situation':
      return [
        "Hur ser er nuvarande process ut för [X]?",
        "Hur många personer är involverade?"
      ];

    case 'Problem':
      return [
        "Vilka utmaningar ser ni med nuvarande lösning?",
        "Vad fungerar inte som det ska?"
      ];

    case 'Implication':
      return [
        "Vad händer om ni inte löser detta?",
        "Hur påverkar detta er försäljning/revenue?"
      ];

    case 'Need-payoff':
      return [
        "Hur skulle det påverka er om ni kunde automatisera detta?",
        "Vad skulle ni kunna göra med den frigjorda tiden?"
      ];
  }
}
```

### 3. Real-time Coaching Triggers

Återanvänd befintlig trigger-logik från live call:

```typescript
async function analyzeNote(note: string, context: MeetingContext) {
  // Samma trigger detection som i live call
  const triggers = await detectTriggers(note, context.productId);

  // Men anpassade för text-context
  triggers.forEach(trigger => {
    if (trigger.type === 'objection') {
      showCoachingTip({
        title: `Invändning: ${trigger.title}`,
        content: trigger.response,
        type: 'objection'
      });
    }

    if (trigger.type === 'opportunity') {
      showCoachingTip({
        title: `Opportunity: ${trigger.title}`,
        content: trigger.suggestion,
        type: 'suggestion'
      });
    }
  });

  // RAG-based coaching för kunskapsfrågor
  if (isQuestionFromCustomer(note)) {
    const ragTip = await searchDocumentsForAnswer(note, context.productId);
    if (ragTip) {
      showCoachingTip(ragTip);
    }
  }
}
```

---

## 🛠️ Teknisk Arkitektur

### Nya komponenter

```
src/components/
  MeetingAssistant.tsx          # Main component (split-screen layout)
  MeetingQuickInput.tsx          # Quick input field med shortcuts
  MeetingTimeline.tsx            # Kronologisk anteckningslista
  MeetingDiscoveryChecklist.tsx  # BANT-checklist
  MeetingSuggestedQuestions.tsx  # AI-generated questions
  MeetingQuickAccess.tsx         # Search battlecards/objections
  MeetingSummary.tsx             # Live + final summary
  MeetingExport.tsx              # Export modal (PDF/email)
```

### State Management

```typescript
// src/store/meetingAssistantStore.ts
interface MeetingAssistantState {
  // Session
  sessionId: string | null;
  isActive: boolean;
  startedAt: Date | null;

  // Meeting info
  customer: {
    company: string;
    contactPerson?: string;
    role?: string;
  };
  productId: string;

  // Notes
  notes: MeetingNote[];

  // Discovery status
  discoveryStatus: {
    budget: DiscoveryItem;
    authority: DiscoveryItem;
    need: DiscoveryItem;
    timeline: DiscoveryItem;
  };

  // AI suggestions
  suggestedQuestions: Question[];
  coachingTips: CoachingTip[];

  // Summary
  liveSummary: MeetingSummary;

  // Actions
  startMeeting: (customer, productId) => void;
  addNote: (text, speaker) => void;
  updateNote: (noteId, text) => void;
  deleteNote: (noteId) => void;
  useSuggestedQuestion: (questionId) => void;
  endMeeting: () => Promise<MeetingSummary>;
  exportMeeting: (format: 'pdf' | 'email') => void;
}

interface MeetingNote {
  id: string;
  timestamp: Date;
  speaker: 'customer' | 'seller' | 'observation';
  text: string;
  tags: string[]; // AI-generated tags
  detectedEntities?: {
    budget?: number;
    timeline?: string;
    painPoint?: string;
    competitor?: string;
  };
}

interface DiscoveryItem {
  completed: boolean;
  value?: string;
  confidence: number;
  sourceNoteId?: string;
}

interface Question {
  id: string;
  text: string;
  rationale: string;
  type: 'BANT' | 'Pain' | 'Product' | 'SPIN';
  priority: number;
}
```

### Integration med befintlig kod

**Gateway WebSocket (optional för meeting mode):**
```typescript
// Kan köras utan WebSocket (enbart local state)
// ELLER med WebSocket för real-time AI processing

// Med WebSocket:
gateway.send({
  type: 'meeting.note_added',
  payload: {
    sessionId,
    note: {
      text: "Budget 500k",
      speaker: 'customer'
    }
  }
});

// Server processar och svarar:
gateway.on('meeting.suggestion', (payload) => {
  addSuggestedQuestion(payload.question);
});

gateway.on('coaching.tip', (payload) => {
  addCoachingTip(payload.tip);
});
```

**Coaching Engine integration:**
```typescript
// Återanvänd CoachingEngine från gateway
import { CoachingEngine } from '../gateway/coaching-engine';

const engine = new CoachingEngine(supabase, openai);

// När note läggs till:
const tips = await engine.detectTriggersAndGenerateTips(
  noteText,
  'customer', // speaker
  {
    sessionId,
    userId,
    productId,
    segments: notes.map(n => ({ text: n.text, speaker: n.speaker }))
  }
);

// Visa tips i UI
tips.forEach(tip => addCoachingTip(tip));
```

**Supabase storage:**
```typescript
// Spara möte i samma call_sessions tabell
const { data: session } = await supabase
  .from('call_sessions')
  .insert({
    user_id: userId,
    product_id: productId,
    account_id: accountId, // Från kundregister
    mode: 'meeting_assistant', // Nytt mode
    customer_company: customer.company,
    customer_name: customer.contactPerson,
    status: 'recording',
    started_at: new Date().toISOString(),
    metadata: {
      notes: notes,
      discoveryStatus: discoveryStatus,
      liveSummary: liveSummary
    }
  });

// Vid avslut - uppdatera med final summary
await supabase
  .from('call_sessions')
  .update({
    status: 'completed',
    ended_at: new Date().toISOString(),
    summary: finalSummary,
    outcome: outcome,
    next_steps: nextSteps
  })
  .eq('id', sessionId);
```

---

## 📱 UX Detaljer

### Keyboard Shortcuts

```
Ctrl+Enter     - Lägg till note
Ctrl+1         - Quick input focus
Ctrl+2         - Quick Access search focus
Ctrl+Q         - Use first suggested question
Ctrl+S         - Save/sync meeting
Esc            - Close current modal
```

### Mobile Responsiveness

För tablet (iPad) användning:

```
┌─────────────────────────┐
│ 📋 Meeting Assistant    │
├─────────────────────────┤
│                         │
│ [Tabs]                  │
│ • Notes                 │
│ • Questions             │
│ • Coaching              │
│ • Summary               │
│                         │
│ [Active tab content]    │
│                         │
│                         │
│ [Quick input - sticky]  │
└─────────────────────────┘
```

Sticky input field längst ner för snabb access.

### Auto-save & Sync

```typescript
// Auto-save var 30:e sekund
useEffect(() => {
  const interval = setInterval(() => {
    if (isActive && notes.length > 0) {
      saveMeetingDraft();
    }
  }, 30000);

  return () => clearInterval(interval);
}, [isActive, notes]);

// Också save on window blur (tab switch)
useEffect(() => {
  const handleBlur = () => saveMeetingDraft();
  window.addEventListener('blur', handleBlur);
  return () => window.removeEventListener('blur', handleBlur);
}, []);
```

---

## 🎁 Unique Features

### 1. Smart Copy-Paste Detection

Om user copy-pastar från Teams/Zoom chat:

```typescript
onPaste={(e) => {
  const text = e.clipboardData.getData('text');

  // Detect if it's from chat (format: "Name: Message")
  const chatMatch = text.match(/^(.+?):\s*(.+)$/);

  if (chatMatch) {
    const [, name, message] = chatMatch;
    addNote(message, 'customer', { source: 'chat', name });
  } else {
    addNote(text, 'customer');
  }
}
```

### 2. Voice Memo Integration (hybrid)

För tillfällen när user inte kan skriva:

```tsx
<button className="voice-memo">
  🎤 Voice memo (för dina egna anteckningar)
</button>

// Korta röstmemon (5-10 sek) transkriberas till text
// Läggs till som observation
```

### 3. Meeting Templates

Pre-configured templates för olika mötestyper:

```typescript
const templates = {
  discovery: {
    name: "Discovery Call",
    checklist: ['Budget', 'Authority', 'Need', 'Timeline'],
    initialQuestions: [
      "Berätta om er nuvarande situation",
      "Vilka utmaningar ser ni?"
    ]
  },

  demo: {
    name: "Product Demo",
    checklist: ['Use Cases', 'Technical Req', 'Timeline', 'Next Steps'],
    initialQuestions: [
      "Vilka use cases är viktigast?",
      "Vilka system ska vi integrera med?"
    ]
  },

  negotiation: {
    name: "Negotiation/Closing",
    checklist: ['Budget Confirmed', 'Contract Terms', 'Decision Date'],
    initialQuestions: [
      "Vad behöver ni för att fatta beslut idag?"
    ]
  }
};
```

User väljer template när de startar mötet.

---

## 📊 Analytics & Insights

### Post-meeting analytics:

```typescript
interface MeetingAnalytics {
  // Efficiency
  noteCount: number;
  avgNoteLength: number;
  questionsAsked: number;
  questionsFromSuggestions: number; // AI adoption rate

  // Discovery effectiveness
  discoveryCompletionRate: number; // % of BANT completed
  timeToFirstPainPoint: number; // seconds
  painPointsIdentified: number;

  // Coaching usage
  coachingTipsShown: number;
  coachingTipsActedOn: number;
  battlecardsAccessed: number;

  // Outcome
  interestLevel: number; // 0-100
  nextStepsDefined: boolean;
  meetingQuality: 'poor' | 'average' | 'good' | 'excellent';
}
```

Visas i dashboard för user att förbättra sig över tid.

---

## 🚀 Implementation Plan

### Phase 1: Core UI (Vecka 1)
- [ ] MeetingAssistant main component
- [ ] Quick input field
- [ ] Meeting timeline (notes list)
- [ ] Basic Discovery checklist
- [ ] Start/end meeting flow

### Phase 2: AI Suggestions (Vecka 2)
- [ ] Question suggestion algorithm
- [ ] Auto-tagging (budget, pain points, etc.)
- [ ] Discovery auto-update
- [ ] Integration med CoachingEngine

### Phase 3: Quick Access & Search (Vecka 3)
- [ ] Quick Access search component
- [ ] Battlecard integration
- [ ] Objection handler integration
- [ ] RAG-based answers

### Phase 4: Summary & Export (Vecka 4)
- [ ] Live summary generation
- [ ] Final summary with next steps
- [ ] PDF export
- [ ] Email template
- [ ] CRM integration

### Phase 5: Advanced Features (Vecka 5)
- [ ] Meeting templates
- [ ] Keyboard shortcuts
- [ ] Mobile/tablet optimization
- [ ] Voice memo integration
- [ ] Analytics dashboard

---

## 💡 Success Metrics

**User Adoption:**
- % of meetings using Meeting Assistant vs Live Call
- Average meeting length
- Notes per meeting

**AI Effectiveness:**
- % of suggested questions used
- Discovery completion rate
- Time saved (vs manual note-taking)

**Business Impact:**
- Win rate for meetings with Meeting Assistant
- Quality of next steps generated
- CRM data completeness

---

## 🎬 Demo Script

### Scenario: Discovery Call med Volvo AB

**Setup:**
```
Product: M365
Company: Volvo AB
Contact: Anna Svensson (CTO)
```

**During meeting:**

```
[00:00] Start meeting
AI suggests: "Berätta om er nuvarande situation med sales tracking"

[02:30] User notes: "25 säljare använder Excel, 2h/dag uppdatering"
→ AI detects: Pain Point (manual process)
→ AI suggests: "Vad kostar er en säljares tid per timme?"

[05:12] User notes: "600 kr/h per säljare"
→ AI calculates: 25 × 2h × 250 days × 600 kr = 7.5M kr/år
→ AI coaching tip: "ROI argument: Vårt pris är 6.7% av deras cost"

[08:45] Customer asks: "Kan ni integrera med Dynamics 365?"
→ User searches "dynamics" in Quick Access
→ Battlecard appears instantly
→ User answers with confidence

[15:20] User notes: "Budget 500k godkänd av CFO"
→ Discovery checklist: Budget ✅, Authority ✅

[20:00] End meeting
→ AI generates summary med next steps:
  1. Boka teknisk demo med CTO
  2. Skicka ROI-kalkyl (7.5M savings)
  3. Förbered Dynamics 365 integration demo
```

**Result:**
- Full BANT discovery completed
- Clear next steps
- High-quality CRM data
- User felt supported throughout

---

**Vill du att jag börjar implementera någon specifik del av detta?**

Förslag på nästa steg:
1. Skapa MeetingAssistant main component med split-screen layout
2. Implementera Quick Input field med keyboard shortcuts
3. Bygga Question Suggestion algorithm
4. Designa Meeting Timeline component