// Contexto de idioma: URL, localStorage e helper pick().

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dictionary, type Dictionary, type Locale } from './dictionary';

const STORAGE_KEY = 'portfolio-lang';

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  toggle: () => void;
  set: (locale: Locale) => void;

  pick: (value: { pt: string; en: string } | undefined | null) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'pt';

  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl === 'en' || fromUrl === 'pt') return fromUrl;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'pt') return stored;
  } catch {}

  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'pt-BR';

    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {}

    const url = new URL(window.location.href);
    if (url.searchParams.get('lang') !== locale) {
      url.searchParams.set('lang', locale);
      window.history.replaceState({}, '', url);
    }
  }, [locale]);

  const toggle = useCallback(() => setLocale((current) => (current === 'pt' ? 'en' : 'pt')), []);

  const pick = useCallback(
    (value: { pt: string; en: string } | undefined | null): string => {
      if (!value) return '';

      return locale === 'en' ? value.en || value.pt : value.pt || value.en;
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, t: dictionary[locale], toggle, set: setLocale, pick }),
    [locale, toggle, pick],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n precisa estar dentro de <I18nProvider>.');
  return context;
}
