// VO LocalizedText: texto bilíngue PT/EN validado.

import { ValidationError } from '../../../shared/errors/index.js';

export type Locale = 'pt' | 'en';

export class LocalizedText {
  private constructor(
    readonly pt: string,
    readonly en: string,
  ) {}

  static create(pt: string, en: string, field: string, options: { required?: boolean; max?: number } = {}) {
    const { required = true, max = 5000 } = options;
    const cleanPt = pt.trim();
    const cleanEn = en.trim();

    if (required && (cleanPt.length === 0 || cleanEn.length === 0)) {
      throw new ValidationError(`Preencha "${field}" em portugues e em ingles.`, field);
    }
    if (cleanPt.length > max || cleanEn.length > max) {
      throw new ValidationError(`"${field}" excede ${max} caracteres.`, field);
    }

    return new LocalizedText(cleanPt, cleanEn);
  }

  get(locale: Locale): string {
    return locale === 'en' ? this.en : this.pt;
  }

  toJSON() {
    return { pt: this.pt, en: this.en };
  }
}
