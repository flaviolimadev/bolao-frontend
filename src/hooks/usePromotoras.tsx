import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { api as kitApi } from "@/lib/api"

type Promotora = {
  id: string
  user_id: string
  nome: string
  contato?: string | null
  email?: string | null
  cpf?: string | null
  photo_url?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
type PromotoraInsert = Omit<Promotora, 'id' | 'user_id' | 'created_at' | 'updated_at'>
type PromotoraUpdate = Partial<PromotoraInsert>

export function usePromotoras() {
  const [promotoras, setPromotoras] = useState<Promotora[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const authHeaders = () => {
    const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
    return access ? { Authorization: `Bearer ${access}` } : undefined
  }

  const fetchPromotoras = async () => {
    try {
      setLoading(true)
      const data = await kitApi<Promotora[]>(`/promotoras`, { headers: authHeaders() })
      setPromotoras(data || [])
    } catch (error) {
      console.error("Error fetching promotoras:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as promotoras",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createPromotora = async (data: any) => {
    try {
      // mapear do modal (name, phone) para API (nome, contato)
      const body = {
        nome: data?.name ?? data?.nome ?? '',
        contato: data?.phone ?? data?.contato ?? null,
        email: data?.email ?? null,
        cpf: data?.cpf ?? null,
        photo_url: data?.photo_url ?? null,
        is_active: typeof data?.is_active === 'boolean' ? data.is_active : true,
      }
      const newPromotora = await kitApi<Promotora>(`/promotoras`, { method: 'POST', headers: authHeaders(), body })
      setPromotoras(prev => [newPromotora, ...prev])
      toast({
        title: "Sucesso",
        description: "Promotora criada com sucesso"
      })
      return { data: newPromotora, error: null }
    } catch (error) {
      console.error("Error creating promotora:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a promotora",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const updatePromotora = async (id: string, data: any) => {
    try {
      const body = {
        nome: data?.name ?? data?.nome,
        contato: data?.phone ?? data?.contato,
        email: data?.email,
        cpf: data?.cpf,
        photo_url: data?.photo_url,
        is_active: data?.is_active,
      }
      const updatedPromotora = await kitApi<Promotora>(`/promotoras/${id}`, { method: 'PATCH', headers: authHeaders(), body })
      setPromotoras(prev => prev.map(p => p.id === id ? updatedPromotora : p))
      toast({
        title: "Sucesso",
        description: "Promotora atualizada com sucesso"
      })
      return { data: updatedPromotora, error: null }
    } catch (error) {
      console.error("Error updating promotora:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a promotora",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const deletePromotora = async (id: string) => {
    try {
      await kitApi(`/promotoras/${id}`, { method: 'DELETE', headers: authHeaders() })
      setPromotoras(prev => prev.filter(p => p.id !== id))
      toast({
        title: "Sucesso",
        description: "Promotora excluída com sucesso"
      })
      return { error: null }
    } catch (error) {
      console.error("Error deleting promotora:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a promotora",
        variant: "destructive"
      })
      return { error }
    }
  }

  const togglePromotoraStatus = async (id: string, isActive: boolean) => {
    return updatePromotora(id, { is_active: isActive })
  }

  useEffect(() => {
    fetchPromotoras()
  }, [])

  return {
    promotoras,
    loading,
    fetchPromotoras,
    createPromotora,
    updatePromotora,
    deletePromotora,
    togglePromotoraStatus
  }
}