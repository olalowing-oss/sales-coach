import type { CallAnalysis } from '../types';

/**
 * Extraherar strukturerad information från transkriptionstext
 * Detta är en förenklad version - i produktion skulle man använda en riktig AI/LLM
 */

const PRODUCT_KEYWORDS = [
  'microsoft 365',
  'm365',
  'office 365',
  'teams',
  'sharepoint',
  'onedrive',
  'copilot',
  'azure',
  'power bi',
  'dynamics'
];

const COMPETITOR_KEYWORDS = [
  'google',
  'workspace',
  'slack',
  'zoom',
  'dropbox',
  'salesforce',
  'oracle',
  'sap',
  'atea',
  'dustin',
  'also'
];

const OBJECTION_PATTERNS = [
  { pattern: /(för |är )?(dyr|dyrt|mycket pengar|kostsam)/i, objection: 'Prisinvändning' },
  { pattern: /inte tid|har mycket att göra|upptagen/i, objection: 'Tidsbrist' },
  { pattern: /redan (har|använder)|nuvarande (system|lösning)/i, objection: 'Har redan lösning' },
  { pattern: /inte behov|behöver inte|klarar oss utan/i, objection: 'Inget behov' },
  { pattern: /inte säker|osäker|tveksam/i, objection: 'Osäkerhet' }
];

const PAIN_POINT_PATTERNS = [
  { pattern: /problem med|svårt att|frustrer|krångel|inte funger/i, pain: 'Tekniska problem' },
  { pattern: /tar (för )?lång tid|ineffektiv|slösar tid/i, pain: 'Tidskrävande processer' },
  { pattern: /hittar inte|leta efter|söka|hitta dokument/i, pain: 'Svårt att hitta information' },
  { pattern: /integration|samarbete|kommunikation|silos/i, pain: 'Samarbetsutmaningar' },
  { pattern: /säkerhet|hack|dataskydd|gdpr/i, pain: 'Säkerhetsoron' },
  { pattern: /kostnad|budget|dyr/i, pain: 'Höga kostnader' }
];

const INDUSTRY_KEYWORDS = [
  { keywords: ['sjukvård', 'vårdcentral', 'sjukhus', 'patient'], industry: 'Sjukvård' },
  { keywords: ['skola', 'utbildning', 'elev', 'student'], industry: 'Utbildning' },
  { keywords: ['tillverk', 'fabrik', 'produktion'], industry: 'Tillverkning' },
  { keywords: ['handel', 'butik', 'e-handel', 'retail'], industry: 'Handel' },
  { keywords: ['finans', 'bank', 'försäkring'], industry: 'Finans' },
  { keywords: ['bygg', 'konstruktion', 'arkitekt'], industry: 'Bygg' },
  { keywords: ['teknologi', 'it', 'software', 'mjukvara'], industry: 'Teknologi' }
];

const COMPANY_SIZE_PATTERNS = [
  { pattern: /(\d+)\s*(användare|anställda|personer|medarbetare)/i, extract: true }
];

const INTEREST_INDICATORS = {
  high: [
    /intressant|spännande|låter bra|vill veta mer|berätta mer|imponera/i,
    /när kan vi|hur snabbt|vill börja|vill starta|vill testa/i,
    /perfekt|precis vad vi behöver|exakt/i
  ],
  low: [
    /inte intresse|inte aktuellt|kanske senare|tänka på det|osäker/i,
    /nej tack|inte nu|har inte tid/i,
    /tveksam|skeptisk|inte säker/i
  ]
};

const VALUE_PATTERNS = [
  { pattern: /(\d+\s*(?:000|tusen))\s*(?:kr|kronor|sek)/i, multiplier: 1000 },
  { pattern: /(\d+)\s*miljoner?\s*(?:kr|kronor|sek)/i, multiplier: 1000000 },
  { pattern: /budget.*?(\d+)/i, multiplier: 1000 }
];

const TIMEFRAME_PATTERNS = [
  { pattern: /omedelbart|direkt|nu|i veckan|asap/i, timeframe: 'Omedelbart' as const },
  { pattern: /nästa månad|inom en månad|1-3 månader/i, timeframe: '1-3 månader' as const },
  { pattern: /i vår|i höst|3-6 månader/i, timeframe: '3-6 månader' as const },
  { pattern: /nästa år|6-12 månader/i, timeframe: '6-12 månader' as const }
];

const CALL_OUTCOME_PATTERNS = [
  {
    pattern: /boka(t|r|de)?.*?(möte|demo|träff)|visa.*?demo|möte.*?nästa|träffa(s|ts)?|kommer.*?besök/i,
    outcome: 'Bokat möte' as const
  },
  {
    pattern: /skicka.*?(offert|anbud|prislista)|ge.*?pris|offerera|offertera/i,
    outcome: 'Skickat offert' as const
  },
  {
    pattern: /tänka.*?på.*?det|fundera|diskuter.*?internt|prata.*?(med|kollegor|ledning)|återkomma/i,
    outcome: 'Behöver tänka' as const
  },
  {
    pattern: /nej.*?tack|inte.*?intresserad|passar.*?inte|inte.*?för.*?oss|avböja/i,
    outcome: 'Nej tack' as const
  },
  {
    pattern: /kontakta|höra.*?av|ring.*?(upp|tillbaka)|följ.*?upp|återkoppla/i,
    outcome: 'Uppföljning krävs' as const
  },
  {
    pattern: /signera(t|r)?|skriv.*?på|avtal(et)?|affär.*?klar|deal|köper/i,
    outcome: 'Avslutad affär' as const
  }
];

const NEXT_STEPS_PATTERNS = [
  {
    pattern: /boka(t|r)?.*?(demo|möte)|visa.*?demo|demonstrera|möte.*?nästa\s+(vecka|månad)/i,
    nextStep: 'Boka demo/möte'
  },
  {
    pattern: /skicka.*?(offert|anbud|prislista)|ge.*?pris|offerera|offertera/i,
    nextStep: 'Skicka offert'
  },
  {
    pattern: /skicka.*?(avtal|kontrakt)|signera|skriv.*?på/i,
    nextStep: 'Skicka avtal'
  },
  {
    pattern: /börja|starta|sätt igång|kick.*?off|kicka.*?igång.*?(nästa|i|om|direkt|nu)/i,
    nextStep: 'Påbörja implementation'
  },
  {
    pattern: /skicka.*?(information|dokument)|mejla|maila|mail/i,
    nextStep: 'Skicka information'
  },
  {
    pattern: /ring.*?tillbaka|kontakta|höra.*?av|återkomma|följ.*?upp/i,
    nextStep: 'Uppföljning'
  },
  {
    pattern: /prata.*?(chef|ledning|kollega)|diskuter.*?internt/i,
    nextStep: 'Vänta på internt beslut'
  }
];

export function extractAnalysisFromTranscript(
  transcript: string,
  existingAnalysis: Partial<CallAnalysis> = {}
): Partial<CallAnalysis> {
  const lowerText = transcript.toLowerCase();
  const updates: Partial<CallAnalysis> = {};

  // Extract products discussed
  const productsDiscussed = new Set(existingAnalysis.productsDiscussed || []);
  PRODUCT_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      productsDiscussed.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  if (productsDiscussed.size > 0) {
    updates.productsDiscussed = Array.from(productsDiscussed);
  }

  // Extract competitors mentioned
  const competitors = new Set(existingAnalysis.competitorsMentioned || []);
  COMPETITOR_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      competitors.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  if (competitors.size > 0) {
    updates.competitorsMentioned = Array.from(competitors);
  }

  // Extract objections
  const objections = new Set(existingAnalysis.objectionsRaised || []);
  OBJECTION_PATTERNS.forEach(({ pattern, objection }) => {
    if (pattern.test(lowerText)) {
      objections.add(objection);
    }
  });
  if (objections.size > 0) {
    updates.objectionsRaised = Array.from(objections);
  }

  // Extract pain points
  const painPoints = new Set(existingAnalysis.painPoints || []);
  PAIN_POINT_PATTERNS.forEach(({ pattern, pain }) => {
    if (pattern.test(lowerText)) {
      painPoints.add(pain);
    }
  });
  if (painPoints.size > 0) {
    updates.painPoints = Array.from(painPoints);
  }

  // Detect industry
  if (!existingAnalysis.industry) {
    for (const { keywords, industry } of INDUSTRY_KEYWORDS) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        updates.industry = industry;
        break;
      }
    }
  }

  // Detect company size
  if (!existingAnalysis.companySize) {
    for (const { pattern } of COMPANY_SIZE_PATTERNS) {
      const match = transcript.match(pattern);
      if (match) {
        const count = parseInt(match[1]);
        if (count <= 50) updates.companySize = '1-50';
        else if (count <= 200) updates.companySize = '51-200';
        else if (count <= 1000) updates.companySize = '201-1000';
        else updates.companySize = '1000+';
        break;
      }
    }
  }

  // Detect interest level
  if (!existingAnalysis.interestLevel) {
    const hasHighInterest = INTEREST_INDICATORS.high.some(pattern => pattern.test(lowerText));
    const hasLowInterest = INTEREST_INDICATORS.low.some(pattern => pattern.test(lowerText));

    if (hasHighInterest && !hasLowInterest) {
      updates.interestLevel = 'Hög';
    } else if (hasLowInterest && !hasHighInterest) {
      updates.interestLevel = 'Låg';
    } else if (hasHighInterest && hasLowInterest) {
      updates.interestLevel = 'Medel';
    }
  }

  // Extract estimated value
  if (!existingAnalysis.estimatedValue) {
    for (const { pattern, multiplier } of VALUE_PATTERNS) {
      const match = transcript.match(pattern);
      if (match) {
        const value = parseInt(match[1]) * multiplier;
        updates.estimatedValue = value;
        break;
      }
    }
  }

  // Detect decision timeframe
  if (!existingAnalysis.decisionTimeframe) {
    for (const { pattern, timeframe } of TIMEFRAME_PATTERNS) {
      if (pattern.test(lowerText)) {
        updates.decisionTimeframe = timeframe;
        break;
      }
    }
  }

  // Detect call outcome
  if (!existingAnalysis.callOutcome) {
    for (const { pattern, outcome } of CALL_OUTCOME_PATTERNS) {
      if (pattern.test(lowerText)) {
        updates.callOutcome = outcome;
        break;
      }
    }
  }

  // Detect next steps - always check for new steps and merge with existing
  const detectedSteps: string[] = [];
  for (const { pattern, nextStep } of NEXT_STEPS_PATTERNS) {
    if (pattern.test(lowerText)) {
      detectedSteps.push(nextStep);
    }
  }

  if (detectedSteps.length > 0) {
    // Merge with existing steps, avoiding duplicates
    const existingSteps = existingAnalysis.nextSteps
      ? existingAnalysis.nextSteps.split(', ').map(s => s.trim())
      : [];
    const allSteps = [...new Set([...existingSteps, ...detectedSteps])];
    updates.nextSteps = allSteps.join(', ');
  }

  // Adjust probability based on interest, objections, and outcomes
  let probability = existingAnalysis.probability || 50;

  // Interest level adjustments
  if (updates.interestLevel === 'Hög') probability += 20;
  if (updates.interestLevel === 'Låg') probability -= 20;

  // Objections reduce probability
  if (objections.size > 0) probability -= objections.size * 5;

  // Outcome-based probability boosts
  if (updates.callOutcome === 'Bokat möte') probability = Math.max(probability, 75);
  if (updates.callOutcome === 'Skickat offert') probability = Math.max(probability, 65);
  if (updates.callOutcome === 'Avslutad affär') probability = 100;
  if (updates.callOutcome === 'Nej tack') probability = 0;
  if (updates.callOutcome === 'Behöver tänka') probability = Math.min(probability, 50);

  updates.probability = Math.max(0, Math.min(100, probability));

  return updates;
}

/**
 * Uppdatera analys baserat på ny transkriptionstext
 */
export function updateAnalysisWithNewText(
  currentAnalysis: Partial<CallAnalysis>,
  newText: string
): Partial<CallAnalysis> {
  const extracted = extractAnalysisFromTranscript(newText, currentAnalysis);

  // Merge nextSteps - extract already handles the merging, so use that value
  // If extracted.nextSteps exists, it already includes currentAnalysis.nextSteps merged in
  const mergedNextSteps = extracted.nextSteps || currentAnalysis.nextSteps;

  // Merge arrays without duplicates
  return {
    ...currentAnalysis,
    ...extracted,
    nextSteps: mergedNextSteps,
    productsDiscussed: [
      ...new Set([...(currentAnalysis.productsDiscussed || []), ...(extracted.productsDiscussed || [])])
    ],
    competitorsMentioned: [
      ...new Set([...(currentAnalysis.competitorsMentioned || []), ...(extracted.competitorsMentioned || [])])
    ],
    objectionsRaised: [
      ...new Set([...(currentAnalysis.objectionsRaised || []), ...(extracted.objectionsRaised || [])])
    ],
    painPoints: [
      ...new Set([...(currentAnalysis.painPoints || []), ...(extracted.painPoints || [])])
    ]
  };
}
