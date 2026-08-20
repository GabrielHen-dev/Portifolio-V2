// Cookie de sessão, defesa CSRF por Origin e guard das rotas admin.

import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Container } from '../../../container.js';
import { Session } from '../../../domain/identity/entities/session.js';
import { allowedOrigins, env } from '../../../config/env.js';

export const SESSION_COOKIE = env.COOKIE_SECURE ? '__Host-portfolio_session' : 'portfolio_session';

export function sessionCookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true, // fora do alcance de qualquer JavaScript da pagina
    secure: env.COOKIE_SECURE,
    sameSite: 'strict' as const, // primeira barreira contra CSRF
    path: '/',
    signed: true,
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export async function enforceOrigin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!MUTATING_METHODS.has(request.method)) return;

  const origin = request.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) {
    request.log.warn({ origin, url: request.url, ip: request.ip }, 'origem rejeitada em requisicao de escrita');
    return reply.code(403).send({ error: 'origem_nao_permitida' });
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    admin?: { id: string; name: string; email: string };
  }
}

export function readSessionToken(request: FastifyRequest): string | null {
  const raw = request.cookies[SESSION_COOKIE];
  if (!raw) return null;

  const unsigned = request.unsignCookie(raw);
  if (!unsigned.valid || !unsigned.value) return null;

  return unsigned.value;
}

export function createRequireAdmin(container: Container) {
  return async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const token = readSessionToken(request);
    if (!token) {
      return reply.code(401).send({ error: 'nao_autenticado' });
    }

    const context = await container.identity.authenticateSession.execute(token);
    if (!context) {
      reply.clearCookie(SESSION_COOKIE, { path: '/' });
      return reply.code(401).send({ error: 'nao_autenticado' });
    }

    if (context.renewed) {
      reply.setCookie(SESSION_COOKIE, token, sessionCookieOptions(Session.FULL_TTL_MS));
    }

    request.admin = {
      id: context.user.id,
      name: context.user.name,
      email: context.user.email.value,
    };
  };
}
