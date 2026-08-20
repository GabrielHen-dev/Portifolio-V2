// Leitura e atualização da aparência do site.

import type { ThemeSettings } from '../../../domain/portfolio/entities/theme-settings.js';
import type { ThemeSettingsRepository } from '../../../domain/portfolio/repositories/portfolio.repositories.js';

export interface UpdateThemeInput {
  palette?: string;
  customAccent?: string | null;
  defaultMode?: string;
}

export class ThemeService {
  constructor(private readonly repository: ThemeSettingsRepository) {}

  get(): Promise<ThemeSettings> {
    return this.repository.get();
  }

  async update(input: UpdateThemeInput): Promise<ThemeSettings> {
    const settings = await this.repository.get();

    settings.update({
      ...(input.palette !== undefined && { palette: input.palette }),
      ...(input.customAccent !== undefined && { customAccent: input.customAccent }),
      ...(input.defaultMode !== undefined && { defaultMode: input.defaultMode }),
    });

    await this.repository.save(settings);
    return settings;
  }
}
