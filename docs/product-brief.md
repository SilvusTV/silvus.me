# Product brief — silvus.me

## 1) Objectif global

Créer un site personnel / portfolio qui présente clairement :

- identité et positionnement,
- compétences,
- parcours scolaire et professionnel,
- projets marquants,
- articles de retour d’expérience (incluant Binance),
- canal de contact professionnel.

Le rendu attendu : **soft, épuré, crédible, non-générique**, avec une identité dev + broadcast.

## 2) Positionnement éditorial

Ton attendu :

- direct,
- humain,
- concret,
- orienté action / impact,
- sans formulations scolaires ou pompeuses.

Exemples de tonalité :

- “Je construis des outils fiables pour le live et le produit.”
- “Je transforme des besoins terrain en solutions claires, maintenables et efficaces.”

## 3) Stack technique

- Monorepo
- Backend: AdonisJS
- Frontend: Inertia + React
- DB SQL (PostgreSQL recommandé)
- API calls via `fetch`
- Email via Resend

## 4) Pages demandées

### Intro

Objectifs :

- présenter le profil rapidement,
- expliciter la double compétence dev + broadcast,
- proposer des CTA vers Portfolio / Parcours / Contact.

### Portfolio

Objectifs :

- montrer les projets, événements et contributions clés.

Entrées explicitement demandées :

- GBA Explorer
- Humanity (2 équipes)
- Z Event
- Kick League
- Suite stream :
  - stream remote
  - stream widget
  - stream relay
  - stream backbone

### Parcours (Journey)

Scolaire :

- ESGI Aix-en-Provence (tout le post-bac)
- 4e année actuelle
- 3e année : Bachelor Ingénierie du Web
- Master actuel : Architecture Logicielle (M1)

Professionnel :

- Kamai (3 premières années en alternance), rôle Product Engineer
- All Broadcast (depuis septembre 2025), dev d’outils internes/externes

Créateurs / streaming :

- activité depuis avril 2022 (cohérent avec “depuis 18 ans”),
- dev & maintenance d’outils stream,
- écosystème OBS / Streamlabs / StreamElements.

### Contact

Fonctions :

- formulaire (nom, email, message, sujet/contexte optionnel),
- liens Twitter/X, Instagram, LinkedIn,
- envoi via Resend.

### Blog

Fonctions :

- liste des articles,
- page détail,
- backoffice de création,
- bloc Binance optionnel et soigné visuellement.

Structure type d’article :

1. contexte
2. ce qui a été fait
3. comment
4. pourquoi
5. résultat

Bas d’article :

- CTA “Me contacter à propos de ce projet”
- redirection vers formulaire de contact prérempli selon l’article.

## 5) Modèle de données minimal

### `portfolio_entries`

- `id`
- `type` (`project` | `event` | `experience` | `skill`)
- `title`
- `summary`
- `context`
- `stack`
- `impact_metrics`
- `start_date`
- `end_date`
- `highlighted`
- `sort_order`
- timestamps

### `blog_posts`

- `id`
- `title`
- `slug`
- `excerpt`
- `content`
- `tags`
- `published_at`
- `binance_symbol` (optionnel)
- `binance_embed_url` (optionnel)
- timestamps

### `contact_inquiries` (optionnel mais recommandé)

- `id`
- `name`
- `email`
- `subject`
- `message`
- `source_page`
- `related_post_slug`
- `sent_at`
- `status`
- timestamps

## 6) Checklist de démarrage

1. Initialiser le monorepo Adonis + Inertia React.
2. Configurer la DB SQL.
3. Configurer Resend.
4. Créer les pages Intro / Portfolio / Journey / Contact / Blog index / Blog show / Admin blog.
5. Créer modèles et migrations portfolio/blog.
6. Exposer les endpoints API et consommer côté front avec `fetch`.
7. Implémenter le formulaire de contact + CTA contextuel depuis les articles.
8. Ajouter les contenus réels.
9. Faire une passe de réécriture éditoriale pour garder une voix naturelle.
