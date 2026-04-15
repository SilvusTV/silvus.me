import { useMemo, useState } from 'react'
import { PageShell } from '../components/PageShell'
import { apiPost } from '../lib/api'

type ContactPayload = {
  name: string
  email: string
  subject?: string
  message: string
  sourcePage?: string
  relatedPostSlug?: string
}

export default function ContactPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])

  const [form, setForm] = useState<ContactPayload>({
    name: '',
    email: '',
    subject: params.get('subject') || '',
    message: '',
    sourcePage: params.get('source') || 'contact',
    relatedPostSlug: params.get('post') || undefined
  })
  const [status, setStatus] = useState<string>('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    await apiPost('/api/contact', form)
    setStatus('Message envoyé. Merci, je te réponds vite.')
  }

  return (
    <PageShell>
      <h1>Contact</h1>
      <p>Tu peux me contacter pour un besoin produit, live ou intégration sur mesure.</p>

      <form onSubmit={submit} style={{ display: 'grid', gap: '0.75rem', maxWidth: 520 }}>
        <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Sujet" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <textarea placeholder="Message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
        <button type="submit">Envoyer</button>
      </form>

      {status ? <p>{status}</p> : null}

      <ul>
        <li><a href="https://x.com" target="_blank" rel="noreferrer">Twitter / X</a></li>
        <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
        <li><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
      </ul>
    </PageShell>
  )
}
