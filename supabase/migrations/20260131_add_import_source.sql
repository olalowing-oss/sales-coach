-- Add import source tracking to call_sessions
-- This allows tracking which sessions were imported vs recorded live

ALTER TABLE call_sessions
ADD COLUMN IF NOT EXISTS import_source TEXT DEFAULT NULL;

COMMENT ON COLUMN call_sessions.import_source IS 'Source of imported transcripts: teams, zoom, manual, etc. NULL for live recordings';

ALTER TABLE call_sessions
ADD COLUMN IF NOT EXISTS original_meeting_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN call_sessions.original_meeting_date IS 'Original meeting date for imported transcripts';

ALTER TABLE call_sessions
ADD COLUMN IF NOT EXISTS meeting_participants TEXT[] DEFAULT NULL;

COMMENT ON COLUMN call_sessions.meeting_participants IS 'List of meeting participants (for imported meetings)';

-- Index for filtering imported sessions
CREATE INDEX IF NOT EXISTS idx_call_sessions_import_source ON call_sessions(import_source);
