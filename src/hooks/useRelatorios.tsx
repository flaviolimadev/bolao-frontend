import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface RelatorioVendas {
  totalVendas: number
  valorTotal: number
  cartelasIndividuais: number
  cotasBolao: number
  vendasPorMes: Array<{
    mes: string
    vendas: number
    valor: number
  }>
  vendasPorOrigem: Array<{
    origem: string
    vendas: number
    valor: number
  }>
  topClientes: Array<{
    nome: string
    telefone: string
    totalCompras: number
    valorTotal: number
  }>
}

export interface RelatorioPromotoras {
  totalPromotoras: number
  promotorasAtivas: number
  totalComissoes: number
  ranking: Array<{
    id: string
    nome: string
    vendas: number
    comissao: number
  }>
}

export interface RelatorioRevendedores {
  totalRevendedores: number
  revendedoresAtivos: number
  totalComissoes: number
  ranking: Array<{
    id: string
    nome: string
    vendas: number
    comissao: number
  }>
}

export function useRelatorios(editionId?: string) {
  const [relatorioVendas, setRelatorioVendas] = useState<RelatorioVendas | null>(null)
  const [relatorioPromotoras, setRelatorioPromotoras] = useState<RelatorioPromotoras | null>(null)
  const [relatorioRevendedores, setRelatorioRevendedores] = useState<RelatorioRevendedores | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchRelatorioVendas = async (dataInicio?: string, dataFim?: string, specificEditionId?: string) => {
    try {
      const targetEditionId = specificEditionId || editionId
      
      let query = supabase
        .from("sales")
        .select(`
          *,
          customer:customers(*),
          edition:editions(*),
          promotora:promotoras(*),
          revendedor:revendedores(*)
        `)

      if (targetEditionId) {
        query = query.eq("edition_id", targetEditionId)
      }

      if (dataInicio) {
        query = query.gte("created_at", dataInicio)
      }
      if (dataFim) {
        query = query.lte("created_at", dataFim)
      }

      const { data: vendas, error } = await query

      if (error) throw error

      // Calcular estatísticas
      const totalVendas = vendas?.length || 0
      const valorTotal = vendas?.reduce((sum, v) => sum + v.amount, 0) || 0
      const cartelasIndividuais = vendas?.filter(v => v.sale_type === "individual_card").length || 0
      const cotasBolao = vendas?.filter(v => v.sale_type === "bolao_quota").length || 0

      // Vendas por mês
      const vendasPorMes = vendas?.reduce((acc, venda) => {
        const mes = new Date(venda.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        const existing = acc.find(item => item.mes === mes)
        if (existing) {
          existing.vendas += 1
          existing.valor += venda.amount
        } else {
          acc.push({ mes, vendas: 1, valor: venda.amount })
        }
        return acc
      }, [] as Array<{ mes: string; vendas: number; valor: number }>) || []

      // Vendas por origem
      const vendasPorOrigem = vendas?.reduce((acc, venda) => {
        const origem = venda.sale_origin === "direct" ? "Direto" : 
                      venda.sale_origin === "promotora" ? "Promotora" : "Revendedor"
        const existing = acc.find(item => item.origem === origem)
        if (existing) {
          existing.vendas += 1
          existing.valor += venda.amount
        } else {
          acc.push({ origem, vendas: 1, valor: venda.amount })
        }
        return acc
      }, [] as Array<{ origem: string; vendas: number; valor: number }>) || []

      // Top clientes
      const clientesMap = new Map()
      vendas?.forEach(venda => {
        const clienteId = venda.customer.id
        if (clientesMap.has(clienteId)) {
          const cliente = clientesMap.get(clienteId)
          cliente.totalCompras += 1
          cliente.valorTotal += venda.amount
        } else {
          clientesMap.set(clienteId, {
            nome: venda.customer.name,
            telefone: venda.customer.phone,
            totalCompras: 1,
            valorTotal: venda.amount
          })
        }
      })

      const topClientes = Array.from(clientesMap.values())
        .sort((a, b) => b.valorTotal - a.valorTotal)
        .slice(0, 10)

      setRelatorioVendas({
        totalVendas,
        valorTotal,
        cartelasIndividuais,
        cotasBolao,
        vendasPorMes: vendasPorMes.slice(-6), // últimos 6 meses
        vendasPorOrigem,
        topClientes
      })
    } catch (error) {
      console.error("Error fetching sales report:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o relatório de vendas",
        variant: "destructive"
      })
    }
  }

  const fetchRelatorioPromotoras = async () => {
    try {
      const { data: promotoras, error } = await supabase
        .from("promotoras")
        .select("*")

      if (error) throw error

      const totalPromotoras = promotoras?.length || 0
      const promotorasAtivas = promotoras?.filter(p => p.is_active).length || 0
      const totalComissoes = promotoras?.reduce((sum, p) => sum + p.commission_total, 0) || 0

      const ranking = promotoras
        ?.sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 10)
        .map(p => ({
          id: p.id,
          nome: p.name,
          vendas: p.total_sales,
          comissao: p.commission_total
        })) || []

      setRelatorioPromotoras({
        totalPromotoras,
        promotorasAtivas,
        totalComissoes,
        ranking
      })
    } catch (error) {
      console.error("Error fetching promotoras report:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o relatório de promotoras",
        variant: "destructive"
      })
    }
  }

  const fetchRelatorioRevendedores = async () => {
    try {
      const { data: revendedores, error } = await supabase
        .from("revendedores")
        .select("*")

      if (error) throw error

      const totalRevendedores = revendedores?.length || 0
      const revendedoresAtivos = revendedores?.filter(r => r.is_active).length || 0
      const totalComissoes = revendedores?.reduce((sum, r) => sum + r.commission_total, 0) || 0

      const ranking = revendedores
        ?.sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 10)
        .map(r => ({
          id: r.id,
          nome: r.name,
          vendas: r.total_sales,
          comissao: r.commission_total
        })) || []

      setRelatorioRevendedores({
        totalRevendedores,
        revendedoresAtivos,
        totalComissoes,
        ranking
      })
    } catch (error) {
      console.error("Error fetching revendedores report:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o relatório de revendedores",
        variant: "destructive"
      })
    }
  }

  const fetchRelatorios = async (dataInicio?: string, dataFim?: string, specificEditionId?: string) => {
    setLoading(true)
    try {
      await Promise.all([
        fetchRelatorioVendas(dataInicio, dataFim, specificEditionId),
        fetchRelatorioPromotoras(),
        fetchRelatorioRevendedores()
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRelatorios()
  }, [editionId])

  return {
    relatorioVendas,
    relatorioPromotoras,
    relatorioRevendedores,
    loading,
    fetchRelatorios
  }
}