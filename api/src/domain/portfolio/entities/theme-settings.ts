// Entidade ThemeSettings: paleta, cor personalizada e tema inicial do site.

import { ValidationError } from '../../../shared/errors/index.js';

export const PALETTE_IDS = ['redline', 'acid', 'amber', 'hud', 'mono'] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];

export const DEFAULT_MODES = ['light', 'dark', 'system'] as const;
export type DefaultMode = (typeof DEFAULT_MODES)[number];

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export interface ThemeSettingsProps {
  palette: PaletteId;

  customAccent: string | null;
  defaultMode: DefaultMode;
}

export class ThemeSettings {
  private constructor(private props: ThemeSettingsProps) {}

  static readonly DEFAULTS: ThemeSettingsProps = {
    palette: 'redline',
    customAccent: null,
    defaultMode: 'dark',
  };

  static restore(props: ThemeSettingsProps): ThemeSettings {
    const palette = (PALETTE_IDS as readonly string[]).includes(props.palette)
      ? props.palette
      : ThemeSettings.DEFAULTS.palette;

    const defaultMode = (DEFAULT_MODES as readonly string[]).includes(props.defaultMode)
      ? props.defaultMode
      : ThemeSettings.DEFAULTS.defaultMode;

    return new ThemeSettings({ ...props, palette, defaultMode });
  }

  static createDefault(): ThemeSettings {
    return new ThemeSettings({ ...ThemeSettings.DEFAULTS });
  }

  get palette(): PaletteId {
    return this.props.palette;
  }
  get customAccent(): string | null {
    return this.props.customAccent;
  }
  get defaultMode(): DefaultMode {
    return this.props.defaultMode;
  }

  update(changes: { palette?: string; customAccent?: string | null; defaultMode?: string }): void {
    if (changes.palette !== undefined) {
      ThemeSettings.assertPalette(changes.palette);
      this.props.palette = changes.palette;
    }

    if (changes.customAccent !== undefined) {
      this.props.customAccent = ThemeSettings.normalizeAccent(changes.customAccent);
    }

    if (changes.defaultMode !== undefined) {
      ThemeSettings.assertMode(changes.defaultMode);
      this.props.defaultMode = changes.defaultMode;
    }
  }

  private static assertPalette(palette: string): asserts palette is PaletteId {
    if (!(PALETTE_IDS as readonly string[]).includes(palette)) {
      throw new ValidationError(`Paleta invalida. Use uma de: ${PALETTE_IDS.join(', ')}.`, 'palette');
    }
  }

  private static assertMode(mode: string): asserts mode is DefaultMode {
    if (!(DEFAULT_MODES as readonly string[]).includes(mode)) {
      throw new ValidationError(`Modo invalido. Use: ${DEFAULT_MODES.join(', ')}.`, 'defaultMode');
    }
  }

  private static normalizeAccent(raw: string | null): string | null {
    if (raw === null) return null;

    const clean = raw.trim().toLowerCase();
    if (clean === '') return null;

    if (!HEX_COLOR.test(clean)) {
      throw new ValidationError('Use uma cor no formato #RRGGBB (ex.: #4f46e5).', 'customAccent');
    }
    return clean;
  }

  toSnapshot(): ThemeSettingsProps {
    return { ...this.props };
  }
}
