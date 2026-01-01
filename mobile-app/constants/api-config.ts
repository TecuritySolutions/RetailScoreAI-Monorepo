export const API_CONFIG = {
  BASE_URL: 'http://192.168.0.149:3000',
  ENDPOINTS: {
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    PROFILE: '/api/user/profile',
    ASSESSMENTS: '/api/user/assessments',
    ASSESSMENT_STATS: '/api/user/assessments/stats',
    ASSESSMENT_BY_ID: (id: string) => `/api/assessments/${id}`,
  },
} as const;
