import Fastify from 'fastify';
import { buildApp } from './app.js';

// Serverless entrypoint for Vercel
// Vercel automatically detects this file and wraps it as a serverless function
const fastify = Fastify({ logger: true });

// Initialize the app
buildApp()
  .then((app) => {
    // Start listening - Vercel handles the serverless wrapping
    app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }
    });
  })
  .catch((error) => {
    fastify.log.error({ error }, 'Failed to initialize Fastify app');
    process.exit(1);
  });
