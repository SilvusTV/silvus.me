# silvus.me

Projet **AdonisJS 7** unique (pas de sous-modules), avec **Inertia + React + Tailwind CSS**.

## Stack

- Backend + routing + API: AdonisJS 7
- UI SSR/hydratation: Inertia + React
- Style: Tailwind CSS
- Base de données: PostgreSQL
- Email: Resend

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run prod
npm run lint
npm run typecheck
```

## Migrations (Adonis Lucid)

Les tables sont definies avec des migrations Lucid TypeScript dans `database/migrations`.

```bash
node ace migration:run
```

Rollback:

```bash
node ace migration:rollback
```

## Variables d’environnement

Copier `.env.example` puis renseigner:

- `APP_KEY`
- `DATABASE_URL`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `RESEND_TO`

## Fonctionnalités incluses

- Pages Inertia: Intro, Portfolio, Journey, Blog index, Blog show, Contact, Admin Blog
- Endpoints API: portfolio, journey, blog, contact, admin blog
- Endpoints branchés sur PostgreSQL (plus d'état en mémoire)
- Seed automatique du contenu initial si la base est vide
- Contact branché sur Resend + log dans `contact_inquiries`
- CTA contextuel blog -> contact prérempli
- Base SQL: `portfolio_entries`, `blog_posts`, `contact_inquiries`

## PostgreSQL via Docker Compose

1. Copier `.env.example` vers `.env`.
2. Lancer PostgreSQL:

```bash
docker compose -f compose.yml up -d
```

3. Vérifier l'état:

```bash
docker compose -f compose.yml ps
```
