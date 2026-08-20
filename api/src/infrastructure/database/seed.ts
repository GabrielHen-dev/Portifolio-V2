// Carga inicial do currículo; roda apenas em banco vazio.

import { count } from 'drizzle-orm';
import { db } from './connection.js';
import { runMigrations } from './migrator.js';
import { projectSkills, projects, siteContent, siteTheme, skillCategories, skills, timelineEntries } from './schema.js';

const CATEGORIES: Array<{ pt: string; en: string }> = [
  { pt: 'Linguagens', en: 'Languages' },
  { pt: 'Front-end', en: 'Frontend' },
  { pt: 'DevOps', en: 'DevOps' },
  { pt: 'Banco de Dados', en: 'Databases' },
  { pt: 'Práticas', en: 'Practices' },
  { pt: 'Dados e IA', en: 'Data & AI' },
];

const SKILLS: Array<{ name: string; category: string; icon: string; level: number }> = [

  { name: 'JavaScript', category: 'language', icon: 'JS', level: 4 },
  { name: 'TypeScript', category: 'language', icon: 'TS', level: 4 },
  { name: 'Node.js', category: 'language', icon: 'Node', level: 4 },
  { name: 'Python', category: 'language', icon: 'Py', level: 3 },
  { name: 'Java', category: 'language', icon: 'Java', level: 3 },
  { name: 'C', category: 'language', icon: 'C', level: 3 },
  { name: 'C++', category: 'language', icon: 'C++', level: 3 },

  { name: 'Angular', category: 'frontend', icon: 'NG', level: 3 },
  { name: 'Vue 3', category: 'frontend', icon: 'Vue', level: 3 },
  { name: 'HTML5', category: 'frontend', icon: 'HTML', level: 4 },
  { name: 'CSS3', category: 'frontend', icon: 'CSS', level: 4 },

  { name: 'Docker', category: 'devops', icon: 'Docker', level: 4 },
  { name: 'Kubernetes', category: 'devops', icon: 'K8s', level: 3 },
  { name: 'Terraform', category: 'devops', icon: 'TF', level: 3 },
  { name: 'Git & GitHub', category: 'devops', icon: 'Git', level: 4 },

  { name: 'Scrum', category: 'practice', icon: 'Scrum', level: 4 },
  { name: 'Kanban', category: 'practice', icon: 'Kanban', level: 4 },
  { name: 'Engenharia de Requisitos', category: 'practice', icon: 'Req', level: 3 },
  { name: 'Testes de Software', category: 'practice', icon: 'Test', level: 3 },

  { name: 'Análise de Dados', category: 'data', icon: 'Data', level: 3 },
  { name: 'Inteligência Artificial', category: 'data', icon: 'IA', level: 3 },
  { name: 'Modelagem de Banco de Dados', category: 'data', icon: 'DB', level: 3 },
];

const TIMELINE = [
  {
    kind: 'experience',
    rolePt: 'Residência Tecnológica',
    roleEn: 'Technology Residency',
    org: 'Avanade',
    startDate: '04/2026',
    endDate: '05/2026',
    location: 'Recife (PE), Brasil',
    descriptionPt:
      'Programa imersivo com foco em criatividade, execução e visão analítica aplicadas a projetos reais de tecnologia.',
    descriptionEn:
      'Immersive program focused on creativity, execution and analytical thinking applied to real technology projects.',
  },
  {
    kind: 'experience',
    rolePt: 'Residência Tecnológica',
    roleEn: 'Technology Residency',
    org: 'Capgemini',
    startDate: '08/2025',
    endDate: '12/2025',
    location: 'Recife (PE), Brasil',
    descriptionPt:
      'Quatro meses desenvolvendo competências de comunicação, execução, liderança, organização e trabalho em equipe em ambiente corporativo.',
    descriptionEn:
      'Four months developing communication, execution, leadership, organization and teamwork skills in a corporate environment.',
  },
  {
    kind: 'education',
    rolePt: 'Tecnólogo em Análise e Desenvolvimento de Sistemas',
    roleEn: 'Technologist in Systems Analysis and Development',
    org: 'Graduação em andamento',
    startDate: '01/2025',
    endDate: null,
    location: 'Pernambuco, Brasil',
    descriptionPt: 'Cursando o 4º período, com ênfase em desenvolvimento web, arquitetura de software e DevOps.',
    descriptionEn: 'Currently in the 4th semester, focused on web development, software architecture and DevOps.',
  },
  {
    kind: 'education',
    rolePt: 'Ciclo GrowUp CESAR',
    roleEn: 'GrowUp CESAR Program',
    org: 'Rocketseat',
    startDate: '06/2025',
    endDate: '06/2025',
    location: 'Recife (PE), Brasil',
    descriptionPt: 'Certificação de 11 horas com foco em desenvolvimento e boas práticas de engenharia de software.',
    descriptionEn: 'An 11-hour certification focused on development and software engineering best practices.',
  },
];

const PROJECTS = [
  {
    slug: 'ecohub',
    titlePt: 'EcoHub',
    titleEn: 'EcoHub',
    descriptionPt:
      'Plataforma voltada a recursos renováveis e meio ambiente. Trabalhei no planejamento estratégico com 5W2H e na análise de dados que sustenta as decisões do produto.',
    descriptionEn:
      'A platform focused on renewable resources and the environment. I worked on strategic planning with 5W2H and on the data analysis behind the product decisions.',
    repoUrl: 'https://github.com/dgcavalcante/EcoHub',
    featured: true,
    skills: ['Análise de Dados', 'Python'],
  },
  {
    slug: 'arena-hub',
    titlePt: 'Arena Hub',
    titleEn: 'Arena Hub',
    descriptionPt:
      'Sistema de administração governamental para gestão de arenas esportivas. Atuei na modelagem do banco de dados e na estruturação orientada a objetos.',
    descriptionEn:
      'A government administration system for managing sports arenas. I worked on database modeling and object-oriented structure.',
    repoUrl: 'https://github.com/lucaschavessf/Arena-Hub',
    featured: true,
    skills: ['Java', 'Modelagem de Banco de Dados'],
  },
];

const CONTENT: Array<{ key: string; pt: string; en: string }> = [
  {
    key: 'hero.headline',
    pt: 'Desenvolvedor full stack com pegada DevOps',
    en: 'Full stack developer with a DevOps mindset',
  },
  {
    key: 'hero.subheadline',
    pt: 'Construo aplicações web do banco ao deploy e gosto de deixar tudo containerizado no caminho.',
    en: 'I build web applications from database to deployment and I like to containerize everything along the way.',
  },
  { key: 'hero.cta', pt: 'Ver projetos', en: 'See projects' },
  { key: 'about.title', pt: 'Sobre mim', en: 'About me' },
  {
    key: 'about.body',
    pt: 'Tenho 20 anos e curso Análise e Desenvolvimento de Sistemas. Passei por duas residências tecnológicas, na Capgemini e na Avanade, onde aprendi na prática como um time de verdade entrega software. Gosto de problemas que misturam código e infraestrutura: modelar o domínio, escrever a API e depois empacotar tudo em container para subir sem surpresa.',
    en: 'I am 20 and studying Systems Analysis and Development. I went through two technology residencies, at Capgemini and Avanade, where I learned first-hand how a real team ships software. I enjoy problems that mix code and infrastructure: modeling the domain, writing the API, then packaging it all into containers so it deploys without surprises.',
  },
  {
    key: 'about.profile',
    pt: 'Perfil DISC: Executor e Analítico. Foco em resultado, com atenção à qualidade e aos detalhes.',
    en: 'DISC profile: Driver and Analytical. Results-focused, with an eye for quality and detail.',
  },
  { key: 'contact.title', pt: 'Vamos conversar', en: "Let's talk" },
  {
    key: 'contact.body',
    pt: 'Aberto a novas oportunidades e desafios. Respondo rápido por e-mail ou WhatsApp.',
    en: 'Open to new opportunities and challenges. I reply fast by email or WhatsApp.',
  },
  { key: 'contact.email', pt: 'Gabriel.Henrique061@outlook.com', en: 'Gabriel.Henrique061@outlook.com' },
  { key: 'contact.phone', pt: '+55 81 99732-9341', en: '+55 81 99732-9341' },
  { key: 'contact.github', pt: 'https://github.com/GabrielHen-dev', en: 'https://github.com/GabrielHen-dev' },
  { key: 'contact.linkedin', pt: '', en: '' },
  { key: 'contact.location', pt: 'Pau Amarelo, Paulista (PE)', en: 'Pau Amarelo, Paulista (PE), Brazil' },
  {
    key: 'footer.note',
    pt: '',
    en: '',
  },
];

async function seed(): Promise<void> {
  await runMigrations();

  const [existing] = await db.select({ value: count() }).from(skills);
  if ((existing?.value ?? 0) > 0) {
    console.log('[seed] o banco ja tem dados — nada a fazer.');
    return;
  }

  console.log('[seed] populando com os dados do curriculo...');

  await db.transaction(async (tx) => {
    const insertedCategories = await tx
      .insert(skillCategories)
      .values(CATEGORIES.map((cat, index) => ({ namePt: cat.pt, nameEn: cat.en, sortOrder: index })))
      .returning({ id: skillCategories.id, namePt: skillCategories.namePt });

    const categoryIdBySlug = new Map<string, string>();
    const slugToPt: Record<string, string> = {
      language: 'Linguagens',
      frontend: 'Front-end',
      devops: 'DevOps',
      database: 'Banco de Dados',
      practice: 'Práticas',
      data: 'Dados e IA',
    };
    for (const [slug, pt] of Object.entries(slugToPt)) {
      const found = insertedCategories.find((c) => c.namePt === pt);
      if (found) categoryIdBySlug.set(slug, found.id);
    }

    const fallbackCategoryId = insertedCategories[0]!.id;

    const insertedSkills = await tx
      .insert(skills)
      .values(
        SKILLS.map((skill, index) => ({
          name: skill.name,
          icon: skill.icon,
          level: skill.level,
          categoryId: categoryIdBySlug.get(skill.category) ?? fallbackCategoryId,
          sortOrder: index,
        })),
      )
      .returning({ id: skills.id, name: skills.name });

    const skillIdByName = new Map(insertedSkills.map((s) => [s.name, s.id]));

    await tx.insert(timelineEntries).values(
      TIMELINE.map((entry, index) => ({
        ...entry,
        sortOrder: index,
      })),
    );

    for (const [index, project] of PROJECTS.entries()) {
      const [row] = await tx
        .insert(projects)
        .values({
          slug: project.slug,
          titlePt: project.titlePt,
          titleEn: project.titleEn,
          descriptionPt: project.descriptionPt,
          descriptionEn: project.descriptionEn,
          repoUrl: project.repoUrl,
          featured: project.featured,
          sortOrder: index,
        })
        .returning({ id: projects.id });

      if (!row) continue;

      const links = project.skills
        .map((name) => skillIdByName.get(name))
        .filter((id): id is string => Boolean(id))
        .map((skillId) => ({ projectId: row.id, skillId }));

      if (links.length > 0) await tx.insert(projectSkills).values(links);
    }

    await tx
      .insert(siteContent)
      .values(CONTENT.map((c) => ({ key: c.key, valuePt: c.pt, valueEn: c.en })))
      .onConflictDoNothing();

    await tx
      .insert(siteTheme)
      .values({ id: 'default', palette: 'redline', defaultMode: 'dark' })
      .onConflictDoNothing();
  });

  console.log(
    `[seed] pronto: ${SKILLS.length} tecnologias, ${TIMELINE.length} entradas de timeline, ${PROJECTS.length} projetos.`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] falhou:', err);
    process.exit(1);
  });
