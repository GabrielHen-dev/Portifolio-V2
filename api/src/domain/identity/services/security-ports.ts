// Portas de segurança (hash, TOTP, tokens) que a infraestrutura implementa.

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(storedHash: string, plain: string): Promise<boolean>;
}

export interface TotpVerificationResult {
  valid: boolean;

  counter: number;
}

export interface TotpService {
  generateSecret(): string;
  buildEnrollmentUrl(accountLabel: string, secret: string): string;
  verify(code: string, encryptedSecret: string): TotpVerificationResult;
  encryptSecret(secret: string): string;
}

export interface TokenGenerator {
  generate(): string;

  hash(token: string): string;
}
