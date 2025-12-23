// Subscription tier enum
export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}

// Extended User interface
export interface User {
  id: string;
  email: string;
  is_verified: boolean;

  // Profile fields
  full_name: string | null;
  phone_number: string | null;
  photo_url: string | null;
  company_name: string | null;
  city: string | null;
  state: string | null;
  country: string;
  subscription_tier: SubscriptionTier;

  // Usage tracking
  total_assessments_count: number;

  // Timestamps
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}

export interface CreateUserDTO {
  email: string;
}

export interface UpdateUserDTO {
  is_verified?: boolean;
  last_login_at?: Date;
}

// DTO for updating user profile
export interface UpdateUserProfileDTO {
  full_name?: string;
  phone_number?: string;
  photo_url?: string;
  company_name?: string;
  city?: string;
  state?: string;
  country?: string;
}

// DTO for admin operations (updating subscription)
export interface UpdateUserSubscriptionDTO {
  subscription_tier: SubscriptionTier;
}

// Public user profile (for API responses)
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
  subscription_tier: SubscriptionTier;
  total_assessments_count: number;
  created_at: Date;
  last_login_at: Date | null;
}
