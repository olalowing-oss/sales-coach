-- Create customer_needs_mapping table
-- This table maps customer needs to our products and identifies gaps

CREATE TABLE IF NOT EXISTS customer_needs_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Customer need
  need_category TEXT NOT NULL, -- "Produktivitet", "Säkerhet", "Samarbete", "Integration", "Support", etc.
  specific_need TEXT NOT NULL,
  need_priority TEXT, -- "Måste ha", "Bör ha", "Kan ha"
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 10), -- 1-10 severity
  customer_quote TEXT, -- Direct quote from customer about this need

  -- Our solution
  suggested_product_id UUID REFERENCES product_profiles(id) ON DELETE SET NULL,
  suggested_feature TEXT, -- Specific feature that addresses this need
  coverage_score INTEGER CHECK (coverage_score >= 0 AND coverage_score <= 100), -- 0-100, how well we cover the need

  -- Gap analysis
  has_gap BOOLEAN DEFAULT false,
  gap_description TEXT, -- What's missing in our product?
  workaround TEXT, -- Can we solve it another way?
  competitive_advantage BOOLEAN DEFAULT false, -- Is this a differentiator?

  -- Business impact
  estimated_impact TEXT, -- "Låg", "Medel", "Hög", "Kritisk"
  revenue_opportunity DECIMAL(12, 2), -- Potential revenue from addressing this need

  -- Follow-up
  requires_followup BOOLEAN DEFAULT false,
  followup_action TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_needs_mapping_session ON customer_needs_mapping(call_session_id);
CREATE INDEX IF NOT EXISTS idx_needs_mapping_user ON customer_needs_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_needs_mapping_product ON customer_needs_mapping(suggested_product_id);
CREATE INDEX IF NOT EXISTS idx_needs_mapping_category ON customer_needs_mapping(need_category);
CREATE INDEX IF NOT EXISTS idx_needs_mapping_gap ON customer_needs_mapping(has_gap) WHERE has_gap = true;
CREATE INDEX IF NOT EXISTS idx_needs_mapping_priority ON customer_needs_mapping(need_priority);

-- Row Level Security
ALTER TABLE customer_needs_mapping ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own needs mappings
CREATE POLICY "Users can view own needs mappings"
  ON customer_needs_mapping FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own needs mappings
CREATE POLICY "Users can insert own needs mappings"
  ON customer_needs_mapping FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own needs mappings
CREATE POLICY "Users can update own needs mappings"
  ON customer_needs_mapping FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own needs mappings
CREATE POLICY "Users can delete own needs mappings"
  ON customer_needs_mapping FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_needs_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_needs_mapping_updated_at
  BEFORE UPDATE ON customer_needs_mapping
  FOR EACH ROW
  EXECUTE FUNCTION update_needs_mapping_updated_at();

-- Add comments for documentation
COMMENT ON TABLE customer_needs_mapping IS 'Maps customer needs to products and identifies gaps for product development';
COMMENT ON COLUMN customer_needs_mapping.need_category IS 'Category of need: Produktivitet, Säkerhet, Samarbete, etc.';
COMMENT ON COLUMN customer_needs_mapping.coverage_score IS 'How well we cover this need (0-100)';
COMMENT ON COLUMN customer_needs_mapping.has_gap IS 'True if we have a gap in addressing this need';
COMMENT ON COLUMN customer_needs_mapping.competitive_advantage IS 'True if addressing this could be a differentiator';
