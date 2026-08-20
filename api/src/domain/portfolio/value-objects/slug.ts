// VO Slug: identificador de URL normalizado.

import { ValidationError } from '../../../shared/errors/index.js';

const COMBINING_MARKS = /[̀-ͯ]/g;

export class Slug {
  private constructor(readonly value: string) {}

  static create(raw: string): Slug {
    const normalized = raw
      .normalize('NFD')
      .replace(COMBINING_MARKS, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (normalized.length < 2) {
      throw new ValidationError('O identificador precisa ter ao menos 2 caracteres.', 'slug');
    }
    if (normalized.length > 80) {
      throw new ValidationError('O identificador e longo demais.', 'slug');
    }

    return new Slug(normalized);
  }

  toString(): string {
    return this.value;
  }
}
