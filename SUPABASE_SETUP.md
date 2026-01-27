# Supabase Setup Guide

Denna guide hjälper dig att sätta upp Supabase-databasen för Sales Coach AI.

## Steg 1: Skapa Supabase-projekt

1. Gå till [supabase.com](https://supabase.com) och skapa ett konto
2. Klicka på "New Project"
3. Välj ett namn (t.ex. "sales-coach-db")
4. Välj ett lösenord för databasen
5. Välj region (välj närmaste, t.ex. "Europe North" för Sverige)
6. Klicka på "Create new project"

## Steg 2: Kör databas-schemat

1. Gå till **SQL Editor** i sidomenyn
2. Klicka på "New query"
3. Kopiera innehållet från `supabase-schema.sql`
4. Klistra in i SQL-editorn
5. Klicka på **"Run"** för att skapa alla tabeller

## Steg 3: Aktivera Anonymous Sign-in (valfritt)

Om du vill köra appen utan inloggning (single-user mode):

1. Gå till **Authentication → Providers**
2. Sök efter "Anonymous Sign-ins"
3. Aktivera det

## Steg 4: Hämta API-nycklar

1. Gå till **Project Settings** (kugghjul i sidomenyn)
2. Gå till **API**
3. Kopiera:
   - **Project URL** (t.ex. `https://xxxxx.supabase.co`)
   - **anon public** nyckel (en lång sträng)

## Steg 5: Lägg till i .env

Öppna din `.env`-fil och lägg till:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=din-anon-key-här
```

## Steg 6: Starta appen

```bash
npm run dev
```

Appen kommer nu spara all data i Supabase!

## Vad sparas?

### Samtalshistorik
- Alla samtalssessioner med metadata
- Transkriberade segment med timestamps
- Coaching-tips som visades under samtalet

### Coachning-data (synkat över enheter)
- Triggers (nyckelord som triggar tips)
- Battlecards (konkurrentjämförelser)
- Objection handlers (invändningshantering)
- Case studies (kundcase)
- Offers (erbjudanden)

## Row Level Security (RLS)

Databasen är konfigurerad med Row Level Security:
- Varje användare ser bara sin egen data
- All data är skyddad automatiskt
- Perfekt för multi-user scenarios

## Troubleshooting

### "No API key found"
Kontrollera att `.env` har rätt variabler och att de börjar med `VITE_`.

### "Invalid API key"
Dubbelkolla att du kopierat **anon public** nyckeln, inte service_role.

### "No permission"
Se till att RLS-policies är skapade (finns i `supabase-schema.sql`).

### "Anonymous sign-in failed"
Aktivera Anonymous Sign-ins i Supabase Dashboard under Authentication → Providers.

## Lokal utveckling utan Supabase

Om du inte vill använda Supabase ännu:
- Data sparas fortfarande i localStorage
- Appen fungerar precis som vanligt
- Lägg bara till Supabase-nycklar när du är redo
