import { buildApp } from '../src/app.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: Awaited<ReturnType<typeof buildApp>> | null = null;

async function getApp() {
  if (!app) {
    app = await buildApp();
    await app.ready();
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fastify = await getApp();

  // Use Fastify's inject method to handle the request
  const response = await fastify.inject({
    method: (req.method || 'GET') as any,
    url: req.url || '/',
    headers: req.headers as Record<string, string>,
    payload: req.body,
  });

  // Set response headers
  Object.entries(response.headers).forEach(([key, value]) => {
    res.setHeader(key, value as any);
  });

  // Set status code and send response
  res.status(response.statusCode).send(response.body);
}
