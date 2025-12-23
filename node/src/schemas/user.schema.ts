import { z } from 'zod';

// Phone number validation based on country
const phoneNumberSchema = z.string().refine(
  (val) => {
    // For India: exactly 10 digits
    // For others: 10-20 digits
    return /^\d{10,20}$/.test(val);
  },
  { message: 'Invalid phone number format' }
);

// Profile update schema
export const updateUserProfileBodySchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  phone_number: phoneNumberSchema.optional(),
  photo_url: z.string().url('Invalid photo URL').optional(),
  company_name: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100).optional(),
});

// Common user object schema for responses
const userObjectSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    full_name: { type: 'string', nullable: true, example: 'John Doe' },
    phone_number: { type: 'string', nullable: true, example: '9876543210' },
    photo_url: { type: 'string', format: 'uri', nullable: true },
    company_name: { type: 'string', nullable: true, example: 'Acme Corp' },
    city: { type: 'string', nullable: true, example: 'Mumbai' },
    state: { type: 'string', nullable: true, example: 'Maharashtra' },
    country: { type: 'string', example: 'India' },
    subscription_tier: { type: 'string', enum: ['FREE', 'BASIC', 'PREMIUM'], example: 'FREE' },
    total_assessments_count: { type: 'number', example: 0 },
    is_verified: { type: 'boolean', example: true },
    created_at: { type: 'string', format: 'date-time' },
    last_login_at: { type: 'string', format: 'date-time', nullable: true },
  },
};

// Fastify schema for GET /api/user/profile
export const getUserProfileSchema = {
  description: 'Get current user profile',
  tags: ['User Profile'],
  security: [{ BearerAuth: [] }],
  response: {
    200: {
      description: 'User profile retrieved successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        user: userObjectSchema,
      },
    },
    401: {
      description: 'Unauthorized - Invalid or missing token',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        error: { type: 'string', example: 'Unauthorized' },
        message: { type: 'string', example: 'Invalid or expired access token' },
      },
    },
  },
};

// Fastify schema for PATCH /api/user/profile
export const updateUserProfileSchema = {
  description: 'Update user profile (partial update supported)',
  tags: ['User Profile'],
  security: [{ BearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      full_name: { type: 'string', minLength: 1, maxLength: 255 },
      phone_number: { type: 'string', pattern: '^\\d{10,20}$' },
      photo_url: { type: 'string', format: 'uri' },
      company_name: { type: 'string', minLength: 1, maxLength: 255 },
      city: { type: 'string', minLength: 1, maxLength: 100 },
      state: { type: 'string', minLength: 1, maxLength: 100 },
      country: { type: 'string', minLength: 1, maxLength: 100 },
    },
  },
  response: {
    200: {
      description: 'Profile updated successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Profile updated successfully' },
        user: userObjectSchema,
      },
    },
    400: {
      description: 'Bad request - Validation error',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: { type: 'string', example: 'Invalid phone number format' },
      },
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        error: { type: 'string', example: 'Unauthorized' },
        message: { type: 'string', example: 'Invalid or expired access token' },
      },
    },
  },
};

export type UpdateUserProfileBody = z.infer<typeof updateUserProfileBodySchema>;
