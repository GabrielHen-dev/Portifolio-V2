// Login passo 1: confere a senha e abre sessão pendente de 2FA, com tempo constante.

import { Session } from '../../../domain/identity/entities/session.js';
import type { AdminUserRepository } from '../../../domain/identity/repositories/admin-user.repository.js';
import type { SessionRepository } from '../../../domain/identity/repositories/session.repository.js';
import type { PasswordHasher, TokenGenerator } from '../../../domain/identity/services/security-ports.js';
import { Email } from '../../../domain/identity/value-objects/email.js';
import { UnauthorizedError, ValidationError } from '../../../shared/errors/index.js';

export interface AuthenticateInput {
  email: string;
  password: string;
  ip: string | null;
  userAgent: string | null;
}

export interface AuthenticateOutput {
  sessionToken: string;
  expiresInMs: number;
}

export class AuthenticateWithPasswordUseCase {
  private dummyHash: Promise<string> | null = null;

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.hasher.hash('senha-inexistente-para-igualar-o-tempo');
    return this.dummyHash;
  }

  constructor(
    private readonly users: AdminUserRepository,
    private readonly sessions: SessionRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenGenerator,
  ) {}

  async execute(input: AuthenticateInput): Promise<AuthenticateOutput> {
    let email: Email;
    try {
      email = Email.create(input.email);
    } catch (err) {
      if (err instanceof ValidationError) throw new UnauthorizedError();
      throw err;
    }

    const user = await this.users.findByEmail(email);

    if (!user) {
      await this.hasher.verify(await this.getDummyHash(), input.password);
      throw new UnauthorizedError();
    }

    user.assertNotLocked();

    const passwordOk = await this.hasher.verify(user.passwordHash, input.password);
    if (!passwordOk) {
      user.registerFailedAttempt();
      await this.users.save(user);
      throw new UnauthorizedError();
    }

    if (!user.totpEnabled || !user.encryptedTotpSecret) {
      throw new UnauthorizedError('Segundo fator nao configurado. Recrie o administrador pelo CLI.');
    }

    const token = this.tokens.generate();
    await this.sessions.create({
      userId: user.id,
      tokenHash: this.tokens.hash(token),
      mfaPending: true,
      expiresAt: new Date(Date.now() + Session.MFA_PENDING_TTL_MS),
      ip: input.ip,
      userAgent: input.userAgent?.slice(0, 500) ?? null,
    });

    return { sessionToken: token, expiresInMs: Session.MFA_PENDING_TTL_MS };
  }
}
