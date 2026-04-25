import { useState, type FormEvent } from 'react'
import { PageShell } from '../components/PageShell'
import { ApiError, apiSend } from '../lib/api'

export default function AdminLogin() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setStatus('')

    try {
      await apiSend<{ authenticated: boolean }>('/api/admin/auth/login', 'POST', { login, password })
      window.location.href = '/admin'
    } catch (error) {
      if (error instanceof ApiError) {
        setStatus(error.message)
      } else {
        setStatus('Connexion admin impossible.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Connexion Backoffice</h1>
        <p className="mt-2 text-sm text-slate-600">Acces reserve au compte configure dans les variables d environnement.</p>

        <form className="mt-5 grid gap-3" onSubmit={submit}>
          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            placeholder="Login"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            required
            autoComplete="username"
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2"
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="dark-action w-fit rounded-full bg-slate-900 px-5 py-2 text-slate-50 disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {status ? <p className="mt-4 text-sm text-rose-700">{status}</p> : null}
      </section>
    </PageShell>
  )
}
