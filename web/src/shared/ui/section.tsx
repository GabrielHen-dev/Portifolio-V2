// Casca de seção numerada com hairline e contador.

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { ScrollReveal } from './scroll-reveal';
import { CountUp } from './telemetry';

interface SectionProps {
  id: string;

  index?: number;
  title?: string;
  subtitle?: string;

  meta?: string;

  count?: number;
  children: ReactNode;
  className?: string;
  full?: boolean;
}

export function Section({
  id,
  index,
  title,
  subtitle,
  meta,
  count,
  children,
  className,
  full = false,
}: SectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-20 py-20 md:py-28', className)}>
      <div className={cn('mx-auto px-5 md:px-8', full ? 'max-w-6xl' : 'max-w-4xl')}>
        {title && (
          <ScrollReveal className="mb-10 md:mb-14">
            <div className="flex items-center gap-4">
              {index !== undefined && (
                <span className="eyebrow tabular shrink-0">{String(index).padStart(2, '0')}</span>
              )}

              <h2 className="eyebrow shrink-0 !text-ink">{title}</h2>

              <span aria-hidden="true" className="h-px flex-1 bg-rule" />

              {count !== undefined && (
                <span className="eyebrow shrink-0">
                  <CountUp value={count} />
                </span>
              )}
              {meta && <span className="eyebrow tabular shrink-0">{meta}</span>}
            </div>

            {subtitle && (
              <p className="mt-6 max-w-2xl text-2xl leading-snug text-pretty md:text-3xl">{subtitle}</p>
            )}
          </ScrollReveal>
        )}

        {children}
      </div>
    </section>
  );
}
