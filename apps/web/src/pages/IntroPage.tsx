import { Link } from '@inertiajs/react'
import { PageShell } from '../components/PageShell'

export default function IntroPage() {
  return (
    <PageShell>
      <section style={{ display: 'grid', gap: '1rem' }}>
        <h1>Je construis des outils fiables pour le live et le produit.</h1>
        <p>
          Développeur fullstack, je travaille à l’intersection du logiciel, des opérations broadcast et des besoins terrain.
          L’objectif reste simple: des systèmes lisibles, maintenables et utiles en situation réelle.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/portfolio">Voir le portfolio</Link>
          <Link href="/journey">Lire mon parcours</Link>
          <Link href="/contact">Me contacter</Link>
        </div>
      </section>
    </PageShell>
  )
}
