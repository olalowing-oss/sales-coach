-- Create function for vector similarity search in documents

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Function to match documents based on embedding similarity
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 3,
  filter_product_id uuid DEFAULT NULL,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE sql STABLE
AS $$
  SELECT
    knowledge_base.id,
    knowledge_base.title,
    knowledge_base.content,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity,
    knowledge_base.metadata
  FROM knowledge_base
  WHERE
    knowledge_base.processing_status = 'completed'
    AND knowledge_base.embedding IS NOT NULL
    AND (filter_user_id IS NULL OR knowledge_base.uploaded_by = filter_user_id)
    AND (filter_product_id IS NULL OR knowledge_base.product_id = filter_product_id)
    AND 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

COMMENT ON FUNCTION match_documents IS 'Vector similarity search for document chunks based on embedding distance';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION match_documents TO authenticated;
GRANT EXECUTE ON FUNCTION match_documents TO anon;
