# Architecture cible (proposition)

## Monorepo

```text
/apps
  /web            # UI React + Inertia pages
  /api            # AdonisJS backend
 /packages
  /ui             # composants partagés (optionnel)
  /config         # config partagée (eslint, tsconfig)
/db
  schema.sql
/docs
  product-brief.md
  architecture.md
```

## Backend (AdonisJS)

Responsabilités :

- servir les pages Inertia,
- exposer les endpoints JSON pour actions async,
- gérer validation,
- persister en base SQL,
- orchestrer l’envoi d’emails via Resend,
- alimenter le backoffice blog.

## Frontend (Inertia + React)

Responsabilités :

- rendu des pages principales,
- appels API via `fetch`,
- états de chargement et erreurs explicites,
- UI cohérente et lisible.

## API (exemple de routes)

- `GET /api/portfolio`
- `GET /api/journey`
- `GET /api/blog`
- `GET /api/blog/:slug`
- `POST /api/contact`
- `POST /api/admin/blog`
- `PATCH /api/admin/blog/:id`

## Contact / Resend

Flux recommandé :

1. validation serveur,
2. journalisation en DB (`contact_inquiries`),
3. envoi via Resend,
4. réponse utilisateur claire.

## Blog + CTA contextuel

Sur chaque article :

- bouton “Me contacter à propos de ce projet”,
- lien prérempli vers `/contact?source=blog&post=<slug>&subject=<title>`.

## Design principles

- composition simple,
- rythme visuel respirant,
- micro-interactions discrètes,
- identité technique + live operations,
- pas d’encombrement inutile.
