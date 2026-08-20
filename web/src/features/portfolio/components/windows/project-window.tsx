// Janela arrastável de projeto com chips de tecnologia.

import { motion } from 'motion/react';
import { ArrowUpRight, Github } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { Project, Skill } from '../../types';
import { TechLogo } from '../tech-logo';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { cn } from '@/shared/lib/cn';

interface ProjectWindowProps {
  project: Project;
  skills: Skill[];

  constraintsRef: RefObject<HTMLDivElement | null>;
  position: { x: number; y: number };
  zIndex: number;
  onFocus: () => void;
  draggable: boolean;
  onMeasure?: (height: number) => void;
}

export function ProjectWindow({
  project,
  skills,
  constraintsRef,
  position,
  zIndex,
  onFocus,
  draggable,
  onMeasure,
}: ProjectWindowProps) {
  const { t, pick } = useI18n();

  const elementRef = useRef<HTMLElement>(null);
  const measureRef = useRef(onMeasure);
  measureRef.current = onMeasure;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      measureRef.current?.(element.offsetHeight);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [draggable]);

  const projectSkills = skills.filter((skill) => project.skillIds.includes(skill.id));

  const content = (
    <>
      <div
        className={cn(
          'flex items-center gap-3 border-b border-rule px-4 py-2.5',
          draggable && 'cursor-grab active:cursor-grabbing',
        )}
      >
        <span className="eyebrow truncate !text-accent">{project.slug}</span>

        {project.featured && <span className="eyebrow ml-auto !text-gold">★ {t.projects.featured}</span>}
      </div>

      <div className="p-5">
        {project.coverUrl && (
          <img
            src={project.coverUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="mb-5 h-32 w-full object-cover"

            draggable={false}
          />
        )}

        <h3 className="text-lg font-medium tracking-tight">{pick(project.title)}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted text-pretty">{pick(project.description)}</p>

        {projectSkills.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {projectSkills.map((skill) => (
              <li
                key={skill.id}
                className="flex items-center gap-1.5 border border-rule bg-surface-raised/60 px-2 py-1"
              >

                <TechLogo skill={skill} className="!size-3.5" />
                <span className="font-mono text-[0.625rem] uppercase tracking-wider text-ink-muted">
                  {skill.name}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-rule pt-4">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"

              rel="noopener noreferrer"
              className="link-underline inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <Github className="size-4" aria-hidden="true" />
              {t.projects.repo}
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline inline-flex items-center gap-1.5 text-sm text-accent"
            >
              {t.projects.demo}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </>
  );

  if (!draggable) {
    return (
      <article ref={elementRef} className="border border-rule bg-surface">
        {content}
      </article>
    );
  }

  return (
    <motion.article
      ref={elementRef}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.12}
      dragMomentum
      dragTransition={{ bounceStiffness: 240, bounceDamping: 26 }}
      onPointerDown={onFocus}
      initial={{ opacity: 0, y: position.y + 12, x: position.x }}
      animate={{ opacity: 1, x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      whileDrag={{ boxShadow: 'var(--shadow-overlay)' }}
      style={{ zIndex }}
      className="absolute w-[min(340px,86vw)] border border-rule bg-surface"
    >
      {content}
    </motion.article>
  );
}
