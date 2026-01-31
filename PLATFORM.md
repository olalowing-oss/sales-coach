# B3 Sales Platform - Multi-Product Version

Detta är platform-versionen av B3 Sales Coach, utformad för att hantera flera produkter och säljområden genom AI-driven materialförädling.

## Skillnader från Original-appen

### Original App (main branch)
- Fokuserad på B3 Sales Coach som produkt
- Fasta träningsscenarier
- Manuellt skapade personas och dialoger
- Enskild produkt-fokus

### Platform Version (platform-development branch)
- Multi-produkt plattform
- **Material Upload Center** - ladda upp produktdokumentation, säljmaterial, FAQ:s
- **AI-Förädling** - automatisk bearbetning av material till strukturerad kunskap
- **Auto-genererade Scenarier** - AI skapar träningsscenarier baserat på uppladdat material
- **RAG (Retrieval-Augmented Generation)** - AI-kunder hämtar relevant information från kunskapsbasen
- **Produkt-switcher** - växla mellan olika produkter/säljområden

## Vision

Skapa en plattform där säljare kan:
1. Ladda upp material om vilken produkt/tjänst som helst
2. AI förädlar materialet och extraherar nyckelinformation
3. Automatiskt genererade träningsscenarier baserade på produkten
4. AI-kunder som svarar med verklig produktinformation
5. Samma kraftfulla träningsverktyg för olika produkter och branscher

## Arkitektur

### Nya Databastabeller

#### `knowledge_base`
Lagrar uppladdat material och processad kunskap:
- `id` - UUID primary key
- `product_id` - Referens till produkt
- `source_type` - 'pdf', 'docx', 'url', 'text'
- `source_url` - Ursprunglig källa
- `title` - Dokumenttitel
- `content` - Råtext från dokument
- `processed_content` - AI-processad och strukturerad text
- `embedding` - Vector embedding för semantisk sökning (pgvector)
- `metadata` - JSON med extra information
- `created_at`, `updated_at`

#### `product_profiles`
Definierar olika produkter/säljområden:
- `id` - UUID primary key
- `name` - Produktnamn (t.ex. "B3 Sales Coach", "CRM System X")
- `description` - Produktbeskrivning
- `industry` - Bransch
- `target_audience` - Målgrupp
- `key_features` - JSON array med huvudfunktioner
- `pricing_model` - Prismodell
- `common_objections` - JSON array med vanliga invändningar
- `value_propositions` - JSON array med värdepropositioner
- `created_at`, `updated_at`

#### Uppdateringar till `training_scenarios`
Lägg till:
- `product_id` - Vilken produkt scenariot gäller
- `auto_generated` - Boolean, om scenariot skapades av AI
- `knowledge_base_refs` - JSON array med referenser till relevant kunskap

### AI Processing Pipeline

```
1. Material Upload
   ↓
2. Document Parsing (PDF → Text, DOCX → Text, URL → Scraping)
   ↓
3. Chunking (Dela upp i meningsfulla sektioner)
   ↓
4. Embedding Generation (OpenAI text-embedding-ada-002)
   ↓
5. Storage (PostgreSQL med pgvector)
   ↓
6. Product Profile Creation (AI extraherar nyckelinformation)
   ↓
7. Scenario Generation (AI skapar träningsscenarier)
```

### RAG Implementation

När AI-kund svarar under träning:
```typescript
1. Användarens fråga → Embedding
2. Semantisk sökning i knowledge_base (cosine similarity)
3. Hämta top 5 mest relevanta dokument
4. Injicera i AI-prompt som kontext
5. AI-kund svarar med verklig produktinformation
```

## Implementation Roadmap

### Phase 1: Upload & Storage (Vecka 1-2)
- [ ] Skapa Knowledge Base Manager UI
- [ ] Implementera fil-upload (PDF, DOCX, URL)
- [ ] Skapa databastabeller (migrations)
- [ ] Aktivera pgvector extension i Supabase
- [ ] Grundläggande dokumentvisning

### Phase 2: AI Processing (Vecka 3-4)
- [ ] PDF/DOCX parsing (pdf-parse, mammoth)
- [ ] URL scraping (cheerio)
- [ ] Text chunking (smart splitting)
- [ ] OpenAI embedding generation
- [ ] Storage med vector search

### Phase 3: Product Profiles (Vecka 5-6)
- [ ] Product Profile UI
- [ ] AI-driven profile generation från material
- [ ] Produkt-switcher i header
- [ ] Filter scenarier per produkt

### Phase 4: Scenario Generation (Vecka 7-8)
- [ ] AI scenario generator från produkt-profil
- [ ] Auto-genererade personas
- [ ] Scenario preview & editing
- [ ] Bulk generation (generera 10+ scenarier per produkt)

### Phase 5: RAG Integration (Vecka 9-10)
- [ ] Vector search implementation
- [ ] RAG prompt engineering
- [ ] Kontext-injection i AI-customer endpoint
- [ ] Citation/källhänvisningar i svar

### Phase 6: Polish & Testing (Vecka 11-12)
- [ ] UI/UX förbättringar
- [ ] Performance optimization
- [ ] Extensive testing med olika produkter
- [ ] Dokumentation & user guides

## Database Strategy

För development:
- **Samma Supabase-projekt** som original-appen
- Lägg till nya tabeller för plattformsfunktioner
- Original-tabeller förblir oförändrade
- RLS policies för multi-product isolation

För production (framtida):
- Skapa separat Supabase-projekt
- Migrering av schema
- Isolerad databas för plattformen

## Development Workflow

```bash
# Arbeta på plattformen
git checkout platform-development
npm run dev

# Återgå till original-appen
git checkout main
npm run dev

# Merga specifika features till main (vid behov)
git checkout main
git merge platform-development -- src/specific-file.tsx
```

## Teknisk Stack

**Nya dependencies som behövs:**
- `pdf-parse` - PDF-parsning
- `mammoth` - DOCX-parsning
- `cheerio` - URL scraping
- `pgvector` - Vector search i PostgreSQL (Supabase extension)
- `langchain` (optional) - RAG och chain orchestration

**Befintliga dependencies som används:**
- `@supabase/supabase-js` - Database
- `openai` - AI & embeddings
- `microsoft-cognitiveservices-speech-sdk` - TTS
- React, TypeScript, Vite

## Mål

Skapa en white-label AI sales training platform där:
1. Vilket företag som helst kan ladda upp sitt material
2. AI skapar anpassade träningsscenarier automatiskt
3. Säljare tränar med AI som känner till deras specifika produkt
4. Platform kan användas för B2B SaaS, fysiska produkter, tjänster, etc.

## Kontakt & Frågor

För frågor om plattformen, kontakta projektledare eller se [GUIDE.md](./GUIDE.md) för användardokumentation.

---

**Status**: Under aktiv utveckling
**Branch**: `platform-development`
**Original App**: Se `main` branch
