// Traduz erros de domínio e Zod em respostas HTTP.

import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { isProd } from '../../../config/env.js';
import {
  AccountLockedError,
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../../shared/errors/index.js';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof ZodError) {
      const issues = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return reply.code(422).send({ error: 'validacao_invalida', issues });
    }

    if (error instanceof AccountLockedError) {
      reply.header('Retry-After', String(error.retryAfterSeconds));
      return reply.code(423).send({ error: error.code, retryAfter: error.retryAfterSeconds });
    }

    if (error instanceof DomainError) {
      const status = statusFor(error);

      if (status === 401 || status === 403) {
        request.log.warn({ code: error.code, url: request.url, ip: request.ip }, error.message);
      }
      return reply.code(status).send({
        error: error.code,
        message: error.message,
        ...(error instanceof ValidationError && error.field ? { field: error.field } : {}),
      });
    }

    const statusCode = (error as FastifyError).statusCode ?? 500;

    if (statusCode >= 500) {
      request.log.error({ err: error, url: request.url }, 'erro nao tratado');
      return reply.code(500).send({
        error: 'erro_interno',
        message: isProd ? 'Erro interno. Tente novamente.' : error.message,
      });
    }

    return reply.code(statusCode).send({
      error: (error as FastifyError).code ?? 'erro',
      message: error.message,
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ error: 'rota_nao_encontrada', message: `${request.method} ${request.url}` });
  });
}

function statusFor(error: DomainError): number {
  if (error instanceof ValidationError) return 422;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ConflictError) return 409;
  if (error instanceof UnauthorizedError) return 401;
  if (error instanceof ForbiddenError) return 403;
  return 400;
}
