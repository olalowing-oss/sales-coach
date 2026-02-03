# Quick Tag System - Exempel & Use Cases

## 🎯 Översikt

Quick Tags gör det möjligt att **logga kundfrågor med 1 klick** istället för att skriva. Perfekt för diskreta möten där snabbhet är viktigt.

---

## 📱 UI Mockup

### Desktop View

```
┌────────────────────────────────────────────────────────────────────────┐
│ Meeting Assistant - Volvo AB (M365)                    🟢 ACTIVE   [X] │
├──────────────────────────────────┬─────────────────────────────────────┤
│                                  │                                      │
│ 📝 Quick Input                   │ 💡 Auto-Triggered                    │
│ ──────────────────────────────   │ ──────────────────────────────       │
│                                  │                                      │
│ 🏷️ Kunden frågar om:             │ 📌 Integration: Salesforce           │
│                                  │ ═══════════════════════════════      │
│ [💰 Pris] [🔌 Integration]       │                                      │
│              ^^^CLICKED           │ ✅ Native Salesforce connector       │
│ [⏰ Tidsplan] [⚙️ Funktioner]    │ • REST API integration               │
│                                  │ • Real-time data sync                │
│ [🆘 Support] [🔒 Säkerhet]       │ • Custom field mapping               │
│                                  │                                      │
│ [👥 Referenser] [📄 Avtal]       │ Setup tid: 2-3 dagar                 │
│                                  │ Kostnad: Ingår i Enterprise          │
│ [+ Custom tag...]                │                                      │
│                                  │ 💼 Customer case:                    │
│ ─── eller skriv: ─────────────   │ "Scania använder vår Salesforce      │
│ ┌──────────────────────────────┐ │  integration för 200+ säljare"       │
│ │ Salesforce                   │ │                                      │
│ │        ^^^USER TYPED          │ │ [Visa fullständig guide →]           │
│ └──────────────────────────────┘ │                                      │
│ Ctrl+Enter                       │ 🎯 Föreslagna följdfrågor:           │
│                                  │ • "Vilken Salesforce-version?"       │
│ ✅ Logged:                       │ • "Vilka objekt ska synkas?"         │
│ 14:42 💬 Kund:                   │ • "Vill ni ha demo av integrationen?"│
│ "Integration (Salesforce)"       │                                      │
│ Tags: Integration, Salesforce    │                                      │
│                                  │                                      │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### Mobile/Tablet View

```
┌───────────────────────────┐
│ Meeting Assistant         │
│ Volvo AB (M365)  🟢       │
├───────────────────────────┤
│                           │
│ 🏷️ Kunden frågar om:      │
│                           │
│ [💰][🔌][⏰][⚙️]          │
│ [🆘][🔒][👥][📄]          │
│                           │
│ ┌───────────────────────┐ │
│ │ eller skriv...        │ │
│ └───────────────────────┘ │
│                           │
│ ──── Senaste ────────     │
│ 14:42 💬 Integration      │
│       (Salesforce)        │
│                           │
│ [Auto-triggered info ↓]   │
│                           │
└───────────────────────────┘
```

---

## 🎬 Konkreta Use Cases

### Use Case 1: Pris-fråga (Enkel)

**Scenario:** Kund frågar direkt om pris

```
Kund säger:
"Vad kostar er lösning?"

Säljare gör:
1. Klickar [💰 Pris]
2. Klart!

System gör:
✅ Loggar: "Kund frågar om pris" (14:35)
✅ Visar: Prislista & erbjudanden i Quick Access
✅ Föreslår fråga: "Vad är er budget för detta?"
✅ Coaching tip: "Fråga om budget innan du visar pris"

Timeline:
──────────────────────────────
14:35 💬 Kund: "Pris"
      Tags: Price inquiry
──────────────────────────────

Quick Access auto-visar:
┌─────────────────────────────┐
│ 💰 M365 Pricing             │
├─────────────────────────────┤
│ Standard: 2,500 kr/user/år  │
│ Enterprise: 4,500 kr/user/år│
│ Custom: Offert vid >100     │
│                             │
│ ROI Calculator: [Öppna]     │
│ Erbjudanden: [Visa alla]    │
└─────────────────────────────┘
```

**Resultat:**
- ⏱️ Tid att logga: **1 sekund**
- 📊 Strukturerad data för analytics
- 💡 Instant coaching-stöd
- 🎯 Klar att svara direkt

---

### Use Case 2: Integration-fråga (Komplex)

**Scenario:** Kund frågar om specifik integration

```
Kund säger:
"Kan ni integrera med vår Dynamics 365 CRM?"

Säljare gör:
1. Klickar [🔌 Integration]
2. Popup: "Vilket system?"
3. Skriver: "Dynamics 365"
4. Enter

System gör:
✅ Loggar: "Integration (Dynamics 365)" (14:38)
✅ AI search: Battlecard för "Dynamics 365"
✅ Visar: Dynamics-specifik integration guide
✅ Föreslår: "Vilken version av Dynamics använder ni?"
✅ Related: Scania case (använder samma integration)

Timeline:
──────────────────────────────────────
14:38 💬 Kund: "Integration (Dynamics 365)"
      Tags: Integration, Dynamics, CRM
──────────────────────────────────────

Quick Access auto-visar:
┌──────────────────────────────────────┐
│ 🔌 Dynamics 365 Integration          │
├──────────────────────────────────────┤
│ ✅ Native connector tillgänglig      │
│ ✅ Sales, Marketing, Service moduler │
│                                      │
│ Setup:                               │
│ • OAuth 2.0 authentication           │
│ • Field mapping (30 min)             │
│ • Initial sync (1-2h beroende på vol)│
│ • Go-live: 2-3 dagar total           │
│                                      │
│ Kostnad: Ingår i Enterprise-plan     │
│                                      │
│ 💼 Case: Scania AB                   │
│ "200 säljare, Dynamics integration   │
│  implementerad på 3 dagar"           │
│                                      │
│ [Teknisk dokumentation →]            │
│ [Boka demo av integration →]         │
└──────────────────────────────────────┘

Coaching tip:
┌──────────────────────────────────────┐
│ 💡 Följdfrågor att ställa:           │
│ • Vilken version? (Online/On-prem)   │
│ • Vilka moduler använder ni?         │
│ • Hur många users?                   │
│ • Finns API-access aktiverat?       │
└──────────────────────────────────────┘
```

**Resultat:**
- ⏱️ Tid att logga: **3 sekunder** (klick + skriv system)
- 📊 Strukturerad + detaljerad data
- 💡 Teknisk info direkt tillgänglig
- 🎯 Relevanta följdfrågor föreslagna

---

### Use Case 3: Multi-Tag (Kombinerad fråga)

**Scenario:** Kund ställer flera frågor samtidigt

```
Kund säger:
"Vad kostar det och hur lång är implementeringen?"

Säljare gör:
1. Klickar [💰 Pris]
2. Klickar [⏰ Tidsplan]
3. Båda tags blir aktiva

System gör:
✅ Loggar: "Pris OCH Tidsplan" (14:45)
✅ Visar: Combined view med båda
✅ Föreslår: ROI-kalkyl (cost + time value)

Timeline:
───────────────────────────────────
14:45 💬 Kund: "Pris & Tidsplan"
      Tags: Price, Timeline
───────────────────────────────────

Quick Access auto-visar:
┌─────────────────────────────────────┐
│ 💰 Pris & ⏰ Implementation Timeline │
├─────────────────────────────────────┤
│ PRIS:                               │
│ Standard: 2,500 kr/user/år          │
│ Enterprise: 4,500 kr/user/år        │
│                                     │
│ TIDSPLAN:                           │
│ Week 1: Onboarding & setup          │
│ Week 2: Integration & migration     │
│ Week 3: Training                    │
│ Week 4: Go-live                     │
│ Total: 4-6 veckor                   │
│                                     │
│ 💡 ROI Calculator:                  │
│ [Beräkna ROI baserat på er situation]│
└─────────────────────────────────────┘

Coaching tip:
┌─────────────────────────────────────┐
│ 💡 Kombinera i svaret:              │
│ "Med Enterprise-planen (4,500/user) │
│  och 25 users blir det 112,500/år.  │
│  Implementation tar 4-6 veckor, så   │
│  ni kan vara live i Q2."            │
│                                     │
│ Följdfråga:                         │
│ "När behöver ni absolut vara live?" │
└─────────────────────────────────────┘
```

**Resultat:**
- ⏱️ Tid att logga: **2 sekunder** (2 klick)
- 📊 Kombinerad insight (båda topics)
- 💡 Integrerad coaching (kombinera svar)
- 🎯 Smart ROI-kalkyl baserat på båda

---

### Use Case 4: Quick Tag + Detalj (Hybrid)

**Scenario:** Generell fråga med specifik detalj

```
Kund säger:
"Har ni några referenser från fordonsindustrin?"

Säljare gör:
1. Klickar [👥 Referenser]
2. Skriver: "fordon" i text field
3. Enter

System gör:
✅ Loggar: "Referenser (fordonsindustrin)" (14:50)
✅ AI filter: Case studies för automotive
✅ Visar: Scania, Volvo Cars, Polestar cases
✅ Föreslår: "Vill ni prata med någon av dem?"

Timeline:
────────────────────────────────────────
14:50 💬 Kund: "Referenser (fordonsindustrin)"
      Tags: References, Automotive
────────────────────────────────────────

Quick Access auto-visar:
┌────────────────────────────────────────┐
│ 👥 Customer Cases - Fordonsindustrin   │
├────────────────────────────────────────┤
│ 🚗 Scania AB                           │
│ • 200 säljare över 15 länder           │
│ • Dynamics 365 integration             │
│ • 40% snabbare deals efter 6 månader   │
│ • Kontakt: Johan Andersson (Sales Dir) │
│ [Läs full case →] [Begär referenssamtal]│
│                                        │
│ 🚗 Volvo Cars                          │
│ • 150 säljare i Norden                 │
│ • SAP integration                      │
│ • 25% bättre forecasting accuracy      │
│ [Läs full case →]                      │
│                                        │
│ 🚗 Polestar                            │
│ • 80 säljare, 12 marknader             │
│ • Custom integration med internal CRM  │
│ • "Game changer för vårt team"         │
│ [Läs full case →]                      │
└────────────────────────────────────────┘

Coaching tip:
┌────────────────────────────────────────┐
│ 💡 Scania är starkaste referensen:     │
│ • Samma bransch (automotive B2B)       │
│ • Liknande setup (Dynamics 365)        │
│ • Stor organisation (200 users)        │
│                                        │
│ Föreslå: "Vill ni prata med Scania's   │
│ Sales Director om deras erfarenheter?" │
└────────────────────────────────────────┘
```

**Resultat:**
- ⏱️ Tid att logga: **3 sekunder**
- 📊 Strukturerad + bransch-specifik
- 💡 Rätt cases baserat på industry
- 🎯 Konkret follow-up action

---

### Use Case 5: Custom Tag (Avancerat)

**Scenario:** Produktspecifik fråga som återkommer ofta

```
Situation:
M365-säljare märker att kunder ofta frågar om
"Multi-tenant deployment" (flera länder/regions)

Säljare skapar custom tag:
┌────────────────────────────────┐
│ Skapa Custom Tag               │
├────────────────────────────────┤
│ Namn: Multi-tenant deployment  │
│ Icon: 🌍                       │
│                                │
│ Auto-trigger:                  │
│ ☑ Battlecard: "Global deployment"│
│ ☑ RAG search: "multi tenant region"│
│ ☑ Följdfråga: "Vilka länder?"  │
│                                │
│ [Spara]                        │
└────────────────────────────────┘

Nu i Quick Tags:
[💰 Pris] [🔌 Integration] [⏰ Tidsplan]
[🌍 Multi-tenant] ← NY CUSTOM TAG

När använd:
Kund: "Kan vi ha olika instanser per land?"

Säljare klickar: [🌍 Multi-tenant]

System visar:
┌────────────────────────────────────┐
│ 🌍 Multi-tenant Deployment         │
├────────────────────────────────────┤
│ ✅ Region-specific deployment      │
│ ✅ EU data residency compliance    │
│ ✅ Separate admin per region       │
│                                    │
│ Supported regions:                 │
│ • EU (Frankfurt, Amsterdam)        │
│ • US (Virginia, Oregon)            │
│ • Asia-Pacific (Singapore, Tokyo)  │
│                                    │
│ Pricing: +20% per additional region│
│                                    │
│ [Global deployment guide →]        │
└────────────────────────────────────┘
```

**Resultat:**
- 🎯 Produktspecifik quick access
- 📊 Konsistent loggning
- 💡 Team-bred kunskap
- 🔄 Återanvändbar för alla säljare

---

## 📊 Analytics från Quick Tags

### Weekly Summary

```
┌──────────────────────────────────────────────────┐
│ 📊 Quick Tag Analytics - Vecka 5                 │
├──────────────────────────────────────────────────┤
│                                                   │
│ Mest klickade tags:                              │
│ 1. 💰 Pris                 23 gånger (32%)       │
│ 2. 🔌 Integration          18 gånger (25%)       │
│ 3. ⏰ Tidsplan             14 gånger (19%)       │
│ 4. 👥 Referenser            8 gånger (11%)       │
│ 5. 🆘 Support/SLA           6 gånger (8%)        │
│                                                   │
│ Integration breakdown:                           │
│ • Salesforce: 8 gånger                           │
│ • Dynamics 365: 6 gånger                         │
│ • HubSpot: 3 gånger                              │
│ • Custom/Other: 1 gång                           │
│                                                   │
│ 💡 Insights:                                     │
│ • Salesforce integration efterfrågas mest        │
│   → Förbered Salesforce demo för alla möten     │
│                                                   │
│ • Pris frågas 85% av gångerna i Discovery        │
│   → Förbered ROI-kalkyl redan från start        │
│                                                   │
│ • Referenser frågas oftare av Enterprise (67%)  │
│   vs SMB (12%)                                   │
│   → Skräddarsy approach baserat på company size │
└──────────────────────────────────────────────────┘
```

### Tag Correlation

```
┌──────────────────────────────────────────────────┐
│ 🔗 Tag Correlations                              │
├──────────────────────────────────────────────────┤
│                                                   │
│ När kunden frågar om:                            │
│                                                   │
│ 💰 Pris → 72% frågar också om ⏰ Tidsplan        │
│         → 58% frågar om 👥 Referenser            │
│                                                   │
│ 🔌 Integration → 83% frågar om ⏰ Tidsplan       │
│                → 45% frågar om 🆘 Support         │
│                                                   │
│ 💡 Rekommendation:                               │
│ Om kunden frågar pris, förbered dig på att       │
│ svara om tidsplan och referenser i samma möte    │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Best Practices

### 1. Använd Tags för Vanliga Frågor
✅ **Gör:** Klicka tag för standardfrågor (pris, integration, etc.)
❌ **Gör inte:** Skriv ut hela frågan manuellt

### 2. Kombinera Tag + Detalj för Precision
✅ **Gör:** Klicka [🔌 Integration] + skriv "Salesforce"
❌ **Gör inte:** Bara klicka tag utan kontext vid specifika frågor

### 3. Multi-Tag för Komplexa Frågor
✅ **Gör:** Klicka [💰 Pris] + [⏰ Tidsplan] samtidigt
❌ **Gör inte:** Skapa separata notes för samma fråga

### 4. Skapa Custom Tags för Återkommande Frågor
✅ **Gör:** Om "GDPR compliance" frågas ofta → custom tag
❌ **Gör inte:** Skriva "GDPR" manuellt varje gång

### 5. Använd Auto-Triggered Info
✅ **Gör:** Läs battlecard som dyker upp automatiskt
❌ **Gör inte:** Sök manuellt efter samma info

---

## 🚀 Performance Metrics

### Speed Comparison

**Utan Quick Tags:**
```
Kund: "Vad kostar det?"
Säljare: Skriver "Kunden frågar om pris"
         Söker i Quick Access: "pris"
         Klickar battlecard
Total tid: ~15 sekunder
```

**Med Quick Tags:**
```
Kund: "Vad kostar det?"
Säljare: Klickar [💰 Pris]
         (Battlecard visas automatiskt)
Total tid: ~2 sekunder
```

**Tidsbesparing: 87%** ⚡

### Data Quality Improvement

**Utan Tags:**
- Inkonsistent notering ("Pris", "Kostar?", "Fråga om pris")
- Svårt att aggregera i analytics
- Missade detaljer (glöms att notera)

**Med Tags:**
- Standardiserad data ("Price inquiry")
- Lätt att analysera trends
- Inget missas (1-klick = loggat)

**Data Quality Improvement: +95%** 📊

---

## 💻 Teknisk Implementation

### Tag Configuration (JSON)

```typescript
interface QuickTag {
  id: string;
  label: string;
  icon: string;
  category: 'customer_question' | 'pain_point' | 'custom';

  // Auto-trigger actions
  autoTriggers: {
    showBattlecard?: string;      // Battlecard ID
    ragSearch?: string;            // Document search query
    suggestFollowUp?: string[];    // Follow-up questions
    updateDiscovery?: 'budget' | 'authority' | 'need' | 'timeline';
  };

  // Prompt for details
  detailPrompt?: string;           // "Vilket system?" etc.

  // Analytics
  usageCount: number;
  lastUsed: Date;
}

// Example tag configs
const defaultTags: QuickTag[] = [
  {
    id: 'price',
    label: 'Pris',
    icon: '💰',
    category: 'customer_question',
    autoTriggers: {
      showBattlecard: 'pricing-overview',
      suggestFollowUp: [
        'Vad är er budget för detta?',
        'Vill ni ha en ROI-kalkyl?'
      ],
      updateDiscovery: 'budget'
    },
    usageCount: 47,
    lastUsed: new Date('2026-02-02')
  },

  {
    id: 'integration',
    label: 'Integration',
    icon: '🔌',
    category: 'customer_question',
    detailPrompt: 'Vilket system? (Salesforce, Dynamics, etc.)',
    autoTriggers: {
      ragSearch: 'integration {system} setup configuration',
      suggestFollowUp: [
        'Vilken version av {system} använder ni?',
        'Hur kritisk är integration för er?'
      ]
    },
    usageCount: 32,
    lastUsed: new Date('2026-02-02')
  }
];
```

### Tag Usage Handler

```typescript
async function handleQuickTag(
  tagId: string,
  detail?: string
): Promise<void> {
  const tag = getTagById(tagId);

  // 1. Log note
  const noteText = detail
    ? `${tag.label} (${detail})`
    : tag.label;

  const note = await addNote({
    text: noteText,
    speaker: 'customer',
    tags: [tag.id, ...(detail ? [detail] : [])],
    timestamp: new Date()
  });

  // 2. Execute auto-triggers
  if (tag.autoTriggers.showBattlecard) {
    const battlecard = await getBattlecard(tag.autoTriggers.showBattlecard);
    showInQuickAccess(battlecard);
  }

  if (tag.autoTriggers.ragSearch) {
    const query = tag.autoTriggers.ragSearch.replace('{system}', detail || '');
    const docs = await searchDocuments(query, session.productId);
    showInQuickAccess(docs);
  }

  if (tag.autoTriggers.suggestFollowUp) {
    const questions = tag.autoTriggers.suggestFollowUp.map(q =>
      q.replace('{system}', detail || '')
    );
    setSuggestedQuestions(questions);
  }

  if (tag.autoTriggers.updateDiscovery) {
    updateDiscoveryChecklist(tag.autoTriggers.updateDiscovery, noteText);
  }

  // 3. Update analytics
  await incrementTagUsage(tagId);
}
```

### Smart Tag Suggestion (ML-based)

```typescript
async function suggestTagFromText(text: string): Promise<QuickTag | null> {
  const lowercaseText = text.toLowerCase();

  // Simple keyword matching
  const tagKeywords = {
    'price': ['pris', 'kost', 'betala', 'budget'],
    'integration': ['integrera', 'koppla', 'anslut', 'api'],
    'timeline': ['när', 'tidsplan', 'snabbt', 'deadline'],
    'support': ['support', 'hjälp', 'sla', 'service']
  };

  for (const [tagId, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(kw => lowercaseText.includes(kw))) {
      return getTagById(tagId);
    }
  }

  return null;
}

// Usage in text input
<textarea
  onChange={(e) => {
    const suggestedTag = await suggestTagFromText(e.target.value);
    if (suggestedTag) {
      showTagSuggestion(suggestedTag);
    }
  }}
/>
```

---

## 🎁 Advanced Features

### 1. Tag Templates by Meeting Type

```typescript
const discoveryTags = ['Pris', 'Integration', 'Timeline', 'Referenser'];
const demoTags = ['Funktioner', 'Integration', 'Support', 'Säkerhet'];
const negotiationTags = ['Pris', 'Avtal', 'Timeline', 'Support'];

// Auto-load relevant tags
function loadTagsForMeetingType(type: MeetingType) {
  const relevantTags = {
    'discovery': discoveryTags,
    'demo': demoTags,
    'negotiation': negotiationTags
  }[type];

  return relevantTags.map(getTagByLabel);
}
```

### 2. Team-Shared Custom Tags

```typescript
// Tags kan delas över teamet
interface CustomTag extends QuickTag {
  createdBy: string;
  sharedWith: 'personal' | 'team' | 'organization';
  usageByUser: Map<string, number>; // Analytics per user
}

// Mest använda custom tags syns för alla
function getTeamPopularTags(): CustomTag[] {
  return customTags
    .filter(tag => tag.sharedWith === 'team')
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);
}
```

### 3. Tag-Based Playbooks

```typescript
// När vissa tags används, föreslå playbook
const playbooks = {
  'price_objection': {
    triggerTags: ['Pris'],
    triggerKeywords: ['för dyrt', 'för mycket', 'billigare'],
    playbook: {
      steps: [
        'Fråga om budget först',
        'Visa ROI-kalkyl',
        'Jämför med nuvarande cost',
        'Erbjud payment plan om nödvändigt'
      ],
      battlecards: ['roi-calculator', 'payment-options']
    }
  }
};
```

---

**Implementation timeline:** 2 veckor
**Priority:** High (drastisk UX-förbättring)
**Dependencies:** Meeting Assistant core UI
