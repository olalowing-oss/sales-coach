-- Fix RLS policies för single-user mode
-- Detta tillåter alla inloggade användare (även anonyma) att se och ändra coaching-data

-- Ta bort gamla restrictive policies för coaching-tabellerna
DROP POLICY IF EXISTS "Users can view own triggers" ON trigger_patterns;
DROP POLICY IF EXISTS "Users can insert own triggers" ON trigger_patterns;
DROP POLICY IF EXISTS "Users can update own triggers" ON trigger_patterns;
DROP POLICY IF EXISTS "Users can delete own triggers" ON trigger_patterns;

DROP POLICY IF EXISTS "Users can view own battlecards" ON battlecards;
DROP POLICY IF EXISTS "Users can insert own battlecards" ON battlecards;
DROP POLICY IF EXISTS "Users can update own battlecards" ON battlecards;
DROP POLICY IF EXISTS "Users can delete own battlecards" ON battlecards;

DROP POLICY IF EXISTS "Users can view own objections" ON objection_handlers;
DROP POLICY IF EXISTS "Users can insert own objections" ON objection_handlers;
DROP POLICY IF EXISTS "Users can update own objections" ON objection_handlers;
DROP POLICY IF EXISTS "Users can delete own objections" ON objection_handlers;

DROP POLICY IF EXISTS "Users can view own cases" ON case_studies;
DROP POLICY IF EXISTS "Users can insert own cases" ON case_studies;
DROP POLICY IF EXISTS "Users can update own cases" ON case_studies;
DROP POLICY IF EXISTS "Users can delete own cases" ON case_studies;

DROP POLICY IF EXISTS "Users can view own offers" ON offers;
DROP POLICY IF EXISTS "Users can insert own offers" ON offers;
DROP POLICY IF EXISTS "Users can update own offers" ON offers;
DROP POLICY IF EXISTS "Users can delete own offers" ON offers;

-- Skapa nya policies som tillåter alla autentiserade användare (även anonyma) att komma åt all coaching-data

-- TRIGGER PATTERNS
CREATE POLICY "Anyone authenticated can view triggers" ON trigger_patterns
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can insert triggers" ON trigger_patterns
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can update triggers" ON trigger_patterns
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can delete triggers" ON trigger_patterns
  FOR DELETE USING (auth.role() = 'authenticated');

-- BATTLECARDS
CREATE POLICY "Anyone authenticated can view battlecards" ON battlecards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can insert battlecards" ON battlecards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can update battlecards" ON battlecards
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can delete battlecards" ON battlecards
  FOR DELETE USING (auth.role() = 'authenticated');

-- OBJECTION HANDLERS
CREATE POLICY "Anyone authenticated can view objections" ON objection_handlers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can insert objections" ON objection_handlers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can update objections" ON objection_handlers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can delete objections" ON objection_handlers
  FOR DELETE USING (auth.role() = 'authenticated');

-- CASE STUDIES
CREATE POLICY "Anyone authenticated can view cases" ON case_studies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can insert cases" ON case_studies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can update cases" ON case_studies
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can delete cases" ON case_studies
  FOR DELETE USING (auth.role() = 'authenticated');

-- OFFERS
CREATE POLICY "Anyone authenticated can view offers" ON offers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can insert offers" ON offers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can update offers" ON offers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can delete offers" ON offers
  FOR DELETE USING (auth.role() = 'authenticated');
