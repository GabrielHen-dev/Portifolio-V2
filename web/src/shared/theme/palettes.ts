// Paletas disponíveis, tipos do tema e cálculo de contraste do texto.

export const PALETTE_IDS = ['redline', 'acid', 'amber', 'hud', 'mono'] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];

export type DefaultMode = 'light' | 'dark' | 'system';

export interface ThemeSettings {
  palette: PaletteId;
  customAccent: string | null;
  defaultMode: DefaultMode;
}

export const DEFAULT_THEME: ThemeSettings = {
  palette: 'redline',
  customAccent: null,
  defaultMode: 'dark',
};

export interface PaletteMeta {
  id: PaletteId;
  label: { pt: string; en: string };

  swatch: { light: string; dark: string };
}

export const PALETTES: PaletteMeta[] = [
  {
    id: 'redline',
    label: { pt: 'Linha de corte', en: 'Redline' },
    swatch: { light: '#d6231a', dark: '#ff3b30' },
  },
  {
    id: 'acid',
    label: { pt: 'Verde de painel', en: 'Dash green' },
    swatch: { light: '#3d7a0f', dark: '#a3f542' },
  },
  {
    id: 'amber',
    label: { pt: 'Ambar de alerta', en: 'Warning amber' },
    swatch: { light: '#a66408', dark: '#ffb020' },
  },
  {
    id: 'hud',
    label: { pt: 'Ciano de HUD', en: 'HUD cyan' },
    swatch: { light: '#0e7490', dark: '#3dd9e8' },
  },
  {
    id: 'mono',
    label: { pt: 'Monocromatico', en: 'Monochrome' },
    swatch: { light: '#1a1a1a', dark: '#f5f5f5' },
  },
];

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === 'string' && (PALETTE_IDS as readonly string[]).includes(value);
}

export function readableInkFor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#ffffff';

  const toLinear = (channel: number): number => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };

  const r = toLinear(parseInt(hex.slice(0, 2), 16));
  const g = toLinear(parseInt(hex.slice(2, 4), 16));
  const b = toLinear(parseInt(hex.slice(4, 6), 16));

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.45 ? '#0a0a0a' : '#ffffff';
}
