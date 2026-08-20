// Health checks: liveness e readiness (banco).

import type { FastifyInstance } from 'fastify';
import { sql } from '../../../infrastructure/database/connection.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    return reply.send({ status: 'ok', uptime: Math.floor(process.uptime()) });
  });

  app.get('/health/ready', async (_request, reply) => {
    try {
      await sql`select 1`;
      return reply.send({ status: 'ready' });
    } catch (err) {
      app.log.error({ err }, 'banco indisponivel no readiness check');
      return reply.code(503).send({ status: 'degraded', reason: 'banco_indisponivel' });
    }
  });
}
