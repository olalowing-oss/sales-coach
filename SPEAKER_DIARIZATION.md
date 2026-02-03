# Speaker Diarization - Talare-identifiering

## 🎤 Lösning implementerad: Automatisk Speaker Diarization (Azure)

Eftersom du och kunden båda pratar i samtalet behöver appen veta vem som är vem. Jag har implementerat **automatisk speaker diarization** med Azure Speech SDK som identifierar olika talare automatiskt.

## ✅ Hur det fungerar

### 1. Azure Conversation Transcriber
Azure Speech SDK använder **ConversationTranscriber** istället för vanlig SpeechRecognizer:

```typescript
const transcriber = new SpeechSDK.ConversationTranscriber(speechConfig, audioConfig);

transcriber.transcribed = (_, event) => {
  const speakerId = event.result.speakerId; // "Guest-1", "Guest-2", etc.
  const text = event.result.text;
  const speaker = mapSpeaker(speakerId); // 'seller' eller 'customer'
};
```

### 2. Automatisk speaker mapping
Första talaren som detekteras = **seller** (du)
Andra talaren som detekteras = **customer**

```typescript
const mapSpeaker = (speakerId: string): 'seller' | 'customer' => {
  if (!speakerMap.has(speakerId)) {
    // First speaker = seller, second = customer
    const role = speakerMap.size === 0 ? 'seller' : 'customer';
    speakerMap.set(speakerId, role);
  }
  return speakerMap.get(speakerId)!;
};
```

### 3. Real-time coaching
Gateway-backend analyserar endast meddelanden där speaker är:
- `customer` → Ger coaching tips, sentiment analysis, objection detection
- `seller` → Ingen analys (du behöver inga tips på vad du själv säger)

### 4. UI-indikator
När Azure speaker diarization är aktiv visas en grön pulsande indikator:
```
[Stoppa] [Pausa] | 🟢 Speaker diarization aktiv
```

## 📋 Implementationsdetaljer

### Hook: useSpeechRecognition.ts
```typescript
export const useSpeechRecognition = ({
  enableDiarization = true, // ⚡ Nytt parameter
  onFinalResult
}: UseSpeechRecognitionOptions) => {

  if (enableDiarization) {
    // Use ConversationTranscriber for speaker diarization
    const transcriber = new SpeechSDK.ConversationTranscriber(
      speechConfig,
      audioConfig
    );

    transcriber.transcribed = (_, event) => {
      const speakerId = event.result.speakerId;
      const speaker = mapSpeaker(speakerId);
      onFinalResult?.(text, confidence, speaker); // ⚡ Speaker included
    };
  }
};
```

### State Management: sessionStore.ts
```typescript
// Updated signature
addFinalTranscript: (text: string, confidence: number, speaker?: 'seller' | 'customer') => {
  const finalSpeaker = speaker || currentSpeaker; // Fallback to manual if no diarization

  const newSegment = {
    text,
    speaker: finalSpeaker, // ⚡ From Azure or fallback
    confidence
  };
};
```

### Gateway Integration
Transcript segments skickas med rätt speaker från Azure:
```typescript
gatewayClient.sendTranscript({
  sessionId: session.id,
  text: text.trim(),
  isFinal: true,
  speaker: finalSpeaker, // ⚡ From Azure diarization
  confidence
});
```

## 🔮 Framtida förbättringar (valfritt)

### Förbättring 1: Speaker Identification (name mapping)
Just nu mappar vi "Guest-1" → seller, "Guest-2" → customer.
För att få exakta namn:

```typescript
// Azure Speaker Recognition
const profile = await client.createProfile('en-US');
await client.enrollProfile(profile.profileId, audioStream);

// Nu kan Azure identifiera "Ola" istället för "Guest-1"
```

**Fördelar:**
- Exakta namn i transkript
- Fungerar med flera kunder

**Nackdelar:**
- Kräver enrollment (träningsdata för varje person)
- Extra komplexitet

### Förbättring 2: Multi-speaker support (>2 personer)
Om fler än 2 personer pratar (ex: gruppsamtal):

```typescript
const mapSpeaker = (speakerId: string): string => {
  if (!speakerMap.has(speakerId)) {
    const role = speakerMap.size === 0 ? 'seller' : `customer-${speakerMap.size}`;
    speakerMap.set(speakerId, role);
  }
  return speakerMap.get(speakerId)!;
};
```

### Förbättring 3: Manual override
Om diarization gör fel, lägg till manuell toggle som backup:

```typescript
// Keyboard shortcut: Cmd+Shift+K = Byt talare
if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'k') {
  e.preventDefault();
  // Swap last segment speaker
  swapLastSegmentSpeaker();
}
```

## 🎯 Nuvarande implementation

**Automatisk Speaker Diarization (Azure):**
- ✅ Helt automatisk - ingen manuell växling
- ✅ Fungerar direkt för 1-on-1 samtal
- ✅ Första talare = seller, andra = customer
- ✅ Inkluderat i Azure Speech Services (ingen extra kostnad)
- ⚠️ Kräver tydlig ljud-separation mellan talare
- ⚠️ Kan vara mindre pålitlig i bullriga miljöer

**Fallback:**
Om speaker inte identifieras använder systemet `currentSpeaker` state (default: 'customer').

## 🧪 Testa nu

### Steg 1: Starta servrar
```bash
# Terminal 1: Backend + Gateway
npm run dev:api

# Terminal 2: Frontend
npm run dev
```

### Steg 2: Testa speaker diarization

1. **Öppna browsern** → http://localhost:5173
2. **Logga in** med ditt konto
3. **Starta ett samtal** → Se "🟢 Speaker diarization aktiv"
4. **Prata först själv** → Du blir "seller" (Guest-1)
5. **Låt någon annan prata** → De blir "customer" (Guest-2)
6. **Kontrollera konsolen**:
   ```
   🎤 New speaker detected: Guest-1 → seller
   🎤 Final [seller]: Hej, det här är Ola
   🎤 New speaker detected: Guest-2 → customer
   🎤 Final [customer]: Det är för dyrt för oss
   ```
7. **Verifiera coaching tip** dyker upp när customer säger trigger-ord

### Steg 3: Test med en person (för utveckling)

Om du testar ensam kan du simulera två talare genom att:
1. Prata normalt (du blir seller)
2. Pausa 2-3 sekunder
3. Ändra röstläge (högre/lägre tonhöjd)
4. Azure kan då tro det är en ny talare

### Steg 4: Kontrollera Gateway logs

I backend-terminalen bör du se:
```
[Gateway] Transcript: [seller] Hej, jag heter Ola...
[Gateway] Transcript: [customer] Det är för dyrt...
💡 Coaching tip: Invändning - Pris
```

## ✅ Implementerat

- ✅ `useSpeechRecognition.ts` - ConversationTranscriber med diarization
- ✅ Speaker mapping (Guest-1 → seller, Guest-2 → customer)
- ✅ `sessionStore.ts` - Updated för att ta emot speaker från Azure
- ✅ `SalesCoach.tsx` - UI-indikator för aktiv diarization
- ✅ Gateway - Använder rätt speaker från diarization i transcript
- ✅ Coaching engine - Analyserar endast customer speech

**Allt klart att testa!** 🚀

## 🐛 Troubleshooting

### Problem: Båda talare identifieras som samma person
**Lösning:** Säkerställ tydlig ljud-separation:
- Använd headset/mikrofon med bra noise cancellation
- Var nära mikrofonen när du pratar
- Pausa mellan talare-byten

### Problem: Ingen speaker-identifiering
**Lösning:** Kontrollera att Azure Speech Key är korrekt:
```bash
# .env
VITE_AZURE_SPEECH_KEY=your-actual-key
VITE_AZURE_SPEECH_REGION=swedencentral
```

### Problem: Fel talare assignas
**Lösning:** Speaker mapping är baserad på vem som pratar först:
- ✅ Om DU pratar först → korrekt (du = seller)
- ❌ Om KUND pratar först → felaktig mapping

**Workaround:** Säg alltid något först när du startar samtalet (ex: "Hej, det här är Ola från B3IT").
