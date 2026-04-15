import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'

type JourneyData = {
  education: Array<{ school: string; program: string; level: string }>
  work: Array<{ company: string; role: string; summary: string }>
  creatorOps: { since: string; summary: string; ecosystems: string[] }
}

export default function Journey() {
  const [data, setData] = useState<JourneyData | null>(null)

  useEffect(() => {
    fetch('/api/journey')
      .then((response) => response.json())
      .then(setData)
  }, [])

  if (!data) return <PageShell>Chargement…</PageShell>

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-semibold">Parcours</h1>
      <h2 className="mt-4 font-medium">Scolaire</h2>
      <ul className="list-disc pl-6 text-zinc-300">
        {data.education.map((item) => (
          <li key={`${item.school}-${item.level}`}>{item.program} ({item.level}) — {item.school}</li>
        ))}
      </ul>

      <h2 className="mt-6 font-medium">Professionnel</h2>
      <ul className="list-disc pl-6 text-zinc-300">
        {data.work.map((item) => (
          <li key={item.company}><strong>{item.company}</strong> — {item.role} · {item.summary}</li>
        ))}
      </ul>

      <h2 className="mt-6 font-medium">Streaming</h2>
      <p className="text-zinc-300">Depuis {data.creatorOps.since}: {data.creatorOps.summary}</p>
    </PageShell>
  )
}
