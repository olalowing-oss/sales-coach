-- Add voice_name column to training_scenarios
-- Run this in Supabase SQL Editor

ALTER TABLE training_scenarios
ADD COLUMN IF NOT EXISTS voice_name VARCHAR(50) DEFAULT 'sv-SE-SofieNeural';

COMMENT ON COLUMN training_scenarios.voice_name IS 'Azure Neural Voice name for TTS';

-- Update existing scenarios with appropriate voices
-- Male personas
UPDATE training_scenarios
SET voice_name = 'sv-SE-MattiasNeural'
WHERE persona_name IN ('Erik Andersson', 'Magnus Bergström', 'Johan Karlsson')
  AND (voice_name IS NULL OR voice_name = 'sv-SE-SofieNeural');

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'training_scenarios'
  AND column_name = 'voice_name';
