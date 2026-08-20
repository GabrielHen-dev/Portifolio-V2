// Entidade SkillCategory: categoria de tecnologia criável pelo painel.

import { LocalizedText } from '../value-objects/localized-text.js';

export interface SkillCategoryProps {
  id: string;
  name: LocalizedText;
  sortOrder: number;
}

export class SkillCategory {
  private constructor(private props: SkillCategoryProps) {}

  static restore(props: SkillCategoryProps): SkillCategory {
    return new SkillCategory(props);
  }

  static create(props: SkillCategoryProps): SkillCategory {
    return new SkillCategory(props);
  }

  get id(): string {
    return this.props.id;
  }
  get name(): LocalizedText {
    return this.props.name;
  }
  get sortOrder(): number {
    return this.props.sortOrder;
  }

  update(changes: { name?: LocalizedText; sortOrder?: number }): void {
    if (changes.name !== undefined) this.props.name = changes.name;
    if (changes.sortOrder !== undefined) this.props.sortOrder = changes.sortOrder;
  }

  toSnapshot(): SkillCategoryProps {
    return { ...this.props };
  }
}
