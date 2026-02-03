# Starta med API-support (RAG-funktioner)

För att få Meeting Assistant RAG-svar att fungera behöver du köra med Vercel Dev istället för vanliga Vite dev.

## Starta Vercel Dev:

```bash
# 1. Stoppa nuvarande dev-server (Ctrl+C i terminalen)

# 2. Starta Vercel Dev istället
npx vercel dev

# Eller om du har Vercel installerat globalt:
vercel dev
```

## Första gången du kör Vercel Dev:

1. Du kommer bli frågad om att logga in på Vercel (om du inte redan är det)
2. Välj ditt project eller skapa ett nytt
3. Vercel kommer sätta upp lokala miljövariabler

## Vad är skillnaden?

- **`npm run dev`** (Vite): Snabb hot-reload, men **INGA API-routes**
- **`vercel dev`**: Kör både frontend OCH serverless functions lokalt

## Efter start:

Öppna http://localhost:3000 (Vercel använder port 3000, inte 5173)

Testa RAG-svar genom att:
1. Starta Meeting Assistant
2. Klicka på "Support/SLA" quick tag
3. Eller skriv en fråga i input-fältet

## Alternativ: Deploy till Vercel

Om du inte vill köra lokalt kan du deploya:

```bash
vercel --prod
```

Då fungerar RAG-svaren direkt i production!
