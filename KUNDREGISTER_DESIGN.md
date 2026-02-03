# Kundregister - Design & Arkitektur

## 🎯 Vision

**Mål**: Använda B3 Sales Coach som ett **kundregister** där varje möte sparas och data byggs upp över tid.

**Nyckelfrågor att besvara**:
1. Vad definierar en "kund" vs ett "möte"?
2. Hur kopplar vi flera möten till samma kund?
3. Vilken data ska aggregeras vs sparas per-möte?
4. Hur hanterar vi företag med flera kontaktpersoner?

---

## 🏗️ Tre arkitekturförslag

### Alternativ A: **Minimal CRM** (Snabbast att implementera)

```
Accounts (Företag)
├─ company_name (primärnyckel)
├─ industry
├─ company_size
└─ created_at

Contacts (Personer)
├─ id
├─ account (FK → company_name)
├─ name
├─ role
├─ email
└─ phone

Call Sessions (Möten)
├─ id
├─ account (FK → company_name)
├─ contact_id (FK → contacts)
├─ transcript
├─ analysis
└─ questionnaire_snapshot (JSON)
```

**Fördelar**:
- ✅ Enkel och snabb att implementera
- ✅ Täcker grundläggande CRM-behov
- ✅ Fungerar för SMB med en kontakt per företag

**Nackdelar**:
- ❌ Company_name som primärnyckel = problem vid stavfel
- ❌ Ingen kundresa/funnel tracking
- ❌ Svårt att hantera företag med många kontakter

---

### Alternativ B: **Progressiv CRM** (Rekommenderad)

```
Accounts (Företag)
├─ id (UUID)
├─ company_name
├─ industry
├─ company_size
├─ account_status (Lead | Prospect | Customer | Lost)
├─ lifecycle_stage (New | Qualified | Demo | Negotiation | Closed Won/Lost)
├─ first_contact_date
├─ latest_activity_date
└─ data_completeness (0-100%)

Contacts (Personer)
├─ id (UUID)
├─ account_id (FK → accounts)
├─ name
├─ role
├─ email
├─ phone
├─ is_primary_contact
└─ decision_maker_type (Economic | Technical | User | Champion)

Interactions (Alla typer av aktiviteter)
├─ id (UUID)
├─ account_id (FK → accounts)
├─ contact_id (FK → contacts) [optional]
├─ type (Call | Meeting | Email | Demo | Follow-up)
├─ call_session_id (FK → call_sessions) [optional]
├─ timestamp
├─ notes
└─ next_action

Call Sessions (Samtal)
├─ id (UUID)
├─ interaction_id (FK → interactions)
├─ transcript
├─ duration
├─ live_analysis (JSON)
└─ [befintliga kolumner]

Questionnaire Answers (Kundfrågor)
├─ id (UUID)
├─ account_id (FK → accounts)  ← Kopplas till företag, inte möte!
├─ call_session_id (FK → call_sessions) [optional - källa]
├─ question_id
├─ answer
├─ source (manual | ai_auto_fill | live_analysis)
├─ confidence
├─ valid_from
└─ superseded_by (FK → questionnaire_answers) [för historik]
```

**Fördelar**:
- ✅ **Progressiv datainsamling** - data byggs upp över flera möten
- ✅ **Kundresa-tracking** - se var kunden är i försäljningstratten
- ✅ **Flera kontakter per företag** - realistiskt för B2B
- ✅ **Historik** - se hur svar ändras över tid
- ✅ **Flexible** - kan lägga till Emails, Demos, etc senare

**Nackdelar**:
- ⚠️ Mer komplex att implementera
- ⚠️ Kräver mer planering

---

### Alternativ C: **Full CRM** (Framtidssäkert)

Lägger till:
```
Opportunities (Affärsmöjligheter)
├─ id
├─ account_id
├─ name (t.ex. "Acme Corp - Azure Migration")
├─ stage (Discovery | Demo | Proposal | Negotiation | Closed Won/Lost)
├─ value (SEK)
├─ probability (%)
├─ expected_close_date
└─ owner_id (säljare)

Activities (Tasks & Reminders)
├─ id
├─ account_id / opportunity_id
├─ type (Call | Email | Task | Follow-up)
├─ due_date
├─ status (Pending | Completed)
└─ assigned_to

Notes
├─ id
├─ account_id / opportunity_id / interaction_id
├─ content
└─ created_by
```

**Fördelar**:
- ✅ Komplett CRM-system
- ✅ Pipeline-management
- ✅ Team collaboration

**Nackdelar**:
- ❌ Mycket arbete att bygga
- ❌ Risk för "scope creep"
- ❌ Konkurrerar med Salesforce/HubSpot

---

## 💡 Rekommendation: **Alternativ B - Progressiv CRM**

**Varför?**
1. **Perfekt för ditt use case**: Återkommande möten med samma företag
2. **Progressiv implementation**: Börja enkelt, lägg till features stegvis
3. **Data over time**: Se hur kundbehov utvecklas
4. **B2B-friendly**: Hanterar flera beslutsfattare per företag

---

## 🎬 Use Cases som ska fungera

### Use Case 1: Första mötet med nytt företag

```
1. Säljare startar samtal
2. Skriver in: "Acme Corp" i företagsfält
3. Systemet kollar: Finns Acme Corp i databasen?
   ❌ Nej → Skapa nytt Account
   ✅ Ja → Ladda befintlig data

4. Under samtalet:
   - AI extraherar live analysis
   - Frågeformulär fylls i (manuellt + AI)

5. När samtalet avslutas:
   - Spara call_session
   - Spara/uppdatera account
   - Spara questionnaire_answers (kopplade till account!)
   - Skapa interaction record

6. Resultat:
   ✅ Acme Corp finns nu i systemet
   ✅ Kunddata sparad (budget, beslutsfattare, etc.)
   ✅ Första interaktionen loggad
```

### Use Case 2: Uppföljningsmöte (2 veckor senare)

```
1. Säljare startar samtal
2. Skriver in: "Acme Corp"
3. Systemet kollar: Finns Acme Corp?
   ✅ Ja → Ladda befintlig data!

4. Frågeformuläret visar:
   ✅ Budget: 500k SEK (från förra mötet)
   ✅ Beslutsfattare: VD Anna (från förra mötet)
   ⚠️ Integration: [Tom - fyll i denna gång]
   ⚠️ Timeline: [Tom - fyll i denna gång]

5. Under samtalet:
   - Säljare fokuserar på NYA frågor
   - AI uppdaterar befintliga svar om de ändrats

6. Efter samtalet:
   ✅ Data completeness: 40% → 75%
   ✅ Lifecycle stage: "New" → "Qualified"
   ✅ Historik: Visar 2 möten med Acme Corp
```

### Use Case 3: Demo med teknisk kontakt (3 veckor senare)

```
1. Säljare startar samtal
2. Skriver in: "Acme Corp"
3. Väljer kontakt: "Lars Andersson (CTO)" [NY kontakt]

4. Systemet visar:
   ℹ️ Företagsinfo från tidigare möten med Anna (VD)
   ℹ️ Budget: 500k
   ℹ️ Beslutsfattare: Anna (VD) + Lars (CTO)

5. Under demo:
   - Tekniska krav fylls i
   - Integration requirements uppdateras

6. Efter demo:
   ✅ 2 kontakter kopplade till Acme Corp
   ✅ Data completeness: 75% → 95%
   ✅ Lifecycle stage: "Qualified" → "Demo"
```

### Use Case 4: Historik & analys

```
Säljare öppnar Acme Corp's profil och ser:

┌─────────────────────────────────────────────┐
│ Acme Corp                                    │
│ Industry: Manufacturing | Size: 201-1000     │
│ Status: Prospect | Stage: Demo              │
│ Data completeness: 95% ████████████▒▒▒      │
├─────────────────────────────────────────────┤
│ Interactions (3):                            │
│ ✅ 2026-01-15 - Discovery call (Anna, VD)   │
│ ✅ 2026-01-29 - Follow-up call (Anna, VD)   │
│ ✅ 2026-02-05 - Demo (Lars, CTO)            │
│                                              │
│ Next action: Skicka offert senast 2026-02-10│
├─────────────────────────────────────────────┤
│ Key Information:                             │
│ Budget: 500k SEK                             │
│ Decision makers: Anna (VD), Lars (CTO)      │
│ Timeline: Beslut inom 3 månader             │
│ Utmaningar: On-prem → Cloud migration       │
│ Competitors: AWS, Azure                      │
│                                              │
│ [View full questionnaire →]                  │
└─────────────────────────────────────────────┘
```

---

## 🗂️ Databas-schema (Detaljerat)

### Tabell: `accounts`

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id), -- Äger detta företag

  -- Grundläggande info
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT, -- '1-50' | '51-200' | '201-1000' | '1000+'
  website TEXT,

  -- Status & lifecycle
  account_status TEXT DEFAULT 'Lead', -- Lead | Prospect | Customer | Lost
  lifecycle_stage TEXT DEFAULT 'New', -- New | Qualified | Demo | Negotiation | Closed Won | Closed Lost

  -- Aggregerad data
  total_interactions INT DEFAULT 0,
  total_call_time_minutes INT DEFAULT 0,
  data_completeness FLOAT DEFAULT 0, -- 0-100, baserat på questionnaire

  -- Affärsmöjlighet
  estimated_value NUMERIC,
  probability INT, -- 0-100
  decision_timeframe TEXT,

  -- Viktiga datum
  first_contact_date TIMESTAMPTZ,
  latest_activity_date TIMESTAMPTZ,
  expected_close_date TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, company_name) -- Samma företag kan inte finnas 2 ggr per user
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_company ON accounts(company_name);
CREATE INDEX idx_accounts_stage ON accounts(lifecycle_stage);
CREATE INDEX idx_accounts_status ON accounts(account_status);
```

### Tabell: `contacts`

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- Personinfo
  name TEXT NOT NULL,
  role TEXT, -- CTO, VD, Inköpschef, etc.
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,

  -- Typ av beslutsfattare (MEDDIC framework)
  decision_maker_type TEXT, -- Economic | Technical | User | Champion
  is_primary_contact BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_account ON contacts(account_id);
CREATE INDEX idx_contacts_email ON contacts(email);
```

### Tabell: `interactions`

```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),

  -- Typ
  type TEXT NOT NULL, -- Call | Meeting | Email | Demo | Follow-up | Note

  -- Koppla till call_session om det var ett samtal
  call_session_id UUID REFERENCES call_sessions(id) ON DELETE SET NULL,

  -- Beskrivning
  subject TEXT,
  notes TEXT,

  -- Outcome
  outcome TEXT, -- Positive | Neutral | Negative | Action Required
  next_action TEXT,
  next_action_date TIMESTAMPTZ,

  -- Tidsstämpel
  interaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_account ON interactions(account_id);
CREATE INDEX idx_interactions_date ON interactions(interaction_date DESC);
CREATE INDEX idx_interactions_session ON interactions(call_session_id);
```

### Tabell: `questionnaire_answers`

```sql
CREATE TABLE questionnaire_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Kopplas till företag (VIKTIGT!)
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- Källa (vilket möte kom detta från?)
  call_session_id UUID REFERENCES call_sessions(id) ON DELETE SET NULL,

  -- Fråga & svar
  question_id TEXT NOT NULL, -- 'current_challenges', 'budget_status', etc.
  answer TEXT NOT NULL,

  -- Metadata
  source TEXT NOT NULL, -- 'manual' | 'ai_auto_fill' | 'live_analysis'
  confidence TEXT, -- 'high' | 'medium' | 'low'

  -- Versionering (för att spåra ändringar)
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ, -- NULL om detta är den senaste versionen
  superseded_by UUID REFERENCES questionnaire_answers(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questionnaire_account ON questionnaire_answers(account_id);
CREATE INDEX idx_questionnaire_question ON questionnaire_answers(question_id);
CREATE INDEX idx_questionnaire_valid ON questionnaire_answers(account_id, valid_to) WHERE valid_to IS NULL;
```

### Modifierad tabell: `call_sessions`

```sql
-- Lägg till kolumner:
ALTER TABLE call_sessions
ADD COLUMN account_id UUID REFERENCES accounts(id),
ADD COLUMN contact_id UUID REFERENCES contacts(id),
ADD COLUMN interaction_id UUID REFERENCES interactions(id);

-- Gamla customer_* kolumner kan deprecated:
-- customer_name, customer_company, customer_role
-- (behålls för bakåtkompatibilitet)
```

---

## 🔄 Dataflöde: Före vs Efter

### FÖRE (nuvarande)

```
Möte 1 med Acme Corp:
├─ call_sessions (nytt ID varje gång)
│  └─ customer_company: "Acme Corp"
└─ Ingen koppling mellan möten!

Möte 2 med Acme Corp:
├─ call_sessions (annat ID)
│  └─ customer_company: "Acme Corp"
└─ ❌ Systemet vet inte att det är samma företag
```

### EFTER (med kundregister)

```
Möte 1 med Acme Corp:
├─ accounts
│  ├─ id: abc-123
│  ├─ company_name: "Acme Corp"
│  └─ lifecycle_stage: "New"
├─ contacts
│  └─ name: "Anna", role: "VD"
├─ interactions
│  └─ type: "Call", account_id: abc-123
├─ call_sessions
│  └─ account_id: abc-123
└─ questionnaire_answers
   ├─ budget: "500k"
   └─ account_id: abc-123

Möte 2 med Acme Corp:
├─ accounts (SAMMA account_id: abc-123)
│  ├─ lifecycle_stage: "New" → "Qualified"
│  └─ data_completeness: 40% → 75%
├─ contacts
│  ├─ Anna (VD) [befintlig]
│  └─ Lars (CTO) [ny kontakt!]
├─ interactions
│  ├─ Möte 1 (historik)
│  └─ Möte 2 (nytt)
├─ call_sessions
│  ├─ Session 1 (historik)
│  └─ Session 2 (nytt)
└─ questionnaire_answers
   ├─ budget: "500k" (oförändrat)
   ├─ integration: "Salesforce" (nytt!)
   └─ account_id: abc-123 (SAMMA företag)
```

---

## 🎨 UI-skisser

### Dashboard med kundregister

```
┌────────────────────────────────────────────────────────────┐
│  B3 Sales Coach - Kundregister                             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  [🔍 Sök företag...]  [+ Nytt möte]  [+ Nytt företag]     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Mina aktiva leads (12)                                │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ Acme Corp          | Demo      | 95% | €500k | 75%   │ │
│  │ TechStart AB       | Qualified | 60% | €200k | 50%   │ │
│  │ Nordic Mfg Group   | Negotia.. | 85% | €1.2M | 90%   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  Senaste aktiviteter:                                       │
│  • 10 min sen: Demo med Lars (CTO) @ Acme Corp            │
│  • 2h sen: Follow-up call med Sara @ TechStart            │
│  • Idag 09:15: Discovery call med Nordic Mfg Group        │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Företagsprofil

```
┌────────────────────────────────────────────────────────────┐
│  ← Tillbaka                    Acme Corp                    │
├────────────────────────────────────────────────────────────┤
│  Manufacturing | 201-1000 anställda                         │
│  Status: Prospect  Stage: Demo  Probability: 75%           │
│                                                             │
│  Data completeness: ████████████▒▒▒ 95%                    │
│                                                             │
│  ┌─────────────┬─────────────┬─────────────────────────┐  │
│  │ Översikt    │ Interaktioner│ Kundfrågor  │ Filer    │  │
│  └─────────────┴─────────────┴─────────────────────────┘  │
│                                                             │
│  💰 Estimated Value: 500k SEK                              │
│  📅 Expected Close: 2026-03-15                             │
│  ⏱️  Decision Timeframe: 1-3 månader                       │
│                                                             │
│  👥 Contacts (2):                                          │
│    • Anna Andersson (VD) - Primary, Economic buyer        │
│    • Lars Svensson (CTO) - Technical buyer                │
│                                                             │
│  📞 Interactions (3):                                      │
│    ✅ 2026-02-01 10:30 - Demo call (Lars, 45 min)         │
│    ✅ 2026-01-20 14:00 - Follow-up (Anna, 30 min)         │
│    ✅ 2026-01-15 09:00 - Discovery call (Anna, 60 min)    │
│                                                             │
│  🎯 Next Action:                                           │
│    Skicka teknisk spec till Lars senast 2026-02-05        │
│                                                             │
│  [📞 Nytt möte] [✉️ Skicka email] [📝 Anteckning]        │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Foundation (Vecka 1)
- [ ] Skapa `accounts` tabell
- [ ] Skapa `contacts` tabell
- [ ] Skapa `interactions` tabell
- [ ] Skapa `questionnaire_answers` tabell
- [ ] Uppdatera `call_sessions` med account_id
- [ ] Migration script för befintlig data

### Phase 2: Basic UI (Vecka 2)
- [ ] Account selector vid ny call
- [ ] Ladda tidigare data från account
- [ ] Auto-save questionnaire till account
- [ ] Enkel företagslista (dashboard)

### Phase 3: Kundprofil (Vecka 3)
- [ ] Företagsprofil-sida
- [ ] Visa alla interactions med företaget
- [ ] Visa contacts
- [ ] Visa questionnaire history
- [ ] Data completeness indicator

### Phase 4: Advanced Features (Vecka 4+)
- [ ] Lifecycle stage management
- [ ] Next action reminders
- [ ] Search & filter
- [ ] Export till Excel/CSV
- [ ] Email integration (optional)

---

## ❓ Frågor att diskutera

1. **Företagsidentifiering**:
   - Ska användaren kunna välja från en lista av tidigare företag?
   - Auto-complete baserat på företagsnamn?
   - Vad händer vid stavfel? ("Acme Corp" vs "ACME Corp" vs "Acme Corporation")

2. **Kontaktpersoner**:
   - Ska systemet automatiskt skapa en contact från customer_name?
   - Kan samma person finnas på flera företag? (konsulter/interim managers)

3. **Data-merge**:
   - Vad händer om AI säger "51-200" första mötet och "201-1000" andra mötet?
   - Ska användaren få välja vilken data som är korrekt?
   - Visa historik av ändringar?

4. **Integration**:
   - Ska detta kunna exporteras till Salesforce/HubSpot?
   - Ska man kunna importera företag från LinkedIn/Excel?

5. **Multi-user**:
   - Om flera säljare använder systemet, ska de dela företag?
   - Eller ska varje säljare ha sina egna leads?

---

## 🎯 Rekommenderad första steg

**Börja med en MVP**:

1. **Accounts table** - Ett företag = en rad
2. **Auto-link** - När call sparas, kolla om company_name finns → länka
3. **Load previous data** - Vid nytt samtal med samma företag → ladda questionnaire
4. **Simple company list** - Visa alla företag med senaste aktivitet

Detta ger dig:
- ✅ Återkommande möten fungerar
- ✅ Data sparas över tid
- ✅ Enkel företagslista
- ⏭️ Kan byggas ut stegvis

**Vad säger du? Ska vi börja med MVP:n?**

---

**Skapad**: 2026-02-01
**Status**: Design & diskussion
**Nästa steg**: Bestäm arkitektur och börja implementera
