import { useState, useEffect } from "react"
import { api as kitApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export interface IndividualCard {
  id: string
  card_number: string
  card_sent: boolean
  whatsapp_sent: boolean
  sent_at?: string
  notes?: string
  created_at: string
  updated_at: string
  sale: {
    id: string
    amount: number
    created_at: string
    customer: {
      nome: string
      cpf: string
      contato: string
    }
    edition: {
      edition_number: number
    }
    promotora?: {
      nome: string
    }
    revendedor?: {
      nome: string
    }
    sale_origin: string
  }
}

export function useCartelasIndividuais() {
  const [cartelas, setCartelas] = useState<IndividualCard[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchCartelas = async (editionId?: string) => {
    try {
      setLoading(true)
      
      const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
      const headers = access ? { Authorization: `Bearer ${access}` } : undefined
      
      const path = editionId ? `/individual-cards?edition=${encodeURIComponent(editionId)}` : `/individual-cards`
      const data = await kitApi<IndividualCard[]>(path, { headers })
      setCartelas(data || [])
    } catch (error) {
      console.error("Error fetching cartelas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as cartelas individuais",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsSent = async (id: string, type: 'card' | 'whatsapp') => {
    try {
      const headers = (() => {
        const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
        return access ? { Authorization: `Bearer ${access}` } : undefined
      })()

      const updatedCard = await kitApi<IndividualCard>(`/individual-cards/${id}/mark-sent`, { 
        method: 'PATCH', 
        headers, 
        body: { type } 
      })

      setCartelas(prev => prev.map(c => c.id === id ? updatedCard : c))

      const typeText = type === 'card' ? 'cartela' : 'WhatsApp'
      toast({
        title: "Sucesso",
        description: `${typeText} marcada como enviada`,
      })
      
      return { data: updatedCard, error: null }
    } catch (error) {
      console.error("Error marking as sent:", error)
      toast({
        title: "Erro",
        description: "Não foi possível marcar como enviada",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const updateNotes = async (id: string, notes: string) => {
    try {
      const headers = (() => {
        const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
        return access ? { Authorization: `Bearer ${access}` } : undefined
      })()

      const updatedCard = await kitApi<IndividualCard>(`/individual-cards/${id}/notes`, { 
        method: 'PATCH', 
        headers, 
        body: { notes } 
      })

      setCartelas(prev => prev.map(c => c.id === id ? updatedCard : c))

      toast({
        title: "Sucesso",
        description: "Notas atualizadas com sucesso",
      })
      
      return { data: updatedCard, error: null }
    } catch (error) {
      console.error("Error updating notes:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as notas",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const deleteCard = async (id: string) => {
    try {
      const headers = (() => {
        const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
        return access ? { Authorization: `Bearer ${access}` } : undefined
      })()

      await kitApi(`/individual-cards/${id}`, { method: 'DELETE', headers })
      setCartelas(prev => prev.filter(c => c.id !== id))

      toast({
        title: "Sucesso",
        description: "Cartela excluída com sucesso"
      })
      
      return { error: null }
    } catch (error) {
      console.error("Error deleting card:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a cartela",
        variant: "destructive"
      })
      return { error }
    }
  }

  const sendCardFile = async (id: string, file: File, notes?: string) => {
    try {
      console.log("🔍 Iniciando sendCardFile...")
      const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
      console.log("🔑 Token de acesso:", access ? "Presente" : "Ausente")
      
      const headers = access ? { Authorization: `Bearer ${access}` } : undefined
      console.log("📋 Headers:", headers)

      const formData = new FormData()
      formData.append('file', file)
      if (notes) {
        formData.append('notes', notes)
      }
      console.log("📁 FormData criado com arquivo:", file.name)
      console.log("📁 FormData entries:", Array.from(formData.entries()))
      console.log("📁 Arquivo completo:", file)
      console.log("📁 Tipo do arquivo:", typeof file)
      console.log("📁 Propriedades do arquivo:", Object.keys(file))

      console.log("🌐 Fazendo requisição para:", `/individual-cards/${id}/send-file`)
      const updatedCard = await kitApi<IndividualCard>(`/individual-cards/${id}/send-file`, { 
        method: 'PATCH', 
        headers: {
          ...headers,
          // Remover Content-Type para FormData
        },
        body: formData
      })

      console.log("✅ Resposta recebida:", updatedCard)
      setCartelas(prev => prev.map(c => c.id === id ? updatedCard : c))

      toast({
        title: "Sucesso",
        description: "Cartela enviada com sucesso!",
      })
      
      return { data: updatedCard, error: null }
    } catch (error) {
      console.error("❌ Error sending card file:", error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar a cartela",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  useEffect(() => {
    fetchCartelas()
  }, [])

  return {
    cartelas,
    loading,
    fetchCartelas,
    markAsSent,
    updateNotes,
    deleteCard,
    sendCardFile
  }
}
