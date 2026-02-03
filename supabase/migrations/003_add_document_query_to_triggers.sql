-- Add document_query field to trigger_patterns for RAG-based coaching

-- Add document_query column
ALTER TABLE trigger_patterns
ADD COLUMN IF NOT EXISTS document_query TEXT;

COMMENT ON COLUMN trigger_patterns.document_query IS 'Query to use for document search when this trigger matches (RAG)';

-- Create index for faster document searches
CREATE INDEX IF NOT EXISTS idx_trigger_patterns_document_query
ON trigger_patterns(document_query)
WHERE document_query IS NOT NULL;
