import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Question structure matching PostCallQuestionnaire
const QUESTIONNAIRE_QUESTIONS = [
  // Nuläge & Utmaningar
  { id: 'current_challenges', question: 'Vilka är de 3 största utmaningarna kunden har idag?' },
  { id: 'cost_of_problems', question: 'Vad kostar dessa problem kunden idag? (tid, pengar, resurser)' },
  { id: 'problem_duration', question: 'Hur länge har problemet funnits?' },
  { id: 'previous_attempts', question: 'Vad har de provat tidigare för att lösa det?' },

  // Målbild & Krav
  { id: 'ideal_solution', question: 'Vad är den ideala lösningen enligt kunden?' },
  { id: 'success_metrics', question: 'Vilka KPI:er använder de för att mäta framgång?' },
  { id: 'must_have_features', question: 'Vilka funktioner är absolut nödvändiga?' },
  { id: 'nice_to_have_features', question: 'Vilka funktioner är önskvärda men inte kritiska?' },
  { id: 'deal_breakers', question: 'Finns det något som skulle stoppa affären helt?' },

  // Beslutsprocess
  { id: 'final_decision_maker', question: 'Vem fattar det slutliga beslutet?' },
  { id: 'approval_stakeholders', question: 'Vilka andra behöver godkänna?' },
  { id: 'procurement_steps', question: 'Vilka steg ingår i deras inköpsprocess?' },
  { id: 'budget_status', question: 'Finns det budget avsatt redan?' },
  { id: 'decision_timeline', question: 'Vad driver tidslinjen för beslutet?' },

  // Konkurrens & Alternativ
  { id: 'alternatives_evaluated', question: 'Vilka alternativ utvärderar de?' },
  { id: 'vendor_selection_criteria', question: 'Vad är viktigast vid val av leverantör?' },
  { id: 'previous_vendor_experience', question: 'Har de arbetat med liknande leverantörer tidigare?' },
  { id: 'biggest_concerns', question: 'Vad är deras största farhågor/tveksamheter?' },

  // Tekniska & Praktiska Aspekter
  { id: 'integration_requirements', question: 'Vilka system måste lösningen integreras med?' },
  { id: 'user_count', question: 'Hur många användare kommer att använda systemet?' },
  { id: 'departments_affected', question: 'Vilka avdelningar kommer att påverkas?' },
  { id: 'compliance_requirements', question: 'Finns det specifika compliance- eller säkerhetskrav?' },
  { id: 'rollout_plan', question: 'Hur planerar de att rulla ut lösningen?' },
];

interface ExtractAnswersRequest {
  transcriptText: string;
  existingAnswers?: Record<string, string>;
}

interface ExtractedAnswer {
  questionId: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  sourceQuote?: string;
}

interface ExtractAnswersResponse {
  extractedAnswers: ExtractedAnswer[];
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
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'OPENAI_API_KEY is missing. Please add it to your environment variables.'
    });
  }

  try {
    const { transcriptText, existingAnswers = {} }: ExtractAnswersRequest = req.body;

    if (!transcriptText || transcriptText.trim().length === 0) {
      return res.status(200).json({ extractedAnswers: [] });
    }

    // Build list of unanswered questions
    const unansweredQuestions = QUESTIONNAIRE_QUESTIONS.filter(
      q => !existingAnswers[q.id] || existingAnswers[q.id].trim() === ''
    );

    if (unansweredQuestions.length === 0) {
      return res.status(200).json({ extractedAnswers: [] });
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `Du är en AI-assistent som hjälper säljare att extrahera strukturerad information från kundsamtal.

Din uppgift är att analysera transkriptet från ett kundsamtal och identifiera svar på specifika frågor om kunden.

Regler:
1. Extrahera ENDAST information som EXPLICIT nämns i transkriptet
2. Gissa INTE eller hitta på information
3. Om informationen inte finns i transkriptet, inkludera INTE den frågan i svaret
4. Svaren ska vara koncisa men informativa
5. Inkludera endast information från KUNDENS uttalanden, inte säljarens
6. Ange confidence-nivå baserat på hur tydligt informationen framgår:
   - "high": Kunden sa det explicit och tydligt
   - "medium": Informationen är underförstådd eller indirekt nämnd
   - "low": Informationen är vag eller oklar
7. Inkludera gärna ett relevant citat från transkriptet som stöd (sourceQuote)

Frågor att besvara:
${unansweredQuestions.map((q, i) => `${i + 1}. [${q.id}] ${q.question}`).join('\n')}`;

    const userPrompt = `Analysera följande transkript och extrahera svar på frågorna ovan. Returnera endast information som EXPLICIT nämns i transkriptet.

Transkript:
${transcriptText}

Extrahera svar och returnera dem i JSON-format med extract_questionnaire_answers funktionen.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      functions: [
        {
          name: 'extract_questionnaire_answers',
          description: 'Extract answers to customer questionnaire questions from the transcript',
          parameters: {
            type: 'object',
            properties: {
              extractedAnswers: {
                type: 'array',
                description: 'Array of extracted answers with confidence levels',
                items: {
                  type: 'object',
                  properties: {
                    questionId: {
                      type: 'string',
                      description: 'The question ID matching the questionnaire'
                    },
                    answer: {
                      type: 'string',
                      description: 'The extracted answer from the transcript'
                    },
                    confidence: {
                      type: 'string',
                      enum: ['high', 'medium', 'low'],
                      description: 'Confidence level of the extraction'
                    },
                    sourceQuote: {
                      type: 'string',
                      description: 'Optional: Direct quote from customer that supports this answer'
                    }
                  },
                  required: ['questionId', 'answer', 'confidence']
                }
              }
            },
            required: ['extractedAnswers']
          }
        }
      ],
      function_call: { name: 'extract_questionnaire_answers' }
    });

    const message = completion.choices[0]?.message;

    if (!message?.function_call?.arguments) {
      console.log('No function call in response');
      return res.status(200).json({ extractedAnswers: [] });
    }

    try {
      const result = JSON.parse(message.function_call.arguments) as ExtractAnswersResponse;

      console.log(`✅ Extracted ${result.extractedAnswers?.length || 0} answers from transcript`);

      return res.status(200).json(result);
    } catch (parseError) {
      console.error('Failed to parse function call arguments:', parseError);
      return res.status(200).json({ extractedAnswers: [] });
    }

  } catch (error) {
    console.error('Error extracting questionnaire answers:', error);
    return res.status(500).json({
      error: 'Failed to extract answers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
