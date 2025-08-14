import { useState, useEffect, createContext, useContext, ReactNode } from "react"
// Tipos simples locais para não depender do supabase-js
type User = { id: string; email?: string | null }
type Session = { user: User } | null
import { supabase } from "@/integrations/supabase/client"
import { api as kitApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any, unverifiedUserId?: string }>
  signUp: (data: { nome: string; sobrenome: string; email: string; contato: string; password: string }) => Promise<{ error: any, userId?: string }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()

  // Helpers para tokens quando usando API real
  const readTokens = () => ({
    access: localStorage.getItem('access_token') || null,
    refresh: localStorage.getItem('refresh_token') || null,
  })
  const writeTokens = (access: string, refresh: string) => {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }
  const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  useEffect(() => {
    try {
      const { access } = readTokens()
      if (!access) { setLoading(false); return }
      ;(async () => {
        try {
          const me = await kitApi<{ id: string; email: string }>(
            '/auth/me', { headers: { Authorization: `Bearer ${access}` } }
          )
          setUser({ id: me.id, email: me.email })
          setSession({ user: { id: me.id, email: me.email } })
          setIsAdmin(true)
        } catch {
          clearTokens()
          setUser(null); setSession(null); setIsAdmin(false)
        } finally {
          setLoading(false)
        }
      })()
    } catch { setLoading(false) }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      try {
        const res = await kitApi<{ access_token: string; refresh_token: string }>(
          '/auth/login', { method: 'POST', body: { email, password } }
        )
          writeTokens(res.access_token, res.refresh_token)
          const me = await kitApi<{ id: string; email: string }>(
            '/auth/me', { headers: { Authorization: `Bearer ${res.access_token}` } }
          )
          setUser({ id: me.id, email: me.email })
          setSession({ user: { id: me.id, email: me.email } })
          setIsAdmin(true)
          return { error: null }
      } catch (e: any) {
        // Se o backend retornou 401 com userId (email não verificado), redirecionar para verificação
        if (e?.status === 401 && e?.data?.userId) {
          toast({ title: 'Email não verificado', description: 'Verifique seu e-mail para concluir o acesso.' })
          try { localStorage.setItem('pending_user_id', e.data.userId) } catch {}
          return { error: e, unverifiedUserId: e.data.userId }
        }
        const msg = e?.message || 'Falha no login'
        toast({ title: 'Erro no login', description: msg, variant: 'destructive' })
        return { error: e }
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      })
      return { error }
    }
  }

  const signUp = async (data: { nome: string; sobrenome: string; email: string; contato: string; password: string }) => {
    try {
      try {
        const res = await kitApi<{ id: string }>(
          '/users', { method: 'POST', body: data }
        )
          toast({ title: 'Cadastro realizado', description: 'Verifique seu e-mail para confirmar a conta' })
          return { error: null, userId: res?.id }
      } catch (e: any) {
        const msg = e?.message || 'Falha no cadastro'
        toast({ title: 'Erro no cadastro', description: msg, variant: 'destructive' })
        return { error: e }
      }
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      })
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const access = localStorage.getItem('access_token')
      if (access) {
        try { await kitApi('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${access}` } }) } catch {}
      }
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null); setSession(null); setIsAdmin(false)
        toast({ title: 'Logout realizado', description: 'Você foi desconectado com sucesso' })
      return
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}