// VO Email: normaliza e valida formato.

import { ValidationError } from '../../../shared/errors/index.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();

    if (normalized.length === 0) {
      throw new ValidationError('Informe o e-mail.', 'email');
    }
    if (normalized.length > 254) {
      throw new ValidationError('E-mail longo demais.', 'email');
    }
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new ValidationError('E-mail em formato invalido.', 'email');
    }

    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
