-- Add call analysis fields to call_sessions table

-- Basic information (already exists: customer_name, customer_company, customer_role)
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS company_size TEXT CHECK (company_size IN ('1-50', '51-200', '201-1000', '1000+', null));

-- Call context
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS call_purpose TEXT CHECK (call_purpose IN ('Prospektering', 'Demo', 'Uppföljning', 'Förhandling', 'Closing', null));
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS call_outcome TEXT CHECK (call_outcome IN ('Bokat möte', 'Skickat offert', 'Behöver tänka', 'Nej tack', 'Uppföljning krävs', 'Avslutad affär', null));
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS interest_level TEXT CHECK (interest_level IN ('Hög', 'Medel', 'Låg', null));

-- Business data
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS estimated_value INTEGER; -- Belopp i SEK
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS decision_timeframe TEXT CHECK (decision_timeframe IN ('Omedelbart', '1-3 månader', '3-6 månader', '6-12 månader', 'Okänt', null));
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS probability INTEGER CHECK (probability >= 0 AND probability <= 100);

-- Structured lists
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS products_discussed TEXT[];
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS competitors_mentioned TEXT[];
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS objections_raised TEXT[];
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS pain_points TEXT[];

-- Follow-up
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS next_steps TEXT;
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS notes TEXT;

-- AI-generated insights
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS key_topics TEXT[];

-- Analysis metadata
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE call_sessions ADD COLUMN IF NOT EXISTS is_analyzed BOOLEAN DEFAULT false;

-- Add index for filtering analyzed sessions
CREATE INDEX IF NOT EXISTS idx_call_sessions_analyzed ON call_sessions(is_analyzed);
CREATE INDEX IF NOT EXISTS idx_call_sessions_follow_up_date ON call_sessions(follow_up_date);
