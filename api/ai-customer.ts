import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

/**
 * Vercel Function: AI Customer Persona Engine with RAG
 * Generates realistic customer responses for sales training
 * Uses knowledge base retrieval for accurate product information
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

interface KnowledgeDocument {
  id: string;
  product_id: string;
  title: string;
  content: string;
  similarity: number;
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

  // Initialize Supabase client for RAG
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const {
      scenario,
      conversationHistory = [],
      salesResponse,
      productId  // Optional: enables RAG if provided
    }: {
      scenario: TrainingScenario;
      conversationHistory: Message[];
      salesResponse: string;
      productId?: string;
    } = req.body;

    if (!scenario || !salesResponse) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = new OpenAI({ apiKey });

    // RAG: Retrieve relevant knowledge base documents if productId provided
    let knowledgeContext = '';
    let sources: KnowledgeDocument[] = [];

    if (productId) {
      try {
        // Generate embedding for the sales response (query)
        const embeddingResponse = await client.embeddings.create({
          model: 'text-embedding-ada-002',
          input: salesResponse.slice(0, 8000),
        });

        const queryEmbedding = embeddingResponse.data[0].embedding;

        // Call match_knowledge_base function to retrieve relevant documents
        const { data: matchedDocs, error: matchError } = await supabase.rpc('match_knowledge_base', {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: 3,
          filter_product_id: productId
        });

        if (!matchError && matchedDocs && matchedDocs.length > 0) {
          sources = matchedDocs;

          // Build knowledge context from retrieved documents
          knowledgeContext = '\n\nPRODUKTINFORMATION (från kunskapsbas):\n' +
            matchedDocs.map((doc: KnowledgeDocument, idx: number) =>
              `[${idx + 1}] ${doc.title}:\n${doc.content.slice(0, 500)}...`
            ).join('\n\n');
        }
      } catch (ragError) {
        console.error('RAG error (non-fatal):', ragError);
        // Continue without RAG if it fails
      }
    }

    // Build conversation context (only last 5 messages for speed)
    const recentHistory = conversationHistory.slice(-5);
    const conversationContext = recentHistory
      .map(msg => `${msg.role === 'customer' ? 'Kund' : 'Säljare'}: ${msg.content}`)
      .join('\n');

    // Generate AI customer response with faster model
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',  // 60% faster, 80% cheaper than gpt-4o
      messages: [
        {
          role: 'system',
          content: `Du är en AI-driven träningskund för säljare.

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
${knowledgeContext}

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
${knowledgeContext ? '11. Använd produktinformation från kunskapsbasen när säljaren frågar om detaljer\n12. Ställ specifika frågor baserat på produktinformation du har läst' : ''}

SAMTALSSTIL:
- Kort och naturligt (1-3 meningar vanligtvis)
- Ställ motfrågor istället för att bara svara
- Visa ditt humör och din personlighet
- Var inte för "snäll" - utmana säljaren
${knowledgeContext ? '- Referera till specifika produktdetaljer när det är relevant' : ''}

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
      temperature: 0.8, // Higher temperature for more natural conversation
      max_tokens: 800  // Limit output length for faster responses
    });

    const functionCall = completion.choices[0]?.message?.function_call;

    if (!functionCall || !functionCall.arguments) {
      throw new Error('No function call returned from OpenAI');
    }

    const result = JSON.parse(functionCall.arguments);

    return res.status(200).json({
      success: true,
      ...result,
      sources: sources.map(doc => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity
      }))
    });

  } catch (error: any) {
    console.error('AI Customer error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate customer response'
    });
  }
}
