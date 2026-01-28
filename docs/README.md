# Dokumentation

Denna mapp innehåller all projektdokumentation för B3 Sales Coach.

## Innehåll

### [ARCHITECTURE.md](ARCHITECTURE.md)
Fullständig teknisk arkitektur-dokumentation.

**Omfattar:**
- Systemöversikt och huvudfunktioner
- Teknisk stack (React, Azure, Supabase)
- Arkitekturdiagram och dataflöden
- Komponentstruktur och filorganisation
- State management med Zustand
- Pattern matching och auto-extraktion
- Databas-schema och RLS policies
- Autentisering och säkerhet
- Deployment till Netlify
- Kostnadsberäkning
- Framtida förbättringar

**För vem:** Utvecklare som behöver förstå systemets arkitektur

### [SETUP.md](SETUP.md)
Steg-för-steg guide för att sätta upp projektet från scratch.

**Omfattar:**
- Krav och förutsättningar
- Lokal installation
- Supabase-konfiguration (databas, auth, RLS)
- Azure Speech Services setup (valfritt)
- Netlify deployment
- Environment variables
- Verifieringschecklist
- Felsökningsguide

**För vem:** Nya utvecklare som ska sätta upp projektet

## Snabbstart

Om du bara vill komma igång snabbt, se [README.md](../README.md) i root.

## Övrig dokumentation

- **[../supabase/schema.sql](../supabase/schema.sql)** - Databas-schema
- **[../README.md](../README.md)** - Projektöversikt och snabbstart

## Uppdatera dokumentation

När du gör ändringar i systemet, uppdatera relevant dokumentation:

1. **Ny funktion** → Uppdatera ARCHITECTURE.md (Funktioner, Dataflöde, Komponenter)
2. **Ny miljövariabel** → Uppdatera SETUP.md (Environment Variables)
3. **Ny databas-tabell** → Uppdatera schema.sql + ARCHITECTURE.md (Databas Schema)
4. **Ny dependency** → Uppdatera README.md (Teknisk Stack)

---

*Dokumentation uppdaterad: 2026-01-28*
