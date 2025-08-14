import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { api as kitApi } from "@/lib/api"

type Revendedor = {
  id: string
  user_id: string
  nome: string
  contato?: string | null
  email?: string | null
  is_active: boolean
  photo_url?: string | null
  created_at: string
  updated_at: string
}
type RevendedorInsert = Omit<Revendedor, 'id' | 'user_id' | 'created_at' | 'updated_at'>
type RevendedorUpdate = Partial<RevendedorInsert>

export function useRevendedores() {
  const [revendedores, setRevendedores] = useState<Revendedor[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const authHeaders = () => {
    const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
    return access ? { Authorization: `Bearer ${access}` } : undefined
  }

  const fetchRevendedores = async () => {
    try {
      setLoading(true)
      const data = await kitApi<Revendedor[]>(`/revendedores`, { headers: authHeaders() })
      setRevendedores(data || [])
    } catch (error) {
      console.error("Error fetching revendedores:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os revendedores",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createRevendedor = async (data: any) => {
    try {
      const body = {
        nome: data?.name ?? data?.nome ?? '',
        contato: data?.phone ?? data?.contato ?? null,
        email: data?.email ?? null,
        is_active: typeof data?.is_active === 'boolean' ? data.is_active : true,
        photo_url: data?.photo_url ?? null,
      }
      const newRevendedor = await kitApi<Revendedor>(`/revendedores`, { method: 'POST', headers: authHeaders(), body })
      setRevendedores(prev => [newRevendedor, ...prev])
      toast({
        title: "Sucesso",
        description: "Revendedor criado com sucesso"
      })
      return { data: newRevendedor, error: null }
    } catch (error) {
      console.error("Error creating revendedor:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o revendedor",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const updateRevendedor = async (id: string, data: any) => {
    try {
      const body = {
        nome: data?.name ?? data?.nome,
        contato: data?.phone ?? data?.contato,
        email: data?.email,
        is_active: data?.is_active,
        photo_url: data?.photo_url,
      }
      const updatedRevendedor = await kitApi<Revendedor>(`/revendedores/${id}`, { method: 'PATCH', headers: authHeaders(), body })
      setRevendedores(prev => prev.map(r => r.id === id ? updatedRevendedor : r))
      toast({
        title: "Sucesso",
        description: "Revendedor atualizado com sucesso"
      })
      return { data: updatedRevendedor, error: null }
    } catch (error) {
      console.error("Error updating revendedor:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o revendedor",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const deleteRevendedor = async (id: string) => {
    try {
      await kitApi(`/revendedores/${id}`, { method: 'DELETE', headers: authHeaders() })
      setRevendedores(prev => prev.filter(r => r.id !== id))
      toast({
        title: "Sucesso",
        description: "Revendedor excluído com sucesso"
      })
      return { error: null }
    } catch (error) {
      console.error("Error deleting revendedor:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o revendedor",
        variant: "destructive"
      })
      return { error }
    }
  }

  const toggleRevendedorStatus = async (id: string, isActive: boolean) => {
    return updateRevendedor(id, { is_active: isActive })
  }

  useEffect(() => {
    fetchRevendedores()
  }, [])

  return {
    revendedores,
    loading,
    fetchRevendedores,
    createRevendedor,
    updateRevendedor,
    deleteRevendedor,
    toggleRevendedorStatus
  }
}