// Login em dois passos, sessão, logout; rate limit agressivo.

import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../container.js';
import { Session } from '../../../domain/identity/entities/session.js';
import { loginSchema, verifyTwoFactorSchema } from '../schemas/auth.schemas.js';
import {
  SESSION_COOKIE,
  createRequireAdmin,
  enforceOrigin,
  readSessionToken,
  sessionCookieOptions,
} from '../middlewares/session.middleware.js';

export async function authRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const requireAdmin = createRequireAdmin(container);

  app.addHook('preHandler', enforceOrigin);

  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    async (request, reply) => {
      const body = loginSchema.parse(request.body);

      const result = await container.identity.authenticateWithPassword.execute({
        email: body.email,
        password: body.password,
        ip: request.ip,
        userAgent: request.headers['user-agent'] ?? null,
      });

      reply.setCookie(SESSION_COOKIE, result.sessionToken, sessionCookieOptions(result.expiresInMs));

      await container.auditLogger.record({
        action: 'auth.password_ok',
        ip: request.ip,
        detail: body.email,
      });

      return reply.send({
        status: 'segundo_fator_necessario',
        expiresInSeconds: Math.floor(result.expiresInMs / 1000),
      });
    },
  );

  app.post(
    '/verify-2fa',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '15 minutes',
        },
      },
    },
    async (request, reply) => {
      const body = verifyTwoFactorSchema.parse(request.body);
      const token = readSessionToken(request);

      if (!token) {
        return reply.code(401).send({ error: 'desafio_invalido' });
      }

      const result = await container.identity.verifySecondFactor.execute({
        sessionToken: token,
        code: body.code,
      });

      reply.setCookie(SESSION_COOKIE, token, sessionCookieOptions(Session.FULL_TTL_MS));

      await container.auditLogger.record({
        userId: result.userId,
        action: result.usedRecoveryCode ? 'auth.login_recovery_code' : 'auth.login_totp',
        ip: request.ip,
      });

      return reply.send({
        status: 'autenticado',
        user: { id: result.userId, name: result.userName, email: result.userEmail },
        usedRecoveryCode: result.usedRecoveryCode,
        remainingRecoveryCodes: result.remainingRecoveryCodes,
      });
    },
  );

  app.get('/me', { preHandler: requireAdmin }, async (request, reply) => {
    return reply.send({ user: request.admin });
  });

  app.post('/logout', async (request, reply) => {
    const token = readSessionToken(request);

    if (token) {
      await container.identity.logout.execute(token);
      await container.auditLogger.record({ action: 'auth.logout', ip: request.ip });
    }

    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return reply.send({ status: 'desconectado' });
  });

  app.post('/logout-all', { preHandler: requireAdmin }, async (request, reply) => {
    await container.identity.logout.executeForAllDevices(request.admin!.id);
    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'auth.logout_all',
      ip: request.ip,
    });

    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return reply.send({ status: 'todas_sessoes_encerradas' });
  });
}
