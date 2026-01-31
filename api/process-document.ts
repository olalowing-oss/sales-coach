import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
// @ts-ignore - pdf-parse doesn't have good types
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || '',
});

interface DocumentProcessingResult {
  success: boolean;
  documentId: string;
  message?: string;
  error?: string;
}

/**
 * Process a document: parse content, generate embedding, create summary
 *
 * POST /api/process-document
 * Body: { documentId: string }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { documentId } = req.body;

  if (!documentId) {
    res.status(400).json({ error: 'documentId is required' });
    return;
  }

  try {
    console.log(`Processing document: ${documentId}`);

    // 1. Fetch document from Supabase
    const { data: document, error: fetchError } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Update status to processing
    await supabase
      .from('knowledge_base')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    // 2. Parse content based on source type
    let parsedContent = '';

    switch (document.source_type) {
      case 'text':
        // Text is already in content field
        parsedContent = document.content || '';
        break;

      case 'pdf':
        parsedContent = await parsePDF(document);
        break;

      case 'docx':
        parsedContent = await parseDOCX(document);
        break;

      case 'url':
        parsedContent = await scrapeURL(document.source_url || '');
        break;

      default:
        parsedContent = document.content || '';
    }

    if (!parsedContent) {
      throw new Error('No content could be extracted from document');
    }

    // 3. Generate summary using OpenAI
    const summary = await generateSummary(parsedContent);

    // 4. Generate embedding using OpenAI
    const embedding = await generateEmbedding(parsedContent);

    // 5. Update document in database
    const { error: updateError } = await supabase
      .from('knowledge_base')
      .update({
        content: parsedContent,
        processed_content: parsedContent,
        summary: summary,
        embedding: JSON.stringify(embedding), // Store as JSON string
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
        processing_error: null,
      })
      .eq('id', documentId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully processed document: ${documentId}`);

    const result: DocumentProcessingResult = {
      success: true,
      documentId,
      message: 'Document processed successfully',
    };

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error processing document:', error);

    // Update document status to failed
    await supabase
      .from('knowledge_base')
      .update({
        processing_status: 'failed',
        processing_error: error.message || 'Unknown error',
      })
      .eq('id', documentId);

    const result: DocumentProcessingResult = {
      success: false,
      documentId,
      error: error.message || 'Unknown error',
    };

    res.status(500).json(result);
  }
}

/**
 * Parse PDF content
 */
async function parsePDF(document: any): Promise<string> {
  try {
    // In a real implementation, you would fetch the PDF file from storage
    // For now, we'll use the content field if it exists
    if (document.content) {
      return document.content;
    }

    // If we have a file URL or buffer, parse it
    // This is a placeholder - you'll need to implement actual PDF fetching
    throw new Error('PDF parsing not fully implemented - upload text content instead');
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  }
}

/**
 * Parse DOCX content
 */
async function parseDOCX(document: any): Promise<string> {
  try {
    // In a real implementation, you would fetch the DOCX file from storage
    // For now, we'll use the content field if it exists
    if (document.content) {
      return document.content;
    }

    // If we have a file buffer, parse it
    // This is a placeholder - you'll need to implement actual DOCX fetching
    throw new Error('DOCX parsing not fully implemented - upload text content instead');
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX');
  }
}

/**
 * Scrape content from URL
 */
async function scrapeURL(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style').remove();

    // Get text content
    const text = $('body').text();

    // Clean up whitespace
    const cleanedText = text
      .replace(/\s+/g, ' ')
      .trim();

    return cleanedText;
  } catch (error) {
    console.error('Error scraping URL:', error);
    throw new Error('Failed to scrape URL');
  }
}

/**
 * Generate summary using OpenAI
 */
async function generateSummary(content: string): Promise<string> {
  try {
    // Truncate content if too long (max ~3000 chars for summary)
    const truncatedContent = content.slice(0, 3000);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du är en AI-assistent som sammanfattar dokument. Skapa en kort och koncis sammanfattning på svenska av dokumentet nedan. Fokusera på de viktigaste punkterna.',
        },
        {
          role: 'user',
          content: `Sammanfatta detta dokument:\n\n${truncatedContent}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || 'Ingen sammanfattning kunde genereras';
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Sammanfattning kunde inte genereras';
  }
}

/**
 * Generate embedding using OpenAI
 */
async function generateEmbedding(content: string): Promise<number[]> {
  try {
    // Truncate content if too long (max ~8000 tokens for ada-002)
    const truncatedContent = content.slice(0, 8000);

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: truncatedContent,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}
