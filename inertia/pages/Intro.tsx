import { Link } from '@inertiajs/react'
import { PageShell } from '../components/PageShell'

export default function Intro() {
  return (
    <PageShell>
      <section className="grid gap-4">
        <h1 className="text-3xl font-semibold">Je construis des outils fiables pour le live et le produit.</h1>
        <p className="max-w-2xl text-zinc-300">
          Développeur fullstack, je transforme des besoins terrain en solutions claires, maintenables et efficaces.
        </p>
        <div className="flex gap-4 text-sm">
          <Link href="/portfolio">Voir le portfolio</Link>
          <Link href="/journey">Lire mon parcours</Link>
          <Link href="/contact">Me contacter</Link>
        </div>
      </section>
    </PageShell>
  )
}
