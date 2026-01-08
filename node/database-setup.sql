-- ============================================
-- RetailScore AI Database Setup
-- Complete migration script for Supabase
-- ============================================

-- MIGRATION 001: Create users table
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE users IS 'Stores user account information for authentication';


-- MIGRATION 002: Create otp_tokens table
-- ============================================

CREATE TABLE IF NOT EXISTS otp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,  -- bcrypt hash of OTP (NEVER store plaintext)
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT max_attempts CHECK (attempts <= 5),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_otp_tokens_email ON otp_tokens(email);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_user_id ON otp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_expires_at ON otp_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_verified ON otp_tokens(verified);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_email_verified ON otp_tokens(email, verified) WHERE verified = FALSE;

-- Create cleanup function for expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_tokens
  WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE otp_tokens IS 'Stores OTP tokens for email-based authentication (OTPs are hashed with bcrypt)';
COMMENT ON COLUMN otp_tokens.otp_hash IS 'bcrypt hash of the OTP - NEVER store OTPs in plaintext';
COMMENT ON COLUMN otp_tokens.attempts IS 'Number of verification attempts (max 5)';
COMMENT ON COLUMN otp_tokens.verified IS 'Whether the OTP has been successfully verified (prevents reuse)';


-- MIGRATION 003: Add user profile fields
-- ============================================

-- Add profile columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS total_assessments_count INT DEFAULT 0;

-- Add constraints (drop first if they exist to avoid errors)
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT valid_subscription_tier
    CHECK (subscription_tier IN ('FREE', 'BASIC', 'PREMIUM'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT valid_phone_number
    CHECK (
      phone_number IS NULL OR
      (country = 'India' AND phone_number ~ '^\d{10}$') OR
      (country != 'India' AND length(phone_number) >= 10 AND length(phone_number) <= 20)
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);

-- Add comments for documentation
COMMENT ON COLUMN users.photo_url IS 'URL to user profile photo stored in cloud storage (S3/Cloudinary)';
COMMENT ON COLUMN users.total_assessments_count IS 'Denormalized count of completed assessments for quick access';
COMMENT ON COLUMN users.subscription_tier IS 'User subscription tier: FREE, BASIC, or PREMIUM';
COMMENT ON COLUMN users.phone_number IS 'User phone number with country-specific validation';


-- MIGRATION 004: Create assessments table
-- ============================================

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
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_assessment_date ON assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_overall_score ON assessments(overall_score);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_user_date ON assessments(user_id, assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_store_name ON assessments(store_name);
CREATE INDEX IF NOT EXISTS idx_assessments_tags ON assessments USING GIN(tags);

-- Auto-update trigger for updated_at
DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
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

DROP TRIGGER IF EXISTS update_user_assessment_count ON assessments;
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

-- ============================================
-- Setup Complete!
-- ============================================
-- Tables created:
--   1. users - User authentication and profiles
--   2. otp_tokens - OTP authentication tokens
--   3. assessments - Store assessment records
--
-- Features included:
--   - Automatic timestamp updates
--   - Email validation
--   - OTP token expiration and cleanup
--   - Assessment score validation (0-100)
--   - Automatic assessment counting
--   - Performance indexes on all key columns
-- ============================================
