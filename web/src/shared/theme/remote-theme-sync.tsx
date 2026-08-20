// Aplica a aparência salva no painel assim que a API responde.

import { useEffect } from 'react';
import { usePortfolio } from '@/features/portfolio/api/portfolio.queries';
import { useTheme } from './theme-provider';

export function RemoteThemeSync() {
  const { data } = usePortfolio();
  const { applySettings } = useTheme();

  const palette = data?.theme?.palette;
  const customAccent = data?.theme?.customAccent;
  const defaultMode = data?.theme?.defaultMode;

  useEffect(() => {
    if (!palette) return;
    applySettings({ palette, customAccent: customAccent ?? null, ...(defaultMode && { defaultMode }) });
  }, [palette, customAccent, defaultMode, applySettings]);

  return null;
}
