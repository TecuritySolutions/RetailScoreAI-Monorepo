import { buildServer } from './config/server.js';
import { testDatabaseConnection, closeDatabaseConnection } from './config/database.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { assessmentRoutes, userAssessmentRoutes } from './routes/assessment.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { env } from './config/env.js';

async function start() {
  const fastify = buildServer();

  try {
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

    // Graceful shutdown handlers
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        fastify.log.info(`Received ${signal}, shutting down gracefully...`);
        try {
          await closeDatabaseConnection();
          await fastify.close();
          fastify.log.info('Server shut down successfully');
          process.exit(0);
        } catch (error) {
          fastify.log.error({ error }, 'Error during shutdown');
          process.exit(1);
        }
      });
    });

    // Start the server
    await fastify.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    fastify.log.info(`
╔═══════════════════════════════════════════════╗
║   RetailScore AI - Node.js API Gateway       ║
║   Server running on port ${env.PORT}               ║
║   Environment: ${env.NODE_ENV.padEnd(31)}║
║   Health: http://localhost:${env.PORT}/health    ║
╚═══════════════════════════════════════════════╝
    `);
  } catch (error) {
    fastify.log.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Start the application
start();
