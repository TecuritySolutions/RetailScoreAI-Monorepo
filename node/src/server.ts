import { buildServer } from './config/server.js';
import { testDatabaseConnection } from './config/database.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { assessmentRoutes, userAssessmentRoutes } from './routes/assessment.routes.js';
import { errorHandler } from './middleware/error-handler.js';

// Build Fastify instance for Vercel serverless
const fastify = buildServer();

// Test database connection (non-blocking)
testDatabaseConnection().catch((error) => {
  fastify.log.error({ error }, 'Database connection test failed during initialization');
});

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

// Vercel intercepts this .listen() call and wraps it as serverless
fastify.listen({ port: 3000 });
