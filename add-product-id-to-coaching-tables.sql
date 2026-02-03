-- Add product_id to all coaching-related tables for multi-tenancy
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ADD PRODUCT_ID TO ALL TABLES
-- ============================================

-- Trigger patterns
ALTER TABLE trigger_patterns
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES product_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_trigger_patterns_product ON trigger_patterns(product_id);

COMMENT ON COLUMN trigger_patterns.product_id IS 'Links trigger to a specific product (NULL for global triggers)';

-- Battlecards
ALTER TABLE battlecards
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES product_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_battlecards_product ON battlecards(product_id);

COMMENT ON COLUMN battlecards.product_id IS 'Links battlecard to a specific product (NULL for global battlecards)';

-- Case Studies
ALTER TABLE case_studies
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES product_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_case_studies_product ON case_studies(product_id);

COMMENT ON COLUMN case_studies.product_id IS 'Links case study to a specific product (NULL for global cases)';

-- Objection Handlers
ALTER TABLE objection_handlers
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES product_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_objection_handlers_product ON objection_handlers(product_id);

COMMENT ON COLUMN objection_handlers.product_id IS 'Links objection handler to a specific product (NULL for global objections)';

-- Offers
ALTER TABLE offers
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES product_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_offers_product ON offers(product_id);

COMMENT ON COLUMN offers.product_id IS 'Links offer to a specific product (NULL for global offers)';

-- ============================================
-- 2. DROP OLD RLS POLICIES
-- ============================================

-- Trigger patterns
DROP POLICY IF EXISTS "Users can manage own triggers" ON trigger_patterns;

-- Battlecards
DROP POLICY IF EXISTS "Users can manage own battlecards" ON battlecards;

-- Case studies
DROP POLICY IF EXISTS "Users can manage own cases" ON case_studies;
DROP POLICY IF EXISTS "Public can view public cases" ON case_studies;

-- Objection handlers
DROP POLICY IF EXISTS "Users can manage own objections" ON objection_handlers;

-- Offers
DROP POLICY IF EXISTS "Users can manage own offers" ON offers;

-- ============================================
-- 3. CREATE NEW MULTI-TENANT RLS POLICIES
-- ============================================

-- Trigger patterns policies
CREATE POLICY "Users can view accessible triggers"
  ON trigger_patterns FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    product_id IN (
      SELECT product_id FROM user_products
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert their own triggers"
  ON trigger_patterns FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own triggers"
  ON trigger_patterns FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own triggers"
  ON trigger_patterns FOR DELETE
  USING (user_id = auth.uid());

-- Battlecards policies
CREATE POLICY "Users can view accessible battlecards"
  ON battlecards FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    product_id IN (
      SELECT product_id FROM user_products
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert their own battlecards"
  ON battlecards FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own battlecards"
  ON battlecards FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own battlecards"
  ON battlecards FOR DELETE
  USING (user_id = auth.uid());

-- Case studies policies
CREATE POLICY "Users can view accessible cases"
  ON case_studies FOR SELECT
  USING (
    is_public = true
    OR
    user_id = auth.uid()
    OR
    product_id IN (
      SELECT product_id FROM user_products
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert their own cases"
  ON case_studies FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cases"
  ON case_studies FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own cases"
  ON case_studies FOR DELETE
  USING (user_id = auth.uid());

-- Objection handlers policies
CREATE POLICY "Users can view accessible objections"
  ON objection_handlers FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    product_id IN (
      SELECT product_id FROM user_products
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert their own objections"
  ON objection_handlers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own objections"
  ON objection_handlers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own objections"
  ON objection_handlers FOR DELETE
  USING (user_id = auth.uid());

-- Offers policies
CREATE POLICY "Users can view accessible offers"
  ON offers FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    product_id IN (
      SELECT product_id FROM user_products
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert their own offers"
  ON offers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own offers"
  ON offers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own offers"
  ON offers FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 4. VERIFICATION
-- ============================================

-- Check that product_id columns were added
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('trigger_patterns', 'battlecards', 'case_studies', 'objection_handlers', 'offers')
  AND column_name = 'product_id'
ORDER BY table_name;

-- Check RLS policies
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('trigger_patterns', 'battlecards', 'case_studies', 'objection_handlers', 'offers')
ORDER BY tablename, cmd, policyname;

SELECT '✅ Multi-tenant setup complete for all coaching tables!' as status;
