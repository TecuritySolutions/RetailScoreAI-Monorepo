import { FastifyInstance } from 'fastify';
import { buildServer } from './config/server.js';
import { testDatabaseConnection } from './config/database.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { assessmentRoutes, userAssessmentRoutes } from './routes/assessment.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = buildServer();

  // Test database connection
  await testDatabaseConnection();

  // Register global error handler
  fastify.setErrorHandler(errorHandler);

  // Health check endpoint
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // Register routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(userRoutes, { prefix: '/api/user' });
  await fastify.register(assessmentRoutes, { prefix: '/api/assessments' });
  await fastify.register(userAssessmentRoutes, { prefix: '/api/user' });

  return fastify;
}
