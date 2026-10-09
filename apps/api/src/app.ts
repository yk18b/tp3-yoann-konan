import Fastify, { type FastifyInstance } from 'fastify';
import { APP_NAME } from '@duper/shared';

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

  app.get('/api/health', () => ({ status: 'ok', app: APP_NAME }));

  return app;
}
