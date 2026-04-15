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
- Contact branché sur Resend
- CTA contextuel blog -> contact prérempli
- Base SQL: `portfolio_entries`, `blog_posts`, `contact_inquiries`
