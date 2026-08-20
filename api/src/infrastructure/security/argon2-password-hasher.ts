// Hash de senha com Argon2id (parâmetros OWASP).

import { Algorithm, hash, verify } from '@node-rs/argon2';
import type { PasswordHasher } from '../../domain/identity/services/security-ports.js';

const OPTIONS = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456, // KiB
  timeCost: 2,
  parallelism: 1,
} as const;

export class Argon2PasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return hash(plain, OPTIONS);
  }

  async verify(storedHash: string, plain: string): Promise<boolean> {
    try {
      return await verify(storedHash, plain, OPTIONS);
    } catch {
      return false;
    }
  }
}
