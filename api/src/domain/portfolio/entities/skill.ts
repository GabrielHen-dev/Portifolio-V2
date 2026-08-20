// Entidade Skill: tecnologia do portfólio com categoria, sigla e visibilidade.

import { ValidationError } from '../../../shared/errors/index.js';

export interface SkillProps {
  id: string;
  name: string;

  categoryId: string;

  icon: string | null;

  level: number;
  sortOrder: number;
  visible: boolean;
}

export class Skill {
  static readonly MIN_LEVEL = 1;
  static readonly MAX_LEVEL = 5;

  private constructor(private props: SkillProps) {}

  static restore(props: SkillProps): Skill {
    return new Skill(props);
  }

  static create(input: SkillProps): Skill {
    Skill.assertName(input.name);
    Skill.assertCategoryId(input.categoryId);
    Skill.assertLevel(input.level);
    return new Skill({ ...input, name: input.name.trim() });
  }

  private static assertName(name: string): void {
    const clean = name.trim();
    if (clean.length < 1) throw new ValidationError('Informe o nome da tecnologia.', 'name');
    if (clean.length > 60) throw new ValidationError('Nome longo demais (maximo 60).', 'name');
  }

  private static assertCategoryId(categoryId: string): void {
    if (!categoryId || categoryId.trim().length === 0) {
      throw new ValidationError('Escolha uma categoria.', 'categoryId');
    }
  }

  private static assertLevel(level: number): void {
    if (!Number.isInteger(level) || level < Skill.MIN_LEVEL || level > Skill.MAX_LEVEL) {
      throw new ValidationError(`O nivel precisa ser um inteiro de ${Skill.MIN_LEVEL} a ${Skill.MAX_LEVEL}.`, 'level');
    }
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get categoryId(): string {
    return this.props.categoryId;
  }
  get icon(): string | null {
    return this.props.icon;
  }
  get level(): number {
    return this.props.level;
  }
  get sortOrder(): number {
    return this.props.sortOrder;
  }
  get visible(): boolean {
    return this.props.visible;
  }

  update(changes: Partial<Omit<SkillProps, 'id'>>): void {
    if (changes.name !== undefined) {
      Skill.assertName(changes.name);
      this.props.name = changes.name.trim();
    }
    if (changes.categoryId !== undefined) {
      Skill.assertCategoryId(changes.categoryId);
      this.props.categoryId = changes.categoryId;
    }
    if (changes.level !== undefined) {
      Skill.assertLevel(changes.level);
      this.props.level = changes.level;
    }
    if (changes.icon !== undefined) this.props.icon = changes.icon;
    if (changes.sortOrder !== undefined) this.props.sortOrder = changes.sortOrder;
    if (changes.visible !== undefined) this.props.visible = changes.visible;
  }

  toSnapshot(): SkillProps {
    return { ...this.props };
  }
}
