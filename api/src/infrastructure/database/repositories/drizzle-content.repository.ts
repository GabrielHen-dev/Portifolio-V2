// Repositórios Drizzle de textos do site e mídia.

import { asc, eq } from 'drizzle-orm';
import type { MediaAsset } from '../../../domain/portfolio/entities/media-asset.js';
import type {
  MediaRepository,
  SiteContentEntry,
  SiteContentRepository,
} from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { LocalizedText } from '../../../domain/portfolio/value-objects/localized-text.js';
import { db } from '../connection.js';
import { PortfolioMapper } from '../mappers/portfolio.mapper.js';
import { mediaAssets, siteContent } from '../schema.js';

export class DrizzleSiteContentRepository implements SiteContentRepository {
  async all(): Promise<SiteContentEntry[]> {
    const rows = await db.select().from(siteContent).orderBy(asc(siteContent.key));
    return rows.map((row) => ({
      key: row.key,
      text: LocalizedText.create(row.valuePt, row.valueEn, row.key, { required: false }),
    }));
  }

  async upsertMany(entries: SiteContentEntry[]): Promise<void> {
    if (entries.length === 0) return;

    await db.transaction(async (tx) => {
      for (const entry of entries) {
        await tx
          .insert(siteContent)
          .values({ key: entry.key, valuePt: entry.text.pt, valueEn: entry.text.en })
          .onConflictDoUpdate({
            target: siteContent.key,
            set: { valuePt: entry.text.pt, valueEn: entry.text.en, updatedAt: new Date() },
          });
      }
    });
  }
}

export class DrizzleMediaRepository implements MediaRepository {
  async list(): Promise<MediaAsset[]> {
    const rows = await db.select().from(mediaAssets).orderBy(asc(mediaAssets.createdAt));
    return rows.map(PortfolioMapper.toMediaAsset);
  }

  async findById(id: string): Promise<MediaAsset | null> {
    const [row] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
    return row ? PortfolioMapper.toMediaAsset(row) : null;
  }

  async create(asset: MediaAsset): Promise<MediaAsset> {
    const s = asset.toSnapshot();
    const [row] = await db
      .insert(mediaAssets)
      .values({
        filename: s.filename,
        originalName: s.originalName,
        mime: s.mime,
        size: s.size,
      })
      .returning();

    if (!row) throw new Error('Falha ao registrar o arquivo.');
    return PortfolioMapper.toMediaAsset(row);
  }

  async delete(id: string): Promise<void> {
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  }
}
