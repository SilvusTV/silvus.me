export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' })
}

export async function apiSend<T>(path: string, method: 'POST' | 'PATCH' | 'DELETE', body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function apiSendForm<T>(path: string, method: 'POST' | 'PATCH', body: FormData): Promise<T> {
  return apiRequest<T>(path, {
    method,
    body,
  })
}

async function apiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
  })

  if (!response.ok) {
    if (response.status === 401 && path.startsWith('/api/admin')) {
      window.location.href = '/admin/login'
    }

    let message = `${init.method || 'GET'} ${path} failed`
    try {
      const payload = (await response.json()) as { message?: string }
      if (payload.message) {
        message = payload.message
      }
    } catch {
      // Ignore JSON parsing errors on non-JSON responses.
    }

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}
