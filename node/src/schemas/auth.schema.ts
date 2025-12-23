import { z } from 'zod';

// Email schema - reusable
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim();

// OTP schema - must be exactly 6 digits
export const otpSchema = z
  .string()
  .regex(/^\d{6}$/, 'OTP must be exactly 6 digits')
  .trim();

// Send OTP request body schema
export const sendOtpBodySchema = z.object({
  email: emailSchema,
});

// Verify OTP request body schema
export const verifyOtpBodySchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

// Refresh token request body schema
export const refreshTokenBodySchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

// Fastify schema for send-otp endpoint
export const sendOtpSchema = {
  description: 'Send OTP to user email',
  tags: ['Authentication'],
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
      },
    },
  },
  response: {
    200: {
      description: 'OTP sent successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'OTP sent successfully to your email' },
        expiresIn: { type: 'number', description: 'OTP expiry time in minutes', example: 15 },
      },
    },
    400: {
      description: 'Bad request',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: { type: 'string', example: 'Invalid email format' },
      },
    },
  },
};

// Fastify schema for verify-otp endpoint
export const verifyOtpSchema = {
  description: 'Verify OTP and get authentication tokens',
  tags: ['Authentication'],
  body: {
    type: 'object',
    required: ['email', 'otp'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
      },
      otp: {
        type: 'string',
        pattern: '^\\d{6}$',
        description: '6-digit OTP code',
      },
    },
  },
  response: {
    200: {
      description: 'Authentication successful',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            email: { type: 'string', example: 'user@example.com' },
            is_verified: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            last_login_at: { type: 'string', format: 'date-time' },
          },
        },
        tokens: {
          type: 'object',
          properties: {
            access_token: { type: 'string', description: 'JWT access token (15 min expiry)' },
            refresh_token: { type: 'string', description: 'JWT refresh token (7 day expiry)' },
            expires_in: { type: 'number', description: 'Access token expiry in seconds', example: 900 },
          },
        },
      },
    },
    400: {
      description: 'Bad request - Invalid input',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: { type: 'string', example: 'OTP must be exactly 6 digits' },
      },
    },
    401: {
      description: 'Unauthorized - Invalid OTP',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        error: { type: 'string', example: 'Unauthorized' },
        message: { type: 'string', example: 'Invalid or expired OTP' },
      },
    },
  },
};

// Fastify schema for refresh-token endpoint
export const refreshTokenSchema = {
  description: 'Refresh access and refresh tokens',
  tags: ['Authentication'],
  body: {
    type: 'object',
    required: ['refresh_token'],
    properties: {
      refresh_token: {
        type: 'string',
        minLength: 1,
        description: 'JWT refresh token',
      },
    },
  },
  response: {
    200: {
      description: 'Tokens refreshed successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        tokens: {
          type: 'object',
          properties: {
            access_token: { type: 'string', description: 'New JWT access token' },
            refresh_token: { type: 'string', description: 'New JWT refresh token' },
            expires_in: { type: 'number', example: 900 },
          },
        },
      },
    },
    401: {
      description: 'Unauthorized - Invalid or expired refresh token',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        error: { type: 'string', example: 'Unauthorized' },
        message: { type: 'string', example: 'Invalid or expired refresh token' },
      },
    },
  },
};

// Type exports
export type SendOtpBody = z.infer<typeof sendOtpBodySchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpBodySchema>;
export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>;
