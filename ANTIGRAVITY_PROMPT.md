# B3 Sales Coach AI - Antigravity Prompt

## Projekt-kontext

Detta är en React/TypeScript-applikation för AI-driven säljcoaching i realtid. Appen lyssnar på säljsamtal via mikrofonen, transkriberar i realtid, och visar kontextuella coaching-tips baserat på vad kunden säger.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Speech:** Microsoft Cognitive Services Speech SDK
- **Icons:** Lucide React

## Viktiga filer

- `src/components/SalesCoach.tsx` - Huvudkomponent
- `src/data/knowledgeBase.ts` - B3:s erbjudanden och invändningar
- `src/utils/triggers.ts` - Logik för att detektera triggers
- `src/hooks/useSpeechRecognition.ts` - Azure Speech integration
- `src/store/sessionStore.ts` - Global state med Zustand

## Vanliga uppgifter

### Lägg till ett nytt erbjudande

Redigera `src/data/knowledgeBase.ts` och lägg till i `OFFERS`-arrayen:

```typescript
{
  id: 'unique-id',
  name: 'Namn på erbjudandet',
  shortDescription: 'Kort beskrivning',
  fullDescription: 'Fullständig beskrivning...',
  deliverables: ['Leverabel 1', 'Leverabel 2'],
  duration: '2-3 dagar',
  priceRange: { min: 30000, max: 50000, unit: 'fixed' },
  targetAudience: ['IT-chefer', 'CTO'],
  relatedCases: ['case-id']
}
```

### Lägg till en ny trigger

Redigera `TRIGGER_PATTERNS` i samma fil:

```typescript
myTrigger: {
  keywords: ['ord1', 'ord2', 'fras'],
  response: 'offer', // eller 'objection', 'battlecard', 'solution', 'expand'
  category: 'optional'
}
```

### Lägg till ny invändningshantering

Lägg till i `OBJECTION_HANDLERS`:

```typescript
{
  id: 'unique-id',
  objection: 'Invändningen i klartext',
  triggers: ['trigger1', 'trigger2'],
  category: 'price', // eller 'timing', 'competition', 'trust', 'need'
  responses: {
    short: 'Kort svar',
    detailed: 'Längre förklaring...',
    followUpQuestions: ['Fråga 1?', 'Fråga 2?']
  }
}
```

## Styling-guidelines

- Använd Tailwind utility classes
- Dark theme (bg-gray-900 som bas)
- Färgschema: blue-600 för primär, green-600 för success, red-600 för danger
- Rounded corners: rounded-lg eller rounded-xl
- Animationer: använd Tailwind's inbyggda (animate-pulse, animate-bounce)

## Testa lokalt

```bash
npm install
npm run dev
```

Appen körs på http://localhost:3000 och startar i demo-läge om Azure-nycklar saknas.
