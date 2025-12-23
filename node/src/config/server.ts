import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './env.js';

export function buildServer() {
  const fastify = Fastify({
    logger:
      env.NODE_ENV === 'development'
        ? {
            level: env.LOG_LEVEL,
            transport: {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                colorize: true,
              },
            },
          }
        : {
            level: env.LOG_LEVEL,
          },
  });

  // Security: Helmet for security headers
  fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Swagger UI needs inline scripts
        imgSrc: ["'self'", 'data:', 'https:', 'validator.swagger.io'], // For Swagger UI
      },
    },
  });

  // CORS configuration
  fastify.register(cors, {
    origin: env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global rate limiting
  fastify.register(rateLimit, {
    max: 100, // Maximum 100 requests
    timeWindow: '15 minutes', // Per 15 minutes
    errorResponseBuilder: () => {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      };
    },
  });

  // JWT authentication
  fastify.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    },
  });

  // Swagger/OpenAPI configuration
  fastify.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'RetailScore AI API',
        description: 'API for retail store assessment and scoring platform',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@retailscore.ai',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
        {
          url: 'https://api.retailscore.ai',
          description: 'Production server',
        },
      ],
      tags: [
        { name: 'Authentication', description: 'OTP-based authentication endpoints' },
        { name: 'User Profile', description: 'User profile management' },
        { name: 'Assessments', description: 'Retail store assessment operations' },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT access token from /api/auth/verify-otp',
          },
        },
      },
      security: [],
    },
  });

  // Swagger UI
  fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  return fastify;
}
