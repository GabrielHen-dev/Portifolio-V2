// VO TotpCode: código de 6 dígitos do autenticador.

import { ValidationError } from '../../../shared/errors/index.js';

export class TotpCode {
  private constructor(readonly value: string) {}

  static create(raw: string): TotpCode {
    const digits = raw.replace(/\D/g, '');

    if (digits.length !== 6) {
      throw new ValidationError('O codigo precisa ter 6 digitos.', 'code');
    }

    return new TotpCode(digits);
  }

  toString(): string {
    return this.value;
  }
}
