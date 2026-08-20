// Gerencia posições, empilhamento e organização das janelas.

import { LayoutGrid } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Project, Skill } from '../../types';
import { ProjectWindow } from './project-window';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { useIsDesktop } from '@/shared/hooks/use-media-query';

interface WindowManagerProps {
  projects: Project[];
  skills: Skill[];
}

const CASCADE_STEP = { x: 46, y: 38 };
const WINDOW_WIDTH = 340;
const PADDING = 16;
const MIN_HEIGHT = 560;

const estimateHeight = (project: Project): number => (project.coverUrl ? 540 : 400);

interface Layout {
  positions: Record<string, { x: number; y: number }>;
  contentHeight: number;
}

export function WindowManager({ projects, skills }: WindowManagerProps) {
  const { t } = useI18n();
  const isDesktop = useIsDesktop();
  const containerRef = useRef<HTMLDivElement>(null);

  const [layoutKey, setLayoutKey] = useState(0);
  const [zOrder, setZOrder] = useState<string[]>(() => projects.map((p) => p.id));
  const [containerWidth, setContainerWidth] = useState(0);
  const [heights, setHeights] = useState<Record<string, number>>({});

  useEffect(() => {
    setZOrder(projects.map((p) => p.id));
  }, [projects]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setContainerWidth(element.clientWidth - PADDING * 2);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [isDesktop]);

  const measure = useCallback((id: string, height: number) => {
    setHeights((current) => (current[id] === height ? current : { ...current, [id]: height }));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setZOrder((current) => [...current.filter((item) => item !== id), id]);
  }, []);

  const organize = useCallback(() => {
    setLayoutKey((value) => value + 1);
    setZOrder(projects.map((p) => p.id));
  }, [projects]);

  const layout = useMemo<Layout>(() => {
    const usable = containerWidth > 0 ? containerWidth : WINDOW_WIDTH;
    const maxX = Math.max(0, usable - WINDOW_WIDTH);

    const positions: Record<string, { x: number; y: number }> = {};
    let contentHeight = 0;

    projects.forEach((project, index) => {
      const height = heights[project.id] ?? estimateHeight(project);
      const x = Math.min(index * CASCADE_STEP.x, maxX);
      const y = index * CASCADE_STEP.y;

      positions[project.id] = { x, y };
      contentHeight = Math.max(contentHeight, y + height);
    });

    return { positions, contentHeight };
  }, [projects, containerWidth, heights]);

  if (projects.length === 0) {
    return <p className="text-ink-muted">{t.projects.empty}</p>;
  }

  if (!isDesktop) {
    return (
      <div className="grid gap-4">
        {projects.map((project) => (
          <ProjectWindow
            key={project.id}
            project={project}
            skills={skills}
            constraintsRef={containerRef}
            position={{ x: 0, y: 0 }}
            zIndex={1}
            onFocus={() => {}}
            draggable={false}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={organize}
        className="link-underline mb-6 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <LayoutGrid className="size-4" aria-hidden="true" />
        {t.projects.organize}
      </button>

      <div
        ref={containerRef}
        style={{ minHeight: Math.max(MIN_HEIGHT, layout.contentHeight + PADDING * 2) }}
        className="relative w-full border border-dashed border-rule/70 p-4"
      >
        {projects.map((project) => (
          <ProjectWindow
            key={`${project.id}-${layoutKey}`}
            project={project}
            skills={skills}
            constraintsRef={containerRef}
            position={layout.positions[project.id] ?? { x: 0, y: 0 }}
            zIndex={zOrder.indexOf(project.id) + 1}
            onFocus={() => bringToFront(project.id)}
            onMeasure={(height) => measure(project.id, height)}
            draggable
          />
        ))}
      </div>
    </div>
  );
}
