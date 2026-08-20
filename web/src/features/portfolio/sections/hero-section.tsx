// Hero: título em gradiente, metadados e traçado de telemetria.

import { motion } from 'motion/react';
import { ArrowDown, ArrowUpRight, Download } from 'lucide-react';
import type { SiteContent } from '../types';
import { Magnetic } from '../components/fx/magnetic';
import { ScrambleText } from '../components/fx/scramble-text';
import { TelemetryTrace } from '../components/telemetry-trace';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { cn } from '@/shared/lib/cn';

interface HeroSectionProps {
  content: SiteContent;
}

export function HeroSection({ content }: HeroSectionProps) {
  const { t, pick } = useI18n();

  const headline = pick(content['hero.headline']) || 'Gabriel Oliveira';
  const subheadline = pick(content['hero.subheadline']);
  const location = pick(content['contact.location']);

  return (
    <section id="home" className="relative flex min-h-[92vh] items-center overflow-hidden bg-grid">

      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 -z-10 w-full text-ink opacity-40 md:w-[56%] md:opacity-100"
      >
        <TelemetryTrace className="size-full" />
      </div>

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r',
          'from-canvas from-40% via-canvas/75 via-65% to-transparent to-90%',
        )}
      />

      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        >
          <h1 className="text-gradient-accent max-w-[15ch] text-[clamp(2.5rem,7vw,4.75rem)] font-semibold leading-[1.05] pb-1 text-balance">
            <ScrambleText text={headline} />
          </h1>

          {subheadline && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted text-pretty">{subheadline}</p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
            {location && <span className="eyebrow">{location}</span>}
            <span aria-hidden="true" className="h-3 w-px bg-rule" />
            <span className="eyebrow">ADS · 4&ordm; {t.hero.term}</span>
            <span aria-hidden="true" className="hidden h-3 w-px bg-rule sm:block" />
            <span className="eyebrow hidden sm:inline">PT · EN</span>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Magnetic>
              <a
                href="#projects"
                className="group inline-flex h-11 items-center gap-2 bg-accent px-6 text-sm font-medium text-accent-ink transition-[opacity,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:glow-accent hover:opacity-95"
              >
                {pick(content['hero.cta']) || t.nav.projects}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Magnetic>

            <a
              href="/curriculo-gabriel-oliveira.pdf"
              download
              className="link-underline inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <Download className="size-4" aria-hidden="true" />
              {t.hero.secondaryCta}
            </a>
          </div>
        </motion.div>
      </div>

      <motion.a
        href="#about"
        aria-label={t.hero.scroll}
        className="absolute bottom-8 left-5 text-ink-muted md:left-8"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ArrowDown className="size-4" aria-hidden="true" />
      </motion.a>
    </section>
  );
}
