-- Fix foreign key constraints to point to 'products' instead of 'product_profiles'

-- Drop old constraints (that reference non-existent 'product_profiles' table)
ALTER TABLE IF EXISTS trigger_patterns DROP CONSTRAINT IF EXISTS trigger_patterns_product_id_fkey;
ALTER TABLE IF EXISTS battlecards DROP CONSTRAINT IF EXISTS battlecards_product_id_fkey;
ALTER TABLE IF EXISTS objection_handlers DROP CONSTRAINT IF EXISTS objection_handlers_product_id_fkey;
ALTER TABLE IF EXISTS case_studies DROP CONSTRAINT IF EXISTS case_studies_product_id_fkey;
ALTER TABLE IF EXISTS offers DROP CONSTRAINT IF EXISTS offers_product_id_fkey;

-- Add correct foreign key constraints (referencing 'products' table)
ALTER TABLE trigger_patterns
  ADD CONSTRAINT trigger_patterns_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE battlecards
  ADD CONSTRAINT battlecards_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE objection_handlers
  ADD CONSTRAINT objection_handlers_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE case_studies
  ADD CONSTRAINT case_studies_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE offers
  ADD CONSTRAINT offers_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

COMMENT ON CONSTRAINT trigger_patterns_product_id_fkey ON trigger_patterns IS 'Links trigger patterns to products (NULL = global)';
COMMENT ON CONSTRAINT battlecards_product_id_fkey ON battlecards IS 'Links battlecards to products (NULL = global)';
COMMENT ON CONSTRAINT objection_handlers_product_id_fkey ON objection_handlers IS 'Links objection handlers to products (NULL = global)';
COMMENT ON CONSTRAINT case_studies_product_id_fkey ON case_studies IS 'Links case studies to products (NULL = global)';
COMMENT ON CONSTRAINT offers_product_id_fkey ON offers IS 'Links offers to products (NULL = global)';
