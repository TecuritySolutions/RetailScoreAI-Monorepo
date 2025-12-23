-- Migration: Add User Profile Fields
-- Description: Adds profile columns to users table for storing personal, company, and location information

-- Add profile columns to users table
ALTER TABLE users
  ADD COLUMN full_name VARCHAR(255),
  ADD COLUMN phone_number VARCHAR(20),
  ADD COLUMN photo_url TEXT,
  ADD COLUMN company_name VARCHAR(255),
  ADD COLUMN city VARCHAR(100),
  ADD COLUMN state VARCHAR(100),
  ADD COLUMN country VARCHAR(100) DEFAULT 'India',
  ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'FREE',
  ADD COLUMN total_assessments_count INT DEFAULT 0;

-- Add constraints
ALTER TABLE users
  ADD CONSTRAINT valid_subscription_tier
    CHECK (subscription_tier IN ('FREE', 'BASIC', 'PREMIUM'));

ALTER TABLE users
  ADD CONSTRAINT valid_phone_number
    CHECK (
      phone_number IS NULL OR
      (country = 'India' AND phone_number ~ '^\d{10}$') OR
      (country != 'India' AND length(phone_number) >= 10 AND length(phone_number) <= 20)
    );

-- Add indexes for common queries
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_full_name ON users(full_name);

-- Add comments for documentation
COMMENT ON COLUMN users.photo_url IS 'URL to user profile photo stored in cloud storage (S3/Cloudinary)';
COMMENT ON COLUMN users.total_assessments_count IS 'Denormalized count of completed assessments for quick access';
COMMENT ON COLUMN users.subscription_tier IS 'User subscription tier: FREE, BASIC, or PREMIUM';
COMMENT ON COLUMN users.phone_number IS 'User phone number with country-specific validation';
