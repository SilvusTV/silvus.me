import { Head, Link } from '@inertiajs/react'
import { PageShell } from '../components/PageShell'

export default function Intro() {
  return (
    <PageShell>
      <Head title="Freelance Broadcast & Streaming Ops" />
      <section className="grid gap-6 rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
          Developpeur · Live Auditeur · Operateur vMix/OBS
        </p>
        <p className="text-sm text-slate-600">
          Hugo Combe · 23 ans
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
          Je rends le live fiable, lisible et exploitable.
        </h1>
        <p className="max-w-3xl text-slate-600">
          J’interviens entre technique et operationnel: setup stream, outillage sur mesure, support en conditions
          reelles et gestion des incidents sans casser le rythme du live.
        </p>

        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Focus #1</p>
            <p className="mt-1 text-slate-700">Diffusion live et fiabilisation des setups en event.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Focus #2</p>
            <p className="mt-1 text-slate-700">Developpement d’outils internes pour les equipes de production.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="font-mono text-xs uppercase tracking-wide text-slate-500">Focus #3</p>
            <p className="mt-1 text-slate-700">Accompagnement streamers et structures en freelance.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link className="dark-action rounded-full bg-slate-900 px-4 py-2 text-slate-50" href="/portfolio">
            Voir le portfolio
          </Link>
          <Link className="rounded-full border border-slate-300 px-4 py-2 text-slate-700" href="/journey">
            Lire mon parcours
          </Link>
          <Link className="rounded-full border border-slate-300 px-4 py-2 text-slate-700" href="/contact">
            Me contacter
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm sm:grid-cols-[1.35fr_1fr]">
        <div className="grid gap-3">
          <h2 className="text-2xl font-semibold text-slate-900">Terrain: regie, production, execution</h2>
          <p className="text-slate-600">
            Cette image represente ma facon de travailler: operationnel, reactivite, et exigence technique pour garder
            un live propre du debut a la fin.
          </p>
          <p className="text-sm text-slate-500">
            J’interviens sur le setup, la supervision, le cadrage et la coordination technique pour que les equipes et
            les talents restent focuses sur le contenu.
          </p>
        </div>
        <figure className="overflow-hidden rounded-2xl border border-slate-200">
          <img
            src="http://127.0.0.1:9000/silvus-assets/static/index-hero_personnal.png"
            alt="Hero Hugo Combe"
            className="h-full w-full object-cover"
          />
        </figure>
      </section>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900">Ce que je livre</h3>
          <p className="mt-2 text-sm text-slate-600">
            Des environnements stream stables, des outils orientés usage reel, et un support technique qui tient quand
            la pression monte.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900">Resultat attendu</h3>
          <p className="mt-2 text-sm text-slate-600">
            Moins d’imprevus, meilleure coordination, et une diffusion qui reste propre du top depart au clap de fin.
          </p>
        </article>
      </section>
    </PageShell>
  )
}
