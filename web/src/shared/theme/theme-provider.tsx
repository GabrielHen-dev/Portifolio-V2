// Contexto de tema: claro/escuro, paleta, favicon dinâmico e caches.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_THEME,
  isPaletteId,
  readableInkFor,
  type PaletteId,
  type ThemeSettings,
} from './palettes';

export type Theme = 'light' | 'dark';

const MODE_KEY = 'portfolio-theme';
const PALETTE_KEY = 'portfolio-palette';
const ACCENT_KEY = 'portfolio-accent';

const DEFAULT_MODE_KEY = 'portfolio-default-mode';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  set: (theme: Theme) => void;

  palette: PaletteId;
  customAccent: string | null;

  applySettings: (settings: Partial<ThemeSettings>) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';

  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

function readInitialPalette(): PaletteId {
  if (typeof document === 'undefined') return DEFAULT_THEME.palette;
  const applied = document.documentElement.dataset.palette;
  return isPaletteId(applied) ? applied : DEFAULT_THEME.palette;
}

function readInitialAccent(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACCENT_KEY);
  } catch {
    return null;
  }
}

function applyPaletteToDocument(palette: PaletteId, customAccent: string | null): void {
  const root = document.documentElement;

  if (customAccent) {
    root.dataset.palette = 'custom';
    root.style.setProperty('--color-accent', customAccent);
    root.style.setProperty('--color-accent-ink', readableInkFor(customAccent));
  } else {
    root.dataset.palette = palette;
    root.style.removeProperty('--color-accent');
    root.style.removeProperty('--color-accent-ink');
  }
}

function updateFavicon(): void {
  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue('--color-accent').trim() || '#ff3b30';
  const ink = styles.getPropertyValue('--color-accent-ink').trim() || '#ffffff';

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="12" fill="${accent}"/>` +
    `<text x="32" y="35" dominant-baseline="central" text-anchor="middle" ` +
    `font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="700" fill="${ink}">G</text>` +
    `</svg>`;

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [palette, setPalette] = useState<PaletteId>(readInitialPalette);
  const [customAccent, setCustomAccent] = useState<string | null>(readInitialAccent);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', theme === 'light');

    root.style.colorScheme = theme;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0c0d0e' : '#fafafa');

    try {
      localStorage.setItem(MODE_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const onChange = (event: MediaQueryListEvent): void => {
      try {
        if (localStorage.getItem(MODE_KEY)) return;
        if (localStorage.getItem(DEFAULT_MODE_KEY) !== 'system') return;
      } catch {}
      setTheme(event.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    applyPaletteToDocument(palette, customAccent);

    try {
      localStorage.setItem(PALETTE_KEY, palette);
      if (customAccent) localStorage.setItem(ACCENT_KEY, customAccent);
      else localStorage.removeItem(ACCENT_KEY);
    } catch {}
  }, [palette, customAccent]);

  const applySettings = useCallback((settings: Partial<ThemeSettings>) => {
    if (settings.palette !== undefined && isPaletteId(settings.palette)) {
      setPalette(settings.palette);
    }
    if (settings.customAccent !== undefined) {
      setCustomAccent(settings.customAccent || null);
    }

    if (settings.defaultMode !== undefined) {
      try {
        localStorage.setItem(DEFAULT_MODE_KEY, settings.defaultMode);

        if (!localStorage.getItem(MODE_KEY) && settings.defaultMode !== 'system') {
          setTheme(settings.defaultMode);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    updateFavicon();
  }, [theme, palette, customAccent]);

  const toggle = useCallback(() => setTheme((current) => (current === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggle, set: setTheme, palette, customAccent, applySettings }),
    [theme, toggle, palette, customAccent, applySettings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme precisa estar dentro de <ThemeProvider>.');
  return context;
}
