import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

/**
 * Vercel Serverless Function for AI Call Analysis
 * Securely handles OpenAI API calls on the backend
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Parse request body
    const { transcript, existingAnalysis } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Invalid transcript' });
    }

    // Initialize OpenAI client (server-side, secure)
    const client = new OpenAI({ apiKey });

    // Make the API call
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Du är en expert på försäljningsanalys för Microsoft-lösningar.
Din uppgift är att analysera transkript från säljsamtal och extrahera strukturerad information.

Fokusera på:
- Företagsnamn (om det nämns i samtalet)
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
              companyName: {
                type: 'string',
                description: 'Company name if mentioned in the call (e.g., "Nordiska Byggsystem AB", "TrendStyle Retail")'
              },
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
      temperature: 0.3
    });

    const functionCall = completion.choices[0]?.message?.function_call;

    if (!functionCall || !functionCall.arguments) {
      throw new Error('No function call returned from OpenAI');
    }

    const analysis = JSON.parse(functionCall.arguments);

    // Return successful response
    return res.status(200).json({
      success: true,
      analysis
    });

  } catch (error: any) {
    console.error('AI Analysis error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze call'
    });
  }
}
