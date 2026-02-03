import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

/**
 * API Endpoint: Answer customer questions using RAG
 * Retrieves relevant knowledge from documents and generates concise answers
 *
 * POST /api/answer-question
 * Body: { question: string, productId: string, context?: string }
 */

interface KnowledgeDocument {
  id: string;
  product_id: string;
  title: string;
  content: string;
  similarity: number;
}

interface AnswerResponse {
  answer: string;
  sources: Array<{
    title: string;
    excerpt: string;
  }>;
  confidence: 'high' | 'medium' | 'low';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[answer-question] Request received:', req.method);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[answer-question] OpenAI API key not configured');
    return res.status(500).json({ error: 'Server configuration error: Missing OpenAI API key' });
  }

  // Initialize Supabase client for RAG
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[answer-question] Supabase configuration missing');
    return res.status(500).json({ error: 'Server configuration error: Missing Supabase credentials' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const {
      question,
      productId,
      context = ''
    }: {
      question: string;
      productId?: string;
      context?: string;
    } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const client = new OpenAI({ apiKey });

    console.log(`[answer-question] Processing question: "${question}"`);

    // Generate embedding for the question
    const embeddingResponse = await client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: question.slice(0, 8000),
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Retrieve relevant knowledge base documents
    const { data: matchedDocs, error: matchError } = await supabase.rpc('match_knowledge_base', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6, // Lower threshold for broader matching
      match_count: 5, // Get more documents for comprehensive answer
      filter_product_id: productId || null
    });

    if (matchError) {
      console.error('Error matching documents:', matchError);
      throw new Error('Failed to retrieve knowledge');
    }

    let knowledgeContext = '';
    let sources: Array<{ title: string; excerpt: string }> = [];
    let confidence: 'high' | 'medium' | 'low' = 'low';

    if (matchedDocs && matchedDocs.length > 0) {
      console.log(`[answer-question] Found ${matchedDocs.length} matching documents`);

      // Determine confidence based on similarity scores
      const avgSimilarity = matchedDocs.reduce((sum: number, doc: KnowledgeDocument) => sum + doc.similarity, 0) / matchedDocs.length;
      if (avgSimilarity > 0.8) confidence = 'high';
      else if (avgSimilarity > 0.7) confidence = 'medium';

      // Build knowledge context from retrieved documents
      knowledgeContext = matchedDocs.map((doc: KnowledgeDocument, idx: number) =>
        `[Källa ${idx + 1}: ${doc.title}]\n${doc.content.slice(0, 1500)}`
      ).join('\n\n---\n\n');

      // Build sources for response
      sources = matchedDocs.map((doc: KnowledgeDocument) => ({
        title: doc.title,
        excerpt: doc.content.slice(0, 200) + '...'
      }));
    } else {
      console.log('[answer-question] No matching documents found');
    }

    // Generate answer using GPT-4o-mini with RAG context
    const systemPrompt = `Du är en expert säljassistent som hjälper säljare att svara på kunders frågor.

DIN UPPGIFT:
- Ge KONCISA, DIREKTA svar (max 3-4 meningar)
- Använd information från kunskapsbasen nedan
- Fokusera på det kunden VERKLIGEN behöver veta
- Om frågan gäller priser/SLA/tekniska detaljer, GE KONKRETA SIFFROR
- Om du inte kan svara med säkerhet, säg det direkt

KUNSKAPSBAS:
${knowledgeContext || 'Ingen relevant information hittades i kunskapsbasen.'}

FORMAT:
- Börja direkt med svaret (ingen "Hej" eller fluff)
- Använd konkreta exempel när möjligt
- Avsluta med en kort "Vill du veta mer om X?" om relevant`;

    const userPrompt = context
      ? `KONTEXT: ${context}\n\nKUNDENS FRÅGA: ${question}`
      : `KUNDENS FRÅGA: ${question}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.3, // Lower temperature for more factual answers
    });

    const answer = completion.choices[0]?.message?.content || 'Jag kunde tyvärr inte hitta ett bra svar på den frågan.';

    console.log(`[answer-question] Generated answer (${answer.length} chars), confidence: ${confidence}`);

    const response: AnswerResponse = {
      answer,
      sources,
      confidence
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('[answer-question] Error:', error);
    console.error('[answer-question] Stack:', error.stack);
    res.status(500).json({
      error: 'Failed to answer question',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
