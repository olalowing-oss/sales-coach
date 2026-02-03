# Testing Speaker Diarization med Simulerad Kund

## 🎯 Översikt

För att testa speaker diarization utan att behöva en riktig kund kan du använda en **genererad kundröst** som spelas upp i högtalare samtidigt som du pratar i mikrofonen.

## 📋 Förutsättningar

- ✅ Azure Speech Key konfigurerad i `.env`
- ✅ Högtalare och mikrofon anslutna
- ✅ Headset **rekommenderas inte** (vi vill att ljud kommer från högtalare)

## 🎤 Steg 1: Generera kundens röst

Kör detta script för att skapa `customer-simulation.mp3`:

```bash
npm run generate:customer-audio
```

**Output:**
- Skapar `customer-simulation.mp3` i projektets root
- Innehåller 8 kundrepliker med pauser mellan
- Använder svensk kvinnlig röst (SofieNeural)

**Kundens repliker:**
1. "Hej! Tack för att du ringer." (3s paus)
2. "Jo, vi är intresserade av Microsoft Teams för vårt företag." (4s paus)
3. "Men priset verkar ganska högt för oss." (5s paus)
4. "Vi har redan avtal med Atea, men vi funderar på att byta." (4s paus)
5. "Vad kan Teams erbjuda som är bättre än vårt nuvarande system?" (5s paus)
6. "Okej, det låter intressant. Hur mycket kostar det egentligen?" (4s paus)
7. "Har ni någon demo vi kan titta på först?" (5s paus)
8. "Ja, det här verkar kunna lösa våra problem. Jag är intresserad!" (3s paus)

## 🧪 Steg 2: Testa med appen

### Setup

1. **Öppna ljudfilen:**
   ```bash
   open customer-simulation.mp3
   # eller
   vlc customer-simulation.mp3
   ```

2. **Justera volym:**
   - Högtalare: Medium-hög volym (så mikrofonen hör kundrösten)
   - Mikrofon: Normal känslighet

3. **Positionering:**
   - Sätt högtalare ~50cm från mikrofonen
   - Du ska sitta nära mikrofonen

### Test-procedur

1. **Starta Sales Coach appen:**
   ```bash
   npm run dev:full
   ```
   Öppna: http://localhost:5173

2. **Starta ett samtal:**
   - Klicka "Starta samtal"
   - Se att "🟢 Speaker diarization aktiv" visas

3. **Spela upp customer-simulation.mp3:**
   - Tryck play på ljudfilen
   - Se att kunden pratar

4. **Prata under pauserna:**
   När kunden pausar, svara på deras frågor:
   ```
   Kund: "Hej! Tack för att du ringer."
   → DU: "Hej! Jag heter Ola från B3IT. Hur mår du?"

   Kund: "Jo, vi är intresserade av Microsoft Teams..."
   → DU: "Vad bra! Vad är det ni vill uppnå med Teams?"

   Kund: "Men priset verkar ganska högt..."
   → DU: "Jag förstår, men låt mig visa ROI..."
   ```

5. **Kontrollera konsolen:**
   Browser DevTools → Console:
   ```
   🎤 New speaker detected: Guest-1 → seller
   🎤 Final [seller]: Hej! Jag heter Ola från B3IT
   🎤 New speaker detected: Guest-2 → customer
   🎤 Final [customer]: Men priset verkar ganska högt för oss
   💡 Coaching tip: Invändning - Pris
   ```

6. **Verifiera Gateway logs:**
   Backend-terminalen:
   ```
   [Gateway] Transcript: [seller] Hej! Jag heter Ola...
   [Gateway] Transcript: [customer] Men priset verkar ganska högt...
   💡 Coaching tip generated: Invändning - Pris
   ```

## ✅ Förväntat resultat

**Vad du ska se:**

1. **Browser console:**
   - `Guest-1` identifieras som `seller` (första talaren = du)
   - `Guest-2` identifieras som `customer` (andra talaren = ljudfilen)
   - Coaching tips dyker upp när kunden säger trigger-ord

2. **Gateway logs:**
   - `[seller]` för dina repliker
   - `[customer]` för kundröstens repliker
   - Coaching events genereras för customer speech

3. **UI:**
   - Transcript panel visar båda talare korrekt märkta
   - Coaching panel visar tips för kundens invändningar
   - Interest level uppdateras baserat på sentiment

## 🐛 Troubleshooting

### Problem: Båda röster identifieras som samma talare

**Orsak:** Mikrofonen hör inte tydlig skillnad mellan rösterna

**Lösning:**
- Öka volymen på högtalare
- Flytta högtalare närmare mikrofonen
- Använd en annan mikrofon med bättre känslighet
- Prata tydligare/högre själv

### Problem: Kunden hörs inte alls

**Orsak:** Volymen för låg eller mikrofonen filtrerar bort systemljud

**Lösning:**
- Öka högtalare-volymen betydligt
- Kontrollera att mikrofonen inte har noise cancellation påslagen
- Prova spela ljudfilen från en annan enhet (mobil med Bluetooth-högtalare)

### Problem: Ingen speaker diarization

**Orsak:** ConversationTranscriber körs inte

**Lösning:**
```bash
# Kontrollera browser console
# Ska visa: "🎤 Starting with speaker diarization enabled"

# Om inte, kontrollera:
# - VITE_AZURE_SPEECH_KEY är korrekt i .env
# - enableDiarization=true i SalesCoach.tsx
```

### Problem: Coaching tips dyker inte upp

**Orsak:** Gateway analyserar inte customer speech

**Lösning:**
```bash
# Kontrollera backend logs
# Ska visa: [Gateway] Transcript: [customer] ...

# Om speaker är [unknown], se SPEAKER_DIARIZATION.md
```

## 🎛️ Anpassa kundrepliker

Redigera `scripts/generate-customer-audio.js`:

```javascript
const customerDialog = [
  { text: "Din egen kundreplika här", pauseAfter: 4000 },
  { text: "Lägg till fler repliker...", pauseAfter: 5000 },
];
```

Kör sedan:
```bash
npm run generate:customer-audio
```

## 🔄 Alternativa testmetoder

### Metod 1: Spela från mobil (bättre separation)

1. Kopiera `customer-simulation.mp3` till mobilen
2. Anslut mobil till Bluetooth-högtalare
3. Placera högtalare 1-2 meter från datorn
4. Bättre ljud-separation = bättre diarization

### Metod 2: Två enheter

1. Enhet 1: Sales Coach appen + din mikrofon
2. Enhet 2: Spela upp kundrösten i Teams/Zoom
3. Detta simulerar ett riktigt Teams-samtal

### Metod 3: Riktigt samtal med kollega

1. Ring en kollega via Teams
2. Be dem läsa upp kundreplikerna
3. Mest realistiskt test

## 📊 Success metrics

**Test passerar om:**

- ✅ Första talaren (du) → `seller`
- ✅ Andra talaren (ljudfil) → `customer`
- ✅ Coaching tips för "för dyrt" invändning
- ✅ Coaching tips för "Atea" konkurrent
- ✅ Sentiment analysis för kundens intresse
- ✅ Gateway logs visar korrekt speaker labels

## 🚀 Nästa steg

När testet fungerar:

1. **Produktionstest:** Testa i riktigt Teams-samtal
2. **Multi-speaker:** Testa med gruppsamtal (>2 personer)
3. **Edge cases:** Testa med dåligt ljud, störningar, etc.
4. **Performance:** Mät latency för speaker identification

## 🎓 Förståelse av speaker diarization

**Hur Azure identifierar talare:**

1. **Akustiska egenskaper:**
   - Pitch (tonhöjd)
   - Timbre (klangfärg)
   - Talrhythm
   - Röststyrka

2. **Temporal mönster:**
   - Talpauser
   - Överlappningar
   - Speaking rate

3. **Mapping:**
   - Första unika röst → Guest-1 → `seller`
   - Andra unika röst → Guest-2 → `customer`

**Begränsningar:**

- Fungerar bäst med tydlig ljud-separation
- Kan bli förvirrad om röster liknar varandra
- Kräver några sekunders ljud för att identifiera talare
- Mindre pålitligt i bullriga miljöer

## 📚 Relaterad dokumentation

- [SPEAKER_DIARIZATION.md](./SPEAKER_DIARIZATION.md) - Implementation details
- [Azure Speech SDK Docs](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-use-conversation-transcription)
