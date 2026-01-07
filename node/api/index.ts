import awsLambdaFastify from '@fastify/aws-lambda';
import { buildApp } from '../src/app.js';
import type { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';

let handler: ReturnType<typeof awsLambdaFastify> | null = null;

async function getHandler() {
  if (!handler) {
    const app = await buildApp();
    handler = awsLambdaFastify(app);
  }
  return handler;
}

export default async function (event: APIGatewayProxyEvent, context: Context, callback: Callback): Promise<void> {
  const h = await getHandler();
  return h(event, context, callback);
}
