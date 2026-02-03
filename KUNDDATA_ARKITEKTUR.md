# Kunddatainsamling - Nuvarande Arkitektur

## 📊 Översikt

Systemet samlar in kunddata från **två källor** under ett samtal:

### 1. **Live AI-analys** (Automatisk)
- Körs kontinuerligt under samtalet
- Extraherar grundläggande företagsinfo från transkriptet
- Sparas i `call_sessions` tabellen

### 2. **Kundfrågeformulär** (Manuell + AI Auto-fill)
- 25 strukturerade frågor i 5 kategorier
- Fylls i manuellt av säljare eller automatiskt av AI
- **⚠️ SPARAS INTE I DATABASEN ÄNNU** - bara i frontend state!

---

## 🗄️ Databas-schema (Nuvarande)

### Tabell: `call_sessions`

Huvudtabell som sparar alla samtalsuppgifter:

```sql
CREATE TABLE call_sessions (
  -- Grundläggande info
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT, -- 'idle' | 'recording' | 'paused' | 'stopped'
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Kundinfo (från customer-objektet)
  customer_name TEXT,
  customer_company TEXT,
  customer_role TEXT,

  -- Transkript
  full_transcript TEXT,
  duration_seconds INT,

  -- AI-analys (live under samtalet)
  industry TEXT,
  company_size TEXT, -- '1-50' | '51-200' | '201-1000' | '1000+'
  call_purpose TEXT, -- 'Prospektering' | 'Demo' | 'Uppföljning' | etc.
  call_outcome TEXT,
  interest_level TEXT, -- 'Hög' | 'Medel' | 'Låg'
  estimated_value NUMERIC,
  decision_timeframe TEXT,
  probability INT, -- 0-100

  -- Listor (JSON arrays)
  products_discussed TEXT[],
  competitors_mentioned TEXT[],
  objections_raised TEXT[],
  pain_points TEXT[],

  -- Uppföljning
  next_steps TEXT,
  follow_up_date TIMESTAMPTZ,
  notes TEXT,

  -- AI-summary (post-call)
  ai_summary TEXT,
  key_topics TEXT[],
  analyzed_at TIMESTAMPTZ,
  is_analyzed BOOLEAN,

  -- Metadata
  import_source TEXT,
  original_meeting_date TIMESTAMPTZ,
  meeting_participants TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Relaterade tabeller:

**`transcript_segments`** - Individuella segment av transkriptet
```sql
CREATE TABLE transcript_segments (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES call_sessions(id),
  text TEXT,
  speaker TEXT, -- 'customer' | 'seller' | 'unknown'
  timestamp_ms BIGINT,
  confidence FLOAT,
  created_at TIMESTAMPTZ
);
```

**`session_coaching_tips`** - Coaching-tips som visades under samtalet
```sql
CREATE TABLE session_coaching_tips (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES call_sessions(id),
  title TEXT,
  content TEXT,
  type TEXT, -- 'trigger' | 'battlecard' | 'objection' | 'case'
  priority TEXT, -- 'high' | 'medium' | 'low'
  dismissed BOOLEAN,
  created_at TIMESTAMPTZ
);
```

---

## 🔄 Dataflöde

### Under samtalet:

```
┌─────────────────────┐
│  Azure Speech SDK   │  ← Mikrofon
└──────────┬──────────┘
           │ Transcript segments
           ▼
┌─────────────────────┐
│  sessionStore.ts    │
│  - addFinalTranscript()
│  - updateLiveAnalysis()
└──────────┬──────────┘
           │
           ├─────────────────────────────────────┐
           │                                     │
           ▼                                     ▼
┌─────────────────────┐              ┌──────────────────────┐
│  AI Live Analysis   │              │  Frågeformulär       │
│  (aiAnalyzer.ts)    │              │  (SalesCoach.tsx)    │
│                     │              │                      │
│  Extraherar:        │              │  25 frågor:          │
│  - industry         │              │  - current_challenges│
│  - companySize      │              │  - budget_status     │
│  - callPurpose      │              │  - decision_maker    │
│  - probability      │              │  - etc.              │
│  - productsDiscussed│              │                      │
└──────────┬──────────┘              └──────────┬───────────┘
           │                                     │
           │ Sparas via                          │ ⚠️ SPARAS INTE!
           │ saveSessionAnalysisToDb()           │ (Bara i state)
           ▼                                     ▼
┌─────────────────────┐              ┌──────────────────────┐
│  call_sessions      │              │  localStorage        │
│  (Supabase)         │              │  (Frontend)          │
│                     │              │                      │
│  ✅ Persistent      │              │  ❌ Försvinner vid   │
│  ✅ Sökbar          │              │     reload/logout    │
│  ✅ Historik        │              │                      │
└─────────────────────┘              └──────────────────────┘
```

### Efter samtalet:

```
┌─────────────────────┐
│  Användare klickar  │
│  "Stoppa inspelning"│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  stopSession()      │
│  (sessionStore.ts)  │
└──────────┬──────────┘
           │
           ├─── Sparar transcript
           ├─── Sparar coaching tips
           └─── Sparar live analysis
                       │
                       ▼
           ┌─────────────────────┐
           │  call_sessions      │
           │  - full_transcript  │
           │  - industry         │
           │  - company_size     │
           │  - probability      │
           │  - etc.             │
           └─────────────────────┘
```

---

## ⚠️ Problem med nuvarande arkitektur

### 1. **Frågeformulär sparas inte**
```typescript
// I SalesCoach.tsx:
const [questionnaireAnswers, setQuestionnaireAnswers] =
  useState<Record<string, string>>({});

// ❌ Dessa svar försvinner när:
// - Användaren laddar om sidan
// - Användaren loggar ut
// - Sessionen avslutas
```

### 2. **Data duplicering**
Samma information finns på två ställen:

| Information | Live Analysis | Frågeformulär |
|-------------|---------------|---------------|
| Företagsstorlek | `company_size` | `user_count` |
| Budget | - | `budget_status` |
| Beslutsfattare | - | `final_decision_maker` |
| Utmaningar | `pain_points` (array) | `current_challenges` (text) |
| Tidslinje | `decision_timeframe` | `decision_timeline` |

### 3. **Ingen progressiv datainsamling**
Eftersom frågeformulär-svar inte sparas kan vi inte:
- Ladda tidigare svar vid uppföljningssamtal
- Visa hur komplett kundprofilen är
- Bygga upp kunskap om kunden över tid

### 4. **Svårt att analysera**
```sql
-- ❌ Går inte att fråga:
SELECT * FROM customers WHERE budget_status = 'Ja, 500k SEK';

-- ✅ Går däremot att fråga:
SELECT * FROM call_sessions WHERE company_size = '201-1000';
```

---

## 📈 Vad som FUNGERAR bra idag

### ✅ Live AI-analys
```typescript
// I sessionStore.ts, rad 210-244:
if (isAIAnalysisAvailable()) {
  analyzeTranscriptWithAI(fullText, liveAnalysis)
    .then(aiAnalysis => {
      // Uppdaterar automatiskt:
      // - industry
      // - companySize
      // - callPurpose
      // - probability
      // - etc.
      set({ liveAnalysis: { ...get().liveAnalysis, ...aiAnalysis } });
    });
}
```

**Resultat**: Grundläggande företagsinfo identifieras automatiskt och sparas.

### ✅ Auto-save av sessions
```typescript
// I sessionStore.ts, rad 114-116:
saveSessionToDb(newSession).catch(err =>
  console.error('Failed to save initial session to DB:', err)
);
```

**Resultat**: Samtalet sparas direkt när det startar, uppdateras kontinuerligt.

### ✅ Transcript segments
Varje mening som transkriberas sparas som ett segment:
```typescript
// I sessionStore.ts, rad 196-199:
if (session?.id) {
  saveSegmentToDb(session.id, newSegment);
}
```

**Resultat**: Full historik av vad som sades och när.

---

## 🎯 Vad som INTE fungerar

### ❌ Frågeformulär-persistens

**Nuvarande kod** (SalesCoach.tsx, rad 283-284):
```typescript
setQuestionnaireAnswers(newAnswers);
setAiFilledQuestions(newAiFilled);
```

**Problem**:
- Sparas bara i React state
- Försvinner vid reload
- Ingen koppling till `session_id`
- Går inte att ladda vid uppföljningssamtal

### ❌ Kundprofiler över tid

**Det som saknas**:
```sql
-- Ingen tabell för customer_profiles
-- Ingen tabell för questionnaire_answers
-- Ingen historik över flera samtal med samma kund
```

**Konsekvens**:
- Säljare måste fråga samma sak varje gång
- Ingen "kundresa" att följa
- Svårt att se när en lead är mogen

---

## 💡 Rekommenderad förbättring

### Ny tabell: `questionnaire_answers`

```sql
CREATE TABLE questionnaire_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  customer_company TEXT, -- För att kunna aggregera över samtal
  question_id TEXT NOT NULL, -- 'current_challenges', 'budget_status', etc.
  answer TEXT NOT NULL,
  source TEXT NOT NULL, -- 'manual' | 'ai_auto_fill' | 'live_analysis'
  confidence TEXT, -- 'high' | 'medium' | 'low' (för AI-svar)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questionnaire_session ON questionnaire_answers(session_id);
CREATE INDEX idx_questionnaire_customer ON questionnaire_answers(customer_company);
CREATE INDEX idx_questionnaire_question ON questionnaire_answers(question_id);
```

### Auto-save implementation

```typescript
// I SalesCoach.tsx, lägg till useEffect:
useEffect(() => {
  if (!session?.id || Object.keys(questionnaireAnswers).length === 0) return;

  // Debounce save (vänta 2 sek efter sista ändring)
  const timeoutId = setTimeout(async () => {
    await saveQuestionnaireAnswers(
      session.id,
      questionnaireAnswers,
      aiFilledQuestions
    );
  }, 2000);

  return () => clearTimeout(timeoutId);
}, [questionnaireAnswers, session?.id]);
```

### Ladda tidigare svar

```typescript
// När användaren startar ett samtal med samma företag:
const previousAnswers = await loadQuestionnaireAnswers(customerCompany);
setQuestionnaireAnswers(previousAnswers);
```

---

## 📊 Jämförelse: Före vs Efter

### FÖRE (nuvarande)

```
Samtal 1 med "Acme Corp":
├─ call_sessions
│  └─ company_size: "201-1000"
│  └─ probability: 60
└─ localStorage
   └─ questionnaireAnswers: { budget: "500k" } ❌ Försvinner!

Samtal 2 med "Acme Corp" (uppföljning):
├─ call_sessions (nytt ID)
│  └─ company_size: "201-1000" (identifierad igen)
└─ questionnaireAnswers: {} ❌ Tomt! Måste fråga igen!
```

### EFTER (med questionnaire_answers)

```
Samtal 1 med "Acme Corp":
├─ call_sessions
│  └─ company_size: "201-1000"
│  └─ probability: 60
└─ questionnaire_answers
   ├─ { question: "budget_status", answer: "500k", source: "ai" }
   ├─ { question: "decision_maker", answer: "VD Anna", source: "manual" }
   └─ { question: "current_challenges", answer: "...", source: "ai" }

Samtal 2 med "Acme Corp" (uppföljning):
├─ call_sessions (nytt ID)
│  └─ company_size: "201-1000"
└─ questionnaire_answers
   ├─ ✅ Laddar tidigare svar automatiskt
   ├─ { question: "budget_status", answer: "500k" } (från samtal 1)
   ├─ { question: "decision_maker", answer: "VD Anna" } (från samtal 1)
   └─ { question: "integration_requirements", answer: "Salesforce" } ← NYtt!
```

---

## 🚀 Nästa steg

För att implementera detta behövs:

1. **Databas-migration**
   - Skapa `questionnaire_answers` tabell
   - Lägg till index för prestanda

2. **Backend-API**
   - `POST /api/questionnaire-answers` - Spara svar
   - `GET /api/questionnaire-answers/:sessionId` - Hämta för session
   - `GET /api/questionnaire-answers/customer/:company` - Hämta för företag

3. **Frontend-integration**
   - Auto-save när svar ändras (debounced)
   - Ladda tidigare svar vid ny session med samma företag
   - Visa progress (t.ex. "15/25 frågor besvarade")

4. **Merge-logik**
   - Kombinera data från live_analysis + questionnaire_answers
   - Prioritera manuella svar över AI-svar
   - Visa datakällor (varifrån kom informationen?)

---

**Sammanfattning**:
- ✅ Live AI-analys fungerar och sparas i `call_sessions`
- ❌ Frågeformulär (25 frågor) sparas INTE, försvinner vid reload
- 🎯 Lösning: Skapa `questionnaire_answers` tabell för persistent lagring

**Status**: 2026-02-01
