// Repositório Drizzle da aparência (linha única, upsert).

import { eq } from 'drizzle-orm';
import { ThemeSettings } from '../../../domain/portfolio/entities/theme-settings.js';
import type { ThemeSettingsRepository } from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { db } from '../connection.js';
import { PortfolioMapper } from '../mappers/portfolio.mapper.js';
import { siteTheme } from '../schema.js';

const SINGLETON_ID = 'default';

export class DrizzleThemeSettingsRepository implements ThemeSettingsRepository {
  async get(): Promise<ThemeSettings> {
    const [row] = await db.select().from(siteTheme).where(eq(siteTheme.id, SINGLETON_ID)).limit(1);
    return row ? PortfolioMapper.toThemeSettings(row) : ThemeSettings.createDefault();
  }

  async save(settings: ThemeSettings): Promise<void> {
    const values = PortfolioMapper.toThemeRow(settings);

    await db
      .insert(siteTheme)
      .values({ id: SINGLETON_ID, ...values })
      .onConflictDoUpdate({
        target: siteTheme.id,
        set: { ...values, updatedAt: new Date() },
      });
  }
}
