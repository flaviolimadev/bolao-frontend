import { useState, useEffect } from "react"
import { api as kitApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Database } from "@/integrations/supabase/types"

type Tables = Database['public']['Tables']

type Sale = {
  id: string
  user_id: string
  customer_id: string
  edition_id: string
  promotora_id?: string | null
  revendedor_id?: string | null
  sale_type: 'individual_card' | 'bolao_quota'
  amount: number
  quotas_quantity?: number | null
  payment_status: 'pending' | 'paid' | 'canceled' | 'refunded'
  sale_origin: 'direct' | 'promotora' | 'revendedor'
  created_at: string
  updated_at: string
}

export interface SaleWithCustomer extends Sale {
  customer: any
  edition: any
  promotora?: any
  revendedor?: any
}

export interface CreateSaleData {
  // Dados do cliente
  customerId?: string
  customerName: string
  customerPhone: string
  customerCpf: string
  customerEmail?: string
  
  // Dados da venda
  editionId: string
  saleType: "individual_card" | "bolao_quota"
  quotasQuantity?: number
  promotoraId?: string
  revendedorId?: string
  saleOrigin: "direct" | "promotora" | "revendedor"
}

export function useVendas() {
  const [vendas, setVendas] = useState<SaleWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchVendas = async (editionId?: string) => {
    try {
      setLoading(true)
      const headers = (() => {
        const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
        return access ? { Authorization: `Bearer ${access}` } : undefined
      })()
      const path = editionId ? `/sales?edition=${encodeURIComponent(editionId)}` : `/sales`
      const data = await kitApi<Sale[]>(path, { headers })
      setVendas(data as any || [])
    } catch (error) {
      console.error("Error fetching vendas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vendas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createSale = async (data: CreateSaleData) => {
    try {
      const headers = (() => {
        const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
        return access ? { Authorization: `Bearer ${access}` } : undefined
      })()
      const payload: any = {
        customer_id: data.customerId || undefined,
        customer_nome: data.customerId ? undefined : data.customerName,
        customer_contato: data.customerId ? undefined : data.customerPhone,
        customer_cpf: data.customerId ? undefined : data.customerCpf,
        customer_email: data.customerId ? undefined : (data.customerEmail || null),
        edition_id: data.editionId,
        sale_type: data.saleType,
        quotas_quantity: data.saleType === 'bolao_quota' ? (data.quotasQuantity || 1) : undefined,
        promotora_id: data.promotoraId || undefined,
        revendedor_id: data.revendedorId || undefined,
        sale_origin: data.saleOrigin,
      }
      const newSale = await kitApi<Sale>(`/sales`, { method: 'POST', headers, body: payload })
      setVendas(prev => [newSale as any, ...prev])
      toast({
        title: "Sucesso",
        description: "Venda registrada com sucesso. Cliente criado/atualizado automaticamente.",
      })
      
      return { data: newSale, error: null }
    } catch (error) {
      console.error("Error creating sale:", error)
      toast({
        title: "Erro",
        description: "Não foi possível registrar a venda",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const updateSale = async (id: string, data: CreateSaleData) => {
    try {
      const headers = (() => {
        const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
        return access ? { Authorization: `Bearer ${access}` } : undefined
      })()
      
      // Mapear o payload para o formato esperado pelo backend
      const payload: any = {
        edition_id: data.editionId,
        sale_type: data.saleType,
        sale_origin: data.saleOrigin,
      }
      
      // Quantidade de cotas somente para bolão; zera para individual
      payload.quotas_quantity = data.saleType === 'bolao_quota' ? (data.quotasQuantity || 1) : null

      // Cliente: se escolher um existente, envia o id; senão, envia os campos para atualização/criação
      if (data.customerId) {
        payload.customer_id = data.customerId
        payload.customer_nome = undefined
        payload.customer_contato = undefined
        payload.customer_cpf = undefined
        payload.customer_email = undefined
      } else {
        payload.customer_id = undefined
        payload.customer_nome = data.customerName
        payload.customer_contato = data.customerPhone
        payload.customer_cpf = data.customerCpf
        payload.customer_email = data.customerEmail || null
      }

      // Origem da venda controla promotor/revendedor
      if (data.saleOrigin === 'direct') {
        payload.promotora_id = null
        payload.revendedor_id = null
      } else if (data.saleOrigin === 'promotora') {
        payload.promotora_id = data.promotoraId || null
        payload.revendedor_id = null
      } else if (data.saleOrigin === 'revendedor') {
        payload.promotora_id = null
        payload.revendedor_id = data.revendedorId || null
      }

      console.log('Payload para atualização:', payload)
      console.log('Dados recebidos:', data)
      console.log('revendedorId:', data.revendedorId)
      console.log('promotoraId:', data.promotoraId)
      console.log('saleOrigin:', data.saleOrigin)

      const updatedSale = await kitApi<Sale>(`/sales/${id}`, { method: 'PATCH', headers, body: payload })
      console.log('Resposta da API:', updatedSale)
      
      setVendas(prev => prev.map(v => v.id === id ? updatedSale as any : v))

      toast({
        title: "Sucesso",
        description: "Venda atualizada com sucesso"
      })
      
      return { data: updatedSale, error: null }
    } catch (error) {
      console.error("Error updating sale:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a venda",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const deleteSale = async (id: string) => {
    try {
      const headers = (() => {
        const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
        return access ? { Authorization: `Bearer ${access}` } : undefined
      })()
      await kitApi(`/sales/${id}`, { method: 'DELETE', headers })
      setVendas(prev => prev.filter(v => v.id !== id))
      toast({
        title: "Sucesso",
        description: "Venda excluída com sucesso"
      })
      return { error: null }
    } catch (error) {
      console.error("Error deleting sale:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a venda",
        variant: "destructive"
      })
      return { error }
    }
  }

  useEffect(() => {
    fetchVendas()
  }, [])

  return {
    vendas,
    loading,
    fetchVendas,
    createSale,
    updateSale,
    deleteSale
  }
}