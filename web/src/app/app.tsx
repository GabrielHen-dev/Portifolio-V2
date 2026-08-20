// Providers, rotas e chunk separado do painel admin.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { PortfolioPage } from '@/features/portfolio/portfolio-page';
import { I18nProvider } from '@/shared/i18n/i18n-provider';
import { RemoteThemeSync } from '@/shared/theme/remote-theme-sync';
import { ThemeProvider } from '@/shared/theme/theme-provider';

const AdminApp = lazy(() => import('@/features/admin/admin-app'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000,
    },
  },
});

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-border-subtle border-t-accent" />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>

          <RemoteThemeSync />

          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PortfolioPage />} />
              <Route
                path="/admin/*"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <AdminApp />
                  </Suspense>
                }
              />

              <Route path="*" element={<PortfolioPage />} />
            </Routes>
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
