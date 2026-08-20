// Erros de domínio com código estável; a camada HTTP traduz em status.

export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  readonly code = 'validacao_invalida';

  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'nao_encontrado';

  constructor(entity: string, identifier?: string) {
    super(identifier ? `${entity} nao encontrado: ${identifier}` : `${entity} nao encontrado`);
  }
}

export class ConflictError extends DomainError {
  readonly code = 'conflito';
}

export class UnauthorizedError extends DomainError {
  readonly code = 'nao_autenticado';

  constructor(message = 'Credenciais invalidas.') {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  readonly code = 'proibido';
}

export class AccountLockedError extends DomainError {
  readonly code = 'conta_bloqueada';

  constructor(readonly retryAfterSeconds: number) {
    super(`Conta bloqueada. Tente novamente em ${retryAfterSeconds}s.`);
  }
}
