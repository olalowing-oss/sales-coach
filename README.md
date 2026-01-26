# B3 Sales Coach AI

AI-driven säljcoaching i realtid för B3 Digital Worklife. Verktyget lyssnar på säljsamtal och ger kontextuell coaching baserat på vad kunden säger.

![B3 Sales Coach](https://via.placeholder.com/800x400?text=B3+Sales+Coach+AI)

## 🚀 Funktioner

- **Realtidstranskribering** - Transkriberar samtal i realtid med Azure Speech Services
- **Intelligent trigger-detektion** - Identifierar invändningar, konkurrenter och intressesignaler
- **Kontextuell coaching** - Visar relevanta tips, battlecards och erbjudanden
- **B3-specifik kunskap** - Förprogrammerad med B3:s erbjudanden och invändningshantering
- **Export** - Spara samtalsnoteringar som Markdown

## 📋 Förutsättningar

- Node.js 18+ 
- npm eller yarn
- Azure-konto (för produktion) eller kör i demo-läge

## 🛠️ Installation

### 1. Klona/kopiera projektet

```bash
# I Antigravity, öppna en ny workspace och kopiera in filerna
# Eller klona från repo om tillgängligt
```

### 2. Installera beroenden

```bash
npm install
```

### 3. Konfigurera miljövariabler

```bash
# Kopiera exempel-filen
cp .env.example .env

# Redigera .env med dina Azure-nycklar
# ELLER lämna som det är för demo-läge
```

### 4. Starta utvecklingsservern

```bash
npm run dev
```

Öppna http://localhost:3000 i webbläsaren.

## 🎮 Demo-läge

Om du inte har Azure-nycklar konfigurerade körs appen i demo-läge:
- Simulerade transkriptioner var 5:e sekund
- Visar hur coaching-tips triggas
- Perfekt för att testa UI och logik

## ☁️ Azure-konfiguration

### Azure Speech Service

1. Gå till [Azure Portal](https://portal.azure.com)
2. Skapa en ny "Speech" resurs
3. Välj region `swedencentral` för bäst latens i Sverige
4. Kopiera nyckeln till `VITE_AZURE_SPEECH_KEY`

### Azure OpenAI (för RAG - framtida version)

1. Skapa "Azure OpenAI" resurs
2. Deploya modeller:
   - `gpt-4o` för coaching-generering
   - `text-embedding-3-large` för vektorisering
3. Kopiera endpoint och nyckel till `.env`

## 🏗️ Projektstruktur

```
b3-sales-coach/
├── src/
│   ├── components/
│   │   ├── SalesCoach.tsx      # Huvudkomponent
│   │   ├── TranscriptPanel.tsx # Transkriptionsvy
│   │   └── CoachingPanel.tsx   # Coaching-tips
│   ├── hooks/
│   │   └── useSpeechRecognition.ts # Azure Speech hook
│   ├── store/
│   │   └── sessionStore.ts     # Zustand state management
│   ├── data/
│   │   └── knowledgeBase.ts    # B3:s erbjudanden & invändningar
│   ├── utils/
│   │   └── triggers.ts         # Trigger-detektion
│   ├── types/
│   │   └── index.ts            # TypeScript-typer
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── TECHNICAL_SPECIFICATION.md  # Fullständig teknisk spec
├── package.json
└── README.md
```

## 🎯 Användning i Antigravity

### Starta projektet

1. Öppna Antigravity
2. Skapa ny workspace
3. Kopiera in projektfilerna
4. Kör: `npm install && npm run dev`

### Utöka kunskapsbasen

Redigera `src/data/knowledgeBase.ts` för att:
- Lägga till nya erbjudanden
- Uppdatera battlecards
- Lägga till invändningar
- Lägga till kundcase

### Lägg till nya triggers

Redigera `TRIGGER_PATTERNS` i `knowledgeBase.ts`:

```typescript
export const TRIGGER_PATTERNS = {
  // Lägg till ett nytt mönster
  newPattern: {
    keywords: ['nyckelord1', 'nyckelord2'],
    response: 'offer', // eller 'objection', 'battlecard', etc.
    category: 'optional-category'
  }
};
```

## ⌨️ Kortkommandon

| Kommando | Åtgärd |
|----------|--------|
| `Ctrl+Shift+S` | Starta/Stoppa samtal |
| `Ctrl+Shift+P` | Pausa/Fortsätt |

## 🔮 Roadmap

### Fas 1: MVP ✅
- [x] Grundläggande transkribering
- [x] Trigger-baserad coaching
- [x] B3:s erbjudanden
- [x] Invändningshantering

### Fas 2: RAG-integration
- [ ] Azure AI Search-integration
- [ ] GPT-4o för intelligent coaching
- [ ] Semantisk sökning i kunskapsbas

### Fas 3: Avancerat
- [ ] CRM-integration
- [ ] Samtalsanalytik
- [ ] Team-funktioner
- [ ] Mobilapp

## 📝 Licens

Proprietary - B3 Digital Worklife AB

## 🤝 Support

Kontakta B3:s utvecklingsteam för support och frågor.
