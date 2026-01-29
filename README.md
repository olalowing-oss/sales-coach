# B3 Sales Coach AI

AI-driven säljcoaching i realtid. Systemet transkriberar säljsamtal, analyserar innehållet automatiskt, och ger säljare kontextuella tips och strukturerad affärsdata i realtid.

## 🚀 Funktioner

### Kärnfunktioner
- **Realtidstranskribering** - Azure Speech Services för svensk taltranskribering
- **AI-Driven Samtalsanalys** 🤖 - GPT-4o analyserar samtal intelligent
  - Kontextuell förståelse av kundintentioner och behov
  - Automatisk extraktion av affärsdata (bransch, storlek, produkter, konkurrenter)
  - Intelligent bedömning av invändningar, pain points och köpsignaler
  - AI-genererade sammanfattningar och nästa steg
  - Dynamisk sannolikhetsberäkning baserad på samtalsanalys
  - Fallback till pattern matching om AI inte är konfigurerad
- **Intelligent Coachning** - Kontextuella tips baserade på triggers och patterns
- **Fil-uppladdning** - Transkribera inspelade WAV-filer med batch-processing
- **Samtalshistorik** - Spara och analysera tidigare samtal i Supabase
- **Efteranalys** - Analysera och berika avslutade samtal med AI eller manuellt
- **Admin-gränssnitt** - Hantera erbjudanden, battlecards, och coaching-regler
- **Demo-läge** - Fullt fungerande simulering utan Azure-konto (3 olika scenarios)
- **Export** - Spara samtalsnoteringar som Markdown

## 📋 Förutsättningar

- Node.js 18+
- npm eller yarn
- Supabase-konto (gratis tier fungerar)
- **OpenAI API-nyckel** (för AI-baserad samtalsanalys, ~$0.01-0.05/samtal)
- Azure Speech Services-konto (valfritt - demo-läge fungerar utan)

## 🛠️ Snabbstart

### 1. Klona projektet

```bash
git clone https://github.com/olalowing-oss/sales-coach.git
cd b3-sales-coach
```

### 2. Installera beroenden

```bash
npm install
```

### 3. Konfigurera miljövariabler

```bash
# Skapa .env-fil
cp .env.example .env
```

Redigera `.env`:
```bash
# Supabase (obligatoriskt)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI API (rekommenderat för AI-driven analys)
VITE_OPENAI_API_KEY=sk-your-openai-key

# Azure Speech (valfritt - demo-läge fungerar utan)
VITE_AZURE_SPEECH_KEY=your-azure-key
VITE_AZURE_SPEECH_REGION=swedencentral
```

### 4. Konfigurera Supabase

Se detaljerad guide i [docs/SETUP.md](docs/SETUP.md)

Snabbversion:
1. Skapa Supabase-projekt
2. Kör SQL-schema från `supabase/schema.sql`
3. Aktivera Email auth

### 5. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:5173](http://localhost:5173) i webbläsaren.

## 🎮 Demo-läge

Appen körs automatiskt i demo-läge om Azure Speech-nycklar saknas:
- Realistiskt simulerat säljsamtal med ord-för-ord transkribering
- **3 olika scenarios att välja mellan:**
  - 🎯 **Copilot Success Story** - Positiv kund, bokat möte + offert (75% sannolikhet)
  - ⚡ **Azure Migration Challenge** - Skeptisk kund med många invändningar (30-50% sannolikhet)
  - 🚀 **Power Platform Quick Win** - Mycket positiv kund, avslutad affär! (100% sannolikhet)
- Alla analysfunktioner triggas (produkter, konkurrenter, nästa steg, etc.)
- AI-analys fungerar även i demo-läge (om OpenAI-nyckel finns)
- Coaching-tips baserat på innehållet
- Perfekt för demonstration och UI-testning

**Växla mellan Demo och Azure:**
- Klicka på "Byt till Demo" / "Byt till Azure" knappen i headern
- Välj scenario med dropdown-menyn (endast i demo-läge)

## ☁️ Supabase-konfiguration

### 1. Skapa projekt

1. Gå till [supabase.com](https://supabase.com)
2. Skapa nytt projekt
3. Kopiera Project URL och Anon Key från Settings > API

### 2. Kör SQL-schema

I Supabase SQL Editor, kör följande:

```sql
-- Se fullständigt schema i supabase/schema.sql
-- Skapar tabeller:
-- - call_sessions
-- - transcript_segments
-- - coaching_tips
-- - trigger_patterns
-- - battlecards
-- - objection_handlers
-- - case_studies
```

### 3. Aktivera Authentication

- Settings > Authentication > Email Auth (aktivera)
- Tillåt sign-ups

### 4. Row Level Security (RLS)

- RLS är aktiverat per default
- Policies säkerställer att användare endast ser sin egen data

## 🤖 OpenAI API-konfiguration (Rekommenderat)

### OpenAI API för AI-driven Analys

**Arkitektur:** Säker serverless-lösning via Netlify Functions - API-nyckeln exponeras aldrig i webbläsaren.

1. Gå till [OpenAI Platform](https://platform.openai.com/api-keys)
2. Skapa ett konto och lägg till betalningsmetod
3. Generera en ny API-nyckel
4. **Lokal utveckling:** Kopiera nyckeln till `VITE_OPENAI_API_KEY` i `.env` (endast för dev)
5. **Produktion:** Lägg till `OPENAI_API_KEY` som environment variable i Netlify (se Deployment-sektionen)

**Modell som används:** GPT-4o (senaste, mest kraftfulla modellen)

**Kostnad:**
- Input: $2.50 per 1M tokens (~$0.01 per samtal)
- Output: $10.00 per 1M tokens (~$0.03 per samtal)
- **Total: ~$0.01-0.05 per samtal** (beroende på längd)

**Funktioner:**
- ✅ Intelligent samtalsanalys i realtid
- ✅ AI-genererade sammanfattningar
- ✅ Kontextuell förståelse av kundintentioner
- ✅ Automatisk "AI Analysera" knapp i analys-modal
- ✅ Säker backend via Netlify Functions (ingen exponering av API-nyckel)
- ⚠️ Fallback till pattern matching om nyckel saknas

## ☁️ Azure Speech-konfiguration (Valfritt)

### Azure Speech Service

1. Gå till [Azure Portal](https://portal.azure.com)
2. Skapa en ny "Speech" resurs
3. Välj region `swedencentral` för bäst latens i Sverige
4. Välj Free Tier (F0) - 5 timmar gratis/månad
5. Kopiera Key 1 till `VITE_AZURE_SPEECH_KEY`

**Kostnad:**
- Free: 5 timmar/månad
- Standard: ~$1/timme
- Ingen extra kostnad för real-time vs batch

## 🏗️ Projektstruktur

```
b3-sales-coach/
├── src/
│   ├── components/                # React-komponenter
│   │   ├── SalesCoach.tsx           # Huvudkomponent
│   │   ├── TranscriptPanel.tsx      # Transkriptionsvy
│   │   ├── CoachingPanel.tsx        # Coaching-tips panel
│   │   ├── LiveCallAnalysisPanel.tsx # Live-analys under samtal
│   │   ├── HistoryPanel.tsx         # Samtalshistorik
│   │   ├── CallAnalysisModal.tsx    # Efteranalys modal
│   │   ├── AdminPanel.tsx           # Erbjudandehantering
│   │   ├── CoachingAdminPanel.tsx   # Coaching-regler
│   │   └── AuthPage.tsx             # Login/registrering
│   ├── hooks/                     # Custom React hooks
│   │   ├── useSpeechRecognition.ts        # Azure Speech real-time
│   │   └── useAudioFileTranscription.ts   # Batch transcription
│   ├── store/                     # Zustand state management
│   │   ├── sessionStore.ts          # Samtalssession & analys
│   │   └── coachingStore.ts         # Coaching-data
│   ├── lib/                       # Bibliotek
│   │   ├── supabase.ts              # Supabase-klient
│   │   └── supabaseOperations.ts    # Databas-CRUD
│   ├── utils/                     # Utilities
│   │   ├── aiAnalyzer.ts            # AI-analys (anropar Netlify Function)
│   │   ├── triggers.ts              # Coaching-triggers
│   │   └── analysisExtractor.ts     # Auto-extraktion av data
│   ├── contexts/                  # React contexts
│   │   └── AuthContext.tsx          # Autentisering
│   ├── types/                     # TypeScript-typer
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── netlify/
│   └── functions/                 # Serverless functions
│       └── analyze-call.ts           # OpenAI AI-analys (säker backend)
├── docs/                       # Dokumentation
│   ├── ARCHITECTURE.md            # Fullständig arkitektur
│   └── SETUP.md                   # Steg-för-steg setup
├── supabase/
│   └── schema.sql                 # Databas-schema
├── netlify.toml                   # Netlify-konfiguration
├── package.json
└── README.md                      # Denna fil
```

## 🎯 Användning

### Starta ett samtal

1. **Login** - Logga in eller registrera konto
2. **Starta samtal** - Klicka på "Starta samtal"
3. **Prata** - Tala in i mikrofonen
4. **Analys** - Se live-analys byggas upp i realtid
5. **Coaching** - Få tips baserat på vad kunden säger
6. **Avsluta** - Klicka "Avsluta" för att spara

### Ladda upp inspelad fil

1. Klicka på "Ladda upp fil"
2. Välj WAV-fil
3. Vänta på transkribering (progress bar)
4. Analysen sker automatiskt

### Hantera historik

1. Klicka på "Historik"
2. Se alla dina tidigare samtal
3. Klicka "Visa detaljer" för att se transkription och analys
4. Klicka "Analysera" för att berika med mer data

### Konfigurera coachning

1. **Erbjudanden** - Hantera produkter och tjänster
2. **Coachning** - Konfigurera triggers, battlecards, invändningar, case studies
3. Allt sparas per-användare i Supabase

## ⌨️ Kortkommandon

| Kommando | Åtgärd |
|----------|--------|
| `Ctrl+Shift+S` | Starta/Stoppa samtal |
| `Ctrl+Shift+P` | Pausa/Fortsätt |

## 📊 Teknisk Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Lucide React** - Ikoner

### Backend & Services
- **OpenAI GPT-4o** - AI-driven samtalsanalys och sammanfattningar
- **Netlify Functions** - Serverless backend för säker OpenAI API-kommunikation
- **Azure Speech Services** - Real-time + batch transcription (svenska)
- **Supabase** - PostgreSQL databas med RLS
- **Netlify** - Hosting & CI/CD

## 🔮 Roadmap

### Fas 1: Core Features ✅
- [x] Realtidstranskribering (Azure Speech)
- [x] Live samtalsanalys med auto-extraktion
- [x] Trigger-baserad coaching
- [x] Fil-uppladdning och batch-processing
- [x] Supabase-integration med RLS
- [x] Samtalshistorik och efteranalys
- [x] Admin-gränssnitt för konfiguration
- [x] Demo-läge
- [x] Autentisering

### Fas 2: AI Enhancement 🚧
- [x] GPT-4o för AI-driven samtalsanalys och sammanfattningar
- [ ] Speaker Diarization (säljare vs kund)
- [ ] Sentiment-analys per segment
- [ ] Automatisk måluppfyllelse-tracking
- [ ] Semantisk sökning i historik

### Fas 3: Team & Integration 📅
- [ ] Team analytics dashboard
- [ ] CRM-integration (Salesforce, HubSpot)
- [ ] Slack/Teams-notifieringar
- [ ] Export till olika format
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)

### Fas 4: Advanced Features 🔮
- [ ] Call recording + audio playback
- [ ] Multi-language support
- [ ] Custom AI models per team
- [ ] Video call support
- [ ] Compliance & GDPR tools

## 📖 Dokumentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Fullständig arkitektur-dokumentation
- **[docs/SETUP.md](docs/SETUP.md)** - Steg-för-steg setup-guide
- **[supabase/schema.sql](supabase/schema.sql)** - Databas-schema
- **README.md** (denna fil) - Snabbstart och översikt

## 🚀 Deployment

### Netlify

Projektet deployar automatiskt till Netlify vid push till `main`:

```bash
git push origin main
# Netlify bygger och deployar automatiskt
```

**Environment Variables i Netlify:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `OPENAI_API_KEY` - OpenAI API key (server-side, används av Netlify Functions)
- `VITE_AZURE_SPEECH_KEY` - Azure Speech key (valfritt, demo-läge fungerar utan)
- `VITE_AZURE_SPEECH_REGION` - Azure region (valfritt)

## 🐛 Felsökning

### "Azure Speech error"
- Kontrollera att `VITE_AZURE_SPEECH_KEY` är korrekt
- Eller växla till demo-läge

### "RLS policy error"
- Kontrollera att RLS policies är aktiverade i Supabase
- Verifiera att användare är inloggad

### Ingen coaching-data
- Vid första användningen synkas default-data automatiskt
- Kontrollera att Supabase-anslutningen fungerar

## 📝 Licens

Proprietary - B3 Consulting

## 🤝 Kontakt

För support och frågor, kontakta utvecklingsteamet.
