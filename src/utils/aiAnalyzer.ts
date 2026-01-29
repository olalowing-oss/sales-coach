import OpenAI from 'openai';
import type { CallAnalysis } from '../types';

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-key') {
    return null;
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Needed for client-side usage
  });
};

/**
 * Analyze call transcript using OpenAI GPT-4o
 * Provides intelligent, context-aware analysis of sales calls
 */
export async function analyzeTranscriptWithAI(
  transcript: string,
  existingAnalysis?: Partial<CallAnalysis>
): Promise<Partial<CallAnalysis>> {
  const client = getOpenAIClient();

  if (!client) {
    console.warn('OpenAI API key not configured, AI analysis disabled');
    return {};
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Du är en expert på försäljningsanalys för Microsoft-lösningar.
Din uppgift är att analysera transkript från säljsamtal och extrahera strukturerad information.

Fokusera på:
- Bransch och företagsstorlek
- Vilka Microsoft-produkter som diskuteras
- Konkurrenter som nämns
- Kundens invändningar och pain points
- Kundens intressenivå och signaler
- Samtalets resultat och konkreta nästa steg
- Beslutshorisonten (hur snabbt kunden vill besluta)
- Uppskattad affärsstorlek
- Sannolikhet för affär (0-100%)

Basera din analys på det faktiska samtalsinnehållet. Var konservativ med sannolikheten - ge högre värden endast när kunden visar tydliga köpsignaler.`
        },
        {
          role: 'user',
          content: `Analysera följande säljsamtal och extrahera information:

TRANSKRIPT:
${transcript}

${existingAnalysis ? `BEFINTLIG ANALYS (uppdatera om ny information finns):
${JSON.stringify(existingAnalysis, null, 2)}` : ''}`
        }
      ],
      functions: [
        {
          name: 'extract_call_analysis',
          description: 'Extract structured analysis from sales call transcript',
          parameters: {
            type: 'object',
            properties: {
              industry: {
                type: 'string',
                description: 'Customer industry (e.g., "Byggbranschen", "Retail", "Tillverkning")'
              },
              companySize: {
                type: 'string',
                enum: ['1-50', '51-250', '251-1000', '1000+'],
                description: 'Company size based on number of employees'
              },
              callPurpose: {
                type: 'string',
                description: 'Main purpose of the call'
              },
              productsDiscussed: {
                type: 'array',
                items: { type: 'string' },
                description: 'Microsoft products discussed (e.g., "Microsoft Copilot", "Teams", "Azure")'
              },
              competitorsMentioned: {
                type: 'array',
                items: { type: 'string' },
                description: 'Competitors mentioned (e.g., "Google Workspace", "AWS", "Slack")'
              },
              objectionsRaised: {
                type: 'array',
                items: { type: 'string' },
                description: 'Customer objections (e.g., "Pris", "Komplexitet", "Timing")'
              },
              painPoints: {
                type: 'array',
                items: { type: 'string' },
                description: 'Customer pain points and challenges'
              },
              interestLevel: {
                type: 'string',
                enum: ['Låg', 'Medium', 'Hög'],
                description: 'Customer interest level based on engagement and responses'
              },
              decisionTimeframe: {
                type: 'string',
                enum: ['Omedelbart', '1-3 månader', '3-6 månader', '6-12 månader', 'Oklart'],
                description: 'When customer plans to make a decision'
              },
              callOutcome: {
                type: 'string',
                enum: ['Bokat möte', 'Skickat offert', 'Behöver tänka', 'Nej tack', 'Uppföljning krävs', 'Avslutad affär'],
                description: 'Outcome of the call'
              },
              nextSteps: {
                type: 'string',
                description: 'Concrete next steps agreed upon (comma-separated)'
              },
              estimatedValue: {
                type: 'number',
                description: 'Estimated deal value in SEK (null if not discussed)'
              },
              probability: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Probability of closing deal (0-100%). Be conservative - only high values for strong buying signals.'
              },
              aiSummary: {
                type: 'string',
                description: 'Brief summary of the call (2-3 sentences)'
              },
              keyTopics: {
                type: 'array',
                items: { type: 'string' },
                description: 'Key topics discussed'
              }
            },
            required: ['probability']
          }
        }
      ],
      function_call: { name: 'extract_call_analysis' },
      temperature: 0.3 // Lower temperature for more consistent results
    });

    const functionCall = completion.choices[0]?.message?.function_call;

    if (!functionCall || !functionCall.arguments) {
      throw new Error('No function call returned from OpenAI');
    }

    const analysis = JSON.parse(functionCall.arguments);

    // Convert to CallAnalysis format
    const result: Partial<CallAnalysis> = {
      industry: analysis.industry || existingAnalysis?.industry,
      companySize: analysis.companySize || existingAnalysis?.companySize,
      callPurpose: analysis.callPurpose || existingAnalysis?.callPurpose,
      productsDiscussed: analysis.productsDiscussed || existingAnalysis?.productsDiscussed || [],
      competitorsMentioned: analysis.competitorsMentioned || existingAnalysis?.competitorsMentioned || [],
      objectionsRaised: analysis.objectionsRaised || existingAnalysis?.objectionsRaised || [],
      painPoints: analysis.painPoints || existingAnalysis?.painPoints || [],
      interestLevel: analysis.interestLevel || existingAnalysis?.interestLevel,
      decisionTimeframe: analysis.decisionTimeframe || existingAnalysis?.decisionTimeframe,
      callOutcome: analysis.callOutcome || existingAnalysis?.callOutcome,
      nextSteps: analysis.nextSteps || existingAnalysis?.nextSteps,
      estimatedValue: analysis.estimatedValue || existingAnalysis?.estimatedValue,
      probability: analysis.probability ?? existingAnalysis?.probability ?? 50,
      aiSummary: analysis.aiSummary || existingAnalysis?.aiSummary,
      keyTopics: analysis.keyTopics || existingAnalysis?.keyTopics || []
    };

    console.log('✅ AI Analysis completed:', result);

    return result;

  } catch (error) {
    console.error('❌ AI Analysis error:', error);

    // Return empty object on error - calling code can handle fallback
    return {};
  }
}

/**
 * Check if AI analysis is available
 */
export function isAIAnalysisAvailable(): boolean {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  return !!(apiKey && apiKey !== 'your-openai-key');
}

/**
 * Estimate cost of AI analysis
 * GPT-4o pricing (as of 2024):
 * - Input: $2.50 per 1M tokens
 * - Output: $10.00 per 1M tokens
 */
export function estimateAnalysisCost(transcriptLength: number): number {
  // Rough estimate: 1 token ≈ 4 characters
  const inputTokens = transcriptLength / 4 + 500; // transcript + system prompt
  const outputTokens = 300; // Typical structured output

  const inputCost = (inputTokens / 1_000_000) * 2.5;
  const outputCost = (outputTokens / 1_000_000) * 10.0;

  return inputCost + outputCost;
}
