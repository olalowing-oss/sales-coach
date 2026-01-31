import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

/**
 * Vercel Function: Quick AI Customer Response with RAG (no coaching)
 * Ultra-fast customer responses for immediate feedback
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
          match_count: 2,  // Only top 2 for speed
          filter_product_id: productId
        });

        if (!matchError && matchedDocs && matchedDocs.length > 0) {
          // Build lightweight knowledge context
          knowledgeContext = '\n\nPRODUKTINFO: ' +
            matchedDocs.map((doc: KnowledgeDocument) =>
              doc.content.slice(0, 300)  // Shorter excerpts for speed
            ).join(' | ');
        }
      } catch (ragError) {
        console.error('RAG error (non-fatal):', ragError);
        // Continue without RAG if it fails
      }
    }

    // Build conversation context (only last 3 messages for maximum speed)
    const recentHistory = conversationHistory.slice(-3);
    const conversationContext = recentHistory
      .map(msg => `${msg.role === 'customer' ? 'Kund' : 'Säljare'}: ${msg.content}`)
      .join('\n');

    // Generate QUICK AI customer response (no coaching)
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Du är ${scenario.personaName}, ${scenario.personaRole} på ${scenario.companyName}.

PERSONLIGHET: ${scenario.personality}
PAIN POINTS: ${scenario.painPoints.join(', ')}
MÅL: ${scenario.objectives[0]}
${knowledgeContext}

Svara naturligt och kort (1-3 meningar) på säljarens påstående. Var konsekvent med din personlighet.${knowledgeContext ? ' Använd produktinfo när relevant.' : ''}`
        },
        {
          role: 'user',
          content: `SENASTE MEDDELANDEN:
${conversationContext}

SÄLJARE: ${salesResponse}

Svara som kunden.`
        }
      ],
      functions: [
        {
          name: 'quick_response',
          description: 'Generate quick customer response',
          parameters: {
            type: 'object',
            properties: {
              customerReply: {
                type: 'string',
                description: 'Kundens naturliga svar (1-3 meningar)'
              },
              interestLevel: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Kundens intressenivå 0-100%'
              },
              shouldEndConversation: {
                type: 'boolean',
                description: 'True om samtalet ska avslutas'
              }
            },
            required: ['customerReply', 'interestLevel', 'shouldEndConversation']
          }
        }
      ],
      function_call: { name: 'quick_response' },
      temperature: 0.8,
      max_tokens: 200  // Very short for maximum speed
    });

    const functionCall = completion.choices[0]?.message?.function_call;

    if (!functionCall || !functionCall.arguments) {
      throw new Error('No function call returned from OpenAI');
    }

    const result = JSON.parse(functionCall.arguments);

    return res.status(200).json({
      success: true,
      ...result,
      isQuickResponse: true
    });

  } catch (error: any) {
    console.error('AI Customer Quick error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate quick customer response'
    });
  }
}
