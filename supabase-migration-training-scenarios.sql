-- ============================================
-- MIGRATION: Training Scenarios (Only new tables)
-- ============================================
-- Kör detta i Supabase SQL Editor för att lägga till träningsfunktionalitet
-- Detta script lägger BARA till de nya tabellerna utan att påverka befintliga

-- ============================================
-- TRAINING SCENARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS training_scenarios (
  id TEXT PRIMARY KEY, -- e.g. 'enthusiastic-startup-cto'
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  description TEXT NOT NULL,

  -- Persona details
  persona_name TEXT NOT NULL,
  persona_role TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_size TEXT NOT NULL,
  industry TEXT NOT NULL,
  pain_points TEXT[] NOT NULL,
  budget TEXT NOT NULL,
  decision_timeframe TEXT NOT NULL,
  personality TEXT NOT NULL,
  objectives TEXT[] NOT NULL,
  competitors TEXT[] NOT NULL,
  opening_line TEXT NOT NULL,

  -- Success & learning criteria
  success_criteria TEXT[] NOT NULL,
  common_mistakes TEXT[] NOT NULL,

  -- Global vs personal scenarios
  is_global BOOLEAN DEFAULT false, -- Global scenarios visible to all users

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_user ON training_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_difficulty ON training_scenarios(difficulty);
CREATE INDEX IF NOT EXISTS idx_scenarios_global ON training_scenarios(is_global);

-- ============================================
-- TRAINING SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL REFERENCES training_scenarios(id) ON DELETE CASCADE,

  -- Session timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Conversation data
  conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Performance metrics
  final_interest_level INTEGER CHECK (final_interest_level >= 0 AND final_interest_level <= 100),
  final_sentiment TEXT CHECK (final_sentiment IN ('positive', 'neutral', 'negative', 'frustrated')),
  deal_closed BOOLEAN DEFAULT false,

  -- Coaching summary
  total_coaching_tips INTEGER DEFAULT 0,
  key_coaching_points TEXT[],

  -- Overall assessment
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  strengths TEXT[],
  areas_for_improvement TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_sessions_user ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_scenario ON training_sessions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_score ON training_sessions(overall_score);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE training_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Training Scenarios (users can see global scenarios OR their own)
DROP POLICY IF EXISTS "Users can view global and own scenarios" ON training_scenarios;
CREATE POLICY "Users can view global and own scenarios" ON training_scenarios
  FOR SELECT USING (is_global = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own scenarios" ON training_scenarios;
CREATE POLICY "Users can insert own scenarios" ON training_scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own scenarios" ON training_scenarios;
CREATE POLICY "Users can update own scenarios" ON training_scenarios
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own scenarios" ON training_scenarios;
CREATE POLICY "Users can delete own scenarios" ON training_scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- Training Sessions
DROP POLICY IF EXISTS "Users can manage own training sessions" ON training_sessions;
CREATE POLICY "Users can manage own training sessions" ON training_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER for updated_at
-- ============================================

-- Create trigger for training_scenarios updated_at
DROP TRIGGER IF EXISTS update_scenarios_updated_at ON training_scenarios;
CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON training_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify tables were created
SELECT 'training_scenarios' as table_name, COUNT(*) as row_count FROM training_scenarios
UNION ALL
SELECT 'training_sessions' as table_name, COUNT(*) as row_count FROM training_sessions;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Next step: Run supabase-seed-scenarios.sql to add training scenarios';
END $$;
