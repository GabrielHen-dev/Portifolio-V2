// Tokens opacos, hash SHA-256 e códigos de recuperação.

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { TokenGenerator } from '../../domain/identity/services/security-ports.js';

export class CryptoTokenGenerator implements TokenGenerator {
  generate(): string {
    return randomBytes(32).toString('base64url');
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  generateRecoveryCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(10);
    const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]!);
    return `${chars.slice(0, 5).join('')}-${chars.slice(5).join('')}`;
  }

  safeEquals(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }
}
