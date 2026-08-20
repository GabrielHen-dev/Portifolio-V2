// TOTP (RFC 6238) com segredo cifrado e contador anti-replay.

import { authenticator } from 'otplib';
import type { TotpService, TotpVerificationResult } from '../../domain/identity/services/security-ports.js';
import type { AesEncryptor } from './aes-encryptor.js';

const STEP_SECONDS = 30;
const ISSUER = 'Portfolio Gabriel';

authenticator.options = {
  digits: 6,
  step: STEP_SECONDS,

  window: 1,
};

export class OtplibTotpService implements TotpService {
  constructor(private readonly encryptor: AesEncryptor) {}

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  encryptSecret(secret: string): string {
    return this.encryptor.encrypt(secret);
  }

  buildEnrollmentUrl(accountLabel: string, secret: string): string {
    return authenticator.keyuri(accountLabel, ISSUER, secret);
  }

  verify(code: string, encryptedSecret: string): TotpVerificationResult {
    const digits = code.replace(/\D/g, '');
    if (digits.length !== 6) return { valid: false, counter: -1 };

    let secret: string;
    try {
      secret = this.encryptor.decrypt(encryptedSecret);
    } catch {
      return { valid: false, counter: -1 };
    }

    let delta: number | null;
    try {
      delta = authenticator.checkDelta(digits, secret);
    } catch {
      return { valid: false, counter: -1 };
    }

    if (delta === null || delta === undefined) return { valid: false, counter: -1 };

    const currentWindow = Math.floor(Date.now() / 1000 / STEP_SECONDS);
    return { valid: true, counter: currentWindow + delta };
  }
}
