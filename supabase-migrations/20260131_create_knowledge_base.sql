-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge_base table for storing uploaded material and processed knowledge
-- This table supports RAG (Retrieval-Augmented Generation) for AI responses

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Product relationship
  product_id UUID REFERENCES product_profiles(id) ON DELETE CASCADE,

  -- Source information
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('pdf', 'docx', 'url', 'text', 'other')),
  source_url TEXT,
  file_name VARCHAR(500),
  file_size_bytes INTEGER,

  -- Content
  title VARCHAR(500),
  content TEXT, -- Raw extracted text
  processed_content TEXT, -- AI-processed and structured text
  summary TEXT, -- AI-generated summary

  -- Vector embedding for semantic search (OpenAI ada-002 = 1536 dimensions)
  embedding vector(1536),

  -- Chunking information (for long documents split into chunks)
  chunk_index INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 1,
  parent_document_id UUID, -- Reference to parent if this is a chunk

  -- Metadata (flexible JSON for document-specific info)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Processing status
  processing_status VARCHAR(50) DEFAULT 'pending' CHECK (
    processing_status IN ('pending', 'processing', 'completed', 'failed')
  ),
  processing_error TEXT,

  -- Uploaded by
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT content_or_url_required CHECK (
    content IS NOT NULL OR source_url IS NOT NULL
  )
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_knowledge_base_product ON knowledge_base(product_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_source_type ON knowledge_base(source_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_status ON knowledge_base(processing_status);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_parent ON knowledge_base(parent_document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_uploaded_by ON knowledge_base(uploaded_by);

-- Create HNSW index for fast vector similarity search
-- HNSW (Hierarchical Navigable Small World) is optimal for semantic search
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Alternative: IVFFlat index (commented out, use HNSW instead for better performance)
-- CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Add RLS (Row Level Security)
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read knowledge for active products
CREATE POLICY "Users can view knowledge base entries"
  ON knowledge_base
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_profiles
      WHERE id = knowledge_base.product_id
      AND is_active = true
    )
  );

-- Users can insert knowledge base entries
CREATE POLICY "Users can create knowledge base entries"
  ON knowledge_base
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own uploads
CREATE POLICY "Users can update their uploads"
  ON knowledge_base
  FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- Users can delete their own uploads
CREATE POLICY "Users can delete their uploads"
  ON knowledge_base
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_knowledge_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_updated_at();

-- Create function for semantic search using cosine similarity
-- Returns top N most similar documents to a query embedding
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_product_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  product_id uuid,
  title varchar,
  content text,
  processed_content text,
  summary text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.product_id,
    kb.title,
    kb.content,
    kb.processed_content,
    kb.summary,
    1 - (kb.embedding <=> query_embedding) AS similarity,
    kb.metadata
  FROM knowledge_base kb
  WHERE
    kb.processing_status = 'completed'
    AND kb.embedding IS NOT NULL
    AND (filter_product_id IS NULL OR kb.product_id = filter_product_id)
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comments
COMMENT ON TABLE knowledge_base IS 'Stores uploaded documents and their vector embeddings for RAG-based AI responses';
COMMENT ON COLUMN knowledge_base.embedding IS 'Vector embedding (1536 dimensions from OpenAI text-embedding-ada-002)';
COMMENT ON FUNCTION match_knowledge_base IS 'Performs semantic search using cosine similarity on embeddings';
