import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3000'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:8081'),

  // Database
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL is required'),

  // SendGrid
  SENDGRID_API_KEY: z.string().min(1, 'SENDGRID_API_KEY is required'),
  SENDGRID_FROM_EMAIL: z.string().email('Invalid SENDGRID_FROM_EMAIL'),
  SENDGRID_FROM_NAME: z.string().min(1, 'SENDGRID_FROM_NAME is required'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // OTP Configuration
  OTP_EXPIRY_MINUTES: z.string().transform(Number).pipe(z.number().int().positive()).default('15'),
  OTP_RATE_LIMIT_COUNT: z.string().transform(Number).pipe(z.number().int().positive()).default('3'),
  OTP_RATE_LIMIT_WINDOW_MINUTES: z.string().transform(Number).pipe(z.number().int().positive()).default('30'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Environment validation failed. Check the logs for details.');
    }
    throw error;
  }
};

export const env = parseEnv();

// Type export for TypeScript
export type Env = z.infer<typeof envSchema>;
