// VO PlainPassword: política de senha; nunca serializa o valor.

import { ValidationError } from '../../../shared/errors/index.js';

export class PlainPassword {
  private constructor(readonly value: string) {}

  static readonly MIN_LENGTH = 12;
  static readonly MAX_LENGTH = 200;

  static create(raw: string): PlainPassword {
    if (raw.length < PlainPassword.MIN_LENGTH) {
      throw new ValidationError(
        `A senha precisa ter pelo menos ${PlainPassword.MIN_LENGTH} caracteres.`,
        'password',
      );
    }
    if (raw.length > PlainPassword.MAX_LENGTH) {
      throw new ValidationError(
        `A senha e longa demais (maximo ${PlainPassword.MAX_LENGTH} caracteres).`,
        'password',
      );
    }
    if (!/[a-z]/.test(raw)) {
      throw new ValidationError('Inclua ao menos uma letra minuscula.', 'password');
    }
    if (!/[A-Z]/.test(raw)) {
      throw new ValidationError('Inclua ao menos uma letra maiuscula.', 'password');
    }
    if (!/[0-9]/.test(raw)) {
      throw new ValidationError('Inclua ao menos um numero.', 'password');
    }

    return new PlainPassword(raw);
  }

  static forVerification(raw: string): PlainPassword {
    return new PlainPassword(raw);
  }

  toJSON(): string {
    return '[senha omitida]';
  }

  toString(): string {
    return '[senha omitida]';
  }
}
