# B3 Sales Coach - Setup Guide

Fullständig guide för att sätta upp B3 Sales Coach från grunden.

## Innehåll

1. [Krav](#krav)
2. [Lokal Installation](#lokal-installation)
3. [Supabase Setup](#supabase-setup)
4. [Azure Speech Setup](#azure-speech-setup-valfritt)
5. [Netlify Deployment](#netlify-deployment)
6. [Verifiering](#verifiering)
7. [Felsökning](#felsökning)

## Krav

### Obligatoriskt
- **Node.js 18+** - [Ladda ner](https://nodejs.org/)
- **npm** eller **yarn** - Kommer med Node.js
- **Git** - För version control
- **Supabase-konto** - [Skapa gratis](https://supabase.com)

### Valfritt
- **Azure-konto** - För real-time transcription (annars används demo-läge)
- **Netlify-konto** - För hosting (gratis tier fungerar)

## Lokal Installation

### 1. Klona projektet

```bash
git clone https://github.com/olalowing-oss/sales-coach.git
cd b3-sales-coach
```

### 2. Installera dependencies

```bash
npm install
```

Detta installerar:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Azure Speech SDK
- Supabase JS Client
- och alla andra dependencies

### 3. Skapa .env-fil

```bash
cp .env.example .env
```

Om `.env.example` saknas, skapa `.env` manuellt:

```bash
# .env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AZURE_SPEECH_KEY=
VITE_AZURE_SPEECH_REGION=swedencentral
```

> **OBS:** Lämna Azure-variablerna tomma för att använda demo-läge

## Supabase Setup

### 1. Skapa Supabase-projekt

1. Gå till [supabase.com](https://supabase.com)
2. Klicka "New Project"
3. Välj organization (eller skapa ny)
4. Fyll i:
   - **Name:** b3-sales-coach
   - **Database Password:** [välj starkt lösenord]
   - **Region:** Europe West (Sweden) för bäst latens
5. Klicka "Create new project"
6. Vänta ~2 minuter tills projektet är klart

### 2. Kopiera API-nycklar

1. Gå till **Settings > API** i Supabase-dashboarden
2. Kopiera:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
3. Klistra in i `.env`-filen

```bash
VITE_SUPABASE_URL=https://xxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **VIKTIGT:** Använd **ALDRIG** service_role key i frontend-kod!

### 3. Kör databas-schema

#### Option A: SQL Editor (Rekommenderat)

1. Gå till **SQL Editor** i Supabase
2. Klicka "New query"
3. Kopiera innehållet från `supabase/schema.sql`
4. Klistra in och klicka "Run"

#### Option B: Via kommandorad

```bash
# Installera Supabase CLI
npm install -g supabase

# Logga in
supabase login

# Länka projektet
supabase link --project-ref [your-project-ref]

# Kör migrering
supabase db push
```

### 4. Verifiera tabeller

I Supabase, gå till **Table Editor** och verifiera att följande tabeller finns:

- ✅ `call_sessions`
- ✅ `transcript_segments`
- ✅ `coaching_tips`
- ✅ `trigger_patterns`
- ✅ `battlecards`
- ✅ `objection_handlers`
- ✅ `case_studies`

### 5. Aktivera Authentication

1. Gå till **Authentication > Providers**
2. Aktivera **Email**
3. Inställningar:
   - **Enable Email Signups:** ON
   - **Enable Email Confirmations:** OFF (för utveckling)
   - **Secure Email Change:** ON
4. Spara

### 6. Verifiera RLS Policies

1. Gå till **Authentication > Policies**
2. Varje tabell ska ha policies som:
   - `Users can access own data`
   - `Users can insert own data`
   - `Users can update own data`
   - `Users can delete own data`

Om policies saknas, lägg till dem manuellt:

```sql
-- Exempel för call_sessions
CREATE POLICY "Users access own sessions"
ON call_sessions
FOR ALL
USING (auth.uid() = user_id);
```

## Azure Speech Setup (Valfritt)

Om du vill använda real-time transcription istället för demo-läge:

### 1. Skapa Azure-konto

1. Gå till [portal.azure.com](https://portal.azure.com)
2. Skapa konto (kredit kortkrav, men Free Tier är gratis)

### 2. Skapa Speech Resource

1. Klicka "Create a resource"
2. Sök efter "Speech"
3. Välj **Speech Services**
4. Fyll i:
   - **Subscription:** Välj din subscription
   - **Resource Group:** Skapa ny "b3-sales-coach-rg"
   - **Region:** **(Europe) Sweden Central** (viktigt för latens!)
   - **Name:** b3-sales-coach-speech
   - **Pricing Tier:** **Free (F0)** - 5 timmar/månad gratis
5. Klicka "Review + create" → "Create"
6. Vänta ~1 minut

### 3. Kopiera nycklar

1. Gå till resursen
2. Klicka **Keys and Endpoint** (vänster meny)
3. Kopiera:
   - **KEY 1** → `VITE_AZURE_SPEECH_KEY`
   - **Region:** swedencentral → `VITE_AZURE_SPEECH_REGION`
4. Klistra in i `.env`

```bash
VITE_AZURE_SPEECH_KEY=1234567890abcdef1234567890abcdef
VITE_AZURE_SPEECH_REGION=swedencentral
```

### 4. Testa Azure Speech

```bash
npm run dev
```

1. Öppna http://localhost:5173
2. Logga in
3. Klicka "Starta samtal"
4. Tala in i mikrofonen
5. Du ska se realtidstranskribering

Om det inte fungerar, klicka "Byt till Demo" för att använda demo-läge.

## Netlify Deployment

### 1. Skapa Netlify-konto

1. Gå till [netlify.com](https://netlify.com)
2. Logga in med GitHub

### 2. Länka GitHub Repo

1. Klicka "Add new site" → "Import an existing project"
2. Välj GitHub
3. Välj repository: `olalowing-oss/sales-coach`
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Klicka "Deploy site"

### 3. Konfigurera Environment Variables

1. Gå till **Site settings > Environment variables**
2. Lägg till:

```
VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
VITE_AZURE_SPEECH_KEY = 123... (valfritt)
VITE_AZURE_SPEECH_REGION = swedencentral
```

3. Klicka "Save"

### 4. Trigger Redeploy

1. Gå till **Deploys**
2. Klicka "Trigger deploy" → "Deploy site"
3. Vänta ~2 minuter

### 5. Verifiera deployment

1. Öppna din Netlify-URL (t.ex. `https://b3-sales-coach.netlify.app`)
2. Registrera ett konto
3. Starta ett demo-samtal
4. Verifiera att allt fungerar

## Verifiering

### Checklist

- [ ] **Lokal utveckling fungerar** - `npm run dev` startar utan fel
- [ ] **Login/Registrering fungerar** - Kan skapa konto och logga in
- [ ] **Demo-läge fungerar** - Kan starta simulerat samtal
- [ ] **Azure transcription fungerar** (om konfigurerat) - Real-time transcription
- [ ] **Live-analys fungerar** - Ser produkter, konkurrenter, next steps byggas upp
- [ ] **Coaching-tips visas** - Tips dyker upp baserat på innehåll
- [ ] **Historik fungerar** - Kan se tidigare samtal
- [ ] **Export fungerar** - Kan ladda ner Markdown-sammanfattning
- [ ] **Netlify deployment fungerar** - Produktionssajt är live

### Test-scenario

1. **Starta demo-samtal**
2. Vänta tills hela samtalet är klart (~2-3 minuter)
3. Verifiera att du ser:
   - Fullständig transkription
   - Produkter: Teams, Sharepoint, Microsoft 365, Copilot
   - Konkurrenter: Google, Atea
   - Pain points: Svårt att hitta information, Samarbetsutmaningar
   - Bransch: Bygg
   - Företagsstorlek: 201-1000
   - Next steps: Boka demo/möte, Skicka offert, Vänta på internt beslut
   - Samtalets resultat: Behöver tänka (från "diskutera internt")
   - Sannolikhet: ~50-70%
4. Klicka "Historik" och verifiera att samtalet sparats
5. Klicka "Analysera" på samtalet och lägg till extra information
6. Exportera som Markdown

## Felsökning

### Problem: "Supabase connection error"

**Lösning:**
1. Verifiera att `VITE_SUPABASE_URL` och `VITE_SUPABASE_ANON_KEY` är korrekta
2. Kontrollera att Supabase-projektet är aktivt
3. Testa anslutningen i Supabase dashboard

### Problem: "RLS policy violation"

**Lösning:**
1. Kontrollera att användaren är inloggad
2. Verifiera RLS policies i Supabase
3. Kör SQL-schema igen om policies saknas

### Problem: "Azure Speech error"

**Lösning:**
1. Verifiera att `VITE_AZURE_SPEECH_KEY` är korrekt
2. Kontrollera att regionen är `swedencentral`
3. Verifiera att Speech Service är aktiv i Azure Portal
4. Alternativt: Använd demo-läge istället

### Problem: Inga coaching-tips visas

**Lösning:**
1. Öppna browser console (F12)
2. Leta efter fel i `processTranscriptForCoaching`
3. Verifiera att coaching-data finns:
   ```javascript
   // I console
   JSON.parse(localStorage.getItem('b3-coaching-data'))
   ```
4. Om tom: Starta om appen för att synka default-data

### Problem: Next steps visar bara "Skicka information"

**Lösning:**
1. Verifiera att senaste koden är deployad
2. Testa i demo-läge - ska ge 3 steg
3. Kontrollera att regex-patterns i `analysisExtractor.ts` är korrekta

### Problem: Build errors i Netlify

**Lösning:**
1. Verifiera att alla environment variables är satta
2. Kontrollera Node.js-version (ska vara 18+)
3. Testa build lokalt: `npm run build`
4. Kolla build logs i Netlify för specifika fel

### Problem: "Cannot read property 'user' of undefined"

**Lösning:**
1. Verifiera att AuthProvider wrappar hela appen
2. Kontrollera att Supabase Auth är aktiverat
3. Rensa browser cache och cookies

## Support

Om du stöter på problem som inte täcks här:

1. Kolla [ARCHITECTURE.md](ARCHITECTURE.md) för djupare teknisk info
2. Sök i GitHub Issues
3. Kontakta utvecklingsteamet

## Nästa Steg

Efter setup:

1. **Anpassa coaching-regler** - Lägg till egna triggers och battlecards
2. **Testa med riktiga samtal** - Om Azure Speech är konfigurerat
3. **Konfigurera team-inställningar** - Lägg till flera användare
4. **Optimera för produktion** - Sätt upp monitoring och analytics

---

*Setup guide uppdaterad: 2026-01-28*
