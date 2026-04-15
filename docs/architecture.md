# Architecture cible (AdonisJS 7 unique)

## Principe

Le projet est maintenant un **seul app AdonisJS 7** (pas de sous-modules). Inertia + React + Tailwind vivent dans la même codebase.

## Structure

```text
app/
  controllers/http/
  services/
  validators/
start/
  routes.ts
inertia/
  app.tsx
  components/
  pages/
resources/
  css/app.css
config/
  inertia.ts
database/
  migrations/
```

## Flux applicatif

- Pages UI rendues via Inertia (`Intro`, `Portfolio`, `Journey`, `Blog`, `Contact`, `Admin Blog`).
- Endpoints API Adonis pour portfolio/journey/blog/contact/admin.
- Contact transmis via Resend.
- CTA en bas d’article vers contact prérempli.

## Styling

Tailwind est branché via `resources/css/app.css`, `tailwind.config.js`, `postcss.config.js` et `vite.config.ts`.
