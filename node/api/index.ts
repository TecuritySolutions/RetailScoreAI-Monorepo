import { buildApp } from '../src/app.js';
import { IncomingMessage, ServerResponse } from 'http';

let appInstance: Awaited<ReturnType<typeof buildApp>> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Initialize app instance once (singleton pattern for serverless)
  if (!appInstance) {
    appInstance = await buildApp();
    await appInstance.ready();
  }

  // Forward the request to Fastify
  appInstance.server.emit('request', req, res);
}
