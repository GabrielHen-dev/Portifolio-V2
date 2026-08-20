// Seção de projetos com o gerenciador de janelas.

import type { Project, Skill } from '../types';
import { WindowManager } from '../components/windows/window-manager';
import { Section } from '@/shared/ui/section';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { useIsDesktop } from '@/shared/hooks/use-media-query';

interface ProjectsSectionProps {
  projects: Project[];
  skills: Skill[];
}

export function ProjectsSection({ projects, skills }: ProjectsSectionProps) {
  const { t } = useI18n();
  const isDesktop = useIsDesktop();

  return (
    <Section
      id="projects"
      index={4}
      title={t.projects.title}

      subtitle={isDesktop ? t.projects.subtitle : undefined}
      count={projects.length}
      full
    >
      <WindowManager projects={projects} skills={skills} />
    </Section>
  );
}
