import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

/**
 * Vercel Function: AI Customer Persona Engine
 * Generates realistic customer responses for sales training
 */

interface Message {
  role: 'customer' | 'salesperson';
  content: string;
  timestamp: number;
}

interface TrainingScenario {
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const {
      scenario,
      conversationHistory = [],
      salesResponse
    }: {
      scenario: TrainingScenario;
      conversationHistory: Message[];
      salesResponse: string;
    } = req.body;

    if (!scenario || !salesResponse) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = new OpenAI({ apiKey });

    // Build conversation context
    const conversationContext = conversationHistory
      .map(msg => `${msg.role === 'customer' ? 'Kund' : 'Säljare'}: ${msg.content}`)
      .join('\n');

    // Generate AI customer response
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Du är en AI-driven träningskund för säljare som säljer Microsoft-lösningar.

PERSONA:
Namn: ${scenario.personaName}
Roll: ${scenario.personaRole}
Företag: ${scenario.companyName}
Storlek: ${scenario.companySize}
Bransch: ${scenario.industry}
Personlighet: ${scenario.personality}

KONTEXT:
Pain Points: ${scenario.painPoints.join(', ')}
Budget: ${scenario.budget}
Beslutshorisonten: ${scenario.decisionTimeframe}
Mål för samtalet: ${scenario.objectives.join(', ')}
Konkurrenter du känner till: ${scenario.competitors.join(', ')}

DIN UPPGIFT:
1. Agera som denna kund på ett realistiskt sätt
2. Svara naturligt på säljarens frågor och påståenden
3. Var konsekvent med personligheten och situationen
4. Ställ relevanta motfrågor baserat på dina pain points
5. Nämn konkurrenter när det är relevant
6. Var varierad i dina svar - inte för lång eller kort
7. Använd svenska vardagsspråk
8. Visa känslor: nyfikenhet, skepticism, entusiasm baserat på personlighet
9. Ge köpsignaler när säljaren gör bra arbete
10. Eskalera invändningar om säljaren missar viktiga punkter

SAMTALSSTIL:
- Kort och naturligt (1-3 meningar vanligtvis)
- Ställ motfrågor istället för att bara svara
- Visa ditt humör och din personlighet
- Var inte för "snäll" - utmana säljaren

PROGRESS:
- Börja skeptisk/neutral
- Bli gradvis mer intresserad om säljaren gör bra jobb
- Ge tydliga köpsignaler när du är övertygad
- Avsluta samtalet om säljaren gör för många misstag`
        },
        {
          role: 'user',
          content: `SAMTALSHISTORIK:
${conversationContext}

SÄLJARENS SENASTE SVAR:
${salesResponse}

Generera kundens nästa replik och coaching-feedback.`
        }
      ],
      functions: [
        {
          name: 'generate_customer_response',
          description: 'Generate customer response and coaching feedback',
          parameters: {
            type: 'object',
            properties: {
              customerReply: {
                type: 'string',
                description: 'Kundens naturliga svar på säljarens senaste påstående (1-3 meningar)'
              },
              customerSentiment: {
                type: 'string',
                enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'],
                description: 'Kundens nuvarande känslomässiga läge'
              },
              interestLevel: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Kundens intressenivå 0-100%'
              },
              coachingTips: {
                type: 'array',
                items: { type: 'string' },
                description: 'Coaching-tips till säljaren (2-4 tips)'
              },
              whatWentWell: {
                type: 'array',
                items: { type: 'string' },
                description: 'Vad säljaren gjorde bra i senaste svaret'
              },
              whatToImprove: {
                type: 'array',
                items: { type: 'string' },
                description: 'Vad säljaren kan förbättra'
              },
              nextBestAction: {
                type: 'string',
                description: 'Rekommenderad nästa åtgärd för säljaren'
              },
              shouldEndConversation: {
                type: 'boolean',
                description: 'True om samtalet ska avslutas (stängt, avslutad affär, eller för många misstag)'
              },
              conversationOutcome: {
                type: 'string',
                enum: ['ongoing', 'meeting_booked', 'quote_requested', 'needs_time', 'rejected', 'closed_deal'],
                description: 'Samtalets resultat'
              }
            },
            required: [
              'customerReply',
              'customerSentiment',
              'interestLevel',
              'coachingTips',
              'whatWentWell',
              'whatToImprove',
              'nextBestAction',
              'shouldEndConversation',
              'conversationOutcome'
            ]
          }
        }
      ],
      function_call: { name: 'generate_customer_response' },
      temperature: 0.8 // Higher temperature for more natural conversation
    });

    const functionCall = completion.choices[0]?.message?.function_call;

    if (!functionCall || !functionCall.arguments) {
      throw new Error('No function call returned from OpenAI');
    }

    const result = JSON.parse(functionCall.arguments);

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error: any) {
    console.error('AI Customer error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate customer response'
    });
  }
}
