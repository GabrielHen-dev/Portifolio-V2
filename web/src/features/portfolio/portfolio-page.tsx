// Página pública: carrega o snapshot e monta as seções.

import { usePortfolio } from './api/portfolio.queries';
import { Header } from './components/layout/header';
import { Footer } from './components/layout/footer';
import { AboutSection } from './sections/about-section';
import { ContactSection } from './sections/contact-section';
import { ExperienceSection } from './sections/experience-section';
import { HeroSection } from './sections/hero-section';
import { ProjectsSection } from './sections/projects-section';
import { SkillsSection } from './sections/skills-section';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { Button } from '@/shared/ui/button';
import { Ticker } from '@/shared/ui/telemetry';

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-32 md:px-8">
      <div className="h-3 w-48 animate-pulse bg-surface-raised" />
      <div className="mt-8 h-16 w-full max-w-2xl animate-pulse bg-surface-raised" />
      <div className="mt-3 h-16 w-3/5 animate-pulse bg-surface-raised" />
      <div className="mt-10 flex gap-4">
        <div className="h-11 w-40 animate-pulse bg-surface-raised" />
        <div className="h-11 w-32 animate-pulse bg-surface-raised" />
      </div>
    </div>
  );
}

export function PortfolioPage() {
  const { t } = useI18n();
  const { data, isPending, isError, refetch } = usePortfolio();

  if (isPending) {
    return (
      <>
        <Header />
        <PageSkeleton />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <Header />
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-40 text-center">
          <p className="text-ink-muted">{t.common.error}</p>
          <Button onClick={() => void refetch()}>{t.common.retry}</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <a href="#main" className="skip-link">
        {t.nav.skipToContent}
      </a>

      <Header />

      <main id="main">
        <HeroSection content={data.content} />

        <Ticker items={data.skills.map((skill) => skill.name)} />

        <AboutSection content={data.content} />
        <SkillsSection skills={data.skills} categories={data.skillCategories} />
        <ExperienceSection entries={data.timeline} />
        <ProjectsSection projects={data.projects} skills={data.skills} />
        <ContactSection content={data.content} />
      </main>

      <Footer content={data.content} />
    </>
  );
}
