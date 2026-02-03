# 🎯 B3 Sales Coach - Funktions-Mindmap

**Komplett översikt över alla funktioner i applikationen**

---

## 📱 HUVUDFUNKTIONER

### 🏠 Dashboard
- Översikt över senaste samtal (5 st)
- Träningsscenarier-översikt
- Demoscript-genvägar
- Snabbåtkomst till huvudfunktioner

### 📞 Kundsamtal (Live Calls)
```
├─ 🎤 Inspelning & Transkribering
│  ├─ Live-inspelning från mikrofon
│  ├─ Uppladdning av ljudfiler (.wav)
│  ├─ Realtids speech-to-text (Azure)
│  ├─ Språk: Svenska (sv-SE)
│  └─ Start/Stopp/Pausa-kontroller
│
├─ 📝 Transkript-panel
│  ├─ Realtidsvisning av text
│  ├─ Talarigenkänning (säljare/kund/okänd)
│  ├─ Tidsstämplar
│  ├─ Konfidensnivåer
│  └─ Preliminär & final text
│
├─ 💡 Coaching-panel
│  ├─ Realtids coachningtips (max 5 aktiva)
│  ├─ Typer: Förslag, Battlecard, Invändning, Erbjudande, Case, Varning
│  ├─ Prioritetsnivåer (hög/medel/låg)
│  ├─ Trigger-baserad aktivering
│  └─ Avfärdningsbara tips
│
├─ 📊 Live-analys
│  ├─ Bransch-detektering
│  ├─ Företagsstorlek
│  ├─ Samtalstyp (Prospektering/Demo/Uppföljning/etc.)
│  ├─ Intressenivå (Hög/Medel/Låg)
│  ├─ Produkter diskuterade
│  ├─ Konkurrenter nämnda
│  ├─ Invändningar
│  ├─ Pain points
│  └─ Estimerat värde & sannolikhet
│
├─ 🤖 AI-analys efter samtalet
│  ├─ GPT-4o-driven analys
│  ├─ Företagsnamn-extraktion
│  ├─ Branschklassificering
│  ├─ Samtalsutfall-bedömning
│  ├─ Beslutstidslinje-estimering
│  ├─ AI-genererad sammanfattning
│  └─ Nyckelämnen-identifiering
│
├─ 📜 Historik
│  ├─ Visa tidigare samtal
│  ├─ Filtrera efter datum/kund/produkt
│  ├─ Visa transkript
│  ├─ Redigera analys i efterhand
│  └─ Exportera data
│
└─ 📥 Importera Transkription
   ├─ Teams VTT-format
   ├─ Teams copy-paste
   ├─ Plain text-format
   ├─ Automatisk parsing
   ├─ Metadatainmatning (kund, datum, deltagare)
   └─ Automatisk AI-analys efter import
```

### 🎓 Säljträning (Training Mode)
```
├─ 🎭 Interaktiv träning med AI-kund
│  ├─ AI-driven kundpersona
│  ├─ Realtidssamtal (röst)
│  ├─ Dynamiska svar baserat på pitch
│  ├─ Sentimentspårning
│  └─ Intressenivå-utveckling (0-100)
│
├─ 📋 Träningsscenarier
│  ├─ Fördefinierade scenarier (8 st standard)
│  ├─ Anpassade scenarier
│  ├─ Svårighetsgrader (Lätt/Medel/Svår)
│  ├─ Persona-detaljer (namn, roll, företag, bransch)
│  ├─ Företagsstorlek & budget
│  ├─ Pain points
│  ├─ Konkurrenter att nämna
│  ├─ Öppningsreplik
│  ├─ Framgångskriterier
│  └─ Vanliga misstag att undvika
│
├─ 💬 Coaching under träning
│  ├─ Nivåer: Full/Medel/Minimal
│  ├─ Realtidsfeedback
│  ├─ Sentimentanalys av kundsvar
│  ├─ Intressetrender
│  ├─ Vad gick bra / Vad kan förbättras
│  └─ Nästa bästa åtgärd
│
├─ 🔧 Scenarioadministration
│  ├─ Skapa nya scenarier
│  ├─ Redigera befintliga
│  ├─ Koppla till produkter
│  ├─ Globala vs. användarspecifika
│  └─ Ta bort scenarier
│
├─ 🤖 AI-generering av scenarier
│  ├─ Generera från produktdokumentation
│  ├─ Batch-generering (flera samtidigt)
│  ├─ Realistiska personas
│  ├─ Automatiska pain points
│  ├─ Framgångskriterier
│  └─ Vanliga misstag
│
└─ 🎙️ Röstval per scenario
   ├─ Manlig röst: sv-SE-MattiasNeural
   ├─ Kvinnlig röst 1: sv-SE-SofieNeural
   └─ Kvinnlig röst 2: sv-SE-HilleviNeural
```

### 🧪 Demosamtal (Demo Mode)
```
├─ 📖 Interaktiva demo-scripts
│  ├─ Produktdemonstrationer
│  ├─ Steg-för-steg-guidning
│  ├─ Målgrupp-anpassade
│  └─ Tidsuppskattning
│
├─ 🎯 Demo-script-struktur
│  ├─ Namn & beskrivning
│  ├─ Varaktighet (minuter)
│  ├─ Målgrupp
│  ├─ Öppningshook
│  ├─ Nyckelbudskap (key talking points)
│  ├─ Demo-flöde (6-8 steg)
│  ├─ Vanliga frågor & svar
│  ├─ Invändningshantering
│  ├─ Framgångskriterier
│  └─ Nästa steg efter demon
│
├─ 📝 Steg-komponenter
│  ├─ Titel & beskrivning
│  ├─ Talking points (3-5 st)
│  ├─ Förväntade kundfrågor (2-4 st)
│  ├─ Tips för steget (2-3 st)
│  └─ Steg-komplettering
│
├─ 🎙️ Interaktiva funktioner
│  ├─ Steg-för-steg-navigering
│  ├─ Vanliga frågor (FAQ) sidebar
│  ├─ Invändningshantering sidebar
│  ├─ Text-to-speech för frågor/svar
│  └─ Framstegsvisualisering
│
├─ ⚙️ Demo-administration
│  ├─ Skapa/redigera scripts
│  ├─ Koppla till produkter
│  ├─ Aktivera/inaktivera
│  └─ Globala vs. användarspecifika
│
└─ 🤖 AI-generering av demo-scripts
   ├─ Generera från produktdokumentation
   ├─ Använder kunskapsbas-dokument
   ├─ Hämtar befintlig coaching-data
   ├─ Anpassat för målgrupp & demotyp
   └─ Sparas automatiskt till databas
```

### 📚 Kunskapsbas (Knowledge Base)
```
├─ 📄 Dokumenthantering
│  ├─ Ladda upp PDF, DOCX, TXT
│  ├─ URL-import
│  ├─ Dokumenttitel & beskrivning
│  └─ Filstorlek & metadata
│
├─ 🔄 Dokumentbearbetning
│  ├─ Status: Pending → Processing → Completed/Failed
│  ├─ Textextraktion
│  ├─ Sammanfattning (AI-genererad)
│  ├─ Embedding-generering
│  ├─ Chunking för långa dokument
│  └─ Vektorisering för RAG
│
├─ 🔍 RAG-testare
│  ├─ Testa kunskapsbas-frågor
│  ├─ Visa relevanta dokument
│  ├─ Streaming AI-svar
│  └─ Prompt-testning
│
└─ 🔗 Användning
   ├─ Referens i scenariogenerering
   ├─ Kontext för AI-analys
   └─ Demo-script-generering
```

---

## ⚙️ ADMINISTRATION & KONFIGURATION

### 🛠️ Coaching-administration
```
├─ 🎯 Trigger Patterns
│  ├─ Nyckelord/fraser
│  ├─ Trigger-typ (invändning, konkurrent, etc.)
│  ├─ Produkt-koppling
│  └─ Prioritet
│
├─ ⚔️ Battlecards
│  ├─ Konkurrent-namn
│  ├─ Våra fördelar (3-5 st)
│  ├─ Deras svagheter (3-5 st)
│  ├─ Nyckelmeddelanden
│  └─ Talking points
│
├─ 🚫 Invändningshanterare
│  ├─ Invändning
│  ├─ Kategori (Pris, Timing, Konkurrent, etc.)
│  ├─ Svarsstrategier (3 st)
│  └─ Talking points
│
├─ 📚 Case Studies
│  ├─ Kundnamn & bransch
│  ├─ Utmaning
│  ├─ Lösning
│  ├─ Resultat (mätbara)
│  └─ Talking points
│
└─ 💼 Erbjudanden
   ├─ Namn & kort beskrivning
   ├─ Lång beskrivning
   ├─ Målgrupp
   ├─ Nyckelfunktioner
   ├─ Fördelar
   └─ Prismodell
```

### 📦 Produktadministration
```
├─ 🏷️ Produktprofiler
│  ├─ Produktnamn & beskrivning
│  ├─ Bransch & målgrupp
│  ├─ Nyckelfunktioner (JSON)
│  ├─ Värdeerbjudanden (JSON)
│  ├─ Vanliga invändningar (JSON)
│  ├─ Prismodell & detaljer
│  ├─ Logotyp & webbplats-URL
│  └─ Aktiv/inaktiv status
│
├─ 👥 Användar-produktkopplingar
│  ├─ Tilldela produkter till användare
│  ├─ Hantera produktåtkomst
│  └─ Aktivera/inaktivera tilldelningar
│
└─ 🔗 Per-produktdata
   ├─ Trigger patterns
   ├─ Battlecards
   ├─ Invändningshanterare
   ├─ Case studies
   └─ Erbjudanden
```

### 👤 Användaradministration
```
├─ 🔐 Autentisering
│  ├─ E-post-baserad inloggning
│  ├─ Supabase-autentisering
│  ├─ Sessionspersistens
│  └─ Utloggning
│
├─ 🎫 Access Control
│  ├─ Rad-nivå-säkerhet (RLS)
│  ├─ Användardata-isolering
│  └─ Produktåtkomst-kontroll
│
└─ 📊 Användarmeny
   ├─ Profilinformation
   ├─ Inställningar
   └─ Logga ut
```

---

## 🤖 AI-FUNKTIONER

### 💬 GPT-4o Integration
```
├─ 📞 Samtalsanalys
│  ├─ Transkript-analys
│  ├─ Strukturerad JSON-respons
│  ├─ Företagsinformation-extraktion
│  ├─ Sentiment-analys
│  └─ Token-baserad kostnadsskattning
│
├─ 🎭 Scenariogenerering
│  ├─ Realistiska personas
│  ├─ Pain points-generering
│  ├─ Framgångskriterier
│  └─ Batch-generering
│
├─ 📖 Demo-script-generering
│  ├─ Från produktdokumentation
│  ├─ Komplett script-struktur
│  ├─ FAQ-generering
│  └─ Invändningshantering
│
└─ 🔒 Säkerhet
   ├─ Backend-funktionskörning
   ├─ Inga direkta API-nyckelexponeringar
   └─ Säkra Vercel-endpoints
```

### 🎙️ Azure Speech Services
```
├─ 🎤 Speech-to-Text
│  ├─ Region: swedencentral
│  ├─ Språk: sv-SE (Svenska)
│  ├─ Realtids streaming-igenkänning
│  ├─ Ljudfil-transkribering
│  ├─ Konfidensskattning
│  └─ Preliminära & finala resultat
│
└─ 🔊 Text-to-Speech
   ├─ Röstsyntes
   ├─ Svenskt stöd
   ├─ Tre neurala röster:
   │  ├─ sv-SE-MattiasNeural (Man)
   │  ├─ sv-SE-SofieNeural (Kvinna, vänlig)
   │  └─ sv-SE-HilleviNeural (Kvinna, tydlig)
   ├─ Används i träningsläge
   └─ Används i demoläge
```

---

## 💾 DATA & DATABAS

### 📊 Supabase Backend
```
├─ 🗄️ PostgreSQL-databas
│  ├─ Realtids-prenumerationer
│  ├─ Rad-nivå-säkerhet (RLS)
│  ├─ Användarautentisering
│  ├─ Fillagring
│  └─ Vektorsökning (för embeddings)
│
├─ 📋 Databastabeller (15 st)
│  ├─ call_sessions
│  ├─ transcript_segments
│  ├─ session_coaching_tips
│  ├─ trigger_patterns
│  ├─ battlecards
│  ├─ objection_handlers
│  ├─ case_studies
│  ├─ offers
│  ├─ product_profiles
│  ├─ knowledge_base
│  ├─ training_scenarios
│  ├─ user_products
│  ├─ demo_scripts
│  └─ auth.users (Supabase)
│
└─ 🔐 Säkerhet
   ├─ RLS-policies per tabell
   ├─ Användar-baserad dataisolering
   └─ Produktåtkomst-kontroll
```

### 📦 Datatyper som lagras
```
├─ 📞 Samtalssessioner
│  ├─ Session-ID, användar-ID
│  ├─ Status (idle, recording, paused, stopped)
│  ├─ Start/slut-tidsstämplar
│  ├─ Kundinformation (namn, företag, roll)
│  ├─ Fullständigt transkript
│  ├─ Varaktighet (sekunder)
│  ├─ Sentiment (positiv, neutral, negativ)
│  ├─ Ämnen diskuterade
│  ├─ Samtalsanalysdata (35+ fält)
│  └─ Import-metadata
│
├─ 📝 Transkriptsegment
│  ├─ Segment-ID
│  ├─ Session-ID (foreign key)
│  ├─ Textinnehåll
│  ├─ Tidsstämpel (ms)
│  ├─ Talare (säljare, kund, okänd)
│  ├─ Konfidensnivå
│  └─ Är final (boolean)
│
├─ 💡 Coachningtips
│  ├─ Tip-ID
│  ├─ Session-ID (foreign key)
│  ├─ Typ (6 typer)
│  ├─ Prioritet
│  ├─ Trigger-nyckelord
│  ├─ Titel & innehåll
│  └─ Avfärdad (boolean)
│
├─ 🎓 Träningsscenarier
│  ├─ Scenario-ID, användar-ID
│  ├─ Namn, svårighetsgrad
│  ├─ Persona-detaljer
│  ├─ Pain points, budget
│  ├─ Framgångskriterier
│  ├─ Röstval
│  └─ Auto-genererad flag
│
├─ 📚 Kunskapsbas-dokument
│  ├─ Dokument-ID
│  ├─ Produkt-ID (foreign key)
│  ├─ Källtyp (pdf, docx, url, text)
│  ├─ Titel, innehåll
│  ├─ Bearbetat innehåll
│  ├─ Sammanfattning, embedding
│  ├─ Chunk-index
│  └─ Bearbetningsstatus
│
└─ 🧪 Demo-scripts
   ├─ Script-ID, användar-ID, produkt-ID
   ├─ Namn, beskrivning
   ├─ Målgrupp, varaktighet
   ├─ Demo-flöde (JSON)
   ├─ FAQ (JSON array)
   ├─ Invändningshantering (JSON)
   └─ Framgångskriterier
```

---

## 🔌 API-ENDPOINTS

### 📡 Backend API (Vercel Functions)
```
├─ POST /api/analyze-call
│  └─ Transkriptanalys med GPT-4o
│
├─ POST /api/process-document
│  └─ Kunskapsbas-dokumentbearbetning
│
├─ POST /api/generate-scenarios
│  └─ AI-generering av träningsscenarier
│
├─ POST /api/generate-offers
│  └─ AI-generering av erbjudanden
│
├─ POST /api/generate-triggers
│  └─ AI-generering av trigger patterns
│
├─ POST /api/generate-battlecards
│  └─ AI-generering av battlecards
│
├─ POST /api/generate-objections
│  └─ AI-generering av invändningshanterare
│
├─ POST /api/generate-cases
│  └─ AI-generering av case studies
│
├─ POST /api/generate-demo-script
│  └─ AI-generering av demo-scripts
│
├─ POST /api/ai-customer
│  └─ AI-kund för träningsläge
│
├─ POST /api/ai-customer-quick
│  └─ Snabb AI-kund-respons
│
├─ GET /api/training-scenarios
│  └─ Hämta träningsscenarier
│
├─ POST /api/training-scenarios
│  └─ Skapa nytt scenario
│
├─ PUT /api/update-scenario
│  └─ Uppdatera scenario
│
└─ POST /api/test-rag
   └─ Testa RAG-frågor mot kunskapsbas
```

---

## 🎨 ANVÄNDARUPPLEVELSE

### ⌨️ Kortkommandon
```
├─ Ctrl+Shift+S → Start/Stopp inspelning
└─ Ctrl+Shift+P → Pausa/Fortsätt
```

### 🎯 Visuella Indikatorer
```
├─ 🔴 Lyssnar-indikator (animerad pulsering)
├─ 📊 Inspelningsstatus-visning
├─ 🟢🟡🔴 Intressenivå-färger
├─ ⏳ Laddnings-spinners
├─ 📈 Framstegsbar
├─ ❌ Felmeddelanden
└─ ✅ Framgångsbekräftelser
```

### 🖥️ UI-Komponenter
```
├─ 📱 Modaler (avfärdningsbara)
├─ 📋 Fullskärms-paneler
├─ 📂 Dropdown-menyer
├─ 💡 Tooltips
├─ 📖 Hopfällbara sektioner
├─ 📄 Paginering/scrollning
└─ 🎨 Responsiv design
```

### 📱 Layouter
```
├─ Två-kolumn-grid (transkript + coaching)
├─ Responsiva paneler
├─ Scrollbart innehåll
├─ Adaptiva knapplayouter
└─ Mobilanpassad design
```

---

## 🔄 ARBETSFLÖDEN

### 1️⃣ Samtalsarbetsflöde
```
Dashboard
   ↓
Starta samtal
   ↓
Aktivera paneler (Transkript + Coaching)
   ↓
Starta taligenkänning (Mikrofon)
   ↓
Realtids transkribering
   ↓
Realtids coachningtips
   ↓
Live-analysuppdateringar
   ↓
Pausa/Fortsätt (vid behov)
   ↓
Stoppa inspelning
   ↓
AI-analys körs
   ↓
Spara till databas
   ↓
Visa i historik
```

### 2️⃣ Träningsarbetsflöde
```
Dashboard → Träning
   ↓
Välj scenario
   ↓
Initialisera med persona
   ↓
Tala din pitch
   ↓
Få AI-kund-svar
   ↓
Realtidsfeedback (coaching-nivå)
   ↓
Intresse-spårning
   ↓
Komplettera scenario
   ↓
Visa feedback-sammanfattning
```

### 3️⃣ Demo-arbetsflöde
```
Dashboard → Demosamtal
   ↓
Välj demo-script
   ↓
Navigera steg
   ↓
Visa talking points
   ↓
Svara på frågor
   ↓
Hantera invändningar
   ↓
Spåra komplettering
   ↓
Visa framgångsindikatorer
```

### 4️⃣ Kunskapshantering
```
Träning → Kunskapsbas
   ↓
Välj/skapa produkt
   ↓
Ladda upp dokument (PDF, DOCX, etc.)
   ↓
Bearbeta dokument (embedding)
   ↓
Vektoriseringsindexering
   ↓
Användning i RAG-frågor
   ↓
Referens i scenariogenerering
```

### 5️⃣ Adminarbetsflöde
```
Åtkomst admin-paneler från menyer
   ↓
Hantera coaching-data
   ↓
Skapa/redigera/ta bort objekt
   ↓
Tilldela till produkter
   ↓
Synkronisera till databas
   ↓
Återställ till standard (vid behov)
```

---

## 🌐 SPRÅK & LOKALISERING

### 🇸🇪 Språkstöd
```
├─ Svenska (sv-SE) - Primärt
├─ Engelsk UI blandat in
├─ Datum/tid-formatering (sv-SE)
├─ Svensk taligenkänning
├─ Svensk text-till-tal
└─ Svenskt samtalskontext
```

---

## 🏗️ TEKNISK ARKITEKTUR

### 📦 State Management
```
Zustand Stores:
├─ useSessionStore → Samtalssession-hantering
├─ useCoachingStore → Coaching-data (persistent)
└─ useOfferStore → Erbjudande-hantering

Features:
├─ Lokal persistens (localStorage)
├─ Async-databas-synk
└─ Prenumerationsstöd
```

### 🪝 Custom Hooks (9 st)
```
├─ useSpeechRecognition → Live Azure Speech
├─ useMockSpeechRecognition → Demo-läge fallback
├─ useAudioFileTranscription → Filbearbetning
├─ useTextToSpeech → Röstsyntes
├─ useAuth → Autentiseringskontext
├─ useSessionStore → Session-state
├─ useCoachingStore → Coaching-state
├─ useOfferStore → Offer-state
└─ Custom API-anrops-hooks
```

### 🧩 Komponenter (28+ st)
```
Huvudkomponenter:
├─ SalesCoach (huvudcontainer)
├─ Dashboard (hem)
├─ TranscriptPanel
├─ CoachingPanel
├─ LiveCallAnalysisPanel
├─ HistoryPanel
├─ TrainingMode
├─ DemoMode
├─ RAGTester
├─ ScenarioGenerator
├─ CallAnalysisModal
├─ ImportTranscriptModal
└─ ... 16+ ytterligare komponenter

Admin-komponenter:
├─ AdminPanel
├─ CoachingAdminPanel
├─ ProductAdminPanel
├─ ScenariosAdmin
├─ DemoAdminPanel
├─ UserProductsAdmin
└─ KnowledgeBaseManager

Utility-komponenter:
├─ KundsamtalDropdown
├─ LoginPage
├─ HelpPanel
├─ OfferForm
├─ ProductManager
├─ FileUpload
├─ DocumentList
└─ SupabaseProvider
```

---

## 🔒 SÄKERHET

### 🛡️ Autentisering & Auktorisering
```
├─ Supabase-autentisering
├─ Användar-sessionshantering
├─ E-post-baserad inloggning
├─ Rad-nivå-säkerhet (RLS)
├─ Användardata-isolering
└─ Produktåtkomst-kontroll
```

### 🔐 API-säkerhet
```
├─ Backend-funktionskörning
├─ Inga direkta API-nyckelexponeringar
├─ Säkra OpenAI/Azure-anrop
└─ CORS-headers korrekt konfigurerade
```

---

## 📊 STATISTIK

### Totaler:
- **Huvudfunktioner**: 7 (Dashboard, Kundsamtal, Träning, Demo, Kunskapsbas, Admin, AI)
- **Komponenter**: 28+
- **API-endpoints**: 14
- **Databastabeller**: 15
- **AI-funktioner**: 9 generationsendpoints
- **Hooks**: 9+ custom hooks
- **Stores**: 3 Zustand stores
- **Språk**: Svenska (primärt)
- **Integrationer**: Azure Speech, OpenAI GPT-4o, Supabase

---

**Senast uppdaterad**: 2026-01-31
**Version**: 1.0
**Plattform**: React + TypeScript + Supabase + Azure + OpenAI
