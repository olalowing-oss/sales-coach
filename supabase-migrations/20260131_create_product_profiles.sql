-- Create product_profiles table for multi-product platform
-- This table stores different products/sales areas that can be trained on

CREATE TABLE IF NOT EXISTS product_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic product information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  target_audience TEXT,

  -- Product details (stored as JSON for flexibility)
  key_features JSONB DEFAULT '[]'::jsonb,
  value_propositions JSONB DEFAULT '[]'::jsonb,
  common_objections JSONB DEFAULT '[]'::jsonb,

  -- Pricing information
  pricing_model VARCHAR(100),
  pricing_details JSONB,

  -- Product metadata
  logo_url TEXT,
  website_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Organization (for future multi-tenancy)
  organization_id UUID,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT product_name_not_empty CHECK (char_length(name) > 0)
);

-- Create index on name for search
CREATE INDEX IF NOT EXISTS idx_product_profiles_name ON product_profiles(name);

-- Create index on organization for multi-tenancy
CREATE INDEX IF NOT EXISTS idx_product_profiles_org ON product_profiles(organization_id);

-- Create index on active status
CREATE INDEX IF NOT EXISTS idx_product_profiles_active ON product_profiles(is_active);

-- Add RLS (Row Level Security)
ALTER TABLE product_profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active products
CREATE POLICY "Anyone can view active products"
  ON product_profiles
  FOR SELECT
  USING (is_active = true);

-- Only authenticated users can create products (for now)
CREATE POLICY "Authenticated users can create products"
  ON product_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update products they created (or admin logic later)
CREATE POLICY "Authenticated users can update products"
  ON product_profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER product_profiles_updated_at
  BEFORE UPDATE ON product_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_product_profiles_updated_at();

-- Add comment
COMMENT ON TABLE product_profiles IS 'Stores product information for multi-product sales training platform';
