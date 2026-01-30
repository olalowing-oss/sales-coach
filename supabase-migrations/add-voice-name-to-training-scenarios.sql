-- Migration: Add voice_name column to training_scenarios table
-- Created: 2026-01-30
-- Purpose: Enable gender-specific Azure Neural Voices for training personas

-- Add voice_name column with default value
ALTER TABLE training_scenarios
ADD COLUMN IF NOT EXISTS voice_name VARCHAR(50) DEFAULT 'sv-SE-SofieNeural';

-- Add comment for documentation
COMMENT ON COLUMN training_scenarios.voice_name IS 'Azure Neural Voice name for TTS (sv-SE-SofieNeural, sv-SE-MattiasNeural, sv-SE-HilleviNeural)';

-- Update existing scenarios with appropriate voices based on persona gender
-- Male personas
UPDATE training_scenarios
SET voice_name = 'sv-SE-MattiasNeural'
WHERE persona_name IN ('Erik Andersson', 'Magnus Bergström', 'Johan Karlsson')
  AND voice_name = 'sv-SE-SofieNeural';  -- Only update if still default

-- Female personas (friendly - keep default Sofie)
-- Already have default 'sv-SE-SofieNeural'

-- Female personas (formal/clear - use Hillevi if identified as formal)
UPDATE training_scenarios
SET voice_name = 'sv-SE-HilleviNeural'
WHERE persona_name = 'Karin Persson'
  AND personality ILIKE '%formell%'
  AND voice_name = 'sv-SE-SofieNeural';  -- Only update if still default
