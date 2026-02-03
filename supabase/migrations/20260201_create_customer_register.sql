-- Migration: Customer Register MVP (Progressive CRM)
-- Date: 2026-02-01
-- Description: Implements accounts, contacts, interactions, and questionnaire_answers tables
--              to enable customer data persistence across recurring meetings

-- ============================================================================
-- 1. ACCOUNTS TABLE (Företag/Organisationer)
-- ============================================================================
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Grundläggande företagsinfo
  company_name TEXT NOT NULL,
  org_number TEXT, -- Organisationsnummer
  industry TEXT,
  company_size TEXT, -- '1-50' | '51-200' | '201-1000' | '1000+'
  website TEXT,

  -- Adress
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT DEFAULT 'Sverige',

  -- Status & Värdering
  account_status TEXT DEFAULT 'active', -- 'active' | 'inactive' | 'prospect' | 'customer' | 'churned'
  lifecycle_stage TEXT DEFAULT 'prospect', -- 'prospect' | 'qualified' | 'opportunity' | 'customer' | 'champion'
  estimated_annual_value NUMERIC,

  -- Metadata
  notes TEXT,
  tags TEXT[], -- För flexibel kategorisering
  data_completeness INT DEFAULT 0, -- 0-100%, beräknas baserat på ifyllda fält

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT company_name_not_empty CHECK (char_length(trim(company_name)) > 0)
);

-- Indexes för accounts
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_company_name ON accounts(company_name);
CREATE INDEX idx_accounts_org_number ON accounts(org_number) WHERE org_number IS NOT NULL;
CREATE INDEX idx_accounts_account_status ON accounts(account_status);
CREATE INDEX idx_accounts_lifecycle_stage ON accounts(lifecycle_stage);
CREATE INDEX idx_accounts_industry ON accounts(industry) WHERE industry IS NOT NULL;

-- RLS för accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. CONTACTS TABLE (Kontaktpersoner på företag)
-- ============================================================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Personlig info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT, -- Titel/Roll, t.ex. "VD", "IT-chef"
  department TEXT,

  -- Kontaktinfo
  email TEXT,
  phone TEXT,
  mobile TEXT,
  linkedin_url TEXT,

  -- Status
  is_primary BOOLEAN DEFAULT false, -- Primär kontaktperson för företaget
  is_decision_maker BOOLEAN DEFAULT false,
  contact_status TEXT DEFAULT 'active', -- 'active' | 'inactive' | 'left_company'

  -- Metadata
  notes TEXT,
  tags TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT first_name_not_empty CHECK (char_length(trim(first_name)) > 0),
  CONSTRAINT last_name_not_empty CHECK (char_length(trim(last_name)) > 0)
);

-- Indexes för contacts
CREATE INDEX idx_contacts_account_id ON contacts(account_id);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email) WHERE email IS NOT NULL;
CREATE INDEX idx_contacts_is_primary ON contacts(is_primary) WHERE is_primary = true;
CREATE INDEX idx_contacts_is_decision_maker ON contacts(is_decision_maker) WHERE is_decision_maker = true;

-- RLS för contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. INTERACTIONS TABLE (Interaktioner med kunder)
-- ============================================================================
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Interaktionsinfo
  interaction_type TEXT NOT NULL, -- 'call' | 'meeting' | 'email' | 'demo' | 'follow_up' | 'note'
  interaction_date TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INT,

  -- Innehåll
  subject TEXT,
  summary TEXT,
  outcome TEXT, -- 'success' | 'follow_up_needed' | 'no_interest' | 'closed_won' | 'closed_lost'

  -- Nästa steg
  next_steps TEXT,
  follow_up_date TIMESTAMPTZ,

  -- Metadata
  tags TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes för interactions
CREATE INDEX idx_interactions_account_id ON interactions(account_id);
CREATE INDEX idx_interactions_contact_id ON interactions(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_type ON interactions(interaction_type);
CREATE INDEX idx_interactions_date ON interactions(interaction_date DESC);
CREATE INDEX idx_interactions_outcome ON interactions(outcome) WHERE outcome IS NOT NULL;

-- RLS för interactions
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interactions"
  ON interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions"
  ON interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
  ON interactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
  ON interactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. QUESTIONNAIRE_ANSWERS TABLE (Frågeformulär-svar)
-- ============================================================================
CREATE TABLE questionnaire_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Fråga & Svar
  question_id TEXT NOT NULL, -- 'current_challenges', 'budget_status', etc.
  question_text TEXT NOT NULL, -- Den faktiska frågan
  answer TEXT NOT NULL,

  -- Metadata
  source TEXT NOT NULL, -- 'manual' | 'ai_auto_fill' | 'live_analysis'
  confidence TEXT, -- 'high' | 'medium' | 'low' (för AI-svar)
  source_quote TEXT, -- Citat från transkript som stöder svaret

  -- Versionshantering (för att se hur svar utvecklas över tid)
  answer_version INT DEFAULT 1,
  previous_answer TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT question_id_not_empty CHECK (char_length(trim(question_id)) > 0),
  CONSTRAINT answer_not_empty CHECK (char_length(trim(answer)) > 0)
);

-- Indexes för questionnaire_answers
CREATE INDEX idx_questionnaire_account_id ON questionnaire_answers(account_id);
CREATE INDEX idx_questionnaire_session_id ON questionnaire_answers(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_questionnaire_user_id ON questionnaire_answers(user_id);
CREATE INDEX idx_questionnaire_question_id ON questionnaire_answers(question_id);
CREATE INDEX idx_questionnaire_source ON questionnaire_answers(source);
CREATE INDEX idx_questionnaire_created_at ON questionnaire_answers(created_at DESC);

-- Unique index: En fråga per account (senaste versionen)
-- Detta förhindrar dubletter och gör det enkelt att hitta senaste svaret
CREATE UNIQUE INDEX idx_questionnaire_unique_latest
  ON questionnaire_answers(account_id, question_id)
  WHERE answer_version = 1;

-- RLS för questionnaire_answers
ALTER TABLE questionnaire_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own questionnaire answers"
  ON questionnaire_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own questionnaire answers"
  ON questionnaire_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaire answers"
  ON questionnaire_answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questionnaire answers"
  ON questionnaire_answers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. UPDATE CALL_SESSIONS TABLE (Lägg till foreign keys)
-- ============================================================================

-- Lägg till nya kolumner för att länka till customer register
ALTER TABLE call_sessions
  ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  ADD COLUMN interaction_id UUID REFERENCES interactions(id) ON DELETE SET NULL;

-- Indexes för nya foreign keys
CREATE INDEX idx_call_sessions_account_id ON call_sessions(account_id) WHERE account_id IS NOT NULL;
CREATE INDEX idx_call_sessions_contact_id ON call_sessions(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_call_sessions_interaction_id ON call_sessions(interaction_id) WHERE interaction_id IS NOT NULL;

-- ============================================================================
-- 6. TRIGGERS FÖR AUTO-UPDATE av updated_at
-- ============================================================================

-- Function för att uppdatera updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interactions_updated_at
  BEFORE UPDATE ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaire_answers_updated_at
  BEFORE UPDATE ON questionnaire_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function för att beräkna data completeness för ett account
CREATE OR REPLACE FUNCTION calculate_account_completeness(account_uuid UUID)
RETURNS INT AS $$
DECLARE
  total_fields INT := 15; -- Totalt antal fält vi räknar
  filled_fields INT := 0;
BEGIN
  SELECT
    CASE WHEN company_name IS NOT NULL AND char_length(trim(company_name)) > 0 THEN 1 ELSE 0 END +
    CASE WHEN org_number IS NOT NULL AND char_length(trim(org_number)) > 0 THEN 1 ELSE 0 END +
    CASE WHEN industry IS NOT NULL AND char_length(trim(industry)) > 0 THEN 1 ELSE 0 END +
    CASE WHEN company_size IS NOT NULL AND char_length(trim(company_size)) > 0 THEN 1 ELSE 0 END +
    CASE WHEN website IS NOT NULL AND char_length(trim(website)) > 0 THEN 1 ELSE 0 END +
    CASE WHEN address_street IS NOT NULL AND char_length(trim(address_street)) > 0 THEN 1 ELSE 0 END +
    CASE WHEN address_city IS NOT NULL AND char_length(trim(address_city)) > 0 THEN 1 ELSE 0 END +
    CASE WHEN address_postal_code IS NOT NULL AND char_length(trim(address_postal_code)) > 0 THEN 1 ELSE 0 END +
    CASE WHEN account_status IS NOT NULL AND char_length(trim(account_status)) > 0 THEN 1 ELSE 0 END +
    CASE WHEN lifecycle_stage IS NOT NULL AND char_length(trim(lifecycle_stage)) > 0 THEN 1 ELSE 0 END +
    CASE WHEN estimated_annual_value IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN notes IS NOT NULL AND char_length(trim(notes)) > 0 THEN 1 ELSE 0 END +
    -- Bonus poäng för kontakter och frågeformulär
    CASE WHEN EXISTS(SELECT 1 FROM contacts WHERE account_id = account_uuid) THEN 2 ELSE 0 END +
    CASE WHEN EXISTS(SELECT 1 FROM questionnaire_answers WHERE account_id = account_uuid) THEN 2 ELSE 0 END
  INTO filled_fields
  FROM accounts
  WHERE id = account_uuid;

  -- Returnera procent (0-100)
  RETURN LEAST(100, (filled_fields * 100) / total_fields);
END;
$$ LANGUAGE plpgsql;

-- Trigger för att auto-uppdatera data_completeness när account uppdateras
CREATE OR REPLACE FUNCTION update_account_completeness()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_completeness := calculate_account_completeness(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_account_completeness_trigger
  BEFORE INSERT OR UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_account_completeness();

-- ============================================================================
-- KOMMENTARER FÖR DOKUMENTATION
-- ============================================================================

COMMENT ON TABLE accounts IS 'Företag/Organisationer i CRM-systemet';
COMMENT ON TABLE contacts IS 'Kontaktpersoner kopplade till företag';
COMMENT ON TABLE interactions IS 'Alla interaktioner med kunder (samtal, möten, email, etc.)';
COMMENT ON TABLE questionnaire_answers IS 'Svar på frågeformulär som byggs upp över tid';

COMMENT ON COLUMN accounts.data_completeness IS 'Beräknad procent (0-100) av hur komplett kundprofilen är';
COMMENT ON COLUMN questionnaire_answers.answer_version IS 'Version av svaret (1 = senaste, 2 = föregående, etc.)';
COMMENT ON COLUMN questionnaire_answers.source IS 'Hur svaret samlades in: manual, ai_auto_fill, eller live_analysis';

-- ============================================================================
-- KLAR! 🚀
-- ============================================================================
-- Detta skapar grunden för Customer Register MVP:
-- ✅ Accounts (företag)
-- ✅ Contacts (kontaktpersoner)
-- ✅ Interactions (interaktioner)
-- ✅ Questionnaire Answers (frågeformulär-svar)
-- ✅ Links från call_sessions till accounts
-- ✅ RLS policies för datasäkerhet
-- ✅ Indexes för prestanda
-- ✅ Triggers för auto-update av timestamps
-- ✅ Helper functions för data completeness
