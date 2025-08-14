import { useState, useEffect } from "react"
import { api as kitApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type Cliente = {
  id: string
  user_id: string
  nome: string
  contato?: string | null
  email?: string | null
  cpf?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
type ClienteInsert = Omit<Cliente, 'id' | 'user_id' | 'created_at' | 'updated_at'>
type ClienteUpdate = Partial<ClienteInsert>

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const authHeaders = () => {
    const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
    return access ? { Authorization: `Bearer ${access}` } : undefined
  }

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const data = await kitApi<Cliente[]>(`/clientes`, { headers: authHeaders() })
      setClientes(data || [])
    } catch (error) {
      console.error("Error fetching clientes:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createCliente = async (data: any) => {
    try {
      const body = {
        nome: data?.name ?? data?.nome ?? '',
        contato: data?.phone ?? data?.contato ?? null,
        email: data?.email ?? null,
        cpf: data?.cpf ?? null,
        is_active: typeof data?.is_active === 'boolean' ? data.is_active : true,
      }
      const newCliente = await kitApi<Cliente>(`/clientes`, { method: 'POST', headers: authHeaders(), body })
      setClientes(prev => [newCliente, ...prev])
      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso"
      })
      return { data: newCliente, error: null }
    } catch (error) {
      console.error("Error creating cliente:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const updateCliente = async (id: string, data: any) => {
    try {
      const body = {
        nome: data?.name ?? data?.nome,
        contato: data?.phone ?? data?.contato,
        email: data?.email,
        cpf: data?.cpf,
        is_active: data?.is_active,
      }
      const updatedCliente = await kitApi<Cliente>(`/clientes/${id}`, { method: 'PATCH', headers: authHeaders(), body })

      setClientes(prev => 
        prev.map(c => c.id === id ? updatedCliente : c)
      )
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso"
      })
      return { data: updatedCliente, error: null }
    } catch (error) {
      console.error("Error updating cliente:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cliente",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const deleteCliente = async (id: string) => {
    try {
      await kitApi(`/clientes/${id}`, { method: 'DELETE', headers: authHeaders() })

      setClientes(prev => prev.filter(c => c.id !== id))
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso"
      })
      return { error: null }
    } catch (error) {
      console.error("Error deleting cliente:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente",
        variant: "destructive"
      })
      return { error }
    }
  }

  const getClienteVendas = async (clienteId: string) => {
    try {
      if (api.isEnabled()) {
        const vendas = await api.get<any[]>(`/customers/${clienteId}/sales`, { status: 'paid' })
        return vendas || []
      } else {
        const { data, error } = await supabase
          .from("sales")
          .select("*")
          .eq("customer_id", clienteId)
          .eq("payment_status", "paid")
        if (error) throw error
        return data || []
      }
    } catch (error) {
      console.error("Error fetching cliente vendas:", error)
      return []
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  return {
    clientes,
    loading,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteVendas
  }
}