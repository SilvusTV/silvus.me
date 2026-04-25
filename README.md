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
- `ADMIN_LOGIN`
- `ADMIN_PASSWORD`
- `S3_ENDPOINT`
- `S3_PORT`
- `S3_USE_SSL`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_BUCKET`
- `S3_REGION`
- `S3_PUBLIC_URL`

## Fonctionnalités incluses

- Pages Inertia: Intro, Portfolio, Journey, Blog index/show, Contact, Backoffice admin
- Endpoints API: portfolio, journey, blog, contact, admin (auth + blog + portfolio + s3)
- Endpoints branchés sur PostgreSQL (plus d'état en mémoire)
- Seed automatique du contenu initial si la base est vide
- Contact branché sur Resend + log dans `contact_inquiries`
- CTA contextuel blog -> contact prérempli
- Base SQL: `portfolio_entries`, `blog_posts`, `contact_inquiries`
- Backoffice protégé par login/mot de passe depuis `.env`
- Gestion S3 compatible via MinIO dans Docker Compose

## PostgreSQL via Docker Compose

1. Copier `.env.example` vers `.env`.
2. Lancer PostgreSQL + MinIO:

```bash
docker compose -f compose.yml up -d
```

3. Vérifier l'état:

```bash
docker compose -f compose.yml ps
```

4. Accès MinIO:

- API S3: `http://localhost:9000`
- Console MinIO: `http://localhost:9001`

5. Backoffice:

- Login: `http://localhost:3333/admin/login`
