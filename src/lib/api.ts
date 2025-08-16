// Fonte principal: valor injetado no build pelo Vite
const ENV_API_URL = ((import.meta as any)?.env?.VITE_API_URL ?? undefined) as string | undefined

// Fallbacks em runtime para cenários onde o build não recebeu a variável
let RUNTIME_API_URL: string | undefined
try {
	RUNTIME_API_URL = (typeof localStorage !== 'undefined' ? localStorage.getItem('API_BASE_URL') : null) || undefined
} catch {}

// Fallback opcional via variável global (pode ser definida via script externo)
const GLOBAL_API_URL = (typeof window !== 'undefined' ? (window as any).__VITE_API_URL : undefined) as string | undefined

// Escolher a primeira opção válida
const RESOLVED_API_URL: string = [ENV_API_URL, GLOBAL_API_URL, RUNTIME_API_URL]
	.map(v => (typeof v === 'string' ? v.trim() : undefined))
	.find(v => !!v) || ''

export const API_URL: string = RESOLVED_API_URL

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

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
	
	const url = `${API_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
	
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


