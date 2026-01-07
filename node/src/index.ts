import { buildApp } from './app.js';
import { closeDatabaseConnection } from './config/database.js';
import { env } from './config/env.js';

async function start() {
  const fastify = await buildApp();

  try {
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
