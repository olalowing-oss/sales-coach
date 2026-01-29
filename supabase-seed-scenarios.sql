-- ============================================
-- SEED TRAINING SCENARIOS
-- ============================================
-- Kör detta i Supabase SQL Editor för att lägga till standardscenarion
-- Observera: Detta skapar globala scenarios (is_global = true) som alla användare kan se

-- 1. Entusiastisk Startup CTO (Easy)
INSERT INTO training_scenarios (
  id, user_id, name, difficulty, description,
  persona_name, persona_role, company_name, company_size, industry,
  pain_points, budget, decision_timeframe, personality,
  objectives, competitors, opening_line,
  success_criteria, common_mistakes, is_global
) VALUES (
  'enthusiastic-startup-cto',
  NULL, -- NULL user_id för globala scenarios
  '🚀 Entusiastisk Startup CTO',
  'easy',
  'Snabbväxande startup som behöver standardisera sin IT. Positiv och snabb i beslut.',
  'Emma Lindberg',
  'CTO',
  'GrowthTech Solutions',
  '35 anställda (växer snabbt)',
  'SaaS',
  ARRAY[
    'Kaos med många olika verktyg (Slack, Zoom, Google Meet, Notion)',
    'Svårt att onboarda nya medarbetare snabbt',
    'Behöver bättre samarbetsverktyg',
    'Säkerhetskrav från investerare'
  ],
  '200,000-300,000 SEK/år',
  'Omedelbart (1-2 veckor)',
  'Entusiastisk, tech-savvy, pragmatisk, snabba beslut, fokuserad på utvecklarupplevelse',
  ARRAY[
    'Hitta EN plattform för allt',
    'Snabb implementation',
    'Bra integrationer med dev-tools (GitHub, Jira)',
    'Få startup-rabatt om möjligt'
  ],
  ARRAY['Google Workspace', 'Slack'],
  'Hej! Vi växer som bara den och behöver verkligen få ordning på våra verktyg. Vi har hört att ni kan hjälpa oss?',
  ARRAY[
    'Visa förståelse för deras utmaning med snabb tillväxt',
    'Förklara hur Teams unifierar alla verktyg',
    'Nämn bra integrationer med dev-tools',
    'Föreslå snabb pilot',
    'Fråga om budget och beslutsprocess'
  ],
  ARRAY[
    'Prata för mycket om enterprise-features de inte behöver',
    'Inte lyssna på deras specifika pain points',
    'För lång säljcykel - de vill ha snabba svar',
    'Glömma fråga om tekniska krav'
  ],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 2. Skeptisk CTO (Medium)
INSERT INTO training_scenarios (
  id, user_id, name, difficulty, description,
  persona_name, persona_role, company_name, company_size, industry,
  pain_points, budget, decision_timeframe, personality,
  objectives, competitors, opening_line,
  success_criteria, common_mistakes, is_global
) VALUES (
  'skeptical-cto',
  NULL,
  '⚠️ Skeptisk CTO',
  'medium',
  'Erfaren teknisk chef som ifrågasätter allt. Kräver bevis och har dåliga erfarenheter av Microsoft.',
  'Erik Lundström',
  'CTO',
  'Nordic Manufacturing Group',
  '400 anställda',
  'Tillverkning',
  ARRAY[
    'Gamla on-premise servrar som är dyra att underhålla',
    'Behöver kunna skala snabbt',
    'Säkerhetskrav (ISO 27001)',
    'Dåliga erfarenheter av Office 2010'
  ],
  'Vet inte - nervösa för molnkostnader',
  '3-6 månader',
  'Skeptisk, tekniskt kunnig, kräver bevis, rädd för leverantörsinlåsning, tar beslut långsamt',
  ARRAY[
    'Bevisa att Azure är säkert',
    'Visa kostnadsfördelar vs on-premise',
    'Motbevisa dåliga Microsoft-erfarenheter',
    'Få teknisk dokumentation'
  ],
  ARRAY['AWS', 'On-premise'],
  'Jag är skeptisk till molnlösningar, speciellt Microsoft. Bevisa för mig varför vi skulle migrera.',
  ARRAY[
    'Lyssna på och erkänn tidigare dåliga erfarenheter',
    'Ge konkreta säkerhetsexempel (certifieringar, datacenter-lokalisering)',
    'Jämför kostnader: TCO-analys on-premise vs Azure',
    'Erbjud tekniskt djupdyk-möte',
    'Dela case studies från liknande företag'
  ],
  ARRAY[
    'Bli defensiv om Microsoft-kritik',
    'Prata marknadsfluff istället för teknik',
    'Inte hantera konkurrentjämförelse professionellt',
    'Pusha för snabb closing - han behöver tid',
    'Inte ge konkreta bevis och referenser'
  ],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 3. Prisfokuserad Inköpschef (Hard)
INSERT INTO training_scenarios (
  id, user_id, name, difficulty, description,
  persona_name, persona_role, company_name, company_size, industry,
  pain_points, budget, decision_timeframe, personality,
  objectives, competitors, opening_line,
  success_criteria, common_mistakes, is_global
) VALUES (
  'price-focused-procurement',
  NULL,
  '💰 Prisfokuserad Inköpschef',
  'hard',
  'Tuff förhandlare som endast bryr sig om pris. Jämför med billigare alternativ.',
  'Robert Ek',
  'Inköpschef',
  'BudgetTech AB',
  '200 anställda',
  'Logistik',
  ARRAY[
    'Betalar för gamla Office 2016-licenser',
    'Snäva marginaler',
    'Behöver spara pengar',
    'VD kräver kostnadssänkningar'
  ],
  'Så lite som möjligt',
  '2-3 månader (budgetcykel)',
  'Hård förhandlare, fixerad vid pris, nämner konkurrenter ofta, söker rabatter, skeptisk till värde',
  ARRAY[
    'Få lägsta möjliga pris',
    'Jämföra med Google Workspace, LibreOffice',
    'Pressa på rabatter',
    'Hitta dolda kostnader'
  ],
  ARRAY['Google Workspace', 'LibreOffice', 'OpenOffice'],
  'Era priser verkar helt vansinniga. Google Workspace är ju mycket billigare. Varför ska vi betala så mycket?',
  ARRAY[
    'INTE gå in i prisförhandling direkt - fokusera på värde först',
    'Kvantifiera kostnaden av nuvarande situation',
    'Visa konkreta besparingar (produktivitet, support-tid)',
    'Jämför total cost of ownership (TCO), inte bara licenspris',
    'Ställ frågor om deras verkliga behov',
    'Erbjud volymrabatt när värde är etablerat'
  ],
  ARRAY[
    'Ge rabatt för tidigt utan att etablera värde',
    'Bli defensiv om pris',
    'Inte ställa frågor om cost of doing nothing',
    'Jämföra äpplen med päron (Basic vs Premium)',
    'Inte räkna in mjuka värden (support, säkerhet, uptime)'
  ],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 4. Stressad IT-chef (Medium)
INSERT INTO training_scenarios (
  id, user_id, name, difficulty, description,
  persona_name, persona_role, company_name, company_size, industry,
  pain_points, budget, decision_timeframe, personality,
  objectives, competitors, opening_line,
  success_criteria, common_mistakes, is_global
) VALUES (
  'busy-it-manager',
  NULL,
  '⏰ Stressad IT-chef',
  'medium',
  'Har akuta problem som måste lösas NU. Tidsbrist men motiverad köpare.',
  'Maria Nilsson',
  'IT-chef',
  'Retail Group Sweden',
  '180 anställda, 45 butiker',
  'Retail',
  ARRAY[
    'Akut: Gammalt system kraschar ofta',
    'Personalen klagar på dåliga verktyg',
    'VD kräver lösning innan Q2',
    'Saknar resurser för stor implementation'
  ],
  '300,000 SEK budgeterat',
  'Omedelbart (1 månad max)',
  'Stressad, brådskande, vill ha enkla lösningar, rädd för komplexa implementationer, behöver snabba svar',
  ARRAY[
    'Lösa akuta problem snabbt',
    'Enkel implementation',
    'Minimal påverkan på verksamheten',
    'Få snabb support'
  ],
  ARRAY['Nuvarande legacy-system'],
  'Vi har ett akut problem - vårt nuvarande system funkar inte. Hur snabbt kan ni hjälpa oss?',
  ARRAY[
    'Visa empati för deras stress',
    'Ge konkret tidslinje (dagar, inte månader)',
    'Föreslå fasad implementation',
    'Nämn 24/7 support',
    'Föreslå nästa konkreta steg (möte, demo)',
    'Förenkla - prata inte om 100 features'
  ],
  ARRAY[
    'Prata för länge - de vill ha action',
    'Komplicera lösningen',
    'Inte ge konkreta nästa steg',
    'Glömma fråga om specifikt smärtpunkt',
    'Inte erbjuda snabb pilot/POC'
  ],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 5. Compliance-ansvarig (Hard)
INSERT INTO training_scenarios (
  id, user_id, name, difficulty, description,
  persona_name, persona_role, company_name, company_size, industry,
  pain_points, budget, decision_timeframe, personality,
  objectives, competitors, opening_line,
  success_criteria, common_mistakes, is_global
) VALUES (
  'compliance-officer',
  NULL,
  '🔒 Compliance-ansvarig',
  'hard',
  'Finansbransch med strikta regulatoriska krav. Mycket fokus på säkerhet och compliance.',
  'Linda Karlsson',
  'CISO',
  'Nordic Finance Solutions',
  '150 anställda',
  'Finans',
  ARRAY[
    'Måste följa GDPR, ISO 27001, Finansinspektionen',
    'Hantera känslig kunddata',
    'Krav från revisorer',
    'Nervös för dataintrång'
  ],
  'Budget finns - säkerhet är prioritet #1',
  '3-6 månader (måste gå igenom compliance-team)',
  'Mycket noggrann, riskmedveten, kräver dokumentation, långsam beslutsprocess, behöver involvera många',
  ARRAY[
    'Bevisa att det är säkert',
    'Få all compliance-dokumentation',
    'Förstå datahantering och encryption',
    'Träffa säkerhetsarkitekter',
    'Se audit logs och monitoring'
  ],
  ARRAY['On-premise', 'AWS'],
  'Vi hanterar extremt känslig finansiell data. Hur kan ni garantera att det är säkert i molnet?',
  ARRAY[
    'Ge konkreta säkerhetscertifieringar (ISO 27001, SOC 2, etc)',
    'Förklara datacenter-lokalisering (Sverige/EU)',
    'Diskutera encryption (at rest, in transit)',
    'Nämn compliance-verktyg (audit logs, DLP)',
    'Erbjuda möte med säkerhetsarkitekt',
    'Dela compliance-dokumentation',
    'Visa förståelse för deras regulatoriska miljö'
  ],
  ARRAY[
    'Ge vaga säkerhetssvar',
    'Inte ha tekniska detaljer',
    'Pusha för snabb closing',
    'Inte erkänna komplexiteten i deras krav',
    'Glömma fråga om specifika compliance-krav'
  ],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 6. HR-chef söker effektivitet (Easy)
INSERT INTO training_scenarios (
  id, user_id, name, difficulty, description,
  persona_name, persona_role, company_name, company_size, industry,
  pain_points, budget, decision_timeframe, personality,
  objectives, competitors, opening_line,
  success_criteria, common_mistakes, is_global
) VALUES (
  'hr-manager-copilot',
  NULL,
  '👥 HR-chef söker effektivitet',
  'easy',
  'HR-chef som spenderar för mycket tid på administration. Nyfiken på Copilot för att automatisera rekrytering och onboarding.',
  'Sofia Bergström',
  'HR-chef',
  'Nordic Consulting Group',
  '80 anställda',
  'Konsultverksamhet',
  ARRAY[
    'Spenderar 60% av tiden på att skriva jobbeskrivningar och mejl',
    'Svårt att hålla koll på alla kandidater och processer',
    'Onboarding tar för lång tid - mycket manuellt arbete',
    'Teamet klagar på att HR-dokument är svåra att hitta'
  ],
  '150,000 SEK/år',
  '2-3 veckor',
  'Positiv, stressad, öppen för ny teknik, värdesätter tidsbesparingar, vill se konkreta exempel',
  ARRAY[
    'Automatisera skrivarbete (jobbeskrivningar, mejl, policies)',
    'Samla all HR-dokumentation på ett ställe',
    'Få hjälp med att analysera kandidatdata',
    'Snabbare onboarding-process'
  ],
  ARRAY['Fortsätta manuellt', 'Google Workspace'],
  'Hej! Jag har hört att Copilot kan hjälpa mig spara tid på skrivarbete. Jag drunknar i mejl och dokument just nu!',
  ARRAY[
    'Ge konkreta exempel på hur Copilot skriver jobbeskrivningar',
    'Visa hur Copilot i Outlook hanterar mejl',
    'Demonstrera SharePoint för dokumenthantering',
    'Nämn Loop för samarbete i HR-teamet',
    'Räkna på tidsbesparingar (t.ex. 10 timmar/vecka)',
    'Föreslå en 2-veckors pilot med HR-teamet'
  ],
  ARRAY[
    'Fokusera för mycket på tekniska detaljer istället för värde',
    'Inte fråga om hennes dagliga arbetsflöde',
    'Glömma nämna ROI och tidsbesparingar',
    'Inte ge konkreta use cases för HR',
    'För komplex lösning - hon vill ha det enkelt'
  ],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 7. Marknadschef vill bli mer produktiv (Easy)
INSERT INTO training_scenarios (
  id, user_id, name, difficulty, description,
  persona_name, persona_role, company_name, company_size, industry,
  pain_points, budget, decision_timeframe, personality,
  objectives, competitors, opening_line,
  success_criteria, common_mistakes, is_global
) VALUES (
  'marketing-manager-productivity',
  NULL,
  '📱 Marknadschef vill bli mer produktiv',
  'easy',
  'Kreativ marknadschef som vill fokusera mer på strategi och mindre på admin. Intresserad av AI-verktyg.',
  'Alexander Nordström',
  'Marknadschef',
  'Bright Marketing Agency',
  '25 anställda',
  'Marknadsföring',
  ARRAY[
    'För mycket tid går till rapporter och sammanfattningar',
    'Svårt att hålla kreativa teamet synkat',
    'Behöver snabbare sätt att skapa content-utkast',
    'Missar deadlines pga administrativt arbete'
  ],
  '200,000 SEK/år (har budget för verktyg)',
  '1-2 veckor (snabba beslut)',
  'Kreativ, nyfiken på AI, vill ha quick wins, värderar design och UX, snabba beslut',
  ARRAY[
    'AI-hjälp för att skriva content-utkast',
    'Automatisera rapportering och sammanfattningar',
    'Bättre samarbete med kreativa teamet',
    'Integration med befintliga verktyg (Adobe, Canva)'
  ],
  ARRAY['ChatGPT Plus', 'Notion AI'],
  'Hallå! Jag använder redan ChatGPT, men funderar på om Microsoft Copilot kan ge mer värde för vårt team?',
  ARRAY[
    'Jämför Copilot med ChatGPT - visa enterprise-fördelar',
    'Ge exempel på Copilot i PowerPoint för presentationer',
    'Visa hur Copilot i Word skapar content-utkast',
    'Nämn integration med Teams för kreativt samarbete',
    'Diskutera datasäkerhet (viktigare än ChatGPT)',
    'Föreslå team-licenser med styrning'
  ],
  ARRAY[
    'Inte erkänna att ChatGPT är bra',
    'Inte förklara skillnaden mellan consumer och enterprise AI',
    'Glömma nämna datasäkerhet och compliance',
    'För teknisk - han vill ha kreativa use cases',
    'Inte visa integrationer med M365-appar'
  ],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 8. Småföretagare vill modernisera (Easy)
INSERT INTO training_scenarios (
  id, user_id, name, difficulty, description,
  persona_name, persona_role, company_name, company_size, industry,
  pain_points, budget, decision_timeframe, personality,
  objectives, competitors, opening_line,
  success_criteria, common_mistakes, is_global
) VALUES (
  'small-business-modernization',
  NULL,
  '🏢 Småföretagare vill modernisera',
  'easy',
  'Småföretagare som fortfarande använder gamla verktyg. Vill ta steget till molnet och bli mer professionell.',
  'Lars Andersson',
  'VD och grundare',
  'Anderssons Måleri AB',
  '12 anställda',
  'Bygg och hantverk',
  ARRAY[
    'Använder Hotmail och privata Gmail-konton',
    'Delar filer via USB och mejl',
    'Inget gemensamt kalendersystem',
    'Ser oprofessionella ut mot kunder'
  ],
  '50,000-80,000 SEK/år',
  'Omedelbart om det är enkelt',
  'Pragmatisk, inte teknikvän, värderar enkelhet, vill ha professionell image, behöver stöd vid implementation',
  ARRAY[
    'Professionella mejladresser (@anderssonsmaleri.se)',
    'Enklare fildelning mellan kontor och projekt',
    'Gemensam kalender för alla i teamet',
    'Se mer professionell ut mot kunder'
  ],
  ARRAY['Fortsätta som idag', 'Google Workspace'],
  'Tja! Vi måste nog börja se lite mer proffsiga ut. Alla har ju olika mejladresser nu och det är lite kaos. Kan ni hjälpa oss?',
  ARRAY[
    'Förklara professional email med egen domän',
    'Visa hur enkelt OneDrive är för fildelning',
    'Demonstrera gemensam kalender i Outlook',
    'Nämn Teams för enkel kommunikation på byggen',
    'Betona enkel setup och migrering',
    'Erbjud supportpaket för implementation',
    'Räkna på småföretagspris'
  ],
  ARRAY[
    'Prata om avancerade features han inte behöver',
    'Inte fråga om deras nuvarande sätt att jobba',
    'Glömma nämna onboarding-support',
    'För dyrt - visa basic-paket först',
    'Inte ge exempel från andra småföretag'
  ],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Verify insertion
SELECT id, name, difficulty FROM training_scenarios WHERE is_global = true ORDER BY difficulty, name;
