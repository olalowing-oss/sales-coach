# Seller Coaching Feature

## Översikt

**Seller Coaching** ger säljaren real-time feedback på sitt eget tal under samtal. Detta kompleterar den befintliga **Customer Coaching** (invändningar, konkurrenter, köpsignaler) med analys av säljarens teknik.

## Implementerad funktionalitet

### 1. **Frågeteknik** (Question Quality Analysis)

Analyserar om säljaren ställer öppna eller stängda frågor.

**Öppna frågor (bra):**
- "Hur ser era utmaningar ut?"
- "Vad är viktigast för er?"
- "Varför är detta prioriterat nu?"

**Stängda frågor (mindre ideal för discovery):**
- "Har ni problem med X?"
- "Vill ni ha detta?"

**Feedback exempel:**
```typescript
{
  type: 'suggestion',
  priority: 'low',
  title: '👍 Bra öppen fråga',
  content: 'Du ställde en öppen fråga som låter kunden utveckla sitt svar.'
}
```

### 2. **Taletid-balans** (Talk Time Balance)

Kontrollerar 70/30-regeln: Kunden bör prata 70%, säljaren 30%.

**Analyserar de senaste 10 segmenten:**
- Räknar ord per talare
- Varnar om säljaren pratar > 50%
- Föreslår engagemang om säljaren pratar < 15%

**Feedback exempel:**
```typescript
{
  type: 'warning',
  priority: 'high',
  title: '⚠️ Du pratar för mycket',
  content: 'Du har pratat 65% av tiden de senaste meddelandena.',
  talkingPoints: [
    'Mål: Kunden pratar 70%, du 30%',
    'Ställ en öppen fråga och lyssna aktivt'
  ]
}
```

### 3. **Språkmönster** (Language Patterns)

Detekterar filler words och apologetiskt språk.

**Filler words:**
- "eh", "öhh", "liksom", "typ", "alltså"
- Varnar om ≥ 3 fyllnadsord i ett segment

**Apologetiskt språk:**
- "ledsen men", "tyvärr", "kanske", "lite grann"

**Feedback exempel:**
```typescript
{
  type: 'suggestion',
  priority: 'medium',
  title: '💪 Använd självsäkert språk',
  content: 'Undvik apologetiskt språk som "kanske", "tyvärr".',
  talkingPoints: [
    'Istället för: "Det är kanske bra"',
    'Säg: "Det är utmärkt för er situation"'
  ]
}
```

### 4. **Värdeskapande språk** (Value Language)

Analyserar om säljaren fokuserar på features eller benefits.

**Feature-fokus (mindre bra):**
- "Vi har 99.9% uptime"
- "Vi erbjuder SSO med SAML 2.0"

**Benefit-fokus (bättre):**
- "Ni slipper systemavbrott"
- "Era medarbetare loggar in en gång"

**Teknisk jargong:**
- Detekterar: "API", "SSO", "SDK", "SaaS", "backend"
- Föreslår förenkling

**Feedback exempel:**
```typescript
{
  type: 'suggestion',
  priority: 'medium',
  title: '💡 Fokusera på nyttan',
  content: 'Du nämnde en feature. Koppla till kundens affärsnytta.',
  talkingPoints: [
    'Från: "Vi har 99.9% uptime"',
    'Till: "Ni slipper systemavbrott som kostar produktivitet"'
  ]
}
```

## Hur det fungerar

### Gateway CoachingEngine Flow:

```
1. Seller pratar → Transcript segment (speaker: 'seller')
   ↓
2. CoachingEngine.detectTriggersAndGenerateTips(text, 'seller', session)
   ↓
3. analyzeSellerSpeech(text, session)
   ↓
4. Parallella analyser:
   - analyzeQuestionQuality()
   - analyzeLanguagePatterns()
   - analyzeValueLanguage()
   - checkTalkTimeBalance()
   ↓
5. Returnerar max 2 tips (för att inte överväld
iga)
   ↓
6. Tips streamas till frontend via WebSocket (coaching.tip event)
   ↓
7. Visas i CoachingPanel
```

### Kod-struktur:

**Huvudmetod:**
```typescript
// gateway/coaching-engine.ts

async analyzeSellerSpeech(
  text: string,
  session: SessionState
): Promise<CoachingTip[]> {
  const tips: CoachingTip[] = [];

  // Kör alla analyser parallellt
  const questionTips = this.analyzeQuestionQuality(text);
  const languageTips = this.analyzeLanguagePatterns(text);
  const benefitTips = this.analyzeValueLanguage(text);
  const balanceTip = this.checkTalkTimeBalance(session);

  tips.push(...questionTips, ...languageTips, ...benefitTips);
  if (balanceTip) tips.push(balanceTip);

  // Max 2 tips för att undvika tip overload
  return tips.slice(0, 2);
}
```

## Fördelar

1. ✅ **Aktiv utveckling** - Säljaren förbättras i realtid
2. ✅ **Självmedvetenhet** - Upptäcker egna mönster
3. ✅ **Konsekvent kvalitet** - Alla samtal följer best practices
4. ✅ **Komplettering** - Customer + Seller coaching = Helhetsvy
5. ✅ **Training mode värdefullare** - AI-kund + seller coaching = Perfekt träning

## Begränsningar

### Kognitiv belastning
**Problem:** Risk för "tip overload" om för många tips samtidigt
**Lösning:** Max 2 seller tips per segment, prioritera high-priority

### Falskt positiva
**Problem:** AI kan misstolka kontext
**Lösning:**
- Tips kan dismissas av användaren
- Framtida: Machine learning från dismissed tips

### Performance
**Problem:** Analyser körs för varje seller segment
**Lösning:**
- Analyserna är snabba (pattern matching, inga API-calls)
- Talk time check bara för senaste 10 segmenten

## Framtida förbättringar

### Phase 2: Advanced Patterns
- **Assumptive closing**: "När vi börjar samarbeta" vs "Om ni väljer"
- **Next steps**: Avslutar säljaren med konkreta next steps?
- **Social proof usage**: Använder säljaren kundfall och case studies?

### Phase 3: AI-driven Analysis
- **OpenAI GPT-analys** av tonalitet och engagemang
- **Sentiment på säljarens tal** - låter säljaren entusiastisk?
- **Empati-detektion** - validerar säljaren kundens utmaningar?

### Phase 4: Post-call Summary
- **Samlad feedback efter samtalet**
- **Visualisering** av talk time över tid
- **Trender** - förbättras säljaren över flera samtal?

## Testing

### Manual test (utveckling):
```bash
npm run dev:full
```

1. Öppna app i browser
2. Starta samtal
3. **Testa öppna frågor:**
   - Säg: "Hur ser era utmaningar ut med Teams idag?"
   - Förväntat: "👍 Bra öppen fråga" tip

4. **Testa filler words:**
   - Säg: "Eh, alltså, liksom, typ, vi har en lösning som eh är ganska bra"
   - Förväntat: "⚠️ Många fyllnadsord" tip

5. **Testa feature vs benefit:**
   - Säg: "Vi har 99.9% uptime och SSO med SAML 2.0"
   - Förväntat: "💡 Fokusera på nyttan" tip

6. **Testa talk time:**
   - Prata mycket (10+ meningar i rad)
   - Förväntat: "⚠️ Du pratar för mycket" tip

### Automated tests (framtida):
```typescript
// tests/seller-coaching.test.ts

describe('Seller Coaching', () => {
  test('detects open questions', () => {
    const tips = analyzeQuestionQuality('Hur ser era utmaningar ut?');
    expect(tips).toHaveLength(1);
    expect(tips[0].title).toContain('Bra öppen fråga');
  });

  test('warns about excessive filler words', () => {
    const tips = analyzeLanguagePatterns('Eh alltså liksom typ ja');
    expect(tips[0].type).toBe('warning');
  });
});
```

## Relaterad dokumentation

- [gateway/coaching-engine.ts](gateway/coaching-engine.ts#L755-L900) - Implementation
- [gateway/protocol.ts](gateway/protocol.ts#L145-L172) - CoachingTip type
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#L498-L550) - Coaching system overview

---

**Implementerat:** 2026-02-02
**Status:** ✅ Fungerar i development
**Nästa steg:** Testing i live calls, samla använderfeedback
