# B3 Sales Coach - Arkitektur och Dokumentation

## Översikt

B3 Sales Coach är en AI-driven applikation för realtidscoachning av säljsamtal. Appen transkriberar samtal i realtid med Azure Speech Services, analyserar innehållet automatiskt, och ger säljare kontextuella tips och vägledning under samtalets gång.

### Huvudfunktioner

1. **Realtidstranskribering** - Azure Speech Services för svensk taltranskribering
2. **Live Samtalsanalys** - Automatisk extraktion av affärsdata under samtalets gång
3. **Intelligent Coachning** - Kontextuella tips baserade på samtalets innehåll
4. **Kunskapsbas** - Battlecards, invändningshantering och case studies
5. **Samtalshistorik** - Sparade samtal med fullständig analys i Supabase
6. **Demo-läge** - Simulerade samtal för demonstration utan Azure-konto

## Teknisk Stack

### Frontend
- **React 18** med TypeScript
- **Vite** för build och utveckling
- **Tailwind CSS** för styling
- **Zustand** för state management
- **Lucide React** för ikoner

### Backend & Tjänster
- **Azure Speech Services** - Realtidstranskribering (svenska)
- **Supabase** - PostgreSQL databas med Row Level Security (RLS)
- **Netlify** - Hosting och deployment

### Utvecklingsverktyg
- TypeScript för typsäkerhet
- ESLint för kodkvalitet
- PostCSS för CSS-bearbetning

## Arkitektur

### Övergripande Arkitektur

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (SPA)                     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components  │  │    Hooks     │  │    Stores    │      │
│  │              │  │              │  │   (Zustand)  │      │
│  │ - SalesCoach │  │ - Speech     │  │ - Session    │      │
│  │ - Transcript │  │ - Audio File │  │ - Coaching   │      │
│  │ - Coaching   │  │              │  │              │      │
│  │ - Analysis   │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└───────────┬───────────────────────────────┬─────────────────┘
            │                               │
            ▼                               ▼
   ┌────────────────┐           ┌────────────────────┐
   │ Azure Speech   │           │    Supabase        │
   │   Services     │           │   PostgreSQL       │
   │                │           │                    │
   │ - Real-time    │           │ - Sessions         │
   │   recognition  │           │ - Segments         │
   │ - Batch        │           │ - Coaching Tips    │
   │   transcription│           │ - Analysis         │
   │ - Swedish (sv) │           │ - Auth (RLS)       │
   └────────────────┘           └────────────────────┘
```

### Komponentstruktur

```
src/
├── components/           # React-komponenter
│   ├── SalesCoach.tsx           # Huvudkomponent
│   ├── TranscriptPanel.tsx      # Visar transkription
│   ├── CoachingPanel.tsx        # Visar coaching-tips
│   ├── LiveCallAnalysisPanel.tsx # Live-analys under samtal
│   ├── AdminPanel.tsx           # Hantera erbjudanden
│   ├── CoachingAdminPanel.tsx   # Hantera coaching-regler
│   ├── HistoryPanel.tsx         # Samtalshistorik
│   ├── CallAnalysisModal.tsx    # Analysera avslutat samtal
│   └── AuthPage.tsx             # Login/registrering
│
├── hooks/                # Custom React hooks
│   ├── useSpeechRecognition.ts     # Azure Speech real-time
│   └── useAudioFileTranscription.ts # Azure batch transcription
│
├── store/                # Zustand state management
│   ├── sessionStore.ts      # Samtalssession och analys
│   └── coachingStore.ts     # Coaching-data och regler
│
├── lib/                  # Bibliotek och utilities
│   ├── supabase.ts              # Supabase-klient
│   └── supabaseOperations.ts    # Databas-operationer
│
├── utils/                # Hjälpfunktioner
│   ├── triggers.ts              # Coaching-trigger-logik
│   └── analysisExtractor.ts     # Automatisk dataextraktion
│
├── contexts/             # React contexts
│   └── AuthContext.tsx          # Autentisering
│
└── types/                # TypeScript-typer
    └── index.ts
```

## Dataflöde

### 1. Samtalsflöde (Real-time)

```
Användare startar samtal
         ↓
useSpeechRecognition hook aktiveras
         ↓
Azure Speech Services lyssnar på mikrofon
         ↓
Interim results → addInterimTranscript() → Visas i UI
         ↓
Final results → addFinalTranscript()
         ↓
    ┌────┴─────┐
    ↓          ↓
Coaching    Live Analysis
Analysis    Extraction
    ↓          ↓
Trigger     Extract:
patterns    - Industry
match       - Products
    ↓       - Competitors
Generate    - Objections
tips        - Pain points
    ↓       - Next steps
Show in     - Call outcome
Coaching    - Probability
Panel          ↓
            Show in
            Analysis Panel
         ↓
Save to Supabase:
- Session
- Segments
- Tips
- Analysis
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

Per-användare konfiguration:

- `trigger_patterns` - Custom trigger-patterns
- `battlecards` - Produkt-/konkurrensinformation
- `objection_handlers` - Invändningshantering
- `case_studies` - Kundfall

**Alla har RLS:**
```sql
-- Exempel RLS policy
CREATE POLICY "Users can manage their own data"
ON trigger_patterns
FOR ALL
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

### 1. Real-time Transkribering

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
  onInterimResult: (text) => { /* Visa pågående */ },
  onFinalResult: (text, confidence) => { /* Spara */ }
});
```

**Funktioner:**
- Kontinuerlig igenkänning
- Interim results för realtidsfeedback
- Automatisk diktering-läge
- TrueText post-processing
- Confidence scoring

### 2. Batch Transkribering

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

### 4. Demo-läge

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

### 5. Coaching-system

**Trigger-baserat:**

```typescript
// Exempel trigger
{
  keywords: ['pris', 'kostnad', 'kostar'],
  tips: [
    {
      type: 'battlecard',
      title: 'Prisdiskussion',
      content: 'Fokusera på värde, inte pris...',
      priority: 'high'
    }
  ]
}
```

**Flöde:**
1. Nytt segment transkriberas
2. `processTranscriptForCoaching()` körs
3. Matchar mot alla trigger-patterns
4. Genererar nya tips (max 5 aktiva)
5. Sparar till databas
6. Visar i CoachingPanel

**Typer:**
- `battlecard` - Produkt/konkurrentinfo
- `objection` - Invändningshantering
- `case_study` - Kundfall
- `tip` - Allmänt råd
- `warning` - Varning

## Deployment

### Netlify

**Build settings:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Environment variables:**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_AZURE_SPEECH_KEY=xxx (optional)
VITE_AZURE_SPEECH_REGION=swedencentral
```

### CI/CD

```
GitHub push to main
      ↓
Netlify detects push
      ↓
npm run build
      ↓
Deploy to production
      ↓
Live på sales-coach.netlify.app
```

## Utveckling

### Setup

```bash
# 1. Klona repo
git clone https://github.com/olalowing-oss/sales-coach.git

# 2. Installera dependencies
npm install

# 3. Konfigurera .env
cp .env.example .env
# Fyll i Supabase credentials

# 4. Kör dev server
npm run dev
```

### Struktur för ny funktion

1. **Skapa typ i** `src/types/index.ts`
2. **Lägg till state i** `sessionStore.ts` eller `coachingStore.ts`
3. **Skapa komponent i** `src/components/`
4. **Lägg till databas-operation i** `supabaseOperations.ts`
5. **Uppdatera UI i** `SalesCoach.tsx`

### Best Practices

- **Typsäkerhet:** Använd TypeScript överallt
- **State:** Zustand för global state, lokala `useState` för UI-state
- **Databas:** Alltid använd RLS policies
- **Error handling:** Try-catch runt async operations
- **Performance:** Memoize tunga beräkningar med `useMemo`
- **Accessibility:** Använd semantisk HTML och ARIA-labels

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
```

### Environment Variables

- **Aldrig** committa nycklar till git
- Använd `.env` lokalt
- Sätt environment variables i Netlify

### Anon Key vs Service Key

- **Anon Key** - För frontend, begränsad access via RLS
- **Service Key** - Endast för backend, full access

## Framtida Förbättringar

### Planerade funktioner

1. **Speaker Diarization** - Identifiera vem som pratar (säljare vs kund)
2. **AI-Summary** - GPT-baserad sammanfattning av samtal
3. **Team Analytics** - Aggregerad statistik för säljteam
4. **Call Recording** - Spara ljudfil tillsammans med transkription
5. **Export to CRM** - Integration med Salesforce/HubSpot
6. **Real-time Collaboration** - Flera coaches kan följa samma samtal
7. **Mobile App** - React Native version

### Tekniska förbättringar

- **WebSocket** för real-time collaboration
- **Redis** för caching av coaching-regler
- **Elasticsearch** för fulltext-sökning i historik
- **Docker** för lokal utveckling
- **E2E tests** med Playwright
- **Storybook** för komponent-dokumentation

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

---

*Dokumentation uppdaterad: 2026-01-28*
