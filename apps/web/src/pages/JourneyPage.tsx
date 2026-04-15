import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiGet } from '../lib/api'

type JourneyPayload = {
  education: Array<{ school: string; program: string; level: string }>
  work: Array<{ company: string; role: string; summary: string }>
  creatorOps: { since: string; summary: string; ecosystems: string[] }
}

export default function JourneyPage() {
  const [journey, setJourney] = useState<JourneyPayload | null>(null)

  useEffect(() => {
    apiGet<JourneyPayload>('/api/journey').then(setJourney)
  }, [])

  if (!journey) {
    return <PageShell>Chargement…</PageShell>
  }

  return (
    <PageShell>
      <h1>Parcours</h1>

      <h2>Scolaire</h2>
      <ul>
        {journey.education.map((entry) => (
          <li key={`${entry.school}-${entry.level}`}>
            {entry.program} ({entry.level}) — {entry.school}
          </li>
        ))}
      </ul>

      <h2>Professionnel</h2>
      <ul>
        {journey.work.map((entry) => (
          <li key={entry.company}>
            <strong>{entry.company}</strong> — {entry.role}<br />
            {entry.summary}
          </li>
        ))}
      </ul>

      <h2>Streaming / créateurs</h2>
      <p>Depuis {journey.creatorOps.since}: {journey.creatorOps.summary}</p>
      <p>Écosystème: {journey.creatorOps.ecosystems.join(', ')}</p>
    </PageShell>
  )
}
