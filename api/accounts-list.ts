import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface AccountWithStats {
  id: string;
  company_name: string;
  org_number: string | null;
  industry: string | null;
  company_size: '1-50' | '51-200' | '201-1000' | '1000+' | null;
  website: string | null;
  account_status: string | null;
  lifecycle_stage: string | null;
  estimated_annual_value: number | null;
  data_completeness: number | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;

  // Aggregated stats
  total_calls: number;
  last_call_date: string | null;
  total_duration_minutes: number;
  questionnaire_completion: number; // 0-100%

  // Recent calls
  recent_calls: Array<{
    id: string;
    started_at: string;
    ended_at: string | null;
    duration_seconds: number | null;
    call_purpose: string | null;
    call_outcome: string | null;
    probability: number | null;
    customer_name: string | null;
  }>;

  // Contacts
  contacts: Array<{
    id: string;
    first_name: string;
    last_name: string;
    role: string | null;
    email: string | null;
    is_primary: boolean | null;
    is_decision_maker: boolean | null;
  }>;

  // Questionnaire Answers
  questionnaire_answers: Array<{
    id: string;
    question_id: string;
    question_text: string;
    answer: string;
    source: string; // 'manual' | 'ai_auto_fill' | 'live_analysis'
    confidence: string | null;
    source_quote: string | null;
    created_at: string;
    updated_at: string;
  }>;
}

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

    // Fetch all accounts for this user
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError);
      return res.status(500).json({
        error: 'Failed to fetch accounts',
        details: accountsError.message
      });
    }

    if (!accounts || accounts.length === 0) {
      return res.status(200).json({ accounts: [] });
    }

    // For each account, fetch related data
    const accountsWithStats: AccountWithStats[] = await Promise.all(
      accounts.map(async (account) => {
        // Fetch call sessions for this account
        const { data: calls } = await supabase
          .from('call_sessions')
          .select('id, started_at, ended_at, duration_seconds, call_purpose, call_outcome, probability, customer_name')
          .eq('account_id', account.id)
          .order('started_at', { ascending: false })
          .limit(5); // Get last 5 calls

        // Fetch contacts for this account
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, role, email, is_primary, is_decision_maker')
          .eq('account_id', account.id)
          .order('is_primary', { ascending: false });

        // Fetch questionnaire answers (full data)
        const { data: questionnaireAnswers } = await supabase
          .from('questionnaire_answers')
          .select('id, question_id, question_text, answer, source, confidence, source_quote, created_at, updated_at')
          .eq('account_id', account.id)
          .eq('answer_version', 1) // Only latest version
          .order('created_at', { ascending: false });

        // Calculate stats
        const totalCalls = calls?.length || 0;
        const lastCallDate = calls?.[0]?.started_at || null;
        const totalDurationMinutes = calls?.reduce((sum, call) => {
          return sum + (call.duration_seconds ? Math.round(call.duration_seconds / 60) : 0);
        }, 0) || 0;

        // Questionnaire has 25 questions total
        const questionnaireCount = questionnaireAnswers?.length || 0;
        const questionnaireCompletion = questionnaireCount
          ? Math.round((questionnaireCount / 25) * 100)
          : 0;

        return {
          ...account,
          total_calls: totalCalls,
          last_call_date: lastCallDate,
          total_duration_minutes: totalDurationMinutes,
          questionnaire_completion: questionnaireCompletion,
          recent_calls: calls || [],
          contacts: contacts || [],
          questionnaire_answers: questionnaireAnswers || []
        };
      })
    );

    console.log(`✅ Fetched ${accountsWithStats.length} accounts with stats`);

    return res.status(200).json({
      accounts: accountsWithStats,
      total: accountsWithStats.length
    });

  } catch (error) {
    console.error('Error in accounts-list:', error);
    return res.status(500).json({
      error: 'Failed to fetch accounts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
