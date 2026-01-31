-- Add user isolation to product_profiles
-- This ensures each user only sees their own products and materials

-- Add user_id to product_profiles to track ownership
ALTER TABLE product_profiles
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for efficient filtering by user
CREATE INDEX IF NOT EXISTS idx_product_profiles_user ON product_profiles(user_id);

-- Drop existing policies that don't account for user isolation
DROP POLICY IF EXISTS "Anyone can view active products" ON product_profiles;
DROP POLICY IF EXISTS "Authenticated users can create products" ON product_profiles;
DROP POLICY IF EXISTS "Authenticated users can update products" ON product_profiles;

-- Create new RLS policies with user isolation

-- Users can only view their own active products
CREATE POLICY "Users can view their own products"
  ON product_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND is_active = true);

-- Users can create products (user_id will be set automatically)
CREATE POLICY "Users can create their own products"
  ON product_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own products
CREATE POLICY "Users can update their own products"
  ON product_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own products
CREATE POLICY "Users can delete their own products"
  ON product_profiles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Update knowledge_base policies to respect product ownership
-- Knowledge base entries are tied to products, so user isolation is inherited

-- Update training_scenarios policies for user-specific scenarios
-- Scenarios can be:
-- 1. Global (is_global = true, user_id = NULL) - visible to all
-- 2. User-specific (is_global = false, user_id set) - only visible to owner
-- 3. Product-specific (product_id set) - only visible to product owner

DROP POLICY IF EXISTS "Users can view scenarios for active products" ON training_scenarios;

CREATE POLICY "Users can view training scenarios"
  ON training_scenarios
  FOR SELECT
  TO authenticated
  USING (
    -- Global scenarios
    is_global = true
    OR
    -- User's own scenarios
    user_id = auth.uid()
    OR
    -- Scenarios for user's products
    EXISTS (
      SELECT 1 FROM product_profiles
      WHERE id = training_scenarios.product_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

-- Add comment
COMMENT ON COLUMN product_profiles.user_id IS 'Owner of this product (for user isolation)';

-- Function to automatically set user_id on product creation (optional but recommended)
CREATE OR REPLACE FUNCTION set_product_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is not set, set it to the current user
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to set user_id automatically
DROP TRIGGER IF EXISTS set_product_user_id_trigger ON product_profiles;
CREATE TRIGGER set_product_user_id_trigger
  BEFORE INSERT ON product_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_product_user_id();
