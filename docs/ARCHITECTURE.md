# B3 Sales Coach - Arkitektur och Dokumentation

## Översikt

B3 Sales Coach är en AI-driven applikation för realtidscoachning av säljsamtal. Appen transkriberar samtal i realtid med Azure Speech Services, analyserar innehållet automatiskt, och ger säljare kontextuella tips och vägledning under samtalets gång.

### Huvudfunktioner

1. **Realtidstranskribering med Speaker Diarization** - Azure ConversationTranscriber för svensk taltranskribering med automatisk taligenkänning (seller vs customer)
2. **Real-time WebSocket Gateway** - OpenClaw-inspirerad arkitektur för <500ms coaching latency
3. **Live Samtalsanalys** - Automatisk extraktion av affärsdata under samtalets gång
4. **Intelligent Coachning** - Kontextuella tips baserade på samtalets innehåll, streamade i realtid
5. **AI-träning** - Simulerade samtal med AI-kund för säljträning
6. **Kunskapsbas** - Battlecards, invändningshantering och case studies
7. **RAG (Retrieval-Augmented Generation)** - Document processing och kontext-baserade AI-svar
8. **Kundregister** - Accounts, Contacts och Interactions för kundrelationshantering
9. **Multi-tenant** - Product-specific coaching rules och user isolation
10. **Samtalshistorik** - Sparade samtal med fullständig analys i Supabase
11. **Demo-läge** - Simulerade samtal för demonstration utan Azure-konto

## Teknisk Stack

### Frontend
- **React 18** med TypeScript
- **Vite** för build och utveckling
- **Tailwind CSS** för styling
- **Zustand** för state management
- **Lucide React** för ikoner

### Backend & Tjänster
- **Azure Speech Services** - Realtidstranskribering (svenska) med Speaker Diarization
- **Supabase** - PostgreSQL databas med Row Level Security (RLS)
- **Express.js** - REST API server (port 3001)
- **WebSocket Gateway** - Real-time coaching events (OpenClaw-inspirerad)
- **Vercel** - API hosting och deployment

### Utvecklingsverktyg
- TypeScript för typsäkerhet
- ESLint för kodkvalitet
- PostCSS för CSS-bearbetning
- Node.js för backend services

## Arkitektur

### Övergripande Arkitektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                      React Frontend (SPA)                            │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Components  │  │    Hooks     │  │    Stores    │              │
│  │              │  │              │  │   (Zustand)  │              │
│  │ - SalesCoach │  │ - Speech     │  │ - Session    │              │
│  │ - Transcript │  │ - Gateway    │  │ - Coaching   │              │
│  │ - Coaching   │  │ - Audio File │  │              │              │
│  │ - Analysis   │  │              │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
└───────┬─────────────────────┬────────────────────┬──────────────────┘
        │                     │                    │
        │ WebSocket           │ REST API          │ Direct
        │ (Real-time)         │ (HTTP)            │
        ▼                     ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐
│ Gateway Server   │  │  Express API     │  │ Azure Speech   │
│   (Port 3001)    │  │  (Port 3001)     │  │   Services     │
│                  │  │                  │  │                │
│ - WebSocket      │  │ - REST Routes    │  │ - Speech       │
│ - Session Mgmt   │  │ - File upload    │  │   Recognizer   │
│ - Coaching       │  │ - Admin APIs     │  │ - Conversation │
│   Engine         │  │ - Document       │  │   Transcriber  │
│ - Real-time      │  │   processing     │  │ - Diarization  │
│   Events         │  │                  │  │ - TTS          │
└────────┬─────────┘  └────────┬─────────┘  └────────────────┘
         │                     │
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌────────────────────┐
         │    Supabase        │
         │   PostgreSQL       │
         │                    │
         │ - Sessions         │
         │ - Segments         │
         │ - Coaching Tips    │
         │ - Analysis         │
         │ - Auth (RLS)       │
         │ - Accounts         │
         │ - Documents        │
         └────────────────────┘
```

### Komponentstruktur

```
src/
├── components/           # React-komponenter
│   ├── SalesCoach.tsx           # Huvudkomponent med Gateway integration
│   ├── TranscriptPanel.tsx      # Visar transkription med speaker labels
│   ├── CoachingPanel.tsx        # Visar real-time coaching-tips
│   ├── LiveCallAnalysisPanel.tsx # Live-analys under samtal
│   ├── AdminPanel.tsx           # Hantera erbjudanden
│   ├── CoachingAdminPanel.tsx   # Hantera coaching-regler
│   ├── ProductAdminPanel.tsx    # Hantera produkter
│   ├── DemoAdminPanel.tsx       # Hantera demo scripts
│   ├── ScenariosAdmin.tsx       # Hantera AI-scenarios
│   ├── AccountsList.tsx         # Kundregister
│   ├── HistoryPanel.tsx         # Samtalshistorik
│   ├── CallAnalysisModal.tsx    # Analysera avslutat samtal
│   ├── TrainingMode.tsx         # AI-träning med simulerad kund
│   ├── DemoMode.tsx             # Demo-läge
│   └── AuthPage.tsx             # Login/registrering
│
├── hooks/                # Custom React hooks
│   ├── useSpeechRecognition.ts     # Azure Speech med diarization
│   ├── useAudioFileTranscription.ts # Azure batch transcription
│   ├── useGateway.ts               # WebSocket Gateway hook
│   └── useRealtimeCoaching.ts      # Real-time coaching events
│
├── store/                # Zustand state management
│   ├── sessionStore.ts      # Samtalssession och analys
│   └── coachingStore.ts     # Coaching-data och regler
│
├── lib/                  # Bibliotek och utilities
│   ├── supabase.ts              # Supabase-klient
│   ├── supabaseOperations.ts    # Databas-operationer
│   ├── accountOperations.ts     # Kundregister-operationer
│   ├── gateway-client.ts        # WebSocket client SDK
│   └── gateway-types.ts         # Protocol types (shared med backend)
│
├── utils/                # Hjälpfunktioner
│   ├── triggers.ts              # Coaching-trigger-logik
│   ├── analysisExtractor.ts     # Automatisk dataextraktion
│   └── transcriptParser.ts      # Parse imported transcripts
│
├── contexts/             # React contexts
│   └── AuthContext.tsx          # Autentisering
│
└── types/                # TypeScript-typer
    ├── index.ts
    └── database.ts              # Supabase database types

gateway/                  # Backend Gateway (Node.js)
├── protocol.ts           # Message type definitions
├── server.ts             # WebSocket server
├── session-manager.ts    # Session state med compaction
├── coaching-engine.ts    # Real-time coaching logic
└── middleware/
    └── auth.ts           # JWT verification

scripts/                  # Utility scripts
└── generate-customer-audio.js  # Generate test audio för diarization
```

## Dataflöde

### 1. Samtalsflöde (Real-time med Gateway)

```
Användare startar samtal
         ↓
WebSocket ansluter till Gateway (ws://localhost:3001/ws)
         ↓
session.start skickas → Gateway skapar SessionState
         ↓
useSpeechRecognition hook aktiveras (enableDiarization: true)
         ↓
Azure ConversationTranscriber lyssnar på mikrofon
         ↓
Speaker Diarization identifierar talare (Guest-1, Guest-2)
         ↓
    ┌────────────────┴───────────────┐
    ↓                                ↓
Första talaren                   Andra talaren
→ seller (du)                    → customer
         ↓
Interim results → onInterimResult(text, speaker) → Visas i UI
         ↓
Final results → onFinalResult(text, confidence, speaker)
         ↓
session.transcript skickas till Gateway med speaker label
         ↓
    ┌────────────┴─────────────┐
    ↓                          ↓
Gateway                    Frontend
Coaching Engine            addFinalTranscript()
    ↓                          ↓
Analyserar endast          Live Analysis
customer speech            Extraction
    ↓                          ↓
Trigger matching:          Extract:
- Keywords                 - Industry
- Objections              - Products
- Competitors             - Competitors
- Sentiment               - Objections
    ↓                     - Pain points
Generate tips:            - Next steps
- coaching.tip            - Call outcome
- coaching.objection      - Probability
- analysis.sentiment         ↓
    ↓                     Show in
Stream till client       Analysis Panel
via WebSocket
    ↓
Show in
Coaching Panel
         ↓
Vid compaction (var 10:e meddelande):
- Gateway sparar till Supabase
- Komprimerar gamla meddelanden
- Behåller senaste 20
         ↓
Vid session.end:
- Spara final session state
- Spara summary
- Cleanup
```

### 2. Live-analysflöde

```
Varje nytt transkriberingssegment
         ↓
updateAnalysisWithNewText()
         ↓
extractAnalysisFromTranscript()
         ↓
Pattern matching mot:
- PRODUCT_KEYWORDS
- COMPETITOR_KEYWORDS
- OBJECTION_PATTERNS
- PAIN_POINT_PATTERNS
- NEXT_STEPS_PATTERNS
- CALL_OUTCOME_PATTERNS
- etc.
         ↓
Merge med befintlig analys
         ↓
Uppdatera liveAnalysis state
         ↓
LiveCallAnalysisPanel uppdateras
         ↓
Vid samtalsstopp → Spara till databas
```

### 3. Fil-uppladdningsflöde

```
Användare väljer WAV-fil
         ↓
useAudioFileTranscription hook
         ↓
Chunka fil i 30-sekunders segment
         ↓
För varje chunk:
  - Konvertera till WAV format
  - Skicka till Azure Speech
  - Få transcription
  - Trigga onFinalResult
         ↓
Samma flöde som real-time
(coaching + analysis)
         ↓
Progress-bar visar framsteg
         ↓
Automatisk stopp vid slutfört
```

## State Management (Zustand)

### Session Store (`sessionStore.ts`)

Hanterar samtalets livscykel och data.

**State:**
```typescript
{
  session: CallSession | null,        // Aktuellt samtal
  status: SessionStatus,              // idle/recording/paused/stopped
  segments: TranscriptSegment[],      // Transkriberade segment
  interimText: string,                // Pågående transkribering
  coachingTips: CoachingTip[],       // Aktiva tips
  dismissedTipIds: string[],         // Avfärdade tips
  conversationContext: string[],     // Senaste 10 meningarna
  liveAnalysis: Partial<CallAnalysis> // Live-analys data
}
```

**Viktiga Actions:**
- `startSession()` - Starta nytt samtal
- `stopSession()` - Avsluta och spara samtal
- `addFinalTranscript()` - Lägg till transkribering
- `processTranscriptForCoaching()` - Analysera för coaching
- `updateLiveAnalysis()` - Uppdatera live-analys

### Coaching Store (`coachingStore.ts`)

Hanterar coaching-regler och kunskapsbas.

**State:**
```typescript
{
  triggerPatterns: Record<string, TriggerPattern[]>,
  battlecards: Battlecard[],
  objectionHandlers: ObjectionHandler[],
  caseStudies: CaseStudy[]
}
```

**Synkronisering:**
- Default data i minnet
- Synkar till Supabase vid första användningen
- Laddar från Supabase vid efterföljande sessioner
- Per-användare data (via Supabase RLS)

## Pattern Matching & Extraktion

### Automatisk Extraktion (`analysisExtractor.ts`)

Systemet använder regex-patterns för att extrahera strukturerad data från transkriptionstext:

**Exempel:**

```typescript
// Produkter
PRODUCT_KEYWORDS = ['microsoft 365', 'm365', 'teams', 'copilot']
"Vi använder Teams" → productsDiscussed: ['Teams']

// Konkurrenter
COMPETITOR_KEYWORDS = ['google', 'slack', 'atea']
"Atea visade oss något" → competitorsMentioned: ['Atea']

// Nästa steg (flexibla regex med .*?)
/skicka.*?(offert|anbud)/i
"Skicka över en offert" → nextSteps: 'Skicka offert'

// Samtalets resultat
/boka(t|r)?.*?(möte|demo)/i
"Kan ni visa en demo" → callOutcome: 'Bokat möte'
```

### Coaching Triggers (`triggers.ts`)

Genererar kontextuella tips baserat på:

1. **Keyword triggers** - Specifika ord triggar tips
2. **Sentiment patterns** - Negativa/positiva uttryck
3. **Question patterns** - Frågor från kund
4. **Objection patterns** - Invändningar

**Prioritering:**
- `high` - Röd, viktig
- `medium` - Gul, rekommenderad
- `low` - Grå, informativ

## Databas Schema (Supabase)

### `call_sessions`

Huvudtabell för samtal.

```sql
CREATE TABLE call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  customer_name TEXT,
  customer_company TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_role TEXT,
  duration_seconds INTEGER,
  full_transcript TEXT,

  -- Analys-fält
  is_analyzed BOOLEAN DEFAULT FALSE,
  industry TEXT,
  company_size TEXT,
  call_purpose TEXT,
  call_outcome TEXT,
  interest_level TEXT,
  estimated_value INTEGER,
  decision_timeframe TEXT,
  probability INTEGER,
  products_discussed TEXT[],
  competitors_mentioned TEXT[],
  objections_raised TEXT[],
  pain_points TEXT[],
  next_steps TEXT,
  notes TEXT,
  ai_summary TEXT,
  analyzed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `transcript_segments`

Enskilda transkriberingssegment.

```sql
CREATE TABLE transcript_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  text TEXT NOT NULL,
  speaker TEXT,
  timestamp_ms BIGINT,
  confidence DECIMAL,
  is_final BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `coaching_tips`

Coaching-tips som visats under samtal.

```sql
CREATE TABLE coaching_tips (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  tip_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL,
  related_content_id TEXT,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Coaching-data tabeller

Per-användare och per-produkt konfiguration:

**`products`** - Produkter för multi-tenant coaching
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`trigger_patterns`** - Custom trigger-patterns
```sql
CREATE TABLE trigger_patterns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  keywords TEXT[] NOT NULL,
  tip_type TEXT,
  title TEXT,
  content TEXT,
  priority TEXT
);
```

**`battlecards`** - Produkt-/konkurrensinformation
```sql
CREATE TABLE battlecards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  product_name TEXT,
  competitor_name TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  talking_points TEXT[]
);
```

**`objection_handlers`** - Invändningshantering
**`case_studies`** - Kundfall
**`ai_training_scenarios`** - AI customer scenarios för träningsläge

### Kundregister tabeller

**`accounts`** - Företag/organisationer
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`contacts`** - Kontaktpersoner
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  is_primary BOOLEAN DEFAULT FALSE
);
```

**`interactions`** - Interaktioner med kunder
```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  contact_id UUID REFERENCES contacts(id),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  subject TEXT,
  notes TEXT,
  interaction_date TIMESTAMPTZ DEFAULT NOW()
);
```

**`questionnaires`** - Frågeformulär svar
```sql
CREATE TABLE questionnaires (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  user_id UUID REFERENCES auth.users(id),
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Document Processing (RAG)

**`documents`** - Uppladdade dokument
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  name TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`document_embeddings`** - Vector embeddings för semantic search
```sql
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  user_id UUID REFERENCES auth.users(id),
  content TEXT,
  embedding vector(1536),  -- OpenAI ada-002 dimensionality
  metadata JSONB
);

-- Vector similarity search index
CREATE INDEX ON document_embeddings USING ivfflat (embedding vector_cosine_ops);
```

**Alla har RLS:**
```sql
-- Exempel RLS policy
CREATE POLICY "Users can manage their own data"
ON trigger_patterns
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their accounts"
ON accounts
FOR SELECT
USING (auth.uid() = user_id);
```

## Autentisering

### Flow

```
1. Användare kommer till app
         ↓
2. AuthGuard kollar Supabase session
         ↓
   Inloggad?
   ├─ Ja → Visa SalesCoach
   └─ Nej → Visa AuthPage
         ↓
3. Login/Register via Supabase Auth
         ↓
4. Session skapas
         ↓
5. RLS policies aktiveras automatiskt
         ↓
6. Användare ser endast sin egen data
```

### AuthContext

Tillhandahåller:
- `user` - Aktuell användare
- `signIn()` - Logga in
- `signUp()` - Registrera
- `signOut()` - Logga ut
- `loading` - Laddningsstatus

## Nyckelfunktioner i Detalj

### 1. Real-time Transkribering med Speaker Diarization

**Hook:** `useSpeechRecognition.ts`

```typescript
const {
  isListening,
  startListening,
  stopListening,
  interimTranscript
} = useSpeechRecognition({
  subscriptionKey: AZURE_KEY,
  region: 'swedencentral',
  language: 'sv-SE',
  enableDiarization: true,  // ⚡ Aktiverar speaker diarization
  onInterimResult: (text, speaker) => { /* Visa pågående med speaker */ },
  onFinalResult: (text, confidence, speaker) => { /* Spara med speaker label */ }
});
```

**Funktioner:**
- Kontinuerlig igenkänning
- **Speaker Diarization** - Automatisk taligenkänning (Azure ConversationTranscriber)
- Speaker mapping: Guest-1 → seller, Guest-2 → customer
- Interim results för realtidsfeedback med speaker labels
- Automatisk diktering-läge
- TrueText post-processing
- Confidence scoring

**Speaker Diarization:**
```typescript
// I useSpeechRecognition.ts
const transcriber = new SpeechSDK.ConversationTranscriber(speechConfig, audioConfig);

transcriber.transcribed = (_, event) => {
  const speakerId = event.result.speakerId;  // "Guest-1", "Guest-2", etc.
  const speaker = mapSpeaker(speakerId);     // 'seller' eller 'customer'
  onFinalResult?.(text, confidence, speaker);
};

// Första talaren = seller (du), andra = customer
const mapSpeaker = (speakerId: string): 'seller' | 'customer' => {
  if (!speakerMap.has(speakerId)) {
    const role = speakerMap.size === 0 ? 'seller' : 'customer';
    speakerMap.set(speakerId, role);
  }
  return speakerMap.get(speakerId)!;
};
```

**Testing:**
- Generera simulerad kundröst: `npm run generate:customer-audio`
- Spela upp `customer-simulation.mp3` i högtalare
- Prata till mikrofonen under pauserna
- Se dokumentation: [TESTING_SPEAKER_DIARIZATION.md](../TESTING_SPEAKER_DIARIZATION.md)

### 2. WebSocket Gateway (Real-time Coaching)

**Hook:** `useGateway.ts`

```typescript
const gateway = useGateway({
  url: 'ws://localhost:3001/ws',
  authToken: user.token
});

// Lyssna på real-time coaching events
gateway.on('coaching.tip', (payload) => {
  addCoachingTip(payload.tip);
});

gateway.on('analysis.sentiment', (payload) => {
  updateSentiment(payload.sentiment, payload.interestLevel);
});

// Skicka transcript till Gateway
gateway.send({
  type: 'session.transcript',
  payload: {
    text: transcript,
    isFinal: true,
    speaker: 'customer',
    confidence: 0.95
  }
});
```

**Protocol Messages:**

```typescript
// Client → Server
interface SessionStartMessage {
  type: 'session.start';
  payload: {
    customer?: string;
    mode: 'live_call' | 'training';
  };
}

interface TranscriptMessage {
  type: 'session.transcript';
  payload: {
    text: string;
    isFinal: boolean;
    speaker: 'seller' | 'customer' | 'unknown';
    confidence: number;
  };
}

interface SessionEndMessage {
  type: 'session.end';
  payload: {
    sessionId: string;
  };
}

// Server → Client
interface CoachingTipEvent {
  type: 'coaching.tip';
  payload: {
    tip: CoachingTip;
  };
}

interface SentimentAnalysisEvent {
  type: 'analysis.sentiment';
  payload: {
    sentiment: 'positive' | 'neutral' | 'negative';
    interestLevel: 'low' | 'medium' | 'high' | 'very_high';
  };
}

interface ObjectionDetectedEvent {
  type: 'coaching.objection';
  payload: {
    objection: ObjectionHandler;
  };
}
```

**Gateway Architecture:**

```
WebSocket Client (Browser)
         ↓
Gateway Server (server.mjs)
         ↓
    ┌────┴─────┐
    ↓          ↓
SessionManager  CoachingEngine
    ↓               ↓
- In-memory    - Analyze transcripts
  state        - Trigger matching
- Compaction   - Sentiment analysis
- DB sync      - Real-time events
```

**Session Compaction:**
- Komprimerar var 10:e meddelande
- Behåller senaste 20 meddelanden
- Sammanfattar äldre meddelanden
- Sparar till Supabase periodiskt
- Minskar minnesanvändning

**Fördelar:**
- ⚡ 2x snabbare coaching tips (500ms vs 1-2s)
- 🔄 Real-time streaming av events
- 💾 Automatisk session persistence
- 🎯 Server-side coaching logic
- 📊 Centraliserad analytics

### 3. Batch Transkribering

**Hook:** `useAudioFileTranscription.ts`

```typescript
const {
  transcribeFile,
  isProcessing,
  progress
} = useAudioFileTranscription({
  subscriptionKey: AZURE_KEY,
  region: 'swedencentral',
  onFinalResult: (text) => { /* Spara */ },
  onComplete: () => { /* Klar */ }
});
```

**Funktioner:**
- WAV-filstöd
- 30-sekunders chunking
- Progress tracking
- Samma analys-pipeline som real-time

### 3. Live Samtalsanalys

**Automatisk extraktion under samtalets gång:**

```typescript
// Vid varje nytt segment
addFinalTranscript(text, confidence) {
  // ... spara segment ...

  // Uppdatera live-analys
  const updatedAnalysis = updateAnalysisWithNewText(
    currentAnalysis,
    text
  );

  set({ liveAnalysis: updatedAnalysis });
}
```

**Extraherar:**
- ✓ Bransch (via keywords)
- ✓ Företagsstorlek (via regex med siffror)
- ✓ Produkter diskuterade
- ✓ Konkurrenter nämnda
- ✓ Invändningar
- ✓ Pain points
- ✓ Intressenivå
- ✓ Beslutstidsram
- ✓ Samtalets resultat
- ✓ Nästa steg (ackumuleras)
- ✓ Sannolikhet (dynamisk baserat på signaler)

**Fördel:** Säljaren ser analysen byggas upp i realtid och kan anpassa sitt samtal.

### 4. AI Training Mode

**Simulerade samtal med AI-kund för säljträning:**

```typescript
// TrainingMode.tsx
const handleStartTraining = async (scenarioId: string) => {
  // Starta session i training mode
  gateway.send({
    type: 'session.start',
    payload: {
      mode: 'training',
      scenarioId
    }
  });

  // När du pratar (seller) → skicka till Gateway
  // Gateway genererar AI customer reply baserat på:
  // - Scenario personality
  // - Conversation context
  // - Your response quality
};
```

**Scenarios:**
- Olika kundpersonligheter (Skeptisk, Entusiastisk, Budget-fokuserad, etc.)
- Bransch-specifika scenarios
- Objection-handling practice
- ROI-diskussioner

**AI Customer Behavior:**
```typescript
// Från ai_training_scenarios tabell
{
  name: "Skeptisk IT-chef",
  personality: "Kritisk, ifrågasätter allt, fokuserar på risker",
  pain_points: ["Legacy system", "Säkerhet", "Integration"],
  objections: ["För dyrt", "Vi har redan lösning", "Behöver bevisa ROI"],
  decision_criteria: ["Säkerhet", "Total cost of ownership", "Support"]
}
```

**Real-time Coaching under träning:**
- Sentiment analysis av dina svar
- Förslag på bättre formuleringar
- Detection av missade möjligheter
- Score på conversational flow

**Fördelar:**
- ⚡ < 1s svarstid (vs 2-3s med REST)
- 🎯 Realistiska samtal
- 📊 Immediate feedback
- 🔄 Unlimited practice

### 5. Demo-läge

För att kunna demonstrera utan Azure-konto finns `useMockSpeechRecognition`:

```typescript
const mockPhrases = [
  "Hej! Jag heter Anna Svensson...",
  "Vi är ett medelstort byggföretag...",
  // ... 18 realistiska fraser
];
```

**Simulerar:**
- Ord-för-ord transkribering
- Interim + final results
- Varierande pauser (4-8 sek)
- Realistiskt säljsamtal
- Triggar alla analysfunktioner

**Aktivering:**
```bash
# Tvinga demo-läge
localStorage.setItem('forceDemoMode', 'true')
```

### 6. Coaching-system (Server-side via Gateway)

**Real-time trigger-baserat system:**

```typescript
// gateway/coaching-engine.ts
class CoachingEngine {
  analyzeTranscript(text: string, speaker: Speaker) {
    // Analysera endast customer speech
    if (speaker === 'seller') return;

    // Trigger matching
    const tips = this.matchTriggers(text);
    const objections = this.detectObjections(text);
    const sentiment = this.analyzeSentiment(text);

    // Stream events till client
    this.emit('coaching.tip', { tip });
    this.emit('coaching.objection', { objection });
    this.emit('analysis.sentiment', { sentiment, interestLevel });
  }
}
```

**Trigger-exempel:**
```typescript
{
  keywords: ['pris', 'kostnad', 'kostar', 'för dyrt'],
  tips: [
    {
      type: 'objection',
      title: 'Invändning - Pris',
      content: 'Fokusera på värde, inte pris. Visa ROI-kalkyl...',
      priority: 'high',
      relatedContent: 'roi_calculator_battlecard_id'
    }
  ]
}
```

**Flöde (Real-time via WebSocket):**
```
1. Customer pratar: "Det är för dyrt för oss"
         ↓
2. Azure ConversationTranscriber → speaker: 'customer'
         ↓
3. session.transcript skickas till Gateway
         ↓
4. CoachingEngine.analyzeTranscript()
         ↓
5. Match trigger: ['för dyrt'] → Invändning - Pris
         ↓
6. Generate tip + fetch related battlecard
         ↓
7. Stream coaching.objection event (< 500ms)
         ↓
8. Client tar emot och visar i CoachingPanel
         ↓
9. Gateway sparar till DB (async, påverkar inte latency)
```

**Event Types:**
- `coaching.tip` - Allmänt råd baserat på context
- `coaching.objection` - Invändningshantering
- `coaching.battlecard` - Produkt/konkurrentinfo
- `coaching.case_study` - Relevant kundfall
- `analysis.sentiment` - Sentiment + interest level
- `analysis.silence` - Silence detection (>20s)

**Prioritering:**
- `high` - Röd, kritisk (invändningar, konkurrenter)
- `medium` - Gul, viktig (produkt-diskussioner)
- `low` - Grå, informativ (tips, förslag)

**Performance:**
- Trigger matching: ~10ms
- OpenAI sentiment analysis: ~200ms (parallel)
- Total latency: < 500ms (vs 1-2s med REST)

## Deployment

### Utveckling (Lokal)

```bash
# Terminal 1: Backend + Gateway
npm run dev:api
# → Express API på http://localhost:3001
# → WebSocket Gateway på ws://localhost:3001/ws

# Terminal 2: Frontend
npm run dev
# → Vite dev server på http://localhost:5173

# Full stack i en terminal
npm run dev:full
```

### Production

**Frontend (Vercel/Netlify):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Backend Gateway (Railway/Render/DigitalOcean):**
⚠️ **VIKTIGT:** Vercel stödjer INTE långlivade WebSocket-anslutningar i Serverless Functions.

**Rekommenderad arkitektur:**
```
Frontend (Vercel)
  ↓
  ├→ REST API (Vercel Functions)
  │   - File upload
  │   - Admin endpoints
  │   - Document processing
  │
  └→ WebSocket Gateway (Railway/Render)
      - Real-time coaching
      - Session management
      - Live transcription
```

**Gateway Deployment (Railway):**
```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.mjs",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Environment Variables:**

**Frontend (.env.production):**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_AZURE_SPEECH_KEY=xxx
VITE_AZURE_SPEECH_REGION=swedencentral
VITE_GATEWAY_URL=wss://gateway.salescoach.app/ws  # Production Gateway URL
VITE_API_URL=https://api.salescoach.vercel.app     # Production API URL
```

**Backend Gateway (.env):**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx  # Service key för server-side access
OPENAI_API_KEY=xxx
PORT=3001
```

### CI/CD

```
GitHub push to main
      ↓
   ┌──┴───┐
   ↓      ↓
Vercel    Railway
Frontend  Gateway
   ↓      ↓
Build     Deploy
   ↓      ↓
Deploy to Production
   ↓
Live på:
- Frontend: https://salescoach.vercel.app
- Gateway: wss://salescoach.railway.app/ws
- API: https://api.salescoach.vercel.app
```

**Kostnader (uppskattade):**
- Vercel: Free tier (hobby project)
- Railway Gateway: ~$5-10/månad (shared server)
- Supabase: Free tier
- Azure Speech: ~$1/timme efter 5h free tier
**Total: ~$5-10/månad + Azure usage**

## Utveckling

### Setup

```bash
# 1. Klona repo
git clone https://github.com/olalowing-oss/sales-coach.git

# 2. Installera dependencies
npm install

# 3. Konfigurera .env
cp .env.example .env
# Fyll i Supabase credentials + Azure Speech Key

# 4. Kör dev servers
npm run dev:full    # Startar både frontend och backend+gateway

# ELLER kör separata terminaler:
# Terminal 1:
npm run dev:api     # Backend + Gateway (port 3001)

# Terminal 2:
npm run dev         # Frontend (port 5173)
```

**Environment Variables (.env):**
```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx  # För backend

# Azure Speech Services
VITE_AZURE_SPEECH_KEY=xxx
VITE_AZURE_SPEECH_REGION=swedencentral

# OpenAI (för RAG och AI customer)
OPENAI_API_KEY=sk-xxx

# Gateway (development)
VITE_GATEWAY_URL=ws://localhost:3001/ws
VITE_API_URL=http://localhost:3001
```

### Struktur för ny funktion

#### Frontend Feature:
1. **Skapa typ i** `src/types/index.ts`
2. **Lägg till state i** `sessionStore.ts` eller `coachingStore.ts`
3. **Skapa komponent i** `src/components/`
4. **Lägg till databas-operation i** `supabaseOperations.ts`
5. **Uppdatera UI i** `SalesCoach.tsx`

#### Backend/Gateway Feature:
1. **Definiera protocol message i** `gateway/protocol.ts`
2. **Uppdatera** `gateway/server.ts` för message handling
3. **Lägg till logik i** `gateway/coaching-engine.ts` eller `gateway/session-manager.ts`
4. **Synka types med** `src/lib/gateway-types.ts`
5. **Testa med** WebSocket client i browser console

#### Database Schema Change:
1. **Skapa migration i Supabase Dashboard**
2. **Uppdatera** `src/types/database.ts`
3. **Lägg till RLS policies**
4. **Uppdatera** `supabaseOperations.ts`
5. **Testa med** olika användare

### Testing

**Manual Testing:**
```bash
# 1. Test Speaker Diarization
npm run generate:customer-audio
open customer-simulation.mp3
# Spela upp och prata samtidigt

# 2. Test Gateway WebSocket
# Browser console:
const ws = new WebSocket('ws://localhost:3001/ws?token=YOUR_JWT');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({
  type: 'session.start',
  payload: { mode: 'live_call' }
}));

# 3. Test RAG
# Ladda upp dokument via ProductAdminPanel
# Fråga AI-kund i TrainingMode
```

**Debugging:**
```bash
# Backend logs
# Terminal med npm run dev:api visar:
# - Gateway connections
# - Session management
# - Coaching events
# - Database errors

# Frontend logs
# Browser DevTools Console:
# - WebSocket messages
# - Speaker diarization
# - State updates
```

### Best Practices

**TypeScript:**
- Använd TypeScript överallt (frontend + backend)
- Shared types mellan frontend och Gateway i `gateway-types.ts`
- Strict mode enabled

**State Management:**
- Zustand för global state (sessions, coaching)
- React `useState` för UI-state (modals, forms)
- WebSocket state hanteras av `useGateway` hook

**Databas:**
- Alltid använd RLS policies
- Service Key endast i backend
- Test med olika användare för att verifiera RLS

**Error Handling:**
- Try-catch runt async operations
- WebSocket reconnection logic
- Fallback till REST om Gateway offline
- User-friendly error messages

**Performance:**
- Memoize tunga beräkningar med `useMemo`
- Debounce user input
- Session compaction i Gateway (var 10:e meddelande)
- Lazy loading för stora komponenter

**Accessibility:**
- Semantisk HTML
- ARIA-labels för screen readers
- Keyboard navigation
- Color contrast (WCAG AA)

**Security:**
- Aldrig expona Service Key i frontend
- JWT verification på alla WebSocket messages
- Sanitize user input
- RLS på alla databas-operationer

## Kostnader

### Azure Speech Services

**Free Tier:**
- 5 timmar audio per månad gratis
- Real-time transcription ingår
- Inget extra för live-funktioner

**Paid:**
- ~$1 per timme efter free tier
- Batch samma pris som real-time

### Supabase

**Free Tier:**
- 500 MB databas
- 2 GB bandwidth
- 50,000 monthly active users
- Unlimited API requests

**Paid:** Från $25/månad för mer resurser

### Netlify

**Free Tier:**
- 100 GB bandwidth
- Automatiska builds
- HTTPS

## Säkerhet

### Row Level Security (RLS)

Alla tabeller har RLS aktiverat:

```sql
-- Användare ser endast sin egen data
CREATE POLICY "Users access own data"
ON call_sessions
FOR ALL
USING (auth.uid() = user_id);

-- Multi-tenant: Users ser endast data för sina produkter
CREATE POLICY "Users access own product data"
ON battlecards
FOR ALL
USING (
  auth.uid() = user_id OR
  product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
);
```

### WebSocket Autentisering

**Gateway använder JWT-baserad autentisering:**

```typescript
// gateway/middleware/auth.ts
export function authenticateWebSocket(ws: WebSocket, request: IncomingMessage) {
  const token = extractTokenFromUrl(request.url);

  if (!token) {
    ws.close(1008, 'Authentication required');
    return null;
  }

  // Verify Supabase JWT
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    ws.close(1008, 'Invalid token');
    return null;
  }

  return data.user;
}
```

**Client-side:**
```typescript
// Hämta access token från Supabase session
const { data: { session } } = await supabase.auth.getSession();
const wsUrl = `ws://localhost:3001/ws?token=${session.access_token}`;

const gateway = new GatewayClient(wsUrl);
```

**Säkerhet:**
- ✅ JWT verification för varje WebSocket connection
- ✅ User ID extraheras från JWT
- ✅ RLS policies appliceras på databas-operationer
- ✅ Session isolation (användare ser endast sin data)
- ✅ Token expiration (standard Supabase 1h, auto-refresh)

### Environment Variables

- **Aldrig** committa nycklar till git
- Använd `.env` lokalt
- Sätt environment variables i Vercel/Railway

### Anon Key vs Service Key

- **Anon Key** - För frontend, begränsad access via RLS
- **Service Key** - Endast för backend (Gateway), full access men respekterar RLS i kod

### CORS och WebSocket Origin

**Gateway server konfiguration:**
```javascript
// server.mjs
const allowedOrigins = [
  'http://localhost:5173',
  'https://salescoach.vercel.app'
];

wss.on('connection', (ws, request) => {
  const origin = request.headers.origin;
  if (!allowedOrigins.includes(origin)) {
    ws.close(1008, 'Origin not allowed');
    return;
  }
  // ... fortsätt med autentisering
});
```

## Implementerade funktioner (2026)

### ✅ Speaker Diarization
- Azure ConversationTranscriber för automatisk taligenkänning
- Mappar Guest-1 → seller, Guest-2 → customer
- Real-time speaker labels i transcript
- Test-verktyg för simulerad kund (MP3 audio generation)
- Se: [SPEAKER_DIARIZATION.md](../SPEAKER_DIARIZATION.md)

### ✅ WebSocket Gateway
- OpenClaw-inspirerad real-time arkitektur
- Session management med compaction
- Server-side coaching engine
- 500ms latency för coaching tips (vs 1-2s tidigare)
- WebSocket protocol för event streaming
- Se: [Merry Floating Clarke Plan](../.claude/plans/merry-floating-clarke.md)

### ✅ RAG (Retrieval-Augmented Generation)
- Document processing och embedding
- Vector search i Supabase
- Kontext-baserade AI-svar
- Integration med OpenAI

### ✅ Multi-tenant Coaching
- Product-specific coaching rules
- User isolation
- Per-product battlecards och objections

### ✅ Kundregister
- Accounts och Contacts tabeller
- Automatic account creation från samtal
- Questionnaire auto-fill från tidigare samtal
- Se: [KUNDREGISTER_DESIGN.md](../KUNDREGISTER_DESIGN.md)

## Framtida Förbättringar

### Planerade funktioner

1. **AI-Summary** - GPT-baserad sammanfattning av samtal
2. **Team Analytics** - Aggregerad statistik för säljteam
3. **Call Recording** - Spara ljudfil tillsammans med transkription
4. **Export to CRM** - Integration med Salesforce/HubSpot
5. **Real-time Collaboration** - Flera coaches kan följa samma samtal
6. **Mobile App** - React Native version
7. **Teams Bot Integration** - Direktintegration med Microsoft Teams
8. **Multi-speaker Support** - Hantera >2 talare (gruppsamtal)

### Tekniska förbättringar

- **Redis** för caching av coaching-regler
- **Elasticsearch** för fulltext-sökning i historik
- **Docker** för lokal utveckling
- **E2E tests** med Playwright
- **Storybook** för komponent-dokumentation
- **Production Gateway Deployment** - Railway/Render för WebSocket hosting

## Support & Underhåll

### Logs

- **Frontend errors:** Browser console
- **Supabase errors:** Supabase dashboard logs
- **Azure errors:** Azure portal metrics

### Monitoring

- Netlify Analytics för traffic
- Supabase Dashboard för databas-performance
- Azure Dashboard för Speech API usage

### Backup

- Supabase gör automatiska backups
- Export databas via Supabase CLI: `supabase db dump`

## Licens

Proprietär - B3 Consulting

## Kontakt

För frågor om arkitekturen, kontakta utvecklingsteamet.

## Relaterad Dokumentation

- **[SPEAKER_DIARIZATION.md](../SPEAKER_DIARIZATION.md)** - Automatisk taligenkänning implementation
- **[TESTING_SPEAKER_DIARIZATION.md](../TESTING_SPEAKER_DIARIZATION.md)** - Test-guide för speaker diarization
- **[Merry Floating Clarke Plan](../.claude/plans/merry-floating-clarke.md)** - OpenClaw Gateway implementation plan
- **[KUNDREGISTER_DESIGN.md](../KUNDREGISTER_DESIGN.md)** - Customer register design
- **[CUSTOMER_REGISTER_IMPLEMENTATION.md](../CUSTOMER_REGISTER_IMPLEMENTATION.md)** - Customer register implementation
- **[AI_QUESTIONNAIRE_AUTOFILL.md](../AI_QUESTIONNAIRE_AUTOFILL.md)** - Questionnaire auto-fill feature
- **[MULTI-TENANT-COACHING-IMPLEMENTATION.md](../MULTI-TENANT-COACHING-IMPLEMENTATION.md)** - Multi-tenant coaching

## Scripts

```bash
# Development
npm run dev              # Frontend only
npm run dev:api          # Backend + Gateway
npm run dev:full         # Full stack (both servers)

# Audio Generation (for testing diarization)
npm run generate:customer-audio  # Generate MP3 test audio

# Build
npm run build           # Production build
npm run preview         # Preview production build
```

---

*Dokumentation uppdaterad: 2026-02-02*
*Inkluderar: Speaker Diarization, WebSocket Gateway, RAG, Multi-tenant, Kundregister*
