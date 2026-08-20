// Cria o administrador via CLI: senha, segredo TOTP e códigos de recuperação.

import type { AdminUserRepository } from '../../../domain/identity/repositories/admin-user.repository.js';
import type { RecoveryCodeRepository } from '../../../domain/identity/repositories/recovery-code.repository.js';
import type { PasswordHasher, TotpService } from '../../../domain/identity/services/security-ports.js';
import { Email } from '../../../domain/identity/value-objects/email.js';
import { PlainPassword } from '../../../domain/identity/value-objects/plain-password.js';
import { ConflictError } from '../../../shared/errors/index.js';
import type { CryptoTokenGenerator } from '../../../infrastructure/security/crypto-token-generator.js';

export interface ProvisionAdminInput {
  email: string;
  name: string;
  password: string;
}

export interface ProvisionAdminOutput {
  userId: string;

  enrollmentUrl: string;

  recoveryCodes: string[];
}

const RECOVERY_CODE_COUNT = 8;

export class ProvisionAdminUseCase {
  constructor(
    private readonly users: AdminUserRepository,
    private readonly recoveryCodes: RecoveryCodeRepository,
    private readonly hasher: PasswordHasher,
    private readonly totp: TotpService,
    private readonly tokens: CryptoTokenGenerator,
  ) {}

  async execute(input: ProvisionAdminInput): Promise<ProvisionAdminOutput> {
    const email = Email.create(input.email);
    const password = PlainPassword.create(input.password);

    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError(`Ja existe um administrador com o e-mail ${email.value}.`);
    }

    const secret = this.totp.generateSecret();
    const user = await this.users.create({
      email,
      name: input.name.trim() || 'Admin',
      passwordHash: await this.hasher.hash(password.value),
      encryptedTotpSecret: this.totp.encryptSecret(secret),
    });

    const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () => this.tokens.generateRecoveryCode());
    await this.recoveryCodes.replaceAll(
      user.id,
      codes.map((code) => this.tokens.hash(code)),
    );

    return {
      userId: user.id,
      enrollmentUrl: this.totp.buildEnrollmentUrl(email.value, secret),
      recoveryCodes: codes,
    };
  }
}
