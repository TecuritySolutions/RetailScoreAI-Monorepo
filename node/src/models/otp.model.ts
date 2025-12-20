export interface OtpToken {
  id: string;
  user_id: string | null;
  email: string;
  otp_hash: string;
  expires_at: Date;
  attempts: number;
  verified: boolean;
  created_at: Date;
}

export interface CreateOtpDTO {
  email: string;
  otp_hash: string;
  expires_at: Date;
  user_id?: string;
}

export interface OtpVerificationResult {
  valid: boolean;
  user_id?: string;
  reason?: 'expired' | 'invalid' | 'max_attempts' | 'already_used';
}
