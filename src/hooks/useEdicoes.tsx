import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { api as kitApi } from "@/lib/api"

export interface Edicao {
  id: string
  edition_number: number
  draw_date: string
  individual_card_price: number
  bolao_quota_price: number
  quotas_per_group: number
  cards_per_group: number
  is_active: boolean
  status: 'draft' | 'active' | 'finalized'
  sales_paused: boolean
  prize_image_url?: string
  created_at: string
  updated_at: string
}

export function useEdicoes() {
  const { toast } = useToast()
  const [edicoes, setEdicoes] = useState<Edicao[]>([])
  const [loading, setLoading] = useState(true)

  // Helpers
  const authHeaders = () => {
    const access = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null
    return access ? { Authorization: `Bearer ${access}` } : undefined
  }
  const toCents = (value: any) => {
    const n = typeof value === 'number' ? value : parseFloat(String(value || 0).replace(',', '.'))
    if (isNaN(n)) return 0
    return Math.round(n * 100)
  }
  const toISO = (value: any) => {
    try {
      if (!value) return new Date().toISOString()
      const s = String(value)
      // Se vier no formato YYYY-MM-DD (input date), forçar meio-dia local para evitar retroceder um dia em UTC
      const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(s)
      const d = isDateOnly ? new Date(`${s}T12:00:00`) : new Date(s)
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
    } catch { return new Date().toISOString() }
  }

  // Carregar edições via API
  const loadEdicoes = async () => {
    try {
      const data = await kitApi<Edicao[]>(`/editions`, { headers: authHeaders() })
      setEdicoes(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar edições",
        description: error?.message || 'Falha ao listar edições',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEdicoes()
  }, [])

  const getEdicao = (numero: number) => {
    return edicoes.find(e => e.edition_number === numero)
  }

  const getEdicaoAtual = () => {
    return edicoes.find(e => e.status === 'active')
  }

  const finalizarEdicao = async (numero: number) => {
    try {
      const edicao = edicoes.find(e => e.edition_number === numero)
      if (!edicao) return

      await kitApi(`/editions/${edicao.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: { is_active: false, status: 'finalized' },
      })

      await loadEdicoes()
      toast({
        title: "Edição finalizada",
        description: "A edição foi finalizada com sucesso."
      })
    } catch (error: any) {
      toast({
        title: "Erro ao finalizar edição",
        description: error?.message || 'Falha ao finalizar edição',
        variant: "destructive"
      })
    }
  }

  const criarNovaEdicao = async (formData: any) => {
    try {
      const proximoNumero = Math.max(...edicoes.map(e => e.edition_number), 0) + 1
      
      const novaEdicao = {
        edition_number: parseInt(formData.numero) || proximoNumero,
        draw_date: toISO(formData.dataSorteio || formData.draw_date || formData.data),
        quotas_per_group: parseInt(formData.cotasPorGrupo),
        cards_per_group: parseInt(formData.cartelasPorGrupo),
        individual_card_price: toCents(formData.valorCartela),
        bolao_quota_price: toCents(formData.valorCota),
        is_active: formData.status === 'ativa',
        status: formData.status === 'ativa' ? 'active' : 'draft',
        prize_image_url: null,
        sales_paused: false,
      }
      const data = await kitApi<Edicao>(`/editions`, {
        method: 'POST',
        headers: authHeaders(),
        body: novaEdicao,
      })

      await loadEdicoes()
      toast({
        title: "Nova edição criada",
        description: `Edição #${data.edition_number} foi criada com sucesso.`
      })

      return data
    } catch (error: any) {
      toast({
        title: "Erro ao criar edição",
        description: error?.message || 'Falha ao criar edição',
        variant: "destructive"
      })
      throw error
    }
  }

  const atualizarEdicao = async (id: string, formData: any) => {
    try {
      const edicaoAtualizada = {
        edition_number: parseInt(formData.numero),
        draw_date: toISO(formData.dataSorteio || formData.draw_date || formData.data),
        individual_card_price: toCents(formData.valorCartela),
        bolao_quota_price: toCents(formData.valorCota),
        quotas_per_group: parseInt(formData.cotasPorGrupo),
        cards_per_group: parseInt(formData.cartelasPorGrupo),
        is_active: formData.status === 'ativa',
        status: formData.status === 'ativa' ? 'active' : 'draft',
        prize_image_url: null,
      }
      await kitApi(`/editions/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: edicaoAtualizada,
      })

      await loadEdicoes()
      toast({
        title: "Edição atualizada",
        description: "As alterações foram salvas com sucesso."
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar edição",
        description: error?.message || 'Falha ao atualizar edição',
        variant: "destructive"
      })
      throw error
    }
  }

  const excluirEdicao = async (id: string) => {
    try {
      await kitApi(`/editions/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })

      await loadEdicoes()
      toast({
        title: "Edição excluída",
        description: "A edição foi removida com sucesso."
      })
    } catch (error: any) {
      toast({
        title: "Erro ao excluir edição",
        description: error?.message || 'Falha ao excluir edição',
        variant: "destructive"
      })
    }
  }

  const toggleSalesStatus = async (id: string, pausar: boolean) => {
    try {
      await kitApi(`/editions/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: { sales_paused: pausar },
      })

      await loadEdicoes()
      toast({
        title: pausar ? "Vendas pausadas" : "Vendas retomadas",
        description: pausar 
          ? "As vendas foram pausadas temporariamente" 
          : "As vendas foram retomadas com sucesso"
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || 'Falha ao alterar status de vendas',
        variant: "destructive"
      })
    }
  }

  return {
    edicoes,
    loading,
    getEdicao,
    getEdicaoAtual,
    finalizarEdicao,
    criarNovaEdicao,
    atualizarEdicao,
    excluirEdicao,
    loadEdicoes,
    toggleSalesStatus
  }
}