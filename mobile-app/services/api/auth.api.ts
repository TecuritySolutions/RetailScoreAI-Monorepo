import { API_CONFIG } from '@/constants/api-config';
import { apiClient } from './client';
import type { AuthResponse, SendOTPResponse, RefreshTokenResponse } from '@/types/auth';

export const authApi = {
  async sendOtp(email: string): Promise<SendOTPResponse> {
    return apiClient.post<SendOTPResponse>(API_CONFIG.ENDPOINTS.SEND_OTP, { email });
  },

  async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.VERIFY_OTP, {
      email,
      otp,
    });
  },

  async refreshToken(refresh_token: string): Promise<RefreshTokenResponse> {
    return apiClient.post<RefreshTokenResponse>(
      API_CONFIG.ENDPOINTS.REFRESH_TOKEN,
      { refresh_token }
    );
  },
};
