# Database Implementation: Training Scenarios

## Översikt

Träningsscenarierna har nu implementerats för att lagras i Supabase-databasen istället för som hårdkodade TypeScript-konstanter. Detta möjliggör:

- ✅ Dynamisk hantering av träningsscenarier via admin-gränssnitt
- ✅ Användare kan skapa egna scenarier
- ✅ Globala scenarier synliga för alla användare
- ✅ Framtida spårning av träningssessioner och resultat
- ✅ Bättre skalbarhet och flexibilitet

## Vad som implementerats

### 1. Databasschema

**Fil:** `supabase-schema.sql`

Två nya tabeller har lagts till:

#### `training_scenarios` - Lagrar scenariodefinitioner
- Innehåller alla fält för att definiera ett träningsscenario (persona, företag, mål, etc.)
- Stöd för både globala scenarier (`is_global = true`) och användarspecifika
- RLS-policies som tillåter användare att se globala scenarier + sina egna

#### `training_sessions` - Lagrar träningsresultat
- Kopplas till ett specifikt scenario och användare
- Sparar konversationshistorik (JSONB)
- Spårar prestationsmått (intressenivå, sentiment, avslutsstatus)
- Samlar coaching-tips och områden för förbättring
- Ger overall score och feedback

### 2. Seed-script för befintliga scenarier

**Fil:** `supabase-seed-scenarios.sql`

Ett SQL-script som migrerar alla 8 befintliga scenarier från TypeScript-koden till databasen:

1. 🚀 Entusiastisk Startup CTO (Lätt)
2. ⚠️ Skeptisk CTO (Medel)
3. 💰 Prisfokuserad Inköpschef (Svår)
4. ⏰ Stressad IT-chef (Medel)
5. 🔒 Compliance-ansvarig (Svår)
6. 👥 HR-chef söker effektivitet (Lätt)
7. 📱 Marknadschef vill bli mer produktiv (Lätt)
8. 🏢 Småföretagare vill modernisera (Lätt)

Alla scenarier markeras som `is_global = true` för att vara tillgängliga för alla användare.

### 3. API Endpoint

**Fil:** `api/training-scenarios.ts`

Ny Vercel Function med två endpoints:

- **GET `/api/training-scenarios`** - Hämta alla globala scenarier
  - Stöd för filtrering på svårighetsgrad via query parameter `?difficulty=easy`
  - Returnerar data i samma format som frontend förväntar sig

- **POST `/api/training-scenarios`** - Skapa ny träningssession
  - Skapar en ny post i `training_sessions` när användare startar träning
  - Används för framtida spårning av resultat

Endpointen är också registrerad i `server.mjs` för lokal utveckling.

### 4. Frontend-uppdateringar

#### TrainingMode.tsx
- Hämtar nu scenarier från API istället för lokal import
- Visar laddningsindikator medan scenarier hämtas
- Fungerar seamless med nya databasdrivna scenarier

#### ScenariosAdmin.tsx (NYA)
Komplett admin-gränssnitt för hantering av träningsscenarier:

- **Lista alla scenarier** - Tabellvy med alla scenarier
- **Skapa nya** - Formulär för att skapa nya scenarier
- **Redigera** - Uppdatera befintliga scenarier
- **Ta bort** - Radera scenarier (med bekräftelse)
- Enkel formulärhantering för alla scenariofält
- Array-fält hanteras som kommaseparerade strängar för enkelhet

#### SalesCoach.tsx
- Ny "Scenarier"-knapp i huvudmenyn för att öppna admin-gränssnittet
- Använder GraduationCap-ikonen för konsistens med träningsläget

## Nästa steg: Migration till databasen

### Steg 1: Kör databasschemat

Gå till din Supabase-dashboard → SQL Editor och kör:

```bash
# Öppna filen i Supabase SQL Editor
supabase-schema.sql
```

Detta lägger till de två nya tabellerna (`training_scenarios` och `training_sessions`) med alla nödvändiga RLS-policies.

### Steg 2: Seed scenarierna

I samma SQL Editor, kör:

```bash
supabase-seed-scenarios.sql
```

Detta kommer att:
- Lägga till alla 8 standardscenarier i databasen
- Markera dem som globala (`is_global = true`)
- Använda `ON CONFLICT DO UPDATE` så scriptet är idempotent (kan köras flera gånger)

### Steg 3: Verifiera installationen

Efter att ha kört båda SQL-scriptsen, verifiera med:

```sql
SELECT id, name, difficulty FROM training_scenarios WHERE is_global = true ORDER BY difficulty, name;
```

Du bör se alla 8 scenarier listade.

### Steg 4: Lägg till service role key (valfritt)

För att admin-gränssnittet ska kunna skapa/uppdatera scenarier, lägg till i `.env`:

```bash
SUPABASE_SERVICE_ROLE_KEY=din_service_role_key
```

Service role key hittar du i Supabase → Settings → API.

**OBS:** Service role key ger full åtkomst till databasen och ska ALDRIG exponeras i frontend. Den används endast i backend API-funktioner.

Om du inte lägger till detta kommer API:t att falla tillbaka på anon key, vilket fungerar för läsning men kan ha begränsningar för skrivning beroende på dina RLS-policies.

### Steg 5: Starta om servern

```bash
npm run dev:full
```

Nu bör träningsläget hämta scenarier från databasen och admin-gränssnittet bör vara funktionellt.

## Användning

### För slutanvändare:
1. Klicka på "Träning"-knappen i huvudmenyn
2. Välj ett scenario att träna på
3. Systemet hämtar scenarier från databasen dynamiskt

### För administratörer:
1. Klicka på "Scenarier"-knappen i huvudmenyn
2. Se alla befintliga scenarier i en tabell
3. Klicka "Skapa nytt" för att lägga till nya scenarier
4. Klicka på Edit-ikonen för att redigera
5. Klicka på Delete-ikonen för att ta bort

## Framtida förbättringar

### Nästa fas - Spåra träningsresultat

När användare avslutar en träningssession kan vi spara resultaten:

```typescript
// I slutet av en träningssession
const { data: session } = await supabase
  .from('training_sessions')
  .update({
    ended_at: new Date().toISOString(),
    duration_seconds: sessionDuration,
    conversation_history: conversationHistory,
    final_interest_level: interestLevel,
    final_sentiment: currentSentiment,
    deal_closed: wasSuccessful,
    total_coaching_tips: coachingTips.length,
    key_coaching_points: topTips,
    overall_score: calculateScore(),
    strengths: identifiedStrengths,
    areas_for_improvement: areasForImprovement
  })
  .eq('id', sessionId);
```

Detta möjliggör:
- Historik över alla träningssessioner
- Analys av framsteg över tid
- Identifiera vilka scenarier som är svårast
- Personliga rekommendationer för förbättring
- Gamification (achievements, leaderboards)

### Andra möjliga förbättringar:
- **Import/Export av scenarier** - Dela scenarier mellan team
- **Scenario-kategorier** - Gruppera efter produkt, bransch, etc.
- **Svårighetsgradering baserad på resultat** - Dynamisk justering
- **AI-genererade scenarier** - Använd GPT för att skapa nya scenarier
- **Multiplayer-träning** - Två användare tränar tillsammans
- **Video/Audio-inspelning** - Spela in träningssessioner för review

## Felsökning

### Problem: "Failed to fetch scenarios"

**Lösning:** Kontrollera att:
1. Supabase-URL och anon key är korrekt konfigurerade i `.env`
2. SQL-scheman har körts utan fel
3. API-servern körs (`npm run dev:api` eller `npm run dev:full`)

### Problem: "You must be logged in to create scenarios"

**Lösning:**
1. Användare måste vara inloggade i applikationen
2. Kontrollera att Supabase Auth är korrekt konfigurerad
3. Verifiera att RLS-policies tillåter den inloggade användaren att skapa scenarier

### Problem: Scenarier visas inte i träningsläget

**Lösning:**
1. Verifiera att seed-scriptet kördes framgångsrikt
2. Kontrollera att `is_global = true` för standardscenarier
3. Öppna browser DevTools → Network för att se API-anrop
4. Kör SQL-frågan i Steg 3 för att verifiera att data finns

## Teknisk dokumentation

### Dataflöde

```
1. Användare öppnar TrainingMode
   ↓
2. useEffect körs → fetch('/api/training-scenarios')
   ↓
3. API-endpoint kopplar till Supabase
   ↓
4. Supabase query: SELECT * FROM training_scenarios WHERE is_global = true
   ↓
5. Data transformeras (snake_case → camelCase)
   ↓
6. Frontend får scenarier och renderar UI
```

### Fältmappning

Database (snake_case) → Frontend (camelCase):

```typescript
persona_name      → personaName
persona_role      → personaRole
company_name      → companyName
company_size      → companySize
pain_points       → painPoints
decision_timeframe → decisionTimeframe
opening_line      → openingLine
success_criteria  → successCriteria
common_mistakes   → commonMistakes
is_global         → (inte exponerad i frontend)
```

## Sammanfattning

Implementationen är nu komplett och klar för produktion. Allt du behöver göra är:

1. ✅ Kör `supabase-schema.sql` i Supabase SQL Editor
2. ✅ Kör `supabase-seed-scenarios.sql` i Supabase SQL Editor
3. ✅ (Valfritt) Lägg till `SUPABASE_SERVICE_ROLE_KEY` i `.env`
4. ✅ Starta om servern med `npm run dev:full`
5. ✅ Testa träningsläget och admin-gränssnittet

Grattis! Din B3 Sales Coach har nu en fullständigt databasdriven träningsfunktion! 🎉
