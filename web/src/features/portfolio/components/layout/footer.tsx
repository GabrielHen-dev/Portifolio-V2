// Rodapé: linha única em mono com marca, copyright e localização; nota opcional editável no painel.

import type { SiteContent } from '../../types';
import { useI18n } from '@/shared/i18n/i18n-provider';

export function Footer({ content }: { content: SiteContent }) {
  const { pick } = useI18n();
  const year = new Date().getFullYear();
  const note = pick(content['footer.note']);

  return (
    <footer className="border-t border-rule py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 md:px-8">
        <p className="eyebrow flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          <span>
            GabrielHen<span className="text-accent">_dev</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>© {year}</span>
        </p>

        {note && <p className="eyebrow text-center">{note}</p>}
      </div>
    </footer>
  );
}
