// Logos de tecnologia embarcadas (brands + pictogramas); sem logo, nada é renderizado.

import { Database, SquareKanban, type LucideIcon } from 'lucide-react';
import {
  siAngular,
  siAnsible,
  siApachekafka,
  siBootstrap,
  siBun,
  siC,
  siCplusplus,
  siCss,
  siCypress,
  siDart,
  siDeno,
  siDocker,
  siDotnet,
  siElasticsearch,
  siElectron,
  siExpress,
  siFastify,
  siFigma,
  siFirebase,
  siFlutter,
  siGit,
  siGithub,
  siGitlab,
  siGo,
  siGooglecloud,
  siGrafana,
  siGraphql,
  siHelm,
  siHtml5,
  siJavascript,
  siJenkins,
  siJest,
  siJupyter,
  siKotlin,
  siKubernetes,
  siLaravel,
  siLinux,
  siMariadb,
  siMongodb,
  siMysql,
  siNestjs,
  siNetlify,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siNumpy,
  siOpenjdk,
  siPandas,
  siPhp,
  siPostgresql,
  siPrometheus,
  siPython,
  siPytorch,
  siRabbitmq,
  siReact,
  siRedis,
  siRust,
  siSass,
  siScrumalliance,
  siSelenium,
  siSpring,
  siSpringboot,
  siSqlite,
  siSupabase,
  siSvelte,
  siSwift,
  siTailwindcss,
  siTensorflow,
  siTerraform,
  siTypescript,
  siVercel,
  siVite,
  siVitest,
  siVuedotjs,
} from 'simple-icons';

interface SimpleIcon {
  title: string;
  path: string;
  hex: string;
}

type TechIcon =
  | { kind: 'brand'; path: string; hex: string }
  | { kind: 'pictogram'; Component: LucideIcon };

const brand = (icon: SimpleIcon): TechIcon => ({ kind: 'brand', path: icon.path, hex: icon.hex });
const pictogram = (Component: LucideIcon): TechIcon => ({ kind: 'pictogram', Component });

const REGISTRY: Record<string, TechIcon> = {
  javascript: brand(siJavascript),
  js: brand(siJavascript),
  typescript: brand(siTypescript),
  ts: brand(siTypescript),
  nodejs: brand(siNodedotjs),
  node: brand(siNodedotjs),
  python: brand(siPython),
  py: brand(siPython),

  java: brand(siOpenjdk),
  openjdk: brand(siOpenjdk),
  c: brand(siC),
  'c++': brand(siCplusplus),
  cpp: brand(siCplusplus),
  angular: brand(siAngular),
  ng: brand(siAngular),
  vue: brand(siVuedotjs),
  vue3: brand(siVuedotjs),
  vuejs: brand(siVuedotjs),
  html: brand(siHtml5),
  html5: brand(siHtml5),
  css: brand(siCss),
  css3: brand(siCss),
  docker: brand(siDocker),
  kubernetes: brand(siKubernetes),
  k8s: brand(siKubernetes),
  terraform: brand(siTerraform),
  tf: brand(siTerraform),
  git: brand(siGit),
  github: brand(siGithub),
  gitgithub: brand(siGithub),
  react: brand(siReact),
  postgresql: brand(siPostgresql),
  postgres: brand(siPostgresql),
  mysql: brand(siMysql),
  mongodb: brand(siMongodb),
  tailwind: brand(siTailwindcss),
  tailwindcss: brand(siTailwindcss),
  fastify: brand(siFastify),
  linux: brand(siLinux),
  figma: brand(siFigma),

  scrum: brand(siScrumalliance),
  kanban: pictogram(SquareKanban),

  oracle: pictogram(Database),
  oracledb: pictogram(Database),

  redis: brand(siRedis),
  nestjs: brand(siNestjs),
  nest: brand(siNestjs),
  nextjs: brand(siNextdotjs),
  next: brand(siNextdotjs),
  graphql: brand(siGraphql),
  rabbitmq: brand(siRabbitmq),
  grafana: brand(siGrafana),
  prometheus: brand(siPrometheus),
  googlecloud: brand(siGooglecloud),
  gcp: brand(siGooglecloud),
  gitlab: brand(siGitlab),
  jenkins: brand(siJenkins),
  nginx: brand(siNginx),
  express: brand(siExpress),
  expressjs: brand(siExpress),
  php: brand(siPhp),
  laravel: brand(siLaravel),
  spring: brand(siSpring),
  springboot: brand(siSpringboot),
  dotnet: brand(siDotnet),
  net: brand(siDotnet),
  go: brand(siGo),
  golang: brand(siGo),
  rust: brand(siRust),
  flutter: brand(siFlutter),
  dart: brand(siDart),
  firebase: brand(siFirebase),
  supabase: brand(siSupabase),
  vercel: brand(siVercel),
  netlify: brand(siNetlify),
  svelte: brand(siSvelte),
  vite: brand(siVite),
  sass: brand(siSass),
  scss: brand(siSass),
  bootstrap: brand(siBootstrap),
  electron: brand(siElectron),
  deno: brand(siDeno),
  bun: brand(siBun),
  jest: brand(siJest),
  vitest: brand(siVitest),
  cypress: brand(siCypress),
  selenium: brand(siSelenium),
  sqlite: brand(siSqlite),
  mariadb: brand(siMariadb),
  elasticsearch: brand(siElasticsearch),
  elastic: brand(siElasticsearch),
  kafka: brand(siApachekafka),
  apachekafka: brand(siApachekafka),
  ansible: brand(siAnsible),
  helm: brand(siHelm),
  pandas: brand(siPandas),
  numpy: brand(siNumpy),
  tensorflow: brand(siTensorflow),
  pytorch: brand(siPytorch),
  jupyter: brand(siJupyter),
  swift: brand(siSwift),
  kotlin: brand(siKotlin),
};

function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9+]/g, '');
}

function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getTechIcon(skill: { name: string; icon: string | null }): TechIcon | null {
  if (skill.icon) {
    const byIcon = REGISTRY[normalize(skill.icon)];
    if (byIcon) return byIcon;
  }
  return REGISTRY[normalize(skill.name)] ?? null;
}

interface TechLogoProps {
  skill: { name: string; icon: string | null };
  className?: string;
}

export function TechLogo({ skill, className }: TechLogoProps) {
  const icon = getTechIcon(skill);

  if (!icon) return null;

  if (icon.kind === 'pictogram') {
    const Pictogram = icon.Component;
    return (
      <Pictogram aria-hidden="true" strokeWidth={1.8} className={`tech-logo size-5 shrink-0 ${className ?? ''}`} />
    );
  }

  const brandIsTooDark = hexLuminance(icon.hex) < 0.08;

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`tech-logo size-5 shrink-0 ${className ?? ''}`}
      style={brandIsTooDark ? undefined : ({ '--tech-brand': `#${icon.hex}` } as React.CSSProperties)}
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}
