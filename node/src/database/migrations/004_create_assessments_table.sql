-- Migration: Create Assessments Table
-- Description: Creates assessments table for storing detailed retail store evaluation history

-- Create assessments table for retail store evaluations
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Store information
  store_name VARCHAR(255) NOT NULL,
  store_location TEXT,
  store_type VARCHAR(100),

  -- Assessment details
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score DECIMAL(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),

  -- Detailed scores (example categories - adjust based on your scoring system)
  cleanliness_score DECIMAL(5,2),
  customer_service_score DECIMAL(5,2),
  product_quality_score DECIMAL(5,2),
  pricing_score DECIMAL(5,2),

  -- Additional data
  notes TEXT,
  photos JSONB, -- Array of photo URLs
  tags VARCHAR(50)[], -- Array of tags for categorization

  -- Metadata
  status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('DRAFT', 'COMPLETED', 'ARCHIVED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient queries
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_assessment_date ON assessments(assessment_date DESC);
CREATE INDEX idx_assessments_overall_score ON assessments(overall_score);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_user_date ON assessments(user_id, assessment_date DESC);
CREATE INDEX idx_assessments_store_name ON assessments(store_name);
CREATE INDEX idx_assessments_tags ON assessments USING GIN(tags);

-- Auto-update trigger for updated_at
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment user's total_assessments_count
CREATE OR REPLACE FUNCTION increment_user_assessment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND (TG_OP = 'INSERT' OR OLD.status != 'COMPLETED') THEN
    UPDATE users
    SET total_assessments_count = total_assessments_count + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_assessment_count
  AFTER INSERT OR UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION increment_user_assessment_count();

-- Add comments
COMMENT ON TABLE assessments IS 'Stores detailed retail store assessment/evaluation history';
COMMENT ON COLUMN assessments.photos IS 'JSON array of photo URLs: ["https://...", "https://..."]';
COMMENT ON COLUMN assessments.tags IS 'Array of tags for categorization/filtering';
COMMENT ON COLUMN assessments.status IS 'Assessment status: DRAFT (in progress), COMPLETED (finished), ARCHIVED (historical)';
COMMENT ON COLUMN assessments.overall_score IS 'Overall assessment score from 0-100';
