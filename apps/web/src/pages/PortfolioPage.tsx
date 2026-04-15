import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiGet } from '../lib/api'

type PortfolioEntry = {
  type: 'project' | 'event' | 'experience' | 'skill'
  title: string
  summary: string
  highlighted: boolean
}

export default function PortfolioPage() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([])

  useEffect(() => {
    apiGet<{ entries: PortfolioEntry[] }>('/api/portfolio').then((data) => setEntries(data.entries))
  }, [])

  return (
    <PageShell>
      <h1>Portfolio</h1>
      <p>Projets, événements et contributions qui montrent ma polyvalence dev + broadcast.</p>

      <ul style={{ display: 'grid', gap: '0.9rem', padding: 0, listStyle: 'none' }}>
        {entries.map((entry) => (
          <li key={entry.title} style={{ border: '1px solid #ddd', borderRadius: 12, padding: '1rem' }}>
            <strong>{entry.title}</strong> {entry.highlighted ? '• highlight' : null}
            <p style={{ marginBottom: 0 }}>{entry.summary}</p>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
