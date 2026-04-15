# silvus.me

Monorepo pour un site personnel/portfolio orienté **développement** et **broadcast**.

## Stack

- **Backend**: AdonisJS (structure API + routes/controllers/validators)
- **Frontend**: Inertia + React
- **DB**: PostgreSQL
- **Email**: Resend
- **Monorepo**: npm workspaces

## Structure

```text
apps/
  api/
    app/
    config/
    database/
    start/
  web/
    src/
    vite.config.ts

db/
  schema.sql

docs/
  product-brief.md
  architecture.md
```

## Fonctionnalités livrées (MVP)

- Pages Intro, Portfolio, Parcours, Blog index, Blog détail, Contact, Admin blog.
- API endpoints pour portfolio, parcours, blog, contact, admin blog.
- Formulaire de contact branché sur Resend (appel HTTP API Resend).
- CTA contextuel en bas d’article blog vers `/contact` prérempli.
- Schéma SQL initial pour portfolio/blog/contact.

## Variables d’environnement

Copier `.env.example` et renseigner:

- `DATABASE_URL`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `RESEND_TO`
- `VITE_API_BASE_URL`

## Scripts

```bash
# Développement complet (API + Web)
npm run dev

# Build production
npm run build

# Lancement production (API + Web preview)
npm run start

# Pipeline complet build + start
npm run prod

npm run lint
npm run typecheck
```

> L’environnement de cette tâche n’autorise pas l’installation npm des dépendances Adonis/React. Le code est prêt à être branché dès que l’accès registre est disponible.
