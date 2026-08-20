// Casca do painel: cabeçalho, navegação numerada e logout.

import { ExternalLink, LogOut, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLogout, type AdminUser } from '../api/admin.api';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { useTheme } from '@/shared/theme/theme-provider';
import { cn } from '@/shared/lib/cn';

export type AdminTab = 'skills' | 'projects' | 'timeline' | 'content' | 'media' | 'appearance';

interface AdminLayoutProps {
  user: AdminUser;
  active: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  children: ReactNode;
}

const TABS: AdminTab[] = ['skills', 'projects', 'timeline', 'content', 'media', 'appearance'];

export function AdminLayout({ user, active, onNavigate, children }: AdminLayoutProps) {
  const { t } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-rule bg-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <span className="font-mono text-sm font-semibold">
            GabrielHen<span className="text-accent">_dev</span>
          </span>
          <span className="eyebrow">{t.admin.title}</span>

          <span aria-hidden="true" className="ml-auto h-4 w-px bg-rule" />

          <span className="hidden text-sm text-ink-muted sm:inline">{user.name}</span>

          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-ink-muted transition-colors hover:text-ink"
              title={t.admin.nav.viewSite}
              aria-label={t.admin.nav.viewSite}
            >
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t.theme.toLight : t.theme.toDark}
              className="text-ink-muted transition-colors hover:text-ink"
            >
              {theme === 'dark' ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => logout.mutate()}
              className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t.admin.nav.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row">

        <nav
          className="flex shrink-0 gap-5 overflow-x-auto border-b border-rule pb-3 md:w-44 md:flex-col md:gap-1 md:overflow-visible md:border-b-0 md:border-r md:pb-0 md:pr-5"
          aria-label={t.admin.title}
        >
          {TABS.map((id, index) => {
            const isActive = active === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex items-baseline gap-2 whitespace-nowrap py-1.5 text-left text-sm transition-colors md:py-2',
                  isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[0.6875rem] tabular',
                    isActive ? 'text-accent' : 'text-ink-muted/60',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                {t.admin.nav[id]}
              </button>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
