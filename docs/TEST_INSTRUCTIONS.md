# Test-instruktioner för Sales Coach

## 🎧 Testa appen med inspelat samtal

Du har nu en färdig testljudfil: **test-conversation.wav** (ca 45 sekunder)

### Vad innehåller testsamtalet?

Ett svenskt säljsamtal mellan:
- **Mattias** (säljare från B3 Digital)
- **Sofie** (kund)

Samtalet innehåller flera trigger-ord och situationer som aktiverar coaching-funktionerna:
- **Prisuppfattning** ("priset känns lite högt") → Triggar objection handler
- **Systemintegration** → Triggar battlecard
- **ROI-diskussion** → Triggar value proposition

### Så här testar du:

#### Option 1: Ladda upp fil (Enklast & Rekommenderat) 🎉

1. **Starta appen lokalt:**
   ```bash
   npm run dev
   ```

2. **Öppna i webbläsaren:**
   ```
   http://localhost:3002
   ```

3. **Logga in** med ditt Supabase-konto

4. **Ladda upp testfilen:**
   - Klicka på **"Ladda upp fil"**-knappen (blå knapp med upload-ikon)
   - Välj `test-conversation.wav` från projektmappen
   - Vänta medan filen transkriberas (du ser en progress bar)

5. **Observera:**
   - Transkription visas i realtid medan filen bearbetas
   - Coaching-tips poppar upp baserat på trigger-ord
   - Analytics uppdateras automatiskt
   - Efter transkribering är klar: se fullständig historik

#### Option 2: Live-inspelning (Kräver tyst miljö)

1. **Starta appen lokalt:**
   ```bash
   npm run dev
   ```

2. **Öppna i webbläsaren:**
   ```
   http://localhost:3002
   ```

3. **Logga in** med ditt Supabase-konto

4. **Starta ett nytt samtal:**
   - Klicka på "Starta samtal" (grön knapp med mikrofon)
   - Ge mikrofontillstånd när webbläsaren frågar

5. **Spela upp testljudfilen:**
   - Öppna `test-conversation.wav` i en musikspelare (iTunes, VLC, etc.)
   - Spela upp den i dina hörlurar/högtalare
   - Mikrofonen kommer att fånga upp ljudet och transkribera i realtid

6. **Observera:**
   - Transkription visas i realtid
   - Coaching-tips poppar upp baserat på trigger-ord
   - Analytics uppdateras
   - Efter samtalet: se historik och fullständig transkript

#### Option 2: Testa på Netlify (Efter miljövariabler är konfigurerade)

1. Konfigurera miljövariabler i Netlify (se instruktioner nedan)
2. Öppna din deployade app
3. Följ steg 3-6 ovan

### Förväntat beteende:

- **Vid 0:05** - "B3 Digital" → Battlecard för företaget
- **Vid 0:20** - "digitala transformation" → Solution trigger
- **Vid 0:30** - "problem med integrationer" → Tech challenge trigger
- **Vid 0:40** - "priset känns lite högt" → Objection handler för pris
- **Vid 0:50** - ROI-argumentation → Value proposition tip
- **Vid 1:05** - Avslutande case study-referens

## 🔧 Konfigurera Netlify (för produktion)

För att appen ska fungera på Netlify behöver du lägga till miljövariabler:

1. Gå till [Netlify Dashboard](https://app.netlify.com/)
2. Välj ditt projekt "sales-coach"
3. Gå till **Site settings → Environment variables**
4. Lägg till följande variabler:

```
VITE_AZURE_SPEECH_KEY=<your-azure-speech-key-from-env-file>
VITE_AZURE_SPEECH_REGION=swedencentral
VITE_SUPABASE_URL=<your-supabase-url-from-env-file>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key-from-env-file>
VITE_DEMO_MODE=false
```

**Tips:** Kopiera värdena från din lokala `.env`-fil

5. Spara och trigga en ny deploy

## 📝 Generera ny testljudfil

Om du vill skapa en ny testljudfil med annat innehåll:

1. Redigera `generate-test-audio.mjs`
2. Kör: `node generate-test-audio.mjs`
3. Ny `test-conversation.wav` skapas

## 🐛 Troubleshooting

### Ingen transkription visas
- Kontrollera att mikrofontillstånd är givet
- Kolla att ljudvolymen är tillräckligt hög
- Öppna DevTools Console för felmeddelanden

### Coaching-tips visas inte
- Kontrollera att trigger-ord matchar din konfiguration
- Se till att coaching-data är laddad från Supabase
- Kolla "Administrera Data" för att verifiera triggers

### Appen är vit/blank på Netlify
- Miljövariabler saknas - följ stegen ovan
- Kolla build-loggen i Netlify för fel

## 🎯 Nästa steg

Efter framgångsrik testning kan du:
1. Lägga till fler trigger-mönster i Admin-panelen
2. Skapa fler battlecards för dina konkurrenter
3. Lägga till case studies från verkliga kunder
4. Anpassa coaching-tips för ditt säljteam
