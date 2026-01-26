import { DetectedTrigger, CoachingTip, TipType } from '../types';
import { 
  TRIGGER_PATTERNS, 
  OBJECTION_HANDLERS, 
  OFFERS, 
  BATTLECARDS,
  CASE_STUDIES,
  findOfferByTopic,
  findBattlecardByCompetitor,
  findObjectionHandler,
  findRelevantCase
} from '../data/knowledgeBase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Detekterar triggers i text baserat på nyckelord
 */
export const detectTriggers = (text: string): DetectedTrigger[] => {
  const textLower = text.toLowerCase();
  const triggers: DetectedTrigger[] = [];
  
  for (const [patternName, pattern] of Object.entries(TRIGGER_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      const position = textLower.indexOf(keyword.toLowerCase());
      if (position !== -1) {
        triggers.push({
          pattern: patternName,
          matchedKeyword: keyword,
          position,
          type: pattern.response,
          confidence: calculateConfidence(text, keyword, position)
        });
      }
    }
  }
  
  // Sortera efter position (första träffen först)
  return triggers.sort((a, b) => a.position - b.position);
};

/**
 * Beräknar konfidens baserat på kontext
 */
const calculateConfidence = (text: string, keyword: string, position: number): number => {
  let confidence = 0.7; // Baskonfidens
  
  // Högre konfidens om det är i början av meningen
  if (position < 20) confidence += 0.1;
  
  // Högre konfidens om det finns negativa ord runt around
  const surroundingText = text.substring(Math.max(0, position - 20), position + keyword.length + 20).toLowerCase();
  const negativeWords = ['inte', 'nej', 'aldrig', 'svårt', 'problem', 'dåligt'];
  if (negativeWords.some(w => surroundingText.includes(w))) {
    confidence += 0.1;
  }
  
  // Högre konfidens om det är en fråga
  if (text.includes('?')) confidence += 0.05;
  
  return Math.min(confidence, 1.0);
};

/**
 * Genererar coaching-tips baserat på detekterade triggers
 */
export const generateCoachingTips = (
  text: string, 
  existingTipIds: string[] = []
): CoachingTip[] => {
  const triggers = detectTriggers(text);
  const tips: CoachingTip[] = [];
  const processedPatterns = new Set<string>();
  
  for (const trigger of triggers) {
    // Undvik dubbletter av samma mönster
    if (processedPatterns.has(trigger.pattern)) continue;
    processedPatterns.add(trigger.pattern);
    
    const tip = createTipFromTrigger(trigger, text);
    if (tip && !existingTipIds.includes(tip.id)) {
      tips.push(tip);
    }
    
    // Max 3 tips åt gången
    if (tips.length >= 3) break;
  }
  
  return tips;
};

/**
 * Skapar ett coaching-tip från en trigger
 */
const createTipFromTrigger = (trigger: DetectedTrigger, originalText: string): CoachingTip | null => {
  const baseId = uuidv4();
  const timestamp = Date.now();
  
  switch (trigger.type) {
    case 'objection': {
      const handler = findObjectionHandler(originalText);
      if (!handler) return null;
      
      return {
        id: baseId,
        type: 'objection',
        priority: 'high',
        trigger: trigger.matchedKeyword,
        title: `💡 Invändning: "${handler.objection}"`,
        content: handler.responses.short,
        talkingPoints: [
          handler.responses.detailed,
          ...handler.responses.followUpQuestions.map(q => `Följdfråga: ${q}`)
        ],
        timestamp,
        dismissed: false
      };
    }
    
    case 'battlecard': {
      // Hitta vilken konkurrent det gäller
      const competitorPatterns = ['atea', 'tieto', 'cgi', 'knowit', 'inhouse'];
      const matchedCompetitor = competitorPatterns.find(c => 
        trigger.pattern.toLowerCase().includes(c)
      );
      
      let battlecard = matchedCompetitor 
        ? BATTLECARDS.find(bc => bc.id.includes(matchedCompetitor))
        : BATTLECARDS.find(bc => bc.id === 'vs-inhouse'); // Default
        
      if (!battlecard) return null;
      
      return {
        id: baseId,
        type: 'battlecard',
        priority: 'high',
        trigger: trigger.matchedKeyword,
        title: `⚔️ Konkurrent: ${battlecard.competitor}`,
        content: battlecard.talkingPoints[0],
        talkingPoints: [
          `Deras svagheter: ${battlecard.theirWeaknesses.join(', ')}`,
          `Våra styrkor: ${battlecard.ourAdvantages.join(', ')}`,
          ...battlecard.talkingPoints.slice(1)
        ],
        timestamp,
        dismissed: false
      };
    }
    
    case 'offer': {
      // Matcha till rätt erbjudande
      const offer = findOfferForTrigger(trigger.pattern);
      if (!offer) return null;
      
      const relatedCase = findRelevantCase(undefined, offer.name);
      
      return {
        id: baseId,
        type: 'offer',
        priority: 'medium',
        trigger: trigger.matchedKeyword,
        title: `📦 Erbjudande: ${offer.name}`,
        content: offer.shortDescription,
        talkingPoints: [
          `Pris: ${formatPrice(offer.priceRange)}`,
          `Tid: ${offer.duration}`,
          `Leverabler: ${offer.deliverables.slice(0, 3).join(', ')}`,
          relatedCase ? `Referens: ${relatedCase.customer} - ${relatedCase.results[0]}` : ''
        ].filter(Boolean),
        relatedOffer: offer,
        relatedCase: relatedCase || undefined,
        timestamp,
        dismissed: false
      };
    }
    
    case 'solution': {
      // Generellt problemlösningstips
      return {
        id: baseId,
        type: 'suggestion',
        priority: 'medium',
        trigger: trigger.matchedKeyword,
        title: '🎯 Möjlighet identifierad',
        content: 'Kunden har uttryckt frustration. Fördjupa dig i problemet innan du presenterar lösning.',
        talkingPoints: [
          '"Kan du berätta mer om det? Hur påverkar det er i vardagen?"',
          '"Hur länge har det varit så här?"',
          '"Vad har ni testat tidigare?"',
          '"Vad skulle det betyda för er om det här löstes?"'
        ],
        timestamp,
        dismissed: false
      };
    }
    
    case 'expand': {
      // Kunden visar intresse - dags att boka möte
      return {
        id: baseId,
        type: 'suggestion',
        priority: 'high',
        trigger: trigger.matchedKeyword,
        title: '🔥 Intresse! Boka möte nu',
        content: 'Kunden visar intresse. Föreslå ett konkret nästa steg.',
        talkingPoints: [
          '"Ska vi boka in 45 minuter där jag kan visa er exakt hur det fungerar?"',
          '"Jag kan ta med mig en kollega som specialiserat sig på just det här."',
          '"Vilken vecka passar er bäst - nästa eller veckan efter?"',
          '"Ska jag skicka en kalenderbokning direkt?"'
        ],
        timestamp,
        dismissed: false
      };
    }
    
    default:
      return null;
  }
};

/**
 * Hittar rätt erbjudande för en trigger
 */
const findOfferForTrigger = (triggerPattern: string): typeof OFFERS[0] | undefined => {
  const patternToOffer: Record<string, string> = {
    'teams': 'modern-workplace',
    'copilot': 'copilot-readiness',
    'sharepoint': 'modern-workplace',
    'azure': 'azure-migration',
    'security': 'security-copilot',
    'powerplatform': 'power-platform'
  };
  
  const offerId = patternToOffer[triggerPattern];
  return offerId ? OFFERS.find(o => o.id === offerId) : OFFERS[0];
};

/**
 * Formaterar prisintervall
 */
const formatPrice = (priceRange: { min: number; max: number; unit: string }): string => {
  const formatNum = (n: number) => n.toLocaleString('sv-SE');
  const unitText = priceRange.unit === 'fixed' ? 'kr' : priceRange.unit === 'hourly' ? 'kr/h' : 'kr/dag';
  
  if (priceRange.min === priceRange.max) {
    return `${formatNum(priceRange.min)} ${unitText}`;
  }
  return `${formatNum(priceRange.min)} - ${formatNum(priceRange.max)} ${unitText}`;
};

/**
 * Analyserar en hel konversation och ger sammanfattande coaching
 */
export const analyzeConversation = (segments: string[]): {
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedNextSteps: string[];
} => {
  const fullText = segments.join(' ').toLowerCase();
  
  // Identifiera ämnen
  const topics: string[] = [];
  if (fullText.includes('teams') || fullText.includes('samarbete')) topics.push('Modern Workplace');
  if (fullText.includes('copilot') || fullText.includes('ai')) topics.push('AI/Copilot');
  if (fullText.includes('azure') || fullText.includes('moln')) topics.push('Azure/Cloud');
  if (fullText.includes('säkerhet') || fullText.includes('security')) topics.push('Security');
  
  // Enkel sentimentanalys
  const positiveWords = ['intressant', 'bra', 'perfekt', 'absolut', 'gärna', 'ja'];
  const negativeWords = ['nej', 'inte', 'dyrt', 'svårt', 'problem', 'tyvärr'];
  
  const positiveCount = positiveWords.filter(w => fullText.includes(w)).length;
  const negativeCount = negativeWords.filter(w => fullText.includes(w)).length;
  
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (positiveCount > negativeCount + 1) sentiment = 'positive';
  if (negativeCount > positiveCount + 1) sentiment = 'negative';
  
  // Föreslå nästa steg
  const suggestedNextSteps: string[] = [];
  if (sentiment === 'positive') {
    suggestedNextSteps.push('Boka uppföljningsmöte');
    suggestedNextSteps.push('Skicka offert');
  } else if (sentiment === 'negative') {
    suggestedNextSteps.push('Skicka sammanfattande mail');
    suggestedNextSteps.push('Boka nytt samtal om 3 månader');
  } else {
    suggestedNextSteps.push('Skicka mer information');
    suggestedNextSteps.push('Boka demo');
  }
  
  return { topics, sentiment, suggestedNextSteps };
};
