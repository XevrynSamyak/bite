import { useEffect, useState, type FormEvent } from 'react'

export type User = { id: number; name: string; email: string }

// Calls the backend. In dev, Vite forwards /api to it (see vite.config.ts).
// Sends a POST when there's a body, a GET otherwise.
export async function api<T>(path: string, body?: object): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body && JSON.stringify(body),
  }).catch(() => null)
  const data = await response?.json().catch(() => null)
  if (!response?.ok || !data)
    throw new Error(data?.error ?? "Couldn't reach BITE. Check your connection and try again.")
  return data
}

// Sends a form's fields to the backend and calls onDone if it worked.
// Gives back the submit handler, the error message to show, and whether it's still waiting.
export function useApiForm(path: string, onDone: () => void) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api(path, Object.fromEntries(new FormData(event.currentTarget)))
      onDone()
    } catch (problem) {
      setError((problem as Error).message)
      setBusy(false)
    }
  }

  return { submit, error, busy }
}

// undefined while we're still asking, null when nobody is logged in
export function useUser() {
  const [user, setUser] = useState<User | null>()
  useEffect(() => {
    api<{ user: User | null }>('me').then(
      (data) => setUser(data.user),
      () => setUser(null),
    )
  }, [])
  return [user, setUser] as const
}
