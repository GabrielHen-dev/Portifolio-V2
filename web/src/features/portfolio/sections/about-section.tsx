// Sobre: foto (ou monograma), bio e competências.

import type { SiteContent } from '../types';
import { Section } from '@/shared/ui/section';
import { ScrollReveal } from '@/shared/ui/scroll-reveal';
import { useI18n } from '@/shared/i18n/i18n-provider';

interface AboutSectionProps {
  content: SiteContent;
}

const TRAITS = [
  {
    pt: { title: 'Criatividade', body: 'Combinar elementos diferentes para chegar a uma solucao nova.' },
    en: { title: 'Creativity', body: 'Combining different elements to reach a new solution.' },
  },
  {
    pt: { title: 'Execucao', body: 'Definir e executar acoes direcionadas a resultado.' },
    en: { title: 'Execution', body: 'Defining and executing actions aimed at results.' },
  },
  {
    pt: { title: 'Organizacao', body: 'Gerenciar recursos, tempo, acoes e resultados.' },
    en: { title: 'Organization', body: 'Managing resources, time, actions and outcomes.' },
  },
  {
    pt: { title: 'Negociacao', body: 'Integrar pontos de vista e gerar solucoes conciliadoras.' },
    en: { title: 'Negotiation', body: 'Integrating viewpoints and building common ground.' },
  },
] as const;

export function AboutSection({ content }: AboutSectionProps) {
  const { t, locale, pick } = useI18n();

  const photo = pick(content['about.photo']);

  return (
    <Section id="about" index={1} title={pick(content['about.title']) || t.nav.about}>
      <div className="grid gap-10 md:grid-cols-[260px_1fr] md:gap-14">
        <ScrollReveal direction="right">
          <figure className="group relative mx-auto w-56 md:mx-0 md:w-full">
            {photo ? (

              <img
                src={photo}
                alt="Gabriel Henrique Costa Oliveira"
                loading="lazy"
                className="aspect-[4/5] w-full border border-rule object-cover grayscale transition duration-500 group-hover:grayscale-0"
              />
            ) : (

              <div
                aria-hidden="true"
                className="grid aspect-[4/5] w-full place-items-center border border-rule bg-surface/40"
              >
                <span className="font-display text-7xl font-semibold tracking-tight text-ink-muted/35">
                  GO
                </span>
              </div>
            )}

            <span aria-hidden="true" className="absolute -left-px -top-px size-5 border-l-2 border-t-2 border-accent" />
            <span aria-hidden="true" className="absolute -bottom-px -right-px size-5 border-b-2 border-r-2 border-accent" />
          </figure>
        </ScrollReveal>

        <ScrollReveal>
          <p className="max-w-2xl text-lg leading-relaxed text-ink-muted text-pretty">
            {pick(content['about.body'])}
          </p>

          {content['about.profile'] && pick(content['about.profile']) && (
            <p className="mt-8 max-w-2xl border-l-2 border-accent pl-5 text-sm leading-relaxed">
              {pick(content['about.profile'])}
            </p>
          )}
        </ScrollReveal>
      </div>

      <ul className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {TRAITS.map((trait, index) => {
          const copy = trait[locale];

          return (
            <ScrollReveal key={copy.title} delay={index * 0.05}>
              <li>
                <h3 className="eyebrow !text-accent">{copy.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted text-pretty">{copy.body}</p>
              </li>
            </ScrollReveal>
          );
        })}
      </ul>
    </Section>
  );
}
