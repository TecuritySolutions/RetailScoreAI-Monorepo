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

// Fastify schema for send-otp endpoint
export const sendOtpSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        expiresIn: { type: 'number' },
      },
    },
  },
};

// Fastify schema for verify-otp endpoint
export const verifyOtpSchema = {
  body: {
    type: 'object',
    required: ['email', 'otp'],
    properties: {
      email: { type: 'string', format: 'email' },
      otp: { type: 'string', pattern: '^\\d{6}$' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            is_verified: { type: 'boolean' },
            created_at: { type: 'string' },
            last_login_at: { type: 'string' },
          },
        },
        tokens: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            refresh_token: { type: 'string' },
            expires_in: { type: 'number' },
          },
        },
      },
    },
  },
};

// Type exports
export type SendOtpBody = z.infer<typeof sendOtpBodySchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpBodySchema>;
