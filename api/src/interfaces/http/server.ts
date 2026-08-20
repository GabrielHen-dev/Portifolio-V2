// Monta o Fastify: helmet, cookies, rate limit, multipart e rotas.

import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';
import { env, isProd } from '../../config/env.js';
import type { Container } from '../../container.js';
import { MAX_UPLOAD_BYTES } from '../../domain/portfolio/entities/media-asset.js';
import { registerErrorHandler } from './middlewares/error-handler.js';
import { adminRoutes } from './routes/admin.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { publicRoutes } from './routes/public.routes.js';

export async function buildServer(container: Container): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: isProd ? 'info' : 'debug',

      redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'],
      ...(isProd ? {} : { transport: { target: 'pino-pretty' } }),
    },

    trustProxy: env.TRUST_PROXY,
    bodyLimit: 1_048_576, // 1 MB para JSON; upload tem limite proprio
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
    hsts: isProd ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });

  await app.register(cookie, {
    secret: env.SESSION_SECRET,
    parseOptions: { path: '/' },
  });

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',

    cache: 10_000,
    keyGenerator: (request) => request.ip,

    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      error: 'muitas_requisicoes',
      message: `Limite atingido. Tente novamente em ${context.after}.`,
    }),
  });

  await app.register(multipart, {
    limits: {
      fileSize: MAX_UPLOAD_BYTES,
      files: 1,
      fields: 5,
    },
  });

  registerErrorHandler(app);

  await app.register(async (instance) => healthRoutes(instance), { prefix: '/api' });
  await app.register(async (instance) => publicRoutes(instance, container), { prefix: '/api/public' });
  await app.register(async (instance) => authRoutes(instance, container), { prefix: '/api/auth' });
  await app.register(async (instance) => adminRoutes(instance, container), { prefix: '/api/admin' });

  return app;
}
