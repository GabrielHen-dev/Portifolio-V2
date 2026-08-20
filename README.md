# Portfólio — Gabriel Henrique

Site pessoal com painel administrativo privado. O conteúdo (tecnologias, projetos, trajetória e textos)
é editado pelo painel e aparece no site sem novo deploy.

## Stack

| Camada | Tecnologias |
|---|---|
| Front | Vite 6, React 19, TypeScript, Tailwind CSS v4, Motion, Matter.js, React Three Fiber |
| API | Node 22, Fastify 5, TypeScript, Drizzle ORM |
| Banco | PostgreSQL 17 |
| Infra | Docker multi-stage, nginx, docker compose |

## Subir pela primeira vez

```bash
cp .env.example .env
```

Preencha o `.env`. Gere cada segredo com:

```bash
openssl rand -base64 32
```

- `SESSION_SECRET` — 32+ caracteres, assina o cookie de sessão
- `ENCRYPTION_KEY` — **exatamente 64 caracteres hex** (`openssl rand -hex 32`), cifra o segredo do 2FA
- `POSTGRES_PASSWORD` — senha do banco
- `PUBLIC_ORIGIN` — a URL pública exata, ex.: `https://seudominio.com`

> Se perder a `ENCRYPTION_KEY`, os códigos do 2FA param de funcionar e você precisa recriar o admin.
> Guarde junto com o backup do banco.

Depois, crie uma vez a rede que o `web` compartilha com o Traefik do Dokploy (no servidor ela já
existe; na sua máquina não):

```bash
docker network create dokploy-network
```

E suba a stack:

```bash
docker compose up --build -d
```

Popule o banco com os dados do currículo (só faz efeito se estiver vazio):

```bash
docker compose exec api npm run seed
```

Crie seu acesso ao painel:

```bash
docker compose exec api npm run admin:create
```

O comando pede e-mail e senha, mostra um QR code para escanear no Google Authenticator/Authy e imprime
**8 códigos de recuperação**. Guarde-os fora do computador — eles não são exibidos de novo e são a única
saída se você perder o celular.

Pronto: o site fica em `http://localhost:8080` e o painel em `http://localhost:8080/admin`.

## Desenvolvimento

Suba só o banco e rode API e front localmente:

```bash
docker compose up db -d
```

```bash
cd api && npm install && npm run dev
```

```bash
cd web && npm install && npm run dev
```

O Vite (`:5173`) repassa `/api` para a API (`:3000`), então o navegador enxerga tudo na mesma origem —
sem isso o cookie `SameSite=Strict` não seria enviado.

Em desenvolvimento local sem HTTPS, deixe `COOKIE_SECURE=false` no `.env`.

## Segurança

| Medida | Como |
|---|---|
| Senha | Argon2id (19 MiB, 2 iterações) — parâmetros OWASP |
| Segundo fator | TOTP obrigatório, com contador anti-replay |
| Segredo do 2FA | Cifrado com AES-256-GCM; um dump do banco não gera códigos |
| Sessão | Token opaco de 32 bytes, guardado como SHA-256 — revogável na hora |
| Cookie | `httpOnly`, `Secure`, `SameSite=Strict`, prefixo `__Host-` |
| CSRF | `SameSite=Strict` + validação do header `Origin` em toda escrita |
| Força bruta | 5 tentativas/15 min por IP + bloqueio progressivo da conta |
| Upload | Tipo real conferido pelos magic bytes, nunca pela extensão |
| Cadastro | Não existe rota HTTP — o admin só nasce pelo CLI dentro do container |
| Banco | Sem porta publicada; alcançável só pela rede interna do compose |
| Containers | Ambos rodam como usuário não-root |
| Auditoria | Toda escrita registra ação, IP e horário em `audit_logs` |

## Estrutura

```
api/src/
├── domain/          Entidades, value objects, políticas — regra de negócio pura, sem I/O
│   ├── identity/    AdminUser, Session, Email, PlainPassword, LockoutPolicy
│   └── portfolio/   Skill, Project, TimelineEntry, MediaAsset, LocalizedText, Slug
├── application/     Casos de uso — orquestram domínio + repositórios
├── infrastructure/  Adaptadores: Drizzle, Argon2, otplib, AES, disco
├── interfaces/http/ Fastify: rotas, middlewares, schemas Zod, presenters
├── shared/errors/   Erros de domínio (o domínio nunca conhece HTTP)
└── container.ts     Composition root — único lugar que conhece as implementações

web/src/
├── app/             Providers e rotas
├── features/
│   ├── portfolio/   Site público: seções, fx, física, 3D, janelas
│   └── admin/       Painel: login 2FA, layout, 5 painéis de edição
└── shared/          Tema, i18n, hooks, UI, cliente HTTP
```

O domínio não importa Fastify, Drizzle nem Argon2 — só as interfaces que ele mesmo declara
(`domain/identity/services/security-ports.ts`). Trocar Postgres por outro banco, ou Argon2 por outro
algoritmo, é escrever um adaptador novo sem tocar em regra de negócio.

## Comandos úteis

```bash
docker compose logs -f api
```

```bash
docker compose exec db pg_dump -U portfolio portfolio > backup.sql
```

```bash
docker compose exec api npm run admin:create
```

## Deploy no seu servidor

O deploy roda no Dokploy. Em produção o `web` não publica porta: ele entra na rede externa
`dokploy-network`, onde o Traefik do Dokploy o alcança. O domínio é cadastrado na aba **Domains**
do app (serviço `web`, porta `8080`) e os labels do Traefik são injetados no deploy — não os
adicione no compose. As variáveis do `.env` vão na aba **Environment**.

Na sua máquina, o `docker-compose.override.yml` publica a porta `8080` para teste local; o Dokploy
ignora esse arquivo porque roda o compose com `-f docker-compose.yml` explícito.

Confira antes de expor:

- [ ] `COOKIE_SECURE=true`
- [ ] `PUBLIC_ORIGIN` com o domínio real e `https://`
- [ ] `TRUST_PROXY=true`
- [ ] Domínio cadastrado em **Domains**, apontando para `web:8080`
- [ ] Segredos regenerados na aba **Environment** (não reaproveite os de desenvolvimento)
- [ ] Backup do banco agendado
