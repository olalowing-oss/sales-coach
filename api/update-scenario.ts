import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Update a training scenario
 * Uses service role key to bypass RLS
 * PUT /api/update-scenario
 * Body: { scenarioId: string, updates: {...} }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { scenarioId, updates } = req.body;

  if (!scenarioId || !updates) {
    return res.status(400).json({ error: 'scenarioId and updates are required' });
  }

  try {
    // Use service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🔄 Updating scenario ${scenarioId} with:`, updates);

    const { data, error } = await supabase
      .from('training_scenarios')
      .update(updates)
      .eq('id', scenarioId)
      .select();

    if (error) {
      console.error('❌ Update error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    console.log('✅ Updated successfully:', data);

    return res.status(200).json({
      success: true,
      data: data[0]
    });

  } catch (error: any) {
    console.error('Update scenario error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
}
