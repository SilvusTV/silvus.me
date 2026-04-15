import { useMemo, useState } from 'react'
import { PageShell } from '../components/PageShell'

type ContactForm = {
  name: string
  email: string
  subject?: string
  message: string
  sourcePage?: string
  relatedPostSlug?: string
}

export default function Contact() {
  const query = useMemo(() => new URLSearchParams(window.location.search), [])
  const [status, setStatus] = useState('')
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: query.get('subject') || '',
    message: '',
    sourcePage: query.get('source') || 'contact',
    relatedPostSlug: query.get('post') || undefined
  })

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (!response.ok) {
      setStatus('Erreur pendant l’envoi. Réessaie dans un instant.')
      return
    }

    setStatus('Message envoyé. Je reviens vers toi rapidement.')
  }

  return (
    <PageShell>
      <h1 className="mb-2 text-2xl font-semibold">Contact</h1>
      <p className="mb-6 text-zinc-300">Besoin produit, live ou intégration custom ? Écris-moi ici.</p>

      <form onSubmit={onSubmit} className="grid max-w-xl gap-3">
        <input className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="Nom" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <input className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="Sujet" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
        <textarea className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2" placeholder="Message" rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
        <button className="rounded bg-zinc-100 px-4 py-2 text-zinc-900" type="submit">Envoyer</button>
      </form>

      {status ? <p className="mt-4 text-sm text-zinc-300">{status}</p> : null}

      <ul className="mt-6 space-y-1 text-sm">
        <li><a href="https://x.com" target="_blank" rel="noreferrer">Twitter / X</a></li>
        <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
        <li><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
      </ul>
    </PageShell>
  )
}
