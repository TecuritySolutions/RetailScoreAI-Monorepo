import { FastifyInstance } from 'fastify';
import { buildServer } from './config/server.js';
import { testDatabaseConnection } from './config/database.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { assessmentRoutes, userAssessmentRoutes } from './routes/assessment.routes.js';
import { errorHandler } from './middleware/error-handler.js';

// Helper function for local development
export async function buildApp(): Promise<FastifyInstance> {
  const app = buildServer();

  // Test database connection (non-blocking)
  try {
    await testDatabaseConnection();
  } catch (error) {
    app.log.error({ error }, 'Database connection test failed during initialization');
  }

  // Register global error handler
  app.setErrorHandler(errorHandler);

  // Health check endpoint
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // Register routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/user' });
  await app.register(assessmentRoutes, { prefix: '/api/assessments' });
  await app.register(userAssessmentRoutes, { prefix: '/api/user' });

  return app;
}

// Create Fastify instance for Vercel (synchronous pattern)
const fastify = buildServer();

// Test database connection (non-blocking for serverless)
testDatabaseConnection()
  .then(() => {
    fastify.log.info('Database connection successful');
  })
  .catch((error) => {
    fastify.log.error({ error }, 'Database connection test failed during initialization');
    // Don't throw - allow the app to start and fail gracefully on first request
  });

// Register global error handler
fastify.setErrorHandler(errorHandler);

// Health check endpoint
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}));

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(userRoutes, { prefix: '/api/user' });
fastify.register(assessmentRoutes, { prefix: '/api/assessments' });
fastify.register(userAssessmentRoutes, { prefix: '/api/user' });

// Vercel will intercept this .listen() call
fastify.listen({ port: 3000 });
