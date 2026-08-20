// Leitura e gravação dos textos do site (lista fechada de chaves).

import type {
  SiteContentEntry,
  SiteContentRepository,
} from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { LocalizedText } from '../../../domain/portfolio/value-objects/localized-text.js';
import { ValidationError } from '../../../shared/errors/index.js';

export const CONTENT_KEYS = [
  'hero.headline',
  'hero.subheadline',
  'hero.cta',
  'about.title',
  'about.body',
  'about.profile',

  'about.photo',
  'contact.title',
  'contact.body',
  'contact.email',
  'contact.phone',
  'contact.github',
  'contact.linkedin',
  'contact.location',
  'footer.note',
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

export class SiteContentService {
  constructor(private readonly repository: SiteContentRepository) {}

  all(): Promise<SiteContentEntry[]> {
    return this.repository.all();
  }

  async saveMany(payload: Record<string, { pt: string; en: string }>): Promise<void> {
    const entries: SiteContentEntry[] = [];

    for (const [key, value] of Object.entries(payload)) {
      if (!CONTENT_KEYS.includes(key as ContentKey)) {
        throw new ValidationError(`Chave de conteudo desconhecida: "${key}".`, 'key');
      }
      entries.push({
        key,
        text: LocalizedText.create(value.pt, value.en, key, { required: false }),
      });
    }

    await this.repository.upsertMany(entries);
  }
}
