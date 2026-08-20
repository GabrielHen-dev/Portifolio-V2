// Trajetória: linha do tempo com barras de duração.

import { Briefcase, GraduationCap } from 'lucide-react';
import type { TimelineEntry } from '../types';
import { Section } from '@/shared/ui/section';
import { ScrollReveal } from '@/shared/ui/scroll-reveal';
import { DurationBar } from '@/shared/ui/telemetry';
import { useI18n } from '@/shared/i18n/i18n-provider';

interface ExperienceSectionProps {
  entries: TimelineEntry[];
}

export function ExperienceSection({ entries }: ExperienceSectionProps) {
  const { t, pick } = useI18n();

  const maxMonths = Math.max(1, ...entries.map((entry) => entry.durationMonths));

  return (
    <Section
      id="experience"
      index={3}
      title={t.experience.title}
      subtitle={t.experience.subtitle}
      count={entries.length}
    >

      <ol className="relative border-l border-rule pl-8 md:pl-10">
        {entries.map((entry, index) => {
          const Icon = entry.kind === 'education' ? GraduationCap : Briefcase;

          return (
            <li key={entry.id} className="relative pb-12 last:pb-0">
              <ScrollReveal delay={index * 0.05} direction="left">
                <span
                  className="absolute -left-[41px] flex size-8 items-center justify-center rounded-full border border-rule bg-canvas md:-left-[49px]"
                  aria-hidden="true"
                >
                  <Icon className="size-3.5 text-accent" />
                </span>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="eyebrow tabular">
                    {entry.endDate
                      ? `${entry.startDate} ${t.experience.rangeTo} ${entry.endDate}`
                      : `${t.experience.since} ${entry.startDate}`}
                  </span>

                  <span aria-hidden="true" className="h-3 w-px bg-rule" />

                  <span className="eyebrow">
                    {entry.kind === 'education' ? t.experience.education : t.experience.experience}
                  </span>

                  {entry.isCurrent && (
                    <span className="eyebrow !text-ok">● {t.experience.current}</span>
                  )}
                </div>

                <h3 className="mt-3 text-xl font-medium tracking-tight">{pick(entry.role)}</h3>

                <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-ink-muted">
                  <span className="text-accent">{entry.org}</span>
                  {entry.location && (
                    <>
                      <span aria-hidden="true" className="h-3 w-px bg-rule" />
                      <span>{entry.location}</span>
                    </>
                  )}
                </p>

                {pick(entry.description) && (
                  <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted text-pretty">
                    {pick(entry.description)}
                  </p>
                )}

                <DurationBar
                  months={entry.durationMonths}
                  maxMonths={maxMonths}
                  label={
                    entry.durationMonths === 1
                      ? `1 ${t.experience.month}`
                      : `${entry.durationMonths} ${t.experience.months}`
                  }
                  className="mt-5"
                />
              </ScrollReveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
