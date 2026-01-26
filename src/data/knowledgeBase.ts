import { Offer, Battlecard, ObjectionHandler, CaseStudy, TriggerPattern } from '../types';

// === TRIGGER-MÖNSTER ===
export const TRIGGER_PATTERNS: Record<string, TriggerPattern> = {
  // Prisinvändningar
  price: {
    keywords: ['dyrt', 'för dyrt', 'billigare', 'budget', 'kostnad', 'pris', 'investering', 'har inte råd', 'kostar för mycket'],
    response: 'objection',
    category: 'price'
  },
  
  // Tidsinvändningar
  timing: {
    keywords: ['senare', 'inte nu', 'nästa år', 'Q1', 'Q2', 'inte prioriterat', 'vänta', 'ring tillbaka', 'har inte tid'],
    response: 'objection',
    category: 'timing'
  },
  
  // Konkurrensinvändningar
  competition: {
    keywords: ['annan leverantör', 'redan avtal', 'ramavtal', 'upphandling', 'andra konsulter'],
    response: 'objection',
    category: 'competition'
  },
  
  // Behövs inte
  need: {
    keywords: ['behöver inte', 'fungerar bra', 'har redan', 'klarar oss', 'inte aktuellt'],
    response: 'objection',
    category: 'need'
  },
  
  // Konkurrenter (battlecards)
  atea: {
    keywords: ['Atea', 'atea'],
    response: 'battlecard'
  },
  tieto: {
    keywords: ['Tieto', 'TietoEVRY', 'tieto'],
    response: 'battlecard'
  },
  cgi: {
    keywords: ['CGI', 'cgi'],
    response: 'battlecard'
  },
  knowit: {
    keywords: ['Knowit', 'knowit'],
    response: 'battlecard'
  },
  inhouse: {
    keywords: ['inhouse', 'in-house', 'egen IT', 'vår IT-avdelning', 'egna resurser'],
    response: 'battlecard'
  },
  
  // Microsoft-produkter (erbjudanden)
  teams: {
    keywords: ['Teams', 'Microsoft Teams', 'videosamtal', 'collaboration'],
    response: 'offer'
  },
  copilot: {
    keywords: ['Copilot', 'AI-assistent', 'Microsoft AI', 'generativ AI', 'ChatGPT'],
    response: 'offer'
  },
  sharepoint: {
    keywords: ['SharePoint', 'intranät', 'dokumenthantering', 'fildelning'],
    response: 'offer'
  },
  azure: {
    keywords: ['Azure', 'molnet', 'cloud', 'moln', 'migration'],
    response: 'offer'
  },
  security: {
    keywords: ['säkerhet', 'security', 'Defender', 'Entra', 'identitet', 'MFA', 'phishing'],
    response: 'offer'
  },
  powerplatform: {
    keywords: ['Power Platform', 'Power Apps', 'Power Automate', 'automatisering', 'low-code'],
    response: 'offer'
  },
  
  // Problemsignaler (lösningar)
  chaos: {
    keywords: ['rörigt', 'kaotiskt', 'stökigt', 'ostrukturerat', 'svårt att hitta'],
    response: 'solution'
  },
  frustration: {
    keywords: ['frustrerade', 'problem med', 'fungerar inte', 'missnöjda', 'tar för lång tid'],
    response: 'solution'
  },
  
  // Intressesignaler
  interest: {
    keywords: ['låter intressant', 'berätta mer', 'hur fungerar', 'kan ni hjälpa', 'vad kostar det'],
    response: 'expand'
  }
};

// === B3:S ERBJUDANDEN ===
export const OFFERS: Offer[] = [
  {
    id: 'copilot-readiness',
    name: 'Copilot Readiness Assessment',
    shortDescription: 'Kartläggning av er organisations mognad för Microsoft Copilot',
    fullDescription: 'Vi utvärderar er nuvarande M365-miljö, datastruktur och användarvanor för att identifiera hur ni kan maximera nyttan av Copilot. Inkluderar teknisk granskning, användarintervjuer och en konkret handlingsplan.',
    deliverables: [
      'Teknisk bedömning av M365-miljön',
      'Dataklassificeringsöversikt',
      'Användarmognadsanalys',
      'Prioriterad roadmap för Copilot-implementation',
      'ROI-kalkyl för Copilot-investering'
    ],
    duration: '2-3 dagar',
    priceRange: { min: 35000, max: 55000, unit: 'fixed' },
    targetAudience: ['IT-chefer', 'CDO', 'Verksamhetsutvecklare'],
    relatedCases: ['stena-copilot', 'telenor-ai']
  },
  {
    id: 'modern-workplace',
    name: 'Modern Workplace Workshop',
    shortDescription: 'Strukturera er M365-miljö för effektivt samarbete',
    fullDescription: 'En workshop där vi tillsammans kartlägger era samarbetsbehov och designar en strukturerad Teams- och SharePoint-miljö. Fokus på governance, användaradoption och långsiktig förvaltning.',
    deliverables: [
      'Nulägesanalys av samarbetsmönster',
      'Teams-struktur och namnkonventioner',
      'SharePoint-informationsarkitektur',
      'Governance-ramverk',
      'Utbildningsplan för användare'
    ],
    duration: '2 dagar workshop + 2 dagar implementation',
    priceRange: { min: 45000, max: 75000, unit: 'fixed' },
    targetAudience: ['IT-ansvariga', 'HR', 'Kommunikationschefer'],
    relatedCases: ['ziklo-teams']
  },
  {
    id: 'azure-migration',
    name: 'Azure Migration Assessment',
    shortDescription: 'Planera er flytt till Azure med en gedigen analys',
    fullDescription: 'Vi inventerar era befintliga system och applikationer, bedömer molnmognad och tar fram en detaljerad migrationsplan med kostnadsberäkning.',
    deliverables: [
      'Applikationsinventering',
      'Molnmognadsbedömning per system',
      'Migrationsplan med tidplan',
      'TCO-analys: on-prem vs Azure',
      'Säkerhetsrekommendationer'
    ],
    duration: '3-5 dagar beroende på miljöstorlek',
    priceRange: { min: 50000, max: 120000, unit: 'fixed' },
    targetAudience: ['IT-chefer', 'CTO', 'Infrastrukturansvariga'],
    relatedCases: ['stena-azure']
  },
  {
    id: 'security-copilot',
    name: 'Security Copilot Implementation',
    shortDescription: 'Implementera Microsoft Security Copilot för snabbare hothantering',
    fullDescription: 'Vi hjälper er implementera Security Copilot och integrera det med er befintliga säkerhetsmiljö. Inkluderar konfiguration, promptbibliotek och utbildning av säkerhetsteamet.',
    deliverables: [
      'Security Copilot-konfiguration',
      'Integration med Defender & Sentinel',
      'Anpassade promptbooks för ert team',
      'Utbildning för SOC-analytiker',
      'Playbooks för vanliga incidenttyper'
    ],
    duration: '2-4 veckor',
    priceRange: { min: 80000, max: 200000, unit: 'fixed' },
    targetAudience: ['CISO', 'Säkerhetschefer', 'SOC-ledare'],
    relatedCases: ['bank-security']
  },
  {
    id: 'power-platform',
    name: 'Power Platform Kickstart',
    shortDescription: 'Kom igång med low-code och automatisera processer',
    fullDescription: 'Vi identifierar lämpliga användningsområden, bygger pilotappar/flöden och utbildar era medarbetare att själva utveckla lösningar.',
    deliverables: [
      'Processanalys och möjlighetskartläggning',
      '2-3 pilotappar eller automatiseringar',
      'Center of Excellence-ramverk',
      'Citizen developer-utbildning',
      'Governance och säkerhetsmodell'
    ],
    duration: '4-6 veckor',
    priceRange: { min: 75000, max: 150000, unit: 'fixed' },
    targetAudience: ['Verksamhetsutvecklare', 'IT', 'Processägare'],
    relatedCases: ['telenor-automation']
  }
];

// === BATTLECARDS ===
export const BATTLECARDS: Battlecard[] = [
  {
    id: 'vs-atea',
    competitor: 'Atea',
    theirStrengths: [
      'Stor organisation med bred närvaro',
      'Starka hårdvaruavtal',
      'Välkänt varumärke'
    ],
    theirWeaknesses: [
      'Generalister - inte specialiserade på Microsoft',
      'Ofta juniorare konsulter på Microsoft-uppdrag',
      'Långsamma beslutsprocesser som stor organisation'
    ],
    ourAdvantages: [
      '100% fokus på Microsoft - det är allt vi gör',
      'Seniora konsulter med djup expertis',
      'Snabba beslut och flexibel leverans',
      'Starkare partnerskap med Microsoft (se certifieringar)'
    ],
    talkingPoints: [
      '"Vi är specialister, inte generalister. Microsoft är det enda vi gör."',
      '"Våra konsulter har i snitt 8+ års erfarenhet av Microsoft-plattformen."',
      '"Som mindre bolag är vi snabbare och mer flexibla i leveransen."'
    ],
    commonObjections: [
      'Atea är större och tryggare',
      'Vi har redan avtal med Atea'
    ]
  },
  {
    id: 'vs-inhouse',
    competitor: 'Egen IT-avdelning / Inhouse',
    theirStrengths: [
      'Känner verksamheten väl',
      'Alltid tillgängliga',
      'Ingen upphandling krävs'
    ],
    theirWeaknesses: [
      'Begränsad tid för strategiska projekt',
      'Svårt att hänga med i Microsofts snabba utveckling',
      'Risk för ensidig kompetens'
    ],
    ourAdvantages: [
      'Fräscha perspektiv utifrån',
      'Djup specialistkompetens inom M365/Azure',
      'Erfarenheter från många liknande projekt',
      'Avlastar er IT för drift så de kan fokusera på utveckling'
    ],
    talkingPoints: [
      '"Vi kompletterar er IT-avdelning, vi ersätter dem inte."',
      '"Vi ser lösningar från andra kunder som kan passa er."',
      '"Er IT kan fokusera på kärnverksamheten medan vi driver projektet."'
    ],
    commonObjections: [
      'Vi vill bygga egen kompetens',
      'Konsulter är för dyra'
    ]
  }
];

// === INVÄNDNINGSHANTERING ===
export const OBJECTION_HANDLERS: ObjectionHandler[] = [
  {
    id: 'too-expensive',
    objection: 'Det är för dyrt',
    triggers: ['dyrt', 'för dyrt', 'kostar för mycket', 'budget'],
    category: 'price',
    responses: {
      short: 'Jag förstår att investeringen känns stor. Kan jag fråga - vad kostar det er idag att INTE lösa det här problemet?',
      detailed: 'Jag hör dig. Låt mig visa hur andra kunder räknat på det här. Stena Line räknade på att varje medarbetare sparade 2 timmar i veckan efter vår Teams-implementation. Med 500 användare blev det snabbt en positiv ROI. Ska jag göra en liknande kalkyl för er?',
      followUpQuestions: [
        'Vad är ert största tidstjuvar idag?',
        'Hur mycket tid lägger ni på att leta efter information?',
        'Vad kostar det när ett projekt blir försenat?'
      ]
    }
  },
  {
    id: 'bad-timing',
    objection: 'Det passar inte just nu',
    triggers: ['inte nu', 'senare', 'nästa år', 'har inte tid', 'ring tillbaka'],
    category: 'timing',
    responses: {
      short: 'Jag förstår att det är mycket just nu. Vad är det som gör att det inte passar?',
      detailed: 'Det förstår jag helt. Många av våra kunder kände likadant innan de insåg hur mycket tid de faktiskt förlorade. Om jag kunde visa hur ni kan spara tid redan första veckan - skulle det vara värt 30 minuter?',
      followUpQuestions: [
        'Vad är det som tar mest tid just nu?',
        'När tror du att det skulle passa bättre?',
        'Vad behöver hända för att det ska bli prioriterat?'
      ]
    }
  },
  {
    id: 'have-contract',
    objection: 'Vi har redan avtal med annan leverantör',
    triggers: ['ramavtal', 'redan avtal', 'annan leverantör', 'upphandling'],
    category: 'competition',
    responses: {
      short: 'Jag förstår. Är det ett exklusivt avtal, eller finns det utrymme för specialistkompetens?',
      detailed: 'Det är vanligt. Många av våra kunder har ramavtal för generell IT men anlitar oss för specialistuppdrag inom Microsoft. Vi kan ofta komplettera er befintliga leverantör på de områden där vi har djupare expertis.',
      followUpQuestions: [
        'Hur nöjda är ni med Microsoft-kompetensen hos nuvarande leverantör?',
        'Finns det områden där ni saknar expertis idag?',
        'När går ert nuvarande avtal ut?'
      ]
    }
  },
  {
    id: 'works-fine',
    objection: 'Det fungerar bra som det är',
    triggers: ['fungerar bra', 'behöver inte', 'klarar oss', 'inte aktuellt'],
    category: 'need',
    responses: {
      short: 'Det är bra att höra! Får jag fråga - har ni redan börjat titta på hur Copilot kan förbättra det ytterligare?',
      detailed: 'Förstår jag. Samtidigt ser vi att företag som "fungerar bra" ofta har störst potential. De som kämpar med grunderna har inte tid för nästa steg. Hur ser ni på AI och automation framöver?',
      followUpQuestions: [
        'Vad är nästa steg i er digitalisering?',
        'Hur hänger ni med i Microsofts nya funktioner?',
        'Har ni mätt er produktivitet jämfört med andra i branschen?'
      ]
    }
  },
  {
    id: 'send-email',
    objection: 'Skicka ett mail så tittar jag på det',
    triggers: ['skicka mail', 'mejla', 'skicka information', 'titta på det senare'],
    category: 'timing',
    responses: {
      short: 'Absolut, jag gör det! Men mail försvinner lätt. Kan vi boka 15 minuter nästa vecka så jag kan visa er specifikt vad som skulle passa er?',
      detailed: 'Det kan jag göra. Men ärligt talat - 90% av alla mail hamnar i papperskorgen. Om jag istället kunde visa er en kort demo på 15 minuter, anpassad efter just er situation - skulle det vara möjligt?',
      followUpQuestions: [
        'Vad skulle du vilja se i mailet?',
        'Hur brukar ni utvärdera nya leverantörer?',
        'Finns det någon annan jag borde inkludera i mailet?'
      ]
    }
  }
];

// === KUNDCASE ===
export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'stena-copilot',
    customer: 'Stena Line',
    industry: 'Transport & Logistik',
    challenge: 'Behövde effektivisera administrativa processer och frigöra tid för kärnverksamheten.',
    solution: 'Implementerade Microsoft Copilot för 200 användare med fokus på dokumenthantering och möteseffektivisering.',
    results: [
      '40% kortare tid för mötesförberedelser',
      '2 timmar/vecka sparat per användare',
      '85% nöjda användare efter 3 månader'
    ],
    quote: 'Copilot har förändrat hur våra team arbetar. Det som tog timmar tar nu minuter.',
    isPublic: true
  },
  {
    id: 'ziklo-teams',
    customer: 'Ziklo Bank',
    industry: 'Bank & Finans',
    challenge: 'Kaotisk Teams-miljö med hundratals team utan struktur, svårt att hitta information.',
    solution: 'Modern Workplace Workshop följt av implementation av governance-ramverk och ny Teams-struktur.',
    results: [
      '60% färre team (konsoliderat dubbletter)',
      '75% snabbare att hitta rätt information',
      'Compliance-godkänd struktur för finanssektorn'
    ],
    quote: 'Äntligen ordning och reda! Våra medarbetare hittar nu det de söker på första försöket.',
    isPublic: true
  },
  {
    id: 'telenor-automation',
    customer: 'Telenor Sverige',
    industry: 'Telekom',
    challenge: 'Manuella processer för kundrapportering som tog 40 timmar per månad.',
    solution: 'Power Platform Kickstart med Power Automate-flöden för automatisk rapportgenerering.',
    results: [
      'Från 40 timmar till 2 timmar per månad',
      '95% minskning av manuella fel',
      '10 nya automatiseringar byggda av interna "citizen developers"'
    ],
    isPublic: true
  }
];

// === HJÄLPFUNKTIONER ===

export const findOfferByTopic = (topic: string): Offer | undefined => {
  const topicLower = topic.toLowerCase();
  return OFFERS.find(offer => 
    offer.name.toLowerCase().includes(topicLower) ||
    offer.shortDescription.toLowerCase().includes(topicLower) ||
    offer.deliverables.some(d => d.toLowerCase().includes(topicLower))
  );
};

export const findBattlecardByCompetitor = (competitor: string): Battlecard | undefined => {
  const compLower = competitor.toLowerCase();
  return BATTLECARDS.find(bc => 
    bc.competitor.toLowerCase().includes(compLower)
  );
};

export const findObjectionHandler = (text: string): ObjectionHandler | undefined => {
  const textLower = text.toLowerCase();
  return OBJECTION_HANDLERS.find(handler =>
    handler.triggers.some(trigger => textLower.includes(trigger))
  );
};

export const findRelevantCase = (industry?: string, topic?: string): CaseStudy | undefined => {
  if (industry) {
    const match = CASE_STUDIES.find(c => 
      c.industry.toLowerCase().includes(industry.toLowerCase()) && c.isPublic
    );
    if (match) return match;
  }
  
  if (topic) {
    const match = CASE_STUDIES.find(c =>
      c.solution.toLowerCase().includes(topic.toLowerCase()) && c.isPublic
    );
    if (match) return match;
  }
  
  // Returnera ett slumpmässigt publikt case
  const publicCases = CASE_STUDIES.filter(c => c.isPublic);
  return publicCases[Math.floor(Math.random() * publicCases.length)];
};
