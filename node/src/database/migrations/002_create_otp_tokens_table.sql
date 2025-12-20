-- Create otp_tokens table
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
