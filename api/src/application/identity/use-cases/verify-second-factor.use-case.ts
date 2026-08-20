// Login passo 2: valida TOTP ou código de recuperação e promove a sessão.

import type { AdminUser } from '../../../domain/identity/entities/admin-user.js';
import { Session } from '../../../domain/identity/entities/session.js';
import type { AdminUserRepository } from '../../../domain/identity/repositories/admin-user.repository.js';
import type { RecoveryCodeRepository } from '../../../domain/identity/repositories/recovery-code.repository.js';
import type { SessionRepository } from '../../../domain/identity/repositories/session.repository.js';
import type { TokenGenerator, TotpService } from '../../../domain/identity/services/security-ports.js';
import { UnauthorizedError } from '../../../shared/errors/index.js';

export interface VerifySecondFactorInput {
  sessionToken: string;

  code: string;
}

export interface VerifySecondFactorOutput {
  userId: string;
  userName: string;
  userEmail: string;
  expiresInMs: number;

  usedRecoveryCode: boolean;
  remainingRecoveryCodes: number;
}

export class VerifySecondFactorUseCase {
  constructor(
    private readonly users: AdminUserRepository,
    private readonly sessions: SessionRepository,
    private readonly recoveryCodes: RecoveryCodeRepository,
    private readonly totp: TotpService,
    private readonly tokens: TokenGenerator,
  ) {}

  async execute(input: VerifySecondFactorInput): Promise<VerifySecondFactorOutput> {
    const session = await this.sessions.findByTokenHash(this.tokens.hash(input.sessionToken));

    if (!session || session.isExpired() || !session.mfaPending) {
      throw new UnauthorizedError('Desafio de verificacao invalido ou expirado.');
    }

    const user = await this.users.findById(session.userId);
    if (!user || !user.encryptedTotpSecret) {
      throw new UnauthorizedError();
    }

    user.assertNotLocked();

    const result = await this.tryTotp(user.encryptedTotpSecret, input.code, user);
    const usedRecovery = result === 'recovery-pending' ? await this.tryRecoveryCode(user.id, input.code) : false;

    if (result !== 'ok' && !usedRecovery) {
      user.registerFailedAttempt();
      await this.users.save(user);

      await this.sessions.delete(session.id);
      throw new UnauthorizedError('Codigo invalido.');
    }

    user.registerSuccessfulLogin();
    await this.users.save(user);

    session.completeMfa();
    await this.sessions.save(session);

    return {
      userId: user.id,
      userName: user.name,
      userEmail: user.email.value,
      expiresInMs: Session.FULL_TTL_MS,
      usedRecoveryCode: usedRecovery,
      remainingRecoveryCodes: await this.recoveryCodes.countUnused(user.id),
    };
  }

  private async tryTotp(
    encryptedSecret: string,
    code: string,
    user: AdminUser,
  ): Promise<'ok' | 'recovery-pending'> {
    const check = this.totp.verify(code, encryptedSecret);
    if (!check.valid) return 'recovery-pending';

    if (!user.acceptTotpCounter(check.counter)) return 'recovery-pending';

    return 'ok';
  }

  private async tryRecoveryCode(userId: string, rawCode: string): Promise<boolean> {
    const normalized = rawCode.trim().toUpperCase();
    if (normalized.length < 8) return false;

    const candidateHash = this.tokens.hash(normalized);
    const available = await this.recoveryCodes.listUnused(userId);
    const match = available.find((entry) => entry.codeHash === candidateHash);

    if (!match) return false;

    await this.recoveryCodes.markUsed(match.id, new Date());
    return true;
  }
}
