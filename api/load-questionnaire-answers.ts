import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase credentials not configured');
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Supabase credentials are missing'
    });
  }

  try {
    const accountId = req.query.accountId as string;

    if (!accountId) {
      return res.status(400).json({
        error: 'Missing required parameter',
        details: 'accountId query parameter is required'
      });
    }

    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with user's auth token
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Get user ID from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid auth token' });
    }

    // Fetch all questionnaire answers for this account
    const { data: answers, error } = await supabase
      .from('questionnaire_answers')
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .eq('answer_version', 1) // Only fetch latest versions
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading questionnaire answers:', error);
      return res.status(500).json({
        error: 'Failed to load questionnaire answers',
        details: error.message
      });
    }

    // Transform to the format expected by frontend
    const answersMap: Record<string, {
      answer: string;
      source: 'manual' | 'ai_auto_fill' | 'live_analysis';
      confidence?: 'high' | 'medium' | 'low';
      sourceQuote?: string;
      questionText: string;
      createdAt: string;
      updatedAt: string;
    }> = {};

    answers?.forEach(ans => {
      answersMap[ans.question_id] = {
        answer: ans.answer,
        source: ans.source,
        confidence: ans.confidence || undefined,
        sourceQuote: ans.source_quote || undefined,
        questionText: ans.question_text,
        createdAt: ans.created_at,
        updatedAt: ans.updated_at
      };
    });

    console.log(`✅ Loaded ${Object.keys(answersMap).length} questionnaire answers for account ${accountId}`);

    return res.status(200).json({
      accountId,
      answers: answersMap,
      count: Object.keys(answersMap).length
    });

  } catch (error) {
    console.error('Error in load-questionnaire-answers:', error);
    return res.status(500).json({
      error: 'Failed to load questionnaire answers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
