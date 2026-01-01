export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  photo_url: string | null;
  company_name: string | null;
  city: string | null;
  state: string | null;
  country: string;
  subscription_tier: 'FREE' | 'BASIC' | 'PREMIUM';
  total_assessments_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  success: boolean;
  user: UserProfile;
  tokens: Tokens;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  success: boolean;
  tokens: Tokens;
}

export interface UpdateUserProfileDTO {
  full_name?: string;
  phone_number?: string;
  photo_url?: string;
  company_name?: string;
  city?: string;
  state?: string;
  country?: string;
}
