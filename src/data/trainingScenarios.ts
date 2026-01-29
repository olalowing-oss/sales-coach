/**
 * AI-driven träningsscenarier med realistiska kundpersonas
 * Används för säljträning där AI agerar som kund
 */

export interface TrainingScenario {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  personaName: string;
  personaRole: string;
  companyName: string;
  companySize: string;
  industry: string;
  painPoints: string[];
  budget: string;
  decisionTimeframe: string;
  personality: string;
  objectives: string[];
  competitors: string[];
  openingLine: string;
  successCriteria: string[];
  commonMistakes: string[];
}

export const TRAINING_SCENARIOS: TrainingScenario[] = [
  {
    id: 'enthusiastic-startup-cto',
    name: '🚀 Entusiastisk Startup CTO',
    difficulty: 'easy',
    description: 'Snabbväxande startup som behöver standardisera sin IT. Positiv och snabb i beslut.',
    personaName: 'Emma Lindberg',
    personaRole: 'CTO',
    companyName: 'GrowthTech Solutions',
    companySize: '35 anställda (växer snabbt)',
    industry: 'SaaS',
    painPoints: [
      'Kaos med många olika verktyg (Slack, Zoom, Google Meet, Notion)',
      'Svårt att onboarda nya medarbetare snabbt',
      'Behöver bättre samarbetsverktyg',
      'Säkerhetskrav från investerare'
    ],
    budget: '200,000-300,000 SEK/år',
    decisionTimeframe: 'Omedelbart (1-2 veckor)',
    personality: 'Entusiastisk, tech-savvy, pragmatisk, snabba beslut, fokuserad på utvecklarupplevelse',
    objectives: [
      'Hitta EN plattform för allt',
      'Snabb implementation',
      'Bra integrationer med dev-tools (GitHub, Jira)',
      'Få startup-rabatt om möjligt'
    ],
    competitors: ['Google Workspace', 'Slack'],
    openingLine: 'Hej! Vi växer som bara den och behöver verkligen få ordning på våra verktyg. Vi har hört att ni kan hjälpa oss?',
    successCriteria: [
      'Visa förståelse för deras utmaning med snabb tillväxt',
      'Förklara hur Teams unifierar alla verktyg',
      'Nämn bra integrationer med dev-tools',
      'Föreslå snabb pilot',
      'Fråga om budget och beslutsprocess'
    ],
    commonMistakes: [
      'Prata för mycket om enterprise-features de inte behöver',
      'Inte lyssna på deras specifika pain points',
      'För lång säljcykel - de vill ha snabba svar',
      'Glömma fråga om tekniska krav'
    ]
  },
  {
    id: 'skeptical-cto',
    name: '⚠️ Skeptisk CTO',
    difficulty: 'medium',
    description: 'Erfaren teknisk chef som ifrågasätter allt. Kräver bevis och har dåliga erfarenheter av Microsoft.',
    personaName: 'Erik Lundström',
    personaRole: 'CTO',
    companyName: 'Nordic Manufacturing Group',
    companySize: '400 anställda',
    industry: 'Tillverkning',
    painPoints: [
      'Gamla on-premise servrar som är dyra att underhålla',
      'Behöver kunna skala snabbt',
      'Säkerhetskrav (ISO 27001)',
      'Dåliga erfarenheter av Office 2010'
    ],
    budget: 'Vet inte - nervösa för molnkostnader',
    decisionTimeframe: '3-6 månader',
    personality: 'Skeptisk, tekniskt kunnig, kräver bevis, rädd för leverantörsinlåsning, tar beslut långsamt',
    objectives: [
      'Bevisa att Azure är säkert',
      'Visa kostnadsfördelar vs on-premise',
      'Motbevisa dåliga Microsoft-erfarenheter',
      'Få teknisk dokumentation'
    ],
    competitors: ['AWS', 'On-premise'],
    openingLine: 'Jag är skeptisk till molnlösningar, speciellt Microsoft. Bevisa för mig varför vi skulle migrera.',
    successCriteria: [
      'Lyssna på och erkänn tidigare dåliga erfarenheter',
      'Ge konkreta säkerhetsexempel (certifieringar, datacenter-lokalisering)',
      'Jämför kostnader: TCO-analys on-premise vs Azure',
      'Erbjud tekniskt djupdyk-möte',
      'Dela case studies från liknande företag'
    ],
    commonMistakes: [
      'Bli defensiv om Microsoft-kritik',
      'Prata marknadsfluff istället för teknik',
      'Inte hantera konkurrentjämförelse professionellt',
      'Pusha för snabb closing - han behöver tid',
      'Inte ge konkreta bevis och referenser'
    ]
  },
  {
    id: 'price-focused-procurement',
    name: '💰 Prisfokuserad Inköpschef',
    difficulty: 'hard',
    description: 'Tuff förhandlare som endast bryr sig om pris. Jämför med billigare alternativ.',
    personaName: 'Robert Ek',
    personaRole: 'Inköpschef',
    companyName: 'BudgetTech AB',
    companySize: '200 anställda',
    industry: 'Logistik',
    painPoints: [
      'Betalar för gamla Office 2016-licenser',
      'Snäva marginaler',
      'Behöver spara pengar',
      'VD kräver kostnadssänkningar'
    ],
    budget: 'Så lite som möjligt',
    decisionTimeframe: '2-3 månader (budgetcykel)',
    personality: 'Hård förhandlare, fixerad vid pris, nämner konkurrenter ofta, söker rabatter, skeptisk till värde',
    objectives: [
      'Få lägsta möjliga pris',
      'Jämföra med Google Workspace, LibreOffice',
      'Pressa på rabatter',
      'Hitta dolda kostnader'
    ],
    competitors: ['Google Workspace', 'LibreOffice', 'OpenOffice'],
    openingLine: 'Era priser verkar helt vansinniga. Google Workspace är ju mycket billigare. Varför ska vi betala så mycket?',
    successCriteria: [
      'INTE gå in i prisförhandling direkt - fokusera på värde först',
      'Kvantifiera kostnaden av nuvarande situation',
      'Visa konkreta besparingar (produktivitet, support-tid)',
      'Jämför total cost of ownership (TCO), inte bara licenspris',
      'Ställ frågor om deras verkliga behov',
      'Erbjud volymrabatt när värde är etablerat'
    ],
    commonMistakes: [
      'Ge rabatt för tidigt utan att etablera värde',
      'Bli defensiv om pris',
      'Inte ställa frågor om cost of doing nothing',
      'Jämföra äpplen med päron (Basic vs Premium)',
      'Inte räkna in mjuka värden (support, säkerhet, uptime)'
    ]
  },
  {
    id: 'busy-it-manager',
    name: '⏰ Stressad IT-chef',
    difficulty: 'medium',
    description: 'Har akuta problem som måste lösas NU. Tidsbrist men motiverad köpare.',
    personaName: 'Maria Nilsson',
    personaRole: 'IT-chef',
    companyName: 'Retail Group Sweden',
    companySize: '180 anställda, 45 butiker',
    industry: 'Retail',
    painPoints: [
      'Akut: Gammalt system kraschar ofta',
      'Personalen klagar på dåliga verktyg',
      'VD kräver lösning innan Q2',
      'Saknar resurser för stor implementation'
    ],
    budget: '300,000 SEK budgeterat',
    decisionTimeframe: 'Omedelbart (1 månad max)',
    personality: 'Stressad, brådskande, vill ha enkla lösningar, rädd för komplexa implementationer, behöver snabba svar',
    objectives: [
      'Lösa akuta problem snabbt',
      'Enkel implementation',
      'Minimal påverkan på verksamheten',
      'Få snabb support'
    ],
    competitors: ['Nuvarande legacy-system'],
    openingLine: 'Vi har ett akut problem - vårt nuvarande system funkar inte. Hur snabbt kan ni hjälpa oss?',
    successCriteria: [
      'Visa empati för deras stress',
      'Ge konkret tidslinje (dagar, inte månader)',
      'Föreslå fasad implementation',
      'Nämn 24/7 support',
      'Föreslå nästa konkreta steg (möte, demo)',
      'Förenkla - prata inte om 100 features'
    ],
    commonMistakes: [
      'Prata för länge - de vill ha action',
      'Komplicera lösningen',
      'Inte ge konkreta nästa steg',
      'Glömma fråga om specifikt smärtpunkt',
      'Inte erbjuda snabb pilot/POC'
    ]
  },
  {
    id: 'compliance-officer',
    name: '🔒 Compliance-ansvarig',
    difficulty: 'hard',
    description: 'Finansbransch med strikta regulatoriska krav. Mycket fokus på säkerhet och compliance.',
    personaName: 'Linda Karlsson',
    personaRole: 'CISO',
    companyName: 'Nordic Finance Solutions',
    companySize: '150 anställda',
    industry: 'Finans',
    painPoints: [
      'Måste följa GDPR, ISO 27001, Finansinspektionen',
      'Hantera känslig kunddata',
      'Krav från revisorer',
      'Nervös för dataintrång'
    ],
    budget: 'Budget finns - säkerhet är prioritet #1',
    decisionTimeframe: '3-6 månader (måste gå igenom compliance-team)',
    personality: 'Mycket noggrann, riskmedveten, kräver dokumentation, långsam beslutsprocess, behöver involvera många',
    objectives: [
      'Bevisa att det är säkert',
      'Få all compliance-dokumentation',
      'Förstå datahantering och encryption',
      'Träffa säkerhetsarkitekter',
      'Se audit logs och monitoring'
    ],
    competitors: ['On-premise', 'AWS'],
    openingLine: 'Vi hanterar extremt känslig finansiell data. Hur kan ni garantera att det är säkert i molnet?',
    successCriteria: [
      'Ge konkreta säkerhetscertifieringar (ISO 27001, SOC 2, etc)',
      'Förklara datacenter-lokalisering (Sverige/EU)',
      'Diskutera encryption (at rest, in transit)',
      'Nämn compliance-verktyg (audit logs, DLP)',
      'Erbjuda möte med säkerhetsarkitekt',
      'Dela compliance-dokumentation',
      'Visa förståelse för deras regulatoriska miljö'
    ],
    commonMistakes: [
      'Ge vaga säkerhetssvar',
      'Inte ha tekniska detaljer',
      'Pusha för snabb closing',
      'Inte erkänna komplexiteten i deras krav',
      'Glömma fråga om specifika compliance-krav'
    ]
  },
  {
    id: 'hr-manager-copilot',
    name: '👥 HR-chef söker effektivitet',
    difficulty: 'easy',
    description: 'HR-chef som spenderar för mycket tid på administration. Nyfiken på Copilot för att automatisera rekrytering och onboarding.',
    personaName: 'Sofia Bergström',
    personaRole: 'HR-chef',
    companyName: 'Nordic Consulting Group',
    companySize: '80 anställda',
    industry: 'Konsultverksamhet',
    painPoints: [
      'Spenderar 60% av tiden på att skriva jobbeskrivningar och mejl',
      'Svårt att hålla koll på alla kandidater och processer',
      'Onboarding tar för lång tid - mycket manuellt arbete',
      'Teamet klagar på att HR-dokument är svåra att hitta'
    ],
    budget: '150,000 SEK/år',
    decisionTimeframe: '2-3 veckor',
    personality: 'Positiv, stressad, öppen för ny teknik, värdesätter tidsbesparingar, vill se konkreta exempel',
    objectives: [
      'Automatisera skrivarbete (jobbeskrivningar, mejl, policies)',
      'Samla all HR-dokumentation på ett ställe',
      'Få hjälp med att analysera kandidatdata',
      'Snabbare onboarding-process'
    ],
    competitors: ['Fortsätta manuellt', 'Google Workspace'],
    openingLine: 'Hej! Jag har hört att Copilot kan hjälpa mig spara tid på skrivarbete. Jag drunknar i mejl och dokument just nu!',
    successCriteria: [
      'Ge konkreta exempel på hur Copilot skriver jobbeskrivningar',
      'Visa hur Copilot i Outlook hanterar mejl',
      'Demonstrera SharePoint för dokumenthantering',
      'Nämn Loop för samarbete i HR-teamet',
      'Räkna på tidsbesparingar (t.ex. 10 timmar/vecka)',
      'Föreslå en 2-veckors pilot med HR-teamet'
    ],
    commonMistakes: [
      'Fokusera för mycket på tekniska detaljer istället för värde',
      'Inte fråga om hennes dagliga arbetsflöde',
      'Glömma nämna ROI och tidsbesparingar',
      'Inte ge konkreta use cases för HR',
      'För komplex lösning - hon vill ha det enkelt'
    ]
  },
  {
    id: 'marketing-manager-productivity',
    name: '📱 Marknadschef vill bli mer produktiv',
    difficulty: 'easy',
    description: 'Kreativ marknadschef som vill fokusera mer på strategi och mindre på admin. Intresserad av AI-verktyg.',
    personaName: 'Alexander Nordström',
    personaRole: 'Marknadschef',
    companyName: 'Bright Marketing Agency',
    companySize: '25 anställda',
    industry: 'Marknadsföring',
    painPoints: [
      'För mycket tid går till rapporter och sammanfattningar',
      'Svårt att hålla kreativa teamet synkat',
      'Behöver snabbare sätt att skapa content-utkast',
      'Missar deadlines pga administrativt arbete'
    ],
    budget: '200,000 SEK/år (har budget för verktyg)',
    decisionTimeframe: '1-2 veckor (snabba beslut)',
    personality: 'Kreativ, nyfiken på AI, vill ha quick wins, värderar design och UX, snabba beslut',
    objectives: [
      'AI-hjälp för att skriva content-utkast',
      'Automatisera rapportering och sammanfattningar',
      'Bättre samarbete med kreativa teamet',
      'Integration med befintliga verktyg (Adobe, Canva)'
    ],
    competitors: ['ChatGPT Plus', 'Notion AI'],
    openingLine: 'Hallå! Jag använder redan ChatGPT, men funderar på om Microsoft Copilot kan ge mer värde för vårt team?',
    successCriteria: [
      'Jämför Copilot med ChatGPT - visa enterprise-fördelar',
      'Ge exempel på Copilot i PowerPoint för presentationer',
      'Visa hur Copilot i Word skapar content-utkast',
      'Nämn integration med Teams för kreativt samarbete',
      'Diskutera datasäkerhet (viktigare än ChatGPT)',
      'Föreslå team-licenser med styrning'
    ],
    commonMistakes: [
      'Inte erkänna att ChatGPT är bra',
      'Inte förklara skillnaden mellan consumer och enterprise AI',
      'Glömma nämna datasäkerhet och compliance',
      'För teknisk - han vill ha kreativa use cases',
      'Inte visa integrationer med M365-appar'
    ]
  },
  {
    id: 'small-business-modernization',
    name: '🏢 Småföretagare vill modernisera',
    difficulty: 'easy',
    description: 'Småföretagare som fortfarande använder gamla verktyg. Vill ta steget till molnet och bli mer professionell.',
    personaName: 'Lars Andersson',
    personaRole: 'VD och grundare',
    companyName: 'Anderssons Måleri AB',
    companySize: '12 anställda',
    industry: 'Bygg och hantverk',
    painPoints: [
      'Använder Hotmail och privata Gmail-konton',
      'Delar filer via USB och mejl',
      'Inget gemensamt kalendersystem',
      'Ser oprofessionella ut mot kunder'
    ],
    budget: '50,000-80,000 SEK/år',
    decisionTimeframe: 'Omedelbart om det är enkelt',
    personality: 'Pragmatisk, inte teknikvän, värderar enkelhet, vill ha professionell image, behöver stöd vid implementation',
    objectives: [
      'Professionella mejladresser (@anderssonsmaleri.se)',
      'Enklare fildelning mellan kontor och projekt',
      'Gemensam kalender för alla i teamet',
      'Se mer professionell ut mot kunder'
    ],
    competitors: ['Fortsätta som idag', 'Google Workspace'],
    openingLine: 'Tja! Vi måste nog börja se lite mer proffsiga ut. Alla har ju olika mejladresser nu och det är lite kaos. Kan ni hjälpa oss?',
    successCriteria: [
      'Förklara professional email med egen domän',
      'Visa hur enkelt OneDrive är för fildelning',
      'Demonstrera gemensam kalender i Outlook',
      'Nämn Teams för enkel kommunikation på byggen',
      'Betona enkel setup och migrering',
      'Erbjud supportpaket för implementation',
      'Räkna på småföretagspris'
    ],
    commonMistakes: [
      'Prata om avancerade features han inte behöver',
      'Inte fråga om deras nuvarande sätt att jobba',
      'Glömma nämna onboarding-support',
      'För dyrt - visa basic-paket först',
      'Inte ge exempel från andra småföretag'
    ]
  }
];

export const getTrainingScenario = (id: string): TrainingScenario | undefined => {
  return TRAINING_SCENARIOS.find(s => s.id === id);
};

export const getScenariosByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): TrainingScenario[] => {
  return TRAINING_SCENARIOS.filter(s => s.difficulty === difficulty);
};
