import { buildApp } from '../src/app.js';

// Build and export the Fastify app
// Vercel handles the serverless wrapping automatically
const app = await buildApp();

export default app;
