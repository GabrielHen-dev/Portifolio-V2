// Snapshot público do portfólio em uma única leitura.

import type { MediaAsset } from '../../../domain/portfolio/entities/media-asset.js';
import type { Project } from '../../../domain/portfolio/entities/project.js';
import type { Skill } from '../../../domain/portfolio/entities/skill.js';
import type { SkillCategory } from '../../../domain/portfolio/entities/skill-category.js';
import type { ThemeSettings } from '../../../domain/portfolio/entities/theme-settings.js';
import type { TimelineEntry } from '../../../domain/portfolio/entities/timeline-entry.js';
import type {
  MediaRepository,
  ProjectRepository,
  SiteContentEntry,
  SiteContentRepository,
  SkillCategoryRepository,
  SkillRepository,
  ThemeSettingsRepository,
  TimelineRepository,
} from '../../../domain/portfolio/repositories/portfolio.repositories.js';

export interface PortfolioSnapshot {
  skills: Skill[];
  skillCategories: SkillCategory[];
  projects: Project[];
  timeline: TimelineEntry[];
  content: SiteContentEntry[];
  media: Map<string, MediaAsset>;
  theme: ThemeSettings;
}

export class PortfolioQueryService {
  constructor(
    private readonly skills: SkillRepository,
    private readonly projects: ProjectRepository,
    private readonly timeline: TimelineRepository,
    private readonly content: SiteContentRepository,
    private readonly media: MediaRepository,
    private readonly theme: ThemeSettingsRepository,
    private readonly categories: SkillCategoryRepository,
  ) {}

  async getPublicSnapshot(): Promise<PortfolioSnapshot> {
    const [skills, projects, timeline, content, mediaList, theme, skillCategories] = await Promise.all([
      this.skills.list({ onlyVisible: true }),
      this.projects.list({ onlyVisible: true }),
      this.timeline.list({ onlyVisible: true }),
      this.content.all(),
      this.media.list(),
      this.theme.get(),
      this.categories.list(),
    ]);

    return {
      skills,
      skillCategories,
      projects,
      timeline,
      content,
      media: new Map(mediaList.map((asset) => [asset.id, asset])),
      theme,
    };
  }
}
