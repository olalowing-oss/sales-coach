-- Create demo_scripts table for managing product demonstration scripts
CREATE TABLE IF NOT EXISTS demo_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES product_profiles(id) ON DELETE CASCADE,

  -- Demo metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  target_audience TEXT, -- e.g., "IT Manager", "CEO", "End Users"

  -- Demo structure
  opening_hook TEXT NOT NULL, -- The hook to start the demo
  key_talking_points TEXT[] NOT NULL, -- Main points to cover
  demo_flow JSONB NOT NULL, -- Structured demo flow with steps

  -- Interactive elements
  common_questions JSONB, -- Pre-configured Q&A
  objection_handling JSONB, -- How to handle common objections during demo

  -- Success metrics
  success_criteria TEXT[],
  next_steps TEXT[],

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE demo_scripts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own demo scripts
CREATE POLICY "Users can view own demo scripts"
  ON demo_scripts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own demo scripts
CREATE POLICY "Users can insert own demo scripts"
  ON demo_scripts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own demo scripts
CREATE POLICY "Users can update own demo scripts"
  ON demo_scripts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own demo scripts
CREATE POLICY "Users can delete own demo scripts"
  ON demo_scripts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_demo_scripts_user_id ON demo_scripts(user_id);
CREATE INDEX idx_demo_scripts_product_id ON demo_scripts(product_id);
CREATE INDEX idx_demo_scripts_active ON demo_scripts(is_active);

-- Add updated_at trigger
CREATE TRIGGER update_demo_scripts_updated_at
  BEFORE UPDATE ON demo_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
