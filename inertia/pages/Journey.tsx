import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiGet } from '../lib/api'

type JourneyData = {
  educationSummary: { school: string; currentLevel: string; specialization: string; yearsCompleted: number }
  education: Array<{ period: string; school: string; program: string; level: string; details: string }>
  work: Array<{ period: string; company: string; companyUrl?: string; role: string; summary: string }>
  freelance: { period: string; title: string; summary: string }
}

export default function Journey() {
  const [data, setData] = useState<JourneyData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    apiGet<JourneyData>('/api/journey')
      .then((payload) => {
        if (!active) return
        setData(payload)
      })
      .catch(() => {
        if (!active) return
        setError('Impossible de charger le parcours pour le moment.')
      })

    return () => {
      active = false
    }
  }, [])

  if (!data && !error) return <PageShell>Chargement...</PageShell>

  return (
    <PageShell>
      <Head title="Parcours" />
      <h1 className="mb-3 text-3xl font-semibold text-slate-900">Parcours</h1>
      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</p> : null}

      {data ? (
        <section className="grid gap-6">
          <p className="max-w-3xl rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-slate-600 shadow-sm">
            Actuellement en {data.educationSummary.currentLevel} a {data.educationSummary.school}, specialisation{' '}
            {data.educationSummary.specialization}. Je suis dans ma {data.educationSummary.yearsCompleted}e annee
            post-bac.
          </p>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-medium text-slate-900">Scolaire</h2>
            <ul className="grid gap-3">
              {data.education.map((item) => (
                <li key={`${item.school}-${item.level}`} className="text-slate-600">
                  <p className="font-medium text-slate-900">
                    {item.program} ({item.level})
                  </p>
                  <p>{item.school} · {item.period}</p>
                  <p className="text-sm text-slate-500">{item.details}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-medium text-slate-900">Professionnel</h2>
            <ul className="grid gap-4">
              {data.work.map((item) => (
                <li key={item.company} className="text-slate-600">
                  <p className="font-medium text-slate-900">
                    {item.companyUrl ? (
                      <a href={item.companyUrl} target="_blank" rel="noreferrer" className="underline">
                        {item.company}
                      </a>
                    ) : (
                      item.company
                    )}{' '}
                    · {item.role}
                  </p>
                  <p className="text-sm text-slate-500">{item.period}</p>
                  <p>{item.summary}</p>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="font-medium text-slate-900">
                {data.freelance.title} · {data.freelance.period}
              </p>
              <p className="mt-1 text-sm text-slate-600">{data.freelance.summary}</p>
            </div>
          </section>
        </section>
      ) : null}
    </PageShell>
  )
}
