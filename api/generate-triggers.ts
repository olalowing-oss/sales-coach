import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize clients
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || '',
});

interface GeneratedTrigger {
  id: string;
  keywords: string[];
  response: 'objection' | 'battlecard' | 'offer' | 'solution' | 'expand';
  category?: string;
}

interface GenerateTriggersResponse {
  success: boolean;
  triggers: GeneratedTrigger[];
  productName?: string;
  error?: string;
}

/**
 * Generate trigger patterns based on product documentation
 * POST /api/generate-triggers
 * Body: { productId: string, count?: number }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { productId, count = 5 } = req.body;

  if (!productId) {
    res.status(400).json({ error: 'productId is required' });
    return;
  }

  try {
    console.log(`Generating ${count} triggers for product: ${productId}`);

    // 1. Get product information
    const { data: product, error: productError } = await supabase
      .from('product_profiles')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    console.log(`Product: ${product.name}`);

    // 2. Get all knowledge base documents for this product
    const { data: documents, error: docsError } = await supabase
      .from('knowledge_base')
      .select('id, title, content, processed_content, summary')
      .eq('product_id', productId)
      .eq('processing_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10);

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      throw new Error('Failed to fetch product documents');
    }

    console.log(`Found ${documents?.length || 0} documents for product`);

    if (!documents || documents.length === 0) {
      throw new Error('No documents found for this product. Please upload product documentation first.');
    }

    // 3. Build context from documents
    const productContext = documents.map((doc, idx) => {
      const content = doc.processed_content || doc.content || '';
      const summary = doc.summary ? `\nSammanfattning: ${doc.summary}` : '';
      return `[Dokument ${idx + 1}: ${doc.title}]${summary}\n${content.slice(0, 3000)}`;
    }).join('\n\n---\n\n');

    // 4. Generate triggers using GPT-4
    const systemPrompt = `Du är en expert på att identifiera trigger-ord och fraser som signalerar olika köpsituationer i säljsamtal.

PRODUKTINFORMATION:
Produktnamn: ${product.name}
${product.description ? `Beskrivning: ${product.description}` : ''}

DOKUMENTATION:
${productContext}

DIN UPPGIFT:
Generera ${count} olika trigger-mönster baserat på produktinformationen ovan. Varje trigger ska:
1. Identifiera nyckelord som signalerar ett specifikt kundbehov eller situation
2. Kategoriseras korrekt (price, timing, competition, need, trust, expansion)
3. Kopplas till lämplig responstyp (objection, battlecard, offer, solution, expand)
4. Ha relevanta och specifika nyckelord för denna produkt

Svara ENDAST med en giltig JSON-array med exakt denna struktur:
[
  {
    "id": "unique-kebab-case-id",
    "keywords": ["nyckelord 1", "nyckelord 2", "nyckelord 3"],
    "response": "objection" eller "battlecard" eller "offer" eller "solution" eller "expand",
    "category": "price" eller "timing" eller "competition" eller "need" eller "trust" eller "expansion"
  }
]

VIKTIGT: Svara ENDAST med JSON-arrayen, ingen annan text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generera ${count} trigger-mönster för säljsamtal baserat på produktinformationen.` }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';

    // Parse JSON response
    let triggers: GeneratedTrigger[];
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      triggers = JSON.parse(cleanedResponse);

      if (!Array.isArray(triggers)) {
        throw new Error('Response is not an array');
      }

      // Validate trigger structure
      triggers = triggers.map(trigger => ({
        id: trigger.id || `trigger-${Date.now()}-${Math.random()}`,
        keywords: Array.isArray(trigger.keywords) ? trigger.keywords : [],
        response: ['objection', 'battlecard', 'offer', 'solution', 'expand'].includes(trigger.response)
          ? trigger.response
          : 'objection',
        category: trigger.category || undefined
      }));

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse generated triggers. Please try again.');
    }

    console.log(`Successfully generated ${triggers.length} triggers`);

    const response: GenerateTriggersResponse = {
      success: true,
      triggers,
      productName: product.name,
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Generate triggers error:', error);

    const response: GenerateTriggersResponse = {
      success: false,
      triggers: [],
      error: error.message || 'Unknown error',
    };

    res.status(500).json(response);
  }
}
