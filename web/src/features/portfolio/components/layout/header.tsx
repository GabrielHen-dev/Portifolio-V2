// Cabeçalho fixo: navegação numerada, progresso de leitura, tema e idioma.

import { motion, useScroll, useTransform } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { useTheme } from '@/shared/theme/theme-provider';
import { ReadingProgress } from '@/shared/ui/telemetry';
import { cn } from '@/shared/lib/cn';

const SECTIONS = ['home', 'about', 'skills', 'experience', 'projects', 'contact'] as const;

export function Header() {
  const { t, locale, toggle: toggleLocale } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();

  const { scrollY } = useScroll();

  const chromeOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  const [active, setActive] = useState<string>('home');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );

    for (const id of SECTIONS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">

      <motion.div
        aria-hidden="true"
        className="absolute inset-0 border-b border-rule bg-canvas/85 backdrop-blur-sm"
        style={{ opacity: chromeOpacity }}
      />

      <ReadingProgress />

      <nav
        className="relative mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 md:px-8"
        aria-label="Principal"
      >

        <a href="#home" className="font-mono text-sm font-semibold tracking-tight">
          GabrielHen<span className="text-accent">_dev</span>
        </a>

        <ul className="ml-auto hidden items-center gap-6 md:flex">
          {SECTIONS.slice(1).map((id, index) => {
            const isActive = active === id;

            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'group relative flex items-baseline gap-1.5 py-1 text-sm transition-colors',
                    isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                  )}
                >
                  <span className="font-mono text-[0.6875rem] tabular text-ink-muted/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {t.nav[id as keyof typeof t.nav]}

                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-accent"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-4 md:ml-8">
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={t.lang.switchTo}
            title={t.lang.switchTo}
            className="font-mono text-xs uppercase tracking-widest text-ink-muted transition-colors hover:text-ink"
          >
            {locale === 'pt' ? 'PT' : 'EN'}
          </button>

          <span aria-hidden="true" className="h-4 w-px bg-rule" />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.theme.toLight : t.theme.toDark}
            title={theme === 'dark' ? t.theme.toLight : t.theme.toDark}
            className="text-ink-muted transition-colors hover:text-ink"
          >
            {theme === 'dark' ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
