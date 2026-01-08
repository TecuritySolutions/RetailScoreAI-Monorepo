import awsLambdaFastify from '@fastify/aws-lambda';
import { buildApp } from '../src/app.js';

let handler: ReturnType<typeof awsLambdaFastify> | null = null;

async function getHandler() {
  if (!handler) {
    const app = await buildApp();
    handler = awsLambdaFastify(app);
  }
  return handler;
}

export default async function (req: any, res: any, callback: any) {
  const h = await getHandler();
  return h(req, res, callback);
}
