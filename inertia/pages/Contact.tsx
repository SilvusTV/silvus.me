import { Head } from '@inertiajs/react'
import { useMemo, useState, type FormEvent } from 'react'
import { PageShell } from '../components/PageShell'
import { apiSend } from '../lib/api'

type ContactForm = {
  name: string
  email: string
  subject?: string
  message: string
  sourcePage?: string
  relatedPostSlug?: string
}

export default function Contact() {
  const query = useMemo(
    () => new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search),
    []
  )
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: query.get('subject') || '',
    message: query.get('post') ? `Bonjour, je te contacte au sujet de l article "${query.get('post')}".` : '',
    sourcePage: query.get('source') || 'contact',
    relatedPostSlug: query.get('post') || undefined
  })

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')

    try {
      await apiSend('/api/contact', 'POST', form)
      setStatus('Message envoye. Je reviens vers toi rapidement.')
      setForm((current) => ({
        ...current,
        message: '',
        subject: current.relatedPostSlug ? current.subject : ''
      }))
    } catch {
      setStatus('Erreur pendant l envoi. Reessaie dans un instant.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <Head title="Contact" />
      <section className="mb-6 grid gap-2">
        <h1 className="text-3xl font-semibold text-slate-900">Contact</h1>
        <p className="max-w-2xl text-slate-600">
          Besoin produit, live ou integration custom. Donne-moi ton contexte, je te reponds rapidement.
        </p>
      </section>

      <form onSubmit={onSubmit} className="grid max-w-2xl gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
        <input
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800"
          placeholder="Nom"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <input
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <input
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800"
          placeholder="Sujet ou contexte (optionnel)"
          value={form.subject}
          onChange={(event) => setForm({ ...form, subject: event.target.value })}
        />
        <textarea
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800"
          placeholder="Message"
          rows={7}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          required
        />
        <button className="dark-action w-fit rounded-full bg-slate-900 px-5 py-2 text-slate-50 disabled:opacity-60" disabled={submitting} type="submit">
          {submitting ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>

      {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}

      <ul className="mt-6 grid gap-2 text-sm text-slate-700">
        <li>
          <a className="underline" href="https://x.com/silvus_tv" target="_blank" rel="noreferrer">
            Twitter / X
          </a>
        </li>
        <li>
          <a className="underline" href="https://www.instagram.com/silvus_tv/" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </li>
        <li>
          <a className="underline" href="https://www.linkedin.com/in/cmbhugo/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </li>
      </ul>
    </PageShell>
  )
}
