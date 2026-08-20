// Tecnologias em cartões, agrupadas pelas categorias da API.

import type { Skill, SkillCategoryDto } from '../types';
import { TechLogo } from '../components/tech-logo';
import { Section } from '@/shared/ui/section';
import { ScrollReveal } from '@/shared/ui/scroll-reveal';
import { useI18n } from '@/shared/i18n/i18n-provider';

interface SkillsSectionProps {
  skills: Skill[];
  categories: SkillCategoryDto[];
}

export function SkillsSection({ skills, categories }: SkillsSectionProps) {
  const { t, pick } = useI18n();

  const groups = categories
    .map((category) => ({
      category,
      items: skills.filter((skill) => skill.categoryId === category.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Section id="skills" index={2} title={t.skills.title} subtitle={t.skills.subtitle} full>
      <div className="grid gap-12">
        {groups.map(({ category, items }) => (
          <section key={category.id} aria-labelledby={`skills-${category.id}`}>
            <ScrollReveal>
              <div className="mb-4 flex items-center gap-4">
                <h3 id={`skills-${category.id}`} className="eyebrow shrink-0">
                  {pick(category.name)}
                </h3>
                <span aria-hidden="true" className="h-px flex-1 bg-rule" />
              </div>
            </ScrollReveal>

            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((skill, index) => (
                <li key={skill.id}>
                  <ScrollReveal delay={Math.min(index, 7) * 0.03}>
                    <div className="tile-hover flex items-center gap-3 border border-rule bg-surface/40 px-4 py-3">
                      <TechLogo skill={skill} />
                      <span className="min-w-0 truncate text-sm" title={skill.name}>
                        {skill.name}
                      </span>
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}
