-- B3 Sales Coach Database Schema
-- Kör detta i Supabase SQL Editor för att skapa tabellerna

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTH (hanteras av Supabase Auth)
-- ============================================

-- ============================================
-- CALL SESSIONS
-- ============================================
CREATE TABLE call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('idle', 'recording', 'paused', 'stopped')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  -- Customer info
  customer_name TEXT,
  customer_company TEXT,
  customer_role TEXT,

  -- Transcript
  full_transcript TEXT,
  duration_seconds INTEGER DEFAULT 0,

  -- Analytics
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  topics TEXT[], -- Array av topics

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TRANSCRIPT SEGMENTS
-- ============================================
CREATE TABLE transcript_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  timestamp_ms INTEGER NOT NULL, -- Millisekunder från session start
  speaker TEXT CHECK (speaker IN ('seller', 'customer', 'unknown')),
  confidence DECIMAL(3,2), -- 0.00 - 1.00
  is_final BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index för snabbare queries
CREATE INDEX idx_transcript_segments_session ON transcript_segments(session_id);

-- ============================================
-- COACHING TIPS (från sessioner)
-- ============================================
CREATE TABLE session_coaching_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('suggestion', 'battlecard', 'objection', 'offer', 'case', 'warning')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  trigger_keyword TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  talking_points TEXT[], -- Array
  was_dismissed BOOLEAN DEFAULT false,

  -- Related data IDs (optional)
  related_offer_id UUID,
  related_case_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_tips_session ON session_coaching_tips(session_id);

-- ============================================
-- TRIGGERS (Nyckelord som triggar tips)
-- ============================================
CREATE TABLE trigger_patterns (
  id TEXT PRIMARY KEY, -- e.g. 'price', 'teams', 'atea'
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keywords TEXT[] NOT NULL,
  response_type TEXT NOT NULL CHECK (response_type IN ('objection', 'battlecard', 'offer', 'solution', 'expand')),
  category TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_triggers_user ON trigger_patterns(user_id);

-- ============================================
-- BATTLECARDS
-- ============================================
CREATE TABLE battlecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  competitor TEXT NOT NULL,
  their_strengths TEXT[] NOT NULL,
  their_weaknesses TEXT[] NOT NULL,
  our_advantages TEXT[] NOT NULL,
  talking_points TEXT[] NOT NULL,
  common_objections TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_battlecards_user ON battlecards(user_id);

-- ============================================
-- OBJECTION HANDLERS
-- ============================================
CREATE TABLE objection_handlers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  objection TEXT NOT NULL,
  triggers TEXT[] NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('price', 'timing', 'competition', 'trust', 'need')),
  response_short TEXT NOT NULL,
  response_detailed TEXT NOT NULL,
  followup_questions TEXT[] NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_objections_user ON objection_handlers(user_id);

-- ============================================
-- CASE STUDIES
-- ============================================
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer TEXT NOT NULL,
  industry TEXT NOT NULL,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  results TEXT[] NOT NULL,
  quote TEXT,
  is_public BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cases_user ON case_studies(user_id);
CREATE INDEX idx_cases_industry ON case_studies(industry);

-- ============================================
-- OFFERS
-- ============================================
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  deliverables TEXT[] NOT NULL,
  duration TEXT NOT NULL,

  -- Pricing
  price_min INTEGER NOT NULL,
  price_max INTEGER NOT NULL,
  price_unit TEXT NOT NULL CHECK (price_unit IN ('fixed', 'hourly', 'daily')),

  target_audience TEXT[],
  related_cases TEXT[], -- IDs of related cases

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_offers_user ON offers(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_coaching_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE battlecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE objection_handlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own data

-- Call Sessions
CREATE POLICY "Users can view own sessions" ON call_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON call_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON call_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON call_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Transcript Segments (via session ownership)
CREATE POLICY "Users can view own segments" ON transcript_segments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE id = transcript_segments.session_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own segments" ON transcript_segments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE id = transcript_segments.session_id
      AND user_id = auth.uid()
    )
  );

-- Session Coaching Tips (via session ownership)
CREATE POLICY "Users can view own tips" ON session_coaching_tips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE id = session_coaching_tips.session_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own tips" ON session_coaching_tips
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM call_sessions
      WHERE id = session_coaching_tips.session_id
      AND user_id = auth.uid()
    )
  );

-- Trigger Patterns
CREATE POLICY "Users can manage own triggers" ON trigger_patterns
  FOR ALL USING (auth.uid() = user_id);

-- Battlecards
CREATE POLICY "Users can manage own battlecards" ON battlecards
  FOR ALL USING (auth.uid() = user_id);

-- Objection Handlers
CREATE POLICY "Users can manage own objections" ON objection_handlers
  FOR ALL USING (auth.uid() = user_id);

-- Case Studies
CREATE POLICY "Users can manage own cases" ON case_studies
  FOR ALL USING (auth.uid() = user_id);

-- Offers
CREATE POLICY "Users can manage own offers" ON offers
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_call_sessions_updated_at BEFORE UPDATE ON call_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triggers_updated_at BEFORE UPDATE ON trigger_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_battlecards_updated_at BEFORE UPDATE ON battlecards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objections_updated_at BEFORE UPDATE ON objection_handlers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DEFAULT DATA (Optional)
-- ============================================
-- Du kan lägga till default triggers, battlecards etc. här
-- men vi gör det programmatiskt istället
