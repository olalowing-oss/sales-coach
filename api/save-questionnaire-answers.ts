import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface SaveAnswersRequest {
  accountId: string;
  sessionId?: string;
  answers: Record<string, {
    answer: string;
    source: 'manual' | 'ai_auto_fill' | 'live_analysis';
    confidence?: 'high' | 'medium' | 'low';
    sourceQuote?: string;
    questionText: string;
  }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase credentials not configured');
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Supabase credentials are missing'
    });
  }

  try {
    const { accountId, sessionId, answers }: SaveAnswersRequest = req.body;

    if (!accountId || !answers || Object.keys(answers).length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'accountId and answers are required'
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

    const userId = user.id;

    // Prepare questionnaire answers for insertion/update
    const answersToSave = Object.entries(answers).map(([questionId, data]) => ({
      account_id: accountId,
      session_id: sessionId || null,
      user_id: userId,
      question_id: questionId,
      question_text: data.questionText,
      answer: data.answer,
      source: data.source,
      confidence: data.confidence || null,
      source_quote: data.sourceQuote || null,
      answer_version: 1, // Always latest version
      previous_answer: null // TODO: Implement versioning in future
    }));

    // Save each answer individually (safer approach for partial unique indexes)
    const results = [];
    let saveError = null;

    for (const answerData of answersToSave) {
      // First, try to find existing answer
      const { data: existingAnswer } = await supabase
        .from('questionnaire_answers')
        .select('id')
        .eq('account_id', answerData.account_id)
        .eq('question_id', answerData.question_id)
        .eq('answer_version', 1)
        .single();

      let result;
      if (existingAnswer) {
        // Update existing answer
        result = await supabase
          .from('questionnaire_answers')
          .update({
            answer: answerData.answer,
            source: answerData.source,
            confidence: answerData.confidence,
            source_quote: answerData.source_quote,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAnswer.id)
          .select();
      } else {
        // Insert new answer
        result = await supabase
          .from('questionnaire_answers')
          .insert(answerData)
          .select();
      }

      if (result.error) {
        saveError = result.error;
        break;
      }

      results.push(result.data);
    }

    const data = results.flat();
    const error = saveError;

    if (error) {
      console.error('Error saving questionnaire answers:', error);
      return res.status(500).json({
        error: 'Failed to save questionnaire answers',
        details: error.message
      });
    }

    console.log(`✅ Saved ${answersToSave.length} questionnaire answers for account ${accountId}`);

    return res.status(200).json({
      success: true,
      savedCount: answersToSave.length,
      data
    });

  } catch (error) {
    console.error('Error in save-questionnaire-answers:', error);
    return res.status(500).json({
      error: 'Failed to save questionnaire answers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
