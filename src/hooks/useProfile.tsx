import { useState, useEffect } from "react"
import { useAuth } from "./useAuth"
import { useToast } from "@/hooks/use-toast"
import { api as kitApi, API_URL } from "@/lib/api"

interface ProfileData {
  id: string
  user_id: string
  email: string
  full_name: string | null
  phone: string | null
  cpf: string | null
  photo_url: string | null
  user_type: 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      // Buscar usuário atual via /users/:id (mapeando para o shape usado pela UI)
      const access = localStorage.getItem('access_token')
      const u = await kitApi<any>(`/users/${user.id}`, {
        headers: access ? { Authorization: `Bearer ${access}` } : undefined,
      })
      const full_name = [u.nome, u.sobrenome].filter(Boolean).join(' ').trim()
      let avatarUrl = typeof u.avatar === 'string' ? u.avatar.trim().replace(/^@+/, '') : null
      // Se a URL for direta da R2, usar proxy do backend para exibir sem CORS
      if (avatarUrl && /(r2\.dev|r2\.cloudflarestorage\.com)/.test(avatarUrl)) {
        try {
          const parsed = new URL(avatarUrl)
          const key = parsed.pathname.replace(/^\/+/, '')
          avatarUrl = `${API_URL}/upload/file?key=${encodeURIComponent(key)}`
        } catch {}
      }
      const mapped: ProfileData = {
        id: u.id,
        user_id: u.id,
        email: u.email,
        full_name: full_name || null,
        phone: u.contato || null,
        cpf: null,
        photo_url: avatarUrl || null,
        user_type: 'admin',
        is_active: u.deleted === false,
        created_at: u.created_at || new Date().toISOString(),
        updated_at: u.updated_at || new Date().toISOString(),
      }
      setProfile(mapped)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user || !profile) return { error: 'Usuário não encontrado' }

    try {
      const access = localStorage.getItem('access_token')
      // Mapear campos para entidade users
      const body: any = {}
      if (updates.full_name !== undefined) {
        const parts = updates.full_name?.trim().split(' ') || []
        body.nome = parts.shift() || ''
        body.sobrenome = parts.join(' ') || ''
      }
      if (updates.phone !== undefined) body.contato = updates.phone
      if (updates.photo_url !== undefined) {
        const cleaned = (updates.photo_url ?? '').toString().trim().replace(/^@+/, '')
        body.avatar = cleaned
      }
      // CPF não existe na entidade users; ignorar
      body.updated_at = new Date().toISOString()

      const updated = await kitApi<any>(`/users/${user.id}`, {
        method: 'PATCH',
        body,
        headers: access ? { Authorization: `Bearer ${access}` } : undefined,
      })

      // Atualizar estado local com mapeamento
      setProfile(prev => prev ? {
        ...prev,
        full_name: updates.full_name !== undefined ? updates.full_name : prev.full_name,
        phone: updates.phone !== undefined ? updates.phone : prev.phone,
        photo_url: updates.photo_url !== undefined ? (updates.photo_url?.toString().trim().replace(/^@+/, '') || null) : prev.photo_url,
        updated_at: updated.updated_at || new Date().toISOString(),
      } : null)
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso"
      })

      return { error: null }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      })
      return { error }
    }
  }

  const uploadPhoto = async (file: File) => {
    if (!user) return { error: 'Usuário não encontrado' }

    try {
      // Mantemos o upload existente via Supabase mock (gera URL placeholder) e salvamos avatar no backend
      // Fallback simples: gerar uma URL local de preview (sem persistência de arquivo)
      const localUrl = URL.createObjectURL(file)
      const { error } = await updateProfile({ photo_url: localUrl })
      if (error) return { error }
      toast({ title: "Foto atualizada", description: "Sua foto de perfil foi alterada com sucesso" })
      return { error: null, url: localUrl }
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      })
      return { error }
    }
  }

  const updatePassword = async (_currentPassword: string, newPassword: string) => {
    try {
      const access = localStorage.getItem('access_token')
      await kitApi(`/users/${user?.id}`, {
        method: 'PATCH',
        body: { password: newPassword },
        headers: access ? { Authorization: `Bearer ${access}` } : undefined,
      })

      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso"
      })

      return { error: null }
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      })
      return { error }
    }
  }

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  return {
    profile,
    loading,
    updateProfile,
    uploadPhoto,
    updatePassword,
    refetch: fetchProfile
  }
}