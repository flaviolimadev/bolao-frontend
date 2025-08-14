export const API_URL = import.meta.env.VITE_API_URL as string

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export async function api<T = any>(path: string, options: {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  authToken?: string | null
  timeoutMs?: number
} = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('VITE_API_URL não configurado')
  }
  
  const url = `${API_URL}${path}`
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }
  if (options.authToken) {
    headers['Authorization'] = `Bearer ${options.authToken}`
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000)
  
  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
    signal: controller.signal,
  })
  clearTimeout(timeout)

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const message = isJson && (data as any)?.message ? (data as any).message : res.statusText
    const error: any = new Error(message || 'Erro na requisição')
    error.status = res.status
    error.data = isJson ? data : undefined
    throw error
  }

  return data as T
}


