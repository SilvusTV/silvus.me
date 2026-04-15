import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'

type Entry = { title: string; summary: string; highlighted: boolean }

export default function Portfolio() {
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    fetch('/api/portfolio')
      .then((response) => response.json())
      .then((payload) => setEntries(payload.entries))
  }, [])

  return (
    <PageShell>
      <h1 className="mb-2 text-2xl font-semibold">Portfolio</h1>
      <p className="mb-6 text-zinc-300">Projets et événements clés sur le produit et le broadcast.</p>
      <ul className="grid gap-3">
        {entries.map((entry) => (
          <li key={entry.title} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="font-medium">{entry.title}</p>
            <p className="text-sm text-zinc-300">{entry.summary}</p>
            {entry.highlighted ? <span className="text-xs text-emerald-400">highlight</span> : null}
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
