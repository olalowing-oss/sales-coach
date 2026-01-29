import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Om Supabase är långsam, timeout efter 3 sekunder
const DB_TIMEOUT_MS = 3000;

// In-memory cache för snabbare laddning
let scenariosCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minuter

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestStart = Date.now();
  console.log('⏱️ Request started at', new Date().toISOString());

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error: Supabase credentials missing'
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (req.method === 'GET') {
      const { difficulty } = req.query;
      const now = Date.now();

      // Kontrollera om cache är giltig
      if (scenariosCache && (now - cacheTimestamp) < CACHE_DURATION_MS) {
        const cacheCheckTime = Date.now() - requestStart;
        console.log('✅ Returning cached scenarios');
        console.log(`⏱️ Cache check took: ${cacheCheckTime}ms`);
        let scenarios = scenariosCache;

        // Filtrera på svårighetsgrad om specificerat
        if (difficulty && typeof difficulty === 'string') {
          scenarios = scenarios.filter((s: any) => s.difficulty === difficulty);
        }

        const beforeJson = Date.now();
        const response = {
          success: true,
          scenarios,
          cached: true
        };
        const jsonTime = Date.now() - beforeJson;
        const totalTime = Date.now() - requestStart;
        console.log(`⏱️ JSON preparation took: ${jsonTime}ms`);
        console.log(`⏱️ Total handler time: ${totalTime}ms`);

        return res.status(200).json(response);
      }

      // Hämta från databas om cache är gammal eller tom
      console.log('Fetching scenarios from database...');

      let query = supabase
        .from('training_scenarios')
        .select('*')
        .eq('is_global', true)
        .order('difficulty', { ascending: true })
        .order('name', { ascending: true });

      // Sätt en timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), DB_TIMEOUT_MS)
      );

      try {
        const { data, error } = await Promise.race([query, timeoutPromise]) as any;

        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch training scenarios. Please run the database migration and seed scripts.'
          });
        }

        // Om databasen är tom
        if (!data || data.length === 0) {
          return res.status(200).json({
            success: false,
            error: 'No scenarios found. Please run supabase-seed-scenarios.sql in Supabase SQL Editor.',
            scenarios: []
          });
        }

        // Transform database fields to match frontend interface
        const scenarios = data.map((scenario: any) => ({
          id: scenario.id,
          name: scenario.name,
          difficulty: scenario.difficulty,
          description: scenario.description,
          personaName: scenario.persona_name,
          personaRole: scenario.persona_role,
          companyName: scenario.company_name,
          companySize: scenario.company_size,
          industry: scenario.industry,
          painPoints: scenario.pain_points,
          budget: scenario.budget,
          decisionTimeframe: scenario.decision_timeframe,
          personality: scenario.personality,
          objectives: scenario.objectives,
          competitors: scenario.competitors,
          openingLine: scenario.opening_line,
          successCriteria: scenario.success_criteria,
          commonMistakes: scenario.common_mistakes
        }));

        // Uppdatera cache
        scenariosCache = scenarios;
        cacheTimestamp = now;
        console.log(`Cached ${scenarios.length} scenarios`);

        // Filtrera på svårighetsgrad om specificerat
        let filteredScenarios = scenarios;
        if (difficulty && typeof difficulty === 'string') {
          filteredScenarios = scenarios.filter((s: any) => s.difficulty === difficulty);
        }

        const totalTime = Date.now() - requestStart;
        console.log(`⏱️ Total handler time (with DB): ${totalTime}ms`);

        return res.status(200).json({
          success: true,
          scenarios: filteredScenarios
        });
      } catch (timeoutError) {
        console.error('Database timeout');
        return res.status(500).json({
          success: false,
          error: 'Database query timed out. Check your Supabase connection.'
        });
      }
    }

    if (req.method === 'POST') {
      // Create a new training session
      const { scenario_id, user_id } = req.body;

      if (!scenario_id || !user_id) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: scenario_id and user_id'
        });
      }

      const { data, error } = await supabase
        .from('training_sessions')
        .insert({
          user_id,
          scenario_id,
          conversation_history: []
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create training session:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to create training session'
        });
      }

      return res.status(200).json({
        success: true,
        session: data
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
