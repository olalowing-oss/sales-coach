# B3 Sales Coach AI - Teknisk Specifikation

## Projektöversikt

**Namn:** B3 Sales Coach AI  
**Version:** 1.0 MVP  
**Syfte:** Realtids AI-coaching för säljare under kundsamtal  
**Målplattform:** React webbapplikation (Antigravity-kompatibel)  
**Tech Stack:** React + TypeScript + Azure OpenAI + Azure Speech Services

---

## Arkitekturöversikt

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           B3 SALES COACH AI                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌──────────────────┐     ┌─────────────────────────┐  │
│  │   BROWSER   │     │   AZURE SPEECH   │     │    AZURE OPENAI         │  │
│  │             │     │                  │     │                         │  │
│  │  Web Audio  │────▶│  Real-time STT   │────▶│  GPT-4o + Embeddings    │  │
│  │  API (Mic)  │     │  (Swedish)       │     │  RAG-baserad coaching   │  │
│  └─────────────┘     └──────────────────┘     └────────────┬────────────┘  │
│                                                            │               │
│  ┌─────────────────────────────────────────────────────────▼────────────┐  │
│  │                        REACT FRONTEND                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │ Transcript  │  │  Coaching   │  │  Knowledge  │  │  Analytics  │ │  │
│  │  │   Panel     │  │   Panel     │  │   Browser   │  │   Panel     │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     KUNSKAPSBAS (Azure AI Search)                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │Erbjudanden│ │Battlecards│ │Invändningar│ │Case Studies│ │Prislista│  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Azure-tjänster och konfiguration

### 1. Azure Speech Services (Real-time STT)

**Tjänst:** Azure Cognitive Services - Speech to Text  
**Region:** Sweden Central (för låg latens)  
**Modell:** Whisper eller Azure Speech (sv-SE)

```typescript
// Konfiguration
const speechConfig = {
  subscriptionKey: process.env.AZURE_SPEECH_KEY,
  region: "swedencentral",
  speechRecognitionLanguage: "sv-SE",
  enableDictation: true,
  profanityOption: "raw" // Behåll alla ord
};
```

**API-endpoint:**
```
wss://swedencentral.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1
```

### 2. Azure OpenAI Service

**Modeller som behövs:**
| Modell | Deployment Name | Syfte |
|--------|-----------------|-------|
| GPT-4o | `gpt-4o-coaching` | Generera coaching-tips |
| text-embedding-3-large | `embeddings` | Vektorisera kunskapsbas |

**Konfiguration:**
```typescript
const openaiConfig = {
  endpoint: "https://<your-resource>.openai.azure.com/",
  apiKey: process.env.AZURE_OPENAI_KEY,
  apiVersion: "2024-08-01-preview",
  deploymentName: "gpt-4o-coaching"
};
```

### 3. Azure AI Search (för RAG)

**Index-struktur:**
```json
{
  "name": "b3-knowledge-base",
  "fields": [
    { "name": "id", "type": "Edm.String", "key": true },
    { "name": "title", "type": "Edm.String", "searchable": true },
    { "name": "content", "type": "Edm.String", "searchable": true },
    { "name": "category", "type": "Edm.String", "filterable": true },
    { "name": "tags", "type": "Collection(Edm.String)", "filterable": true },
    { "name": "embedding", "type": "Collection(Edm.Single)", "dimensions": 3072 }
  ]
}
```

**Kategorier:**
- `offer` - Tjänsteerbjudanden
- `battlecard` - Konkurrensjämförelser
- `objection` - Invändningshantering
- `case` - Kundcase/referenser
- `pricing` - Prislista

---

## Datamodeller (TypeScript)

### Core Types

```typescript
// === TRANSKRIPTION ===
interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  speaker: 'seller' | 'customer' | 'unknown';
  confidence: number;
  isFinal: boolean;
}

interface Transcript {
  segments: TranscriptSegment[];
  fullText: string;
  duration: number;
}

// === COACHING ===
interface CoachingTip {
  id: string;
  type: 'suggestion' | 'battlecard' | 'objection' | 'offer' | 'case';
  priority: 'high' | 'medium' | 'low';
  trigger: string; // Vad triggade tipset
  title: string;
  content: string;
  talkingPoints?: string[];
  relatedOffer?: Offer;
  relatedCase?: CaseStudy;
  timestamp: number;
  dismissed: boolean;
}

interface CoachingState {
  activeTips: CoachingTip[];
  dismissedTips: string[];
  conversationContext: string[];
}

// === KUNSKAPSBAS ===
interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: 'offer' | 'battlecard' | 'objection' | 'case' | 'pricing';
  tags: string[];
  embedding?: number[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author?: string;
  };
}

interface Offer {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  deliverables: string[];
  duration: string;
  priceRange: {
    min: number;
    max: number;
    unit: 'fixed' | 'hourly' | 'daily';
  };
  targetAudience: string[];
  relatedCases: string[];
}

interface Battlecard {
  id: string;
  competitor: string;
  theirStrengths: string[];
  theirWeaknesses: string[];
  ourAdvantages: string[];
  talkingPoints: string[];
  commonObjections: string[];
}

interface ObjectionHandler {
  id: string;
  objection: string;
  triggers: string[]; // Nyckelord som triggar
  category: 'price' | 'timing' | 'competition' | 'trust' | 'need';
  responses: {
    short: string;
    detailed: string;
    followUpQuestions: string[];
  };
}

interface CaseStudy {
  id: string;
  customer: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  quote?: string;
  isPublic: boolean;
}

// === SESSIONSHANTERING ===
interface CallSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  customer?: {
    name: string;
    company: string;
    role?: string;
  };
  transcript: Transcript;
  coachingTips: CoachingTip[];
  analytics: CallAnalytics;
}

interface CallAnalytics {
  totalDuration: number;
  talkRatio: {
    seller: number;
    customer: number;
  };
  topicsDiscussed: string[];
  objectionsHandled: string[];
  offersPresented: string[];
  nextSteps?: string;
}
```

---

## API-specifikation

### 1. Speech-to-Text WebSocket

**Anslutning:**
```typescript
const createSpeechConnection = (config: SpeechConfig): WebSocket => {
  const url = `wss://${config.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;
  
  const params = new URLSearchParams({
    language: config.speechRecognitionLanguage,
    format: 'detailed',
    profanity: 'raw'
  });
  
  const ws = new WebSocket(`${url}?${params}`, {
    headers: {
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000'
    }
  });
  
  return ws;
};
```

**Meddelanden:**
```typescript
// Inkommande (från Azure)
interface SpeechRecognitionResult {
  RecognitionStatus: 'Success' | 'NoMatch' | 'InitialSilenceTimeout';
  DisplayText: string;
  Offset: number;
  Duration: number;
  NBest: Array<{
    Confidence: number;
    Display: string;
    Lexical: string;
  }>;
}

// Utgående (till Azure)
// Binary audio data (PCM 16-bit, 16kHz, mono)
```

### 2. Coaching Generation API

**Endpoint:** `POST /api/coaching/generate`

**Request:**
```typescript
interface CoachingRequest {
  transcript: string;           // Senaste transkription
  context: string[];            // Tidigare konversationskontext
  sessionId: string;
  customerId?: string;
}
```

**Response:**
```typescript
interface CoachingResponse {
  tips: CoachingTip[];
  updatedContext: string[];
  processingTime: number;
}
```

**Implementation (serverless function):**
```typescript
// /api/coaching/generate.ts
import { AzureOpenAI } from "@azure/openai";
import { SearchClient } from "@azure/search-documents";

export async function generateCoaching(req: CoachingRequest): Promise<CoachingResponse> {
  const startTime = Date.now();
  
  // 1. Analysera transkription för triggers
  const triggers = await detectTriggers(req.transcript);
  
  // 2. Sök relevant kunskap via RAG
  const relevantDocs = await searchKnowledge(triggers, req.context);
  
  // 3. Generera coaching med GPT-4o
  const tips = await generateTips(req.transcript, relevantDocs, req.context);
  
  return {
    tips,
    updatedContext: [...req.context, summarize(req.transcript)].slice(-10),
    processingTime: Date.now() - startTime
  };
}
```

### 3. Knowledge Search API

**Endpoint:** `POST /api/knowledge/search`

**Request:**
```typescript
interface SearchRequest {
  query: string;
  categories?: string[];
  topK?: number;
}
```

**Response:**
```typescript
interface SearchResponse {
  results: Array<{
    document: KnowledgeDocument;
    score: number;
    highlights: string[];
  }>;
}
```

---

## Trigger-detektion

### Nyckelordbaserade triggers

```typescript
const TRIGGER_PATTERNS = {
  // Prisinvändningar
  price: {
    keywords: ['dyrt', 'för dyrt', 'billigare', 'budget', 'kostnad', 'pris', 'investering'],
    response: 'objection',
    category: 'price'
  },
  
  // Tidsinvändningar
  timing: {
    keywords: ['senare', 'inte nu', 'nästa år', 'Q1', 'Q2', 'inte prioriterat', 'vänta'],
    response: 'objection',
    category: 'timing'
  },
  
  // Konkurrenter
  competitors: {
    keywords: ['Atea', 'Tieto', 'CGI', 'Knowit', 'Sigma', 'HiQ', 'Accenture', 'inhouse'],
    response: 'battlecard'
  },
  
  // Microsoft-produkter
  products: {
    keywords: ['Teams', 'Copilot', 'SharePoint', 'Azure', 'M365', 'Microsoft 365', 'Power Platform'],
    response: 'offer'
  },
  
  // Problemsignaler
  problems: {
    keywords: ['rörigt', 'kaotiskt', 'stökigt', 'inte fungerar', 'frustrerade', 'problem med'],
    response: 'solution'
  },
  
  // Intressesignaler
  interest: {
    keywords: ['låter intressant', 'berätta mer', 'hur fungerar', 'kan ni', 'vad kostar'],
    response: 'expand'
  }
};
```

### Semantisk trigger-detektion

```typescript
const detectSemanticTriggers = async (text: string): Promise<Trigger[]> => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-coaching",
    messages: [
      {
        role: "system",
        content: `Du analyserar säljsamtal på svenska. Identifiera:
          1. Invändningar (price, timing, trust, competition, need)
          2. Intresse (high, medium, low)
          3. Ämnen som diskuteras
          4. Möjligheter att presentera erbjudanden
          
          Svara i JSON-format.`
      },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content);
};
```

---

## Prompt Engineering

### System Prompt för Coaching

```typescript
const COACHING_SYSTEM_PROMPT = `Du är en AI-säljcoach för B3 Digital Worklife, ett svenskt IT-konsultbolag specialiserat på Microsoft-lösningar.

## Din roll
- Ge realtids-coaching till säljare under kundsamtal
- Föreslå relevanta erbjudanden baserat på kundens behov
- Hjälp hantera invändningar på ett naturligt sätt
- Referera till relevanta kundcase när det passar

## B3:s kärnkompetenser
- Microsoft 365 & Modern Workplace
- Azure Cloud & Infrastructure
- Copilot & AI-lösningar
- Power Platform & automatisering
- Security & Compliance

## Regler för coaching
1. Var kortfattad - säljaren har begränsad tid att läsa
2. Föreslå konkreta fraser säljaren kan använda
3. Anpassa tonen till svensk affärskultur (inte för pushig)
4. Prioritera att lösa kundens problem över att sälja
5. Använd aldrig teknisk jargong utan förklaring

## Output-format
Ge coaching som korta, handlingsbara tips. Max 3 tips åt gången.
Prioritera det viktigaste först.`;
```

### Prompt för invändningshantering

```typescript
const OBJECTION_PROMPT = (objection: string, context: string) => `
Kunden har just sagt: "${objection}"

Konversationskontext: ${context}

Ge ett förslag på hur säljaren kan bemöta detta på ett empatiskt och effektivt sätt.
Inkludera:
1. En kort acknowledge-fras
2. En omformulering som vänder invändningen
3. En uppföljningsfråga

Håll det naturligt och svenskt.`;
```

---

## React Component-struktur

```
src/
├── components/
│   ├── SalesCoach/
│   │   ├── SalesCoach.tsx           # Huvudcontainer
│   │   ├── TranscriptPanel.tsx      # Visar transkription
│   │   ├── CoachingPanel.tsx        # Visar coaching-tips
│   │   ├── TipCard.tsx              # Enskilt coaching-tip
│   │   ├── OfferCard.tsx            # Erbjudandekort
│   │   ├── BattlecardModal.tsx      # Konkurrensjämförelse
│   │   └── SessionControls.tsx      # Start/stopp/etc
│   │
│   ├── KnowledgeBase/
│   │   ├── KnowledgeBrowser.tsx     # Bläddra kunskapsbas
│   │   ├── DocumentViewer.tsx       # Visa dokument
│   │   └── SearchBar.tsx            # Sökning
│   │
│   └── Analytics/
│       ├── SessionSummary.tsx       # Sammanfattning
│       └── PerformanceChart.tsx     # Statistik
│
├── hooks/
│   ├── useSpeechRecognition.ts      # Azure Speech hook
│   ├── useCoaching.ts               # Coaching-logik
│   ├── useKnowledge.ts              # Kunskapsbas-sökning
│   └── useSession.ts                # Sessionshantering
│
├── services/
│   ├── speechService.ts             # Azure Speech Service
│   ├── openaiService.ts             # Azure OpenAI
│   ├── searchService.ts             # Azure AI Search
│   └── storageService.ts            # Lokal lagring
│
├── store/
│   ├── sessionStore.ts              # Zustand store
│   └── knowledgeStore.ts
│
├── types/
│   └── index.ts                     # Alla TypeScript-typer
│
└── utils/
    ├── triggers.ts                  # Trigger-detektion
    ├── formatters.ts                # Textformattering
    └── analytics.ts                 # Analysverktyg
```

---

## Dataflöde

```
1. ANVÄNDARE STARTAR SESSION
   │
   ▼
2. MIKROFON AKTIVERAS
   │
   ▼
3. AUDIO STREAMAS TILL AZURE SPEECH
   │
   ├─── Interim results (partial) ──▶ Visas i UI (grått)
   │
   └─── Final results ──▶ 4. TRIGGER-DETEKTION
                              │
                              ├─── Nyckelord matchade? ──▶ Snabb-coaching
                              │
                              └─── Var 5:e sekund ──▶ 5. SEMANTISK ANALYS
                                                          │
                                                          ▼
                                                    6. RAG-SÖKNING
                                                          │
                                                          ▼
                                                    7. GPT-4o GENERERING
                                                          │
                                                          ▼
                                                    8. COACHING VISAS I UI
```

---

## Säkerhet & Compliance

### Dataskydd

```typescript
// Ingen persondata lagras permanent
// Transkriptioner raderas efter sessionen om inte användaren sparar
const sessionCleanup = (sessionId: string) => {
  // Radera transkription
  localStorage.removeItem(`transcript_${sessionId}`);
  
  // Anonymisera analytics
  const analytics = getAnalytics(sessionId);
  saveAnonymizedAnalytics(analytics);
};
```

### GDPR-överväganden
- Användaren måste godkänna inspelning
- Kunden måste informeras om att samtalet analyseras (rekommenderas)
- Data stannar i Sverige (Azure Sweden Central)
- Ingen träning av AI-modeller på kunddata

---

## MVP-scope

### Fas 1: Basic (Vecka 1-2)
- [x] Mikrofon-input via Web Audio API
- [x] Transkribering med Azure Speech
- [x] Visa transkription i realtid
- [x] Hårdkodade trigger-ord → coaching-tips

### Fas 2: Intelligent (Vecka 3-4)
- [ ] RAG-integration med Azure AI Search
- [ ] GPT-4o för coaching-generering
- [ ] Ladda upp B3:s erbjudanden
- [ ] Invändningshantering

### Fas 3: Polish (Vecka 5-6)
- [ ] Sessionssummering
- [ ] Export av samtalsnoteringar
- [ ] Feedback-loop (betygsätt tips)
- [ ] Performance-optimering

---

## Kostnadskalkyl (Azure)

| Tjänst | Användning | Kostnad/månad |
|--------|-----------|---------------|
| Azure Speech | 10h transkribering | ~$10 |
| Azure OpenAI GPT-4o | 100k tokens | ~$30 |
| Azure OpenAI Embeddings | 1M tokens | ~$2 |
| Azure AI Search | Basic tier | ~$70 |
| **Totalt** | | **~$112/månad** |

*Baserat på 5 säljare, 2h samtal/dag, 20 dagar/månad*

---

## Nästa steg för implementation

1. **Skapa Azure-resurser**
   - Speech Service i Sweden Central
   - OpenAI Service med GPT-4o deployment
   - AI Search index

2. **Konfigurera miljövariabler**
   ```env
   AZURE_SPEECH_KEY=xxx
   AZURE_SPEECH_REGION=swedencentral
   AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
   AZURE_OPENAI_KEY=xxx
   AZURE_SEARCH_ENDPOINT=https://xxx.search.windows.net
   AZURE_SEARCH_KEY=xxx
   ```

3. **Starta Antigravity och skapa projekt**
   ```
   Prompt: "Create a React TypeScript project with Vite, 
   Tailwind CSS, and the folder structure from the spec"
   ```

4. **Implementera grundfunktioner**
   - Speech hook
   - UI-komponenter
   - Trigger-detektion

5. **Ladda kunskapsbas**
   - Konvertera B3:s dokument till JSON
   - Vektorisera och ladda till Azure AI Search
