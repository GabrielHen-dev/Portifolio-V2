// Entidade Project: projeto exibido nas janelas; valida URLs http/https.

import { ValidationError } from '../../../shared/errors/index.js';
import { LocalizedText } from '../value-objects/localized-text.js';
import { Slug } from '../value-objects/slug.js';

export interface ProjectProps {
  id: string;
  slug: Slug;
  title: LocalizedText;
  description: LocalizedText;
  repoUrl: string | null;
  demoUrl: string | null;
  coverMediaId: string | null;
  featured: boolean;
  sortOrder: number;
  visible: boolean;
  skillIds: string[];
}

export class Project {
  private constructor(private props: ProjectProps) {}

  static restore(props: ProjectProps): Project {
    return new Project(props);
  }

  static create(props: ProjectProps): Project {
    Project.assertUrl(props.repoUrl, 'repoUrl');
    Project.assertUrl(props.demoUrl, 'demoUrl');
    return new Project(props);
  }

  private static assertUrl(url: string | null, field: string): void {
    if (!url) return;
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new ValidationError('URL invalida.', field);
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new ValidationError('Use apenas links http ou https.', field);
    }
  }

  get id(): string {
    return this.props.id;
  }
  get slug(): Slug {
    return this.props.slug;
  }
  get title(): LocalizedText {
    return this.props.title;
  }
  get description(): LocalizedText {
    return this.props.description;
  }
  get repoUrl(): string | null {
    return this.props.repoUrl;
  }
  get demoUrl(): string | null {
    return this.props.demoUrl;
  }
  get coverMediaId(): string | null {
    return this.props.coverMediaId;
  }
  get featured(): boolean {
    return this.props.featured;
  }
  get sortOrder(): number {
    return this.props.sortOrder;
  }
  get visible(): boolean {
    return this.props.visible;
  }
  get skillIds(): string[] {
    return [...this.props.skillIds];
  }

  update(changes: Partial<Omit<ProjectProps, 'id'>>): void {
    if (changes.repoUrl !== undefined) {
      Project.assertUrl(changes.repoUrl, 'repoUrl');
      this.props.repoUrl = changes.repoUrl;
    }
    if (changes.demoUrl !== undefined) {
      Project.assertUrl(changes.demoUrl, 'demoUrl');
      this.props.demoUrl = changes.demoUrl;
    }
    if (changes.slug !== undefined) this.props.slug = changes.slug;
    if (changes.title !== undefined) this.props.title = changes.title;
    if (changes.description !== undefined) this.props.description = changes.description;
    if (changes.coverMediaId !== undefined) this.props.coverMediaId = changes.coverMediaId;
    if (changes.featured !== undefined) this.props.featured = changes.featured;
    if (changes.sortOrder !== undefined) this.props.sortOrder = changes.sortOrder;
    if (changes.visible !== undefined) this.props.visible = changes.visible;
    if (changes.skillIds !== undefined) this.props.skillIds = [...new Set(changes.skillIds)];
  }

  toSnapshot(): ProjectProps {
    return { ...this.props, skillIds: [...this.props.skillIds] };
  }
}
