# B3 Sales Coach AI

AI-driven säljcoaching i realtid. Systemet transkriberar säljsamtal, analyserar innehållet automatiskt, och ger säljare kontextuella tips och strukturerad affärsdata i realtid.

## 🚀 Funktioner

### Kärnfunktioner
- **Realtidstranskribering** - Azure Speech Services för svensk taltranskribering
- **Live Samtalsanalys** - Automatisk extraktion av affärsdata under samtalets gång
  - Bransch, företagsstorlek
  - Produkter diskuterade, konkurrenter nämnda
  - Invändningar, pain points
  - Samtalets resultat, nästa steg
  - Dynamisk sannolikhet
- **Intelligent Coachning** - Kontextuella tips baserade på triggers och patterns
- **Fil-uppladdning** - Transkribera inspelade WAV-filer med batch-processing
- **Samtalshistorik** - Spara och analysera tidigare samtal i Supabase
- **Efteranalys** - Analysera och berika avslutade samtal med strukturerad data
- **Admin-gränssnitt** - Hantera erbjudanden, battlecards, och coaching-regler
- **Demo-läge** - Fullt fungerande simulering utan Azure-konto
- **Export** - Spara samtalsnoteringar som Markdown

## 📋 Förutsättningar

- Node.js 18+
- npm eller yarn
- Supabase-konto (gratis tier fungerar)
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

# Azure Speech (valfritt - demo-läge fungerar utan)
VITE_AZURE_SPEECH_KEY=your-azure-key
VITE_AZURE_SPEECH_REGION=swedencentral
```

### 4. Konfigurera Supabase

Kör SQL-skript i Supabase SQL Editor:
1. Skapa tabeller (se `supabase/schema.sql`)
2. Aktivera RLS policies
3. Aktivera Email auth

### 5. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:5173](http://localhost:5173) i webbläsaren.

## 🎮 Demo-läge

Appen körs automatiskt i demo-läge om Azure Speech-nycklar saknas:
- Realistiskt simulerat säljsamtal med 18 fraser
- Ord-för-ord transkribering med varierande pauser
- Alla analysfunktioner triggas (produkter, konkurrenter, nästa steg, etc.)
- Coaching-tips baserat på innehållet
- Perfekt för demonstration och UI-testning

**Växla mellan Demo och Azure:**
- Klicka på "Byt till Demo" / "Byt till Azure" knappen i headern

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
│   │   ├── triggers.ts              # Coaching-triggers
│   │   └── analysisExtractor.ts     # Auto-extraktion av data
│   ├── contexts/                  # React contexts
│   │   └── AuthContext.tsx          # Autentisering
│   ├── types/                     # TypeScript-typer
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── schema.sql                 # Databas-schema
├── ARCHITECTURE.md                # Fullständig arkitektur-dokumentation
├── package.json
└── README.md
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
- [ ] Speaker Diarization (säljare vs kund)
- [ ] GPT-4o för AI-sammanfattningar
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

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Fullständig arkitektur-dokumentation
- **[Supabase Schema](supabase/schema.sql)** - Databas-schema
- **README.md** (denna fil) - Snabbstart och översikt

## 🚀 Deployment

### Netlify

Projektet deployar automatiskt till Netlify vid push till `main`:

```bash
git push origin main
# Netlify bygger och deployar automatiskt
```

**Environment Variables i Netlify:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AZURE_SPEECH_KEY` (valfritt)
- `VITE_AZURE_SPEECH_REGION`

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
