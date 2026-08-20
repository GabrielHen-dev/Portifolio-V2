// Cabeçalho de aba, gaveta lateral e estado vazio.

import { AnimatePresence, motion } from 'motion/react';
import { Plus, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { Button } from '@/shared/ui/button';

interface PanelShellProps {
  index?: number;
  title: string;
  description?: string;
  onCreate?: () => void;
  children: ReactNode;
}

export function PanelShell({ index, title, description, onCreate, children }: PanelShellProps) {
  const { t } = useI18n();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-4">
          {index !== undefined && (
            <span className="eyebrow tabular shrink-0">{String(index).padStart(2, '0')}</span>
          )}

          <h1 className="eyebrow shrink-0 !text-ink">{title}</h1>

          <span aria-hidden="true" className="h-px flex-1 bg-rule" />

          {onCreate && (
            <Button onClick={onCreate} size="sm" variant="secondary" className="shrink-0">
              <Plus className="size-3.5" aria-hidden="true" />
              {t.admin.actions.create}
            </Button>
          )}
        </div>

        {description && <p className="mt-3 text-sm text-ink-muted">{description}</p>}
      </div>

      {children}
    </div>
  );
}

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-rule bg-canvas shadow-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onClose();
            }}
          >
            <div className="flex items-center gap-4 border-b border-rule px-5 py-4">
              <h2 className="eyebrow !text-ink">{title}</h2>
              <span aria-hidden="true" className="h-px flex-1 bg-rule" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="text-ink-muted transition-colors hover:text-ink"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function EmptyState({ message }: { message?: string }) {
  const { t } = useI18n();

  return (
    <div className="grid place-items-center border-y border-rule py-14 text-center text-sm text-ink-muted">
      {message ?? t.admin.actions.empty}
    </div>
  );
}
