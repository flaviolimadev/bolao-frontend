/*
HTTP client simples para integrar com o backend.
Lê a base URL de import.meta.env.VITE_API_BASE_URL e faz fallback silencioso quando não definido.
*/

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const RAW_API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL ?? undefined) as string | undefined
// Fallback opcional via localStorage para facilitar debug quando .env não é lido
let RUNTIME_BASE_URL: string | undefined
try { RUNTIME_BASE_URL = (typeof localStorage !== 'undefined' ? localStorage.getItem('API_BASE_URL') : null) || undefined } catch {}

const API_BASE_URL: string | undefined = (RAW_API_BASE_URL && RAW_API_BASE_URL.trim() !== ''
  ? RAW_API_BASE_URL.trim()
  : (RUNTIME_BASE_URL && RUNTIME_BASE_URL.trim() !== '' ? RUNTIME_BASE_URL.trim() : undefined))

// Debug: log base URL uma única vez no load do módulo
// eslint-disable-next-line no-console
console.debug('[API] Base URL =', API_BASE_URL, '(env:', RAW_API_BASE_URL, 'ls:', RUNTIME_BASE_URL, ')')

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const base = (API_BASE_URL || '').replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${base}${cleanPath}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, String(v)))
      } else {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

async function request<T>(method: HttpMethod, path: string, options?: {
  params?: Record<string, unknown>
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL não configurado no ambiente (.env)')
  }

  const { params, body, headers, signal } = options || {}
  const url = buildUrl(path, params)

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    // Não usar cookies; autenticação via Bearer facilita CORS
    // mode padrão é 'cors' quando cross-origin
  })

  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const data = isJson ? await res.json() : (await res.text() as unknown)

  if (!res.ok) {
    const message = typeof data === 'object' && data && 'message' in (data as any)
      ? (data as any).message
      : `HTTP ${res.status} ${res.statusText}`
    throw new Error(message)
  }

  return data as T
}

export const api = {
  isEnabled(): boolean {
    return typeof API_BASE_URL === 'string' && API_BASE_URL.length > 0
  },
  baseUrl(): string | undefined {
    return API_BASE_URL
  },
  get<T>(path: string, params?: Record<string, unknown>, init?: { headers?: Record<string, string>; signal?: AbortSignal }) {
    return request<T>('GET', path, { params, headers: init?.headers, signal: init?.signal })
  },
  post<T>(path: string, body?: unknown, init?: { params?: Record<string, unknown>; headers?: Record<string, string>; signal?: AbortSignal }) {
    return request<T>('POST', path, { params: init?.params, body, headers: init?.headers, signal: init?.signal })
  },
  put<T>(path: string, body?: unknown, init?: { params?: Record<string, unknown>; headers?: Record<string, string>; signal?: AbortSignal }) {
    return request<T>('PUT', path, { params: init?.params, body, headers: init?.headers, signal: init?.signal })
  },
  patch<T>(path: string, body?: unknown, init?: { params?: Record<string, unknown>; headers?: Record<string, string>; signal?: AbortSignal }) {
    return request<T>('PATCH', path, { params: init?.params, body, headers: init?.headers, signal: init?.signal })
  },
  delete<T>(path: string, params?: Record<string, unknown>, init?: { headers?: Record<string, string>; signal?: AbortSignal }) {
    return request<T>('DELETE', path, { params, headers: init?.headers, signal: init?.signal })
  },
}


