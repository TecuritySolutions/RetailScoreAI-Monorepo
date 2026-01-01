import { API_CONFIG } from '@/constants/api-config';
import { apiClient } from './client';
import type { UserProfile, UpdateUserProfileDTO } from '@/types/auth';

interface UserProfileResponse {
  success: boolean;
  user: UserProfile;
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

export const userApi = {
  async getProfile(): Promise<UserProfileResponse> {
    return apiClient.get<UserProfileResponse>(API_CONFIG.ENDPOINTS.PROFILE);
  },

  async updateProfile(updates: UpdateUserProfileDTO): Promise<UpdateProfileResponse> {
    return apiClient.patch<UpdateProfileResponse>(API_CONFIG.ENDPOINTS.PROFILE, updates);
  },
};
