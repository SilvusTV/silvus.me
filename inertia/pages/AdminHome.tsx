import { Link } from '@inertiajs/react'
import { AdminShell } from '../components/AdminShell'

const modules = [
  {
    href: '/admin/blog',
    title: 'Blogs',
    description: 'Creer, modifier et supprimer les articles.',
  },
  {
    href: '/admin/portfolio',
    title: 'Projets',
    description: 'Mettre a jour les fiches portfolio et leur contenu riche.',
  },
  {
    href: '/admin/s3',
    title: 'S3 / MinIO',
    description: 'Uploader, lister et supprimer les assets.',
  },
]

export default function AdminHome() {
  return (
    <AdminShell>
      <section className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          >
            <h2 className="text-lg font-semibold text-slate-900">{module.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{module.description}</p>
          </Link>
        ))}
      </section>
    </AdminShell>
  )
}
