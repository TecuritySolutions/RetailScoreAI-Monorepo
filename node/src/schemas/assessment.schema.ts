import { z } from 'zod';

// Score validation (0-100)
const scoreSchema = z.number().min(0).max(100);

// Create assessment schema
export const createAssessmentBodySchema = z.object({
  store_name: z.string().min(1).max(255),
  store_location: z.string().max(500).optional(),
  store_type: z.string().max(100).optional(),
  assessment_date: z.string().datetime().or(z.date()).optional(),
  overall_score: scoreSchema.optional(),
  cleanliness_score: scoreSchema.optional(),
  customer_service_score: scoreSchema.optional(),
  product_quality_score: scoreSchema.optional(),
  pricing_score: scoreSchema.optional(),
  notes: z.string().max(2000).optional(),
  photos: z.array(z.string().url()).max(10).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(['DRAFT', 'COMPLETED', 'ARCHIVED']).optional(),
});

// Update assessment schema (all fields optional)
export const updateAssessmentBodySchema = createAssessmentBodySchema.partial();

// Query parameters for listing assessments
export const listAssessmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'COMPLETED', 'ARCHIVED']).optional(),
  from_date: z.string().datetime().or(z.date()).optional(),
  to_date: z.string().datetime().or(z.date()).optional(),
  sort_by: z.enum(['assessment_date', 'overall_score', 'created_at']).default('assessment_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateAssessmentBody = z.infer<typeof createAssessmentBodySchema>;
export type UpdateAssessmentBody = z.infer<typeof updateAssessmentBodySchema>;
export type ListAssessmentsQuery = z.infer<typeof listAssessmentsQuerySchema>;

// Common assessment object schema for responses
const assessmentObjectSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    user_id: { type: 'string', format: 'uuid' },
    store_name: { type: 'string', example: 'SuperMart Downtown' },
    store_location: { type: 'string', nullable: true, example: '123 Main St, Mumbai' },
    store_type: { type: 'string', nullable: true, example: 'Supermarket' },
    assessment_date: { type: 'string', format: 'date-time', example: '2024-12-20T10:00:00Z' },
    overall_score: { type: 'number', nullable: true, minimum: 0, maximum: 100, example: 85.5 },
    cleanliness_score: { type: 'number', nullable: true, minimum: 0, maximum: 100, example: 90 },
    customer_service_score: { type: 'number', nullable: true, minimum: 0, maximum: 100, example: 88 },
    product_quality_score: { type: 'number', nullable: true, minimum: 0, maximum: 100, example: 82 },
    pricing_score: { type: 'number', nullable: true, minimum: 0, maximum: 100, example: 78 },
    notes: { type: 'string', nullable: true, maxLength: 2000, example: 'Store was clean and well-organized' },
    photos: {
      type: 'array',
      nullable: true,
      items: { type: 'string', format: 'uri' },
      maxItems: 10,
      example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    },
    tags: {
      type: 'array',
      nullable: true,
      items: { type: 'string', maxLength: 50 },
      maxItems: 20,
      example: ['grocery', 'urban', 'premium'],
    },
    status: { type: 'string', enum: ['DRAFT', 'COMPLETED', 'ARCHIVED'], example: 'COMPLETED' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

// Fastify schema for POST /api/assessments
export const createAssessmentSchema = {
  description: 'Create new retail store assessment',
  tags: ['Assessments'],
  security: [{ BearerAuth: [] }],
  body: {
    type: 'object',
    required: ['store_name'],
    properties: {
      store_name: { type: 'string', minLength: 1, maxLength: 255 },
      store_location: { type: 'string', maxLength: 500 },
      store_type: { type: 'string', maxLength: 100 },
      assessment_date: { type: 'string', format: 'date-time' },
      overall_score: { type: 'number', minimum: 0, maximum: 100 },
      cleanliness_score: { type: 'number', minimum: 0, maximum: 100 },
      customer_service_score: { type: 'number', minimum: 0, maximum: 100 },
      product_quality_score: { type: 'number', minimum: 0, maximum: 100 },
      pricing_score: { type: 'number', minimum: 0, maximum: 100 },
      notes: { type: 'string', maxLength: 2000 },
      photos: {
        type: 'array',
        items: { type: 'string', format: 'uri' },
        maxItems: 10,
      },
      tags: {
        type: 'array',
        items: { type: 'string', maxLength: 50 },
        maxItems: 20,
      },
      status: { type: 'string', enum: ['DRAFT', 'COMPLETED', 'ARCHIVED'] },
    },
  },
  response: {
    201: {
      description: 'Assessment created successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Assessment created successfully' },
        assessment: assessmentObjectSchema,
      },
    },
    400: {
      description: 'Bad request - Validation error',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: { type: 'string', example: 'Invalid input data' },
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

// Fastify schema for GET /api/assessments/:id
export const getAssessmentSchema = {
  description: 'Get single assessment by ID',
  tags: ['Assessments'],
  security: [{ BearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
    required: ['id'],
  },
  response: {
    200: {
      description: 'Assessment retrieved successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        assessment: assessmentObjectSchema,
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
    404: {
      description: 'Assessment not found',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        error: { type: 'string', example: 'Not Found' },
        message: { type: 'string', example: 'Assessment not found' },
      },
    },
  },
};

// Fastify schema for PATCH /api/assessments/:id
export const updateAssessmentSchema = {
  description: 'Update assessment (partial update supported)',
  tags: ['Assessments'],
  security: [{ BearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      store_name: { type: 'string', minLength: 1, maxLength: 255 },
      store_location: { type: 'string', maxLength: 500 },
      store_type: { type: 'string', maxLength: 100 },
      assessment_date: { type: 'string', format: 'date-time' },
      overall_score: { type: 'number', minimum: 0, maximum: 100 },
      cleanliness_score: { type: 'number', minimum: 0, maximum: 100 },
      customer_service_score: { type: 'number', minimum: 0, maximum: 100 },
      product_quality_score: { type: 'number', minimum: 0, maximum: 100 },
      pricing_score: { type: 'number', minimum: 0, maximum: 100 },
      notes: { type: 'string', maxLength: 2000 },
      photos: {
        type: 'array',
        items: { type: 'string', format: 'uri' },
        maxItems: 10,
      },
      tags: {
        type: 'array',
        items: { type: 'string', maxLength: 50 },
        maxItems: 20,
      },
      status: { type: 'string', enum: ['DRAFT', 'COMPLETED', 'ARCHIVED'] },
    },
  },
  response: {
    200: {
      description: 'Assessment updated successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Assessment updated successfully' },
        assessment: assessmentObjectSchema,
      },
    },
    400: {
      description: 'Bad request - Validation error',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: { type: 'string', example: 'Invalid input data' },
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
    404: {
      description: 'Assessment not found',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        error: { type: 'string', example: 'Not Found' },
        message: { type: 'string', example: 'Assessment not found' },
      },
    },
  },
};

// Fastify schema for DELETE /api/assessments/:id
export const deleteAssessmentSchema = {
  description: 'Delete assessment',
  tags: ['Assessments'],
  security: [{ BearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
    required: ['id'],
  },
  response: {
    200: {
      description: 'Assessment deleted successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Assessment deleted successfully' },
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
    404: {
      description: 'Assessment not found',
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        error: { type: 'string', example: 'Not Found' },
        message: { type: 'string', example: 'Assessment not found' },
      },
    },
  },
};

// Fastify schema for GET /api/user/assessments
export const listAssessmentsSchema = {
  description: 'List user assessments with pagination and filtering',
  tags: ['Assessments'],
  security: [{ BearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100 },
      status: { type: 'string', enum: ['DRAFT', 'COMPLETED', 'ARCHIVED'] },
      from_date: { type: 'string', format: 'date-time' },
      to_date: { type: 'string', format: 'date-time' },
      sort_by: {
        type: 'string',
        enum: ['assessment_date', 'overall_score', 'created_at'],
      },
      sort_order: {
        type: 'string',
        enum: ['asc', 'desc'],
      },
    },
  },
  response: {
    200: {
      description: 'Assessments retrieved successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            assessments: {
              type: 'array',
              items: assessmentObjectSchema,
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total_count: { type: 'number', example: 45 },
                total_pages: { type: 'number', example: 3 },
                has_next: { type: 'boolean', example: true },
                has_prev: { type: 'boolean', example: false },
              },
            },
          },
        },
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

// Fastify schema for GET /api/user/assessments/stats
export const getAssessmentStatsSchema = {
  description: 'Get user assessment statistics',
  tags: ['Assessments'],
  security: [{ BearerAuth: [] }],
  response: {
    200: {
      description: 'Statistics retrieved successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        stats: {
          type: 'object',
          properties: {
            total_assessments: { type: 'number', example: 45 },
            average_score: { type: 'number', nullable: true, example: 82.3 },
            assessments_this_month: { type: 'number', example: 8 },
            assessments_this_year: { type: 'number', example: 45 },
          },
        },
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
