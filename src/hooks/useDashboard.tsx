import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface DashboardStats {
  vendasHoje: {
    total: number
    valor: number
    mudanca: number
  }
  cartelasVendidas: {
    total: number
    mudanca: number
  }
  cotasBolao: {
    total: number
    mudanca: number
  }
  promotorasAtivas: {
    total: number
    mudanca: number
  }
  revendedoresAtivos: {
    total: number
    mudanca: number
  }
  totalFaturamento: {
    mes: number
    anterior: number
    mudanca: number
  }
}

export interface AtividadeRecente {
  id: string
  tipo: 'venda' | 'cadastro' | 'cartela' | 'bolao'
  descricao: string
  cliente: string
  valor: string
  tempo: string
  created_at: string
}

export interface ProximosEventos {
  id: string
  tipo: 'sorteio' | 'pagamento' | 'deadline'
  titulo: string
  data: string
  dias_restantes: number
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [atividadeRecente, setAtividadeRecente] = useState<AtividadeRecente[]>([])
  const [proximosEventos, setProximosEventos] = useState<ProximosEventos[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const calcularDiasAtras = (dias: number) => {
    const data = new Date()
    data.setDate(data.getDate() - dias)
    return data.toISOString().split('T')[0]
  }

  const fetchDashboardStats = async () => {
    try {
      // Buscar edição ativa primeiro
      const { data: edicaoAtiva } = await supabase
        .from("editions")
        .select("id")
        .eq("status", "active")
        .single()

      if (!edicaoAtiva) {
        console.warn("Nenhuma edição ativa encontrada")
        return
      }

      // Buscar vendas de hoje
      const hoje = new Date().toISOString().split('T')[0]
      const ontem = calcularDiasAtras(1)
      const mesPassado = calcularDiasAtras(30)

      const [
        { data: vendasHoje },
        { data: vendasOntem },
        { data: vendasMes },
        { data: vendasMesAnterior },
        { data: promotoras },
        { data: revendedores }
      ] = await Promise.all([
        // Vendas de hoje da edição ativa
        supabase
          .from("sales")
          .select("amount, sale_type")
          .eq("edition_id", edicaoAtiva.id)
          .gte("created_at", hoje),
        
        // Vendas de ontem da edição ativa
        supabase
          .from("sales")
          .select("amount, sale_type")
          .eq("edition_id", edicaoAtiva.id)
          .gte("created_at", ontem)
          .lt("created_at", hoje),
        
        // Vendas do mês atual da edição ativa
        supabase
          .from("sales")
          .select("amount, sale_type")
          .eq("edition_id", edicaoAtiva.id)
          .gte("created_at", mesPassado),
        
        // Vendas do mês anterior da edição ativa
        supabase
          .from("sales")
          .select("amount")
          .eq("edition_id", edicaoAtiva.id)
          .gte("created_at", calcularDiasAtras(60))
          .lt("created_at", mesPassado),
        
        // Promotoras ativas
        supabase
          .from("promotoras")
          .select("id, is_active"),
        
        // Revendedores ativos
        supabase
          .from("revendedores")
          .select("id, is_active")
      ])

      // Calcular estatísticas
      const valorHoje = vendasHoje?.reduce((sum, v) => sum + v.amount, 0) || 0
      const valorOntem = vendasOntem?.reduce((sum, v) => sum + v.amount, 0) || 0
      const mudancaVendas = valorOntem > 0 ? ((valorHoje - valorOntem) / valorOntem) * 100 : 0

      const cartelasHoje = vendasHoje?.filter(v => v.sale_type === "individual_card").length || 0
      const cartelasOntem = vendasOntem?.filter(v => v.sale_type === "individual_card").length || 0
      const mudancaCartelas = cartelasOntem > 0 ? ((cartelasHoje - cartelasOntem) / cartelasOntem) * 100 : 0

      const cotasHoje = vendasHoje?.filter(v => v.sale_type === "bolao_quota").length || 0
      const cotasOntem = vendasOntem?.filter(v => v.sale_type === "bolao_quota").length || 0
      const mudancaCotas = cotasOntem > 0 ? ((cotasHoje - cotasOntem) / cotasOntem) * 100 : 0

      const promotorasAtivas = promotoras?.filter(p => p.is_active).length || 0
      const revendedoresAtivos = revendedores?.filter(r => r.is_active).length || 0

      const faturamentoMes = vendasMes?.reduce((sum, v) => sum + v.amount, 0) || 0
      const faturamentoMesAnterior = vendasMesAnterior?.reduce((sum, v) => sum + v.amount, 0) || 0
      const mudancaFaturamento = faturamentoMesAnterior > 0 ? 
        ((faturamentoMes - faturamentoMesAnterior) / faturamentoMesAnterior) * 100 : 0

      setStats({
        vendasHoje: {
          total: vendasHoje?.length || 0,
          valor: valorHoje,
          mudanca: mudancaVendas
        },
        cartelasVendidas: {
          total: cartelasHoje,
          mudanca: mudancaCartelas
        },
        cotasBolao: {
          total: cotasHoje,
          mudanca: mudancaCotas
        },
        promotorasAtivas: {
          total: promotorasAtivas,
          mudanca: 0
        },
        revendedoresAtivos: {
          total: revendedoresAtivos,
          mudanca: 0
        },
        totalFaturamento: {
          mes: faturamentoMes,
          anterior: faturamentoMesAnterior,
          mudanca: mudancaFaturamento
        }
      })

    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do dashboard",
        variant: "destructive"
      })
    }
  }

  const fetchAtividadeRecente = async () => {
    try {
      // Buscar edição ativa primeiro
      const { data: edicaoAtiva } = await supabase
        .from("editions")
        .select("id")
        .eq("status", "active")
        .single()

      if (!edicaoAtiva) {
        console.warn("Nenhuma edição ativa encontrada")
        return
      }

      const { data: vendas, error } = await supabase
        .from("sales")
        .select(`
          *,
          customer:customers(name),
          promotora:promotoras(name),
          revendedor:revendedores(name)
        `)
        .eq("edition_id", edicaoAtiva.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      const atividades: AtividadeRecente[] = vendas?.map(venda => {
        const agora = new Date()
        const vendaData = new Date(venda.created_at)
        const diffMs = agora.getTime() - vendaData.getTime()
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        let tempo: string
        if (diffMinutes < 60) {
          tempo = `${diffMinutes} min atrás`
        } else if (diffHours < 24) {
          tempo = `${diffHours}h atrás`
        } else {
          tempo = `${diffDays}d atrás`
        }

        const vendedor = venda.promotora?.name || venda.revendedor?.name || "Venda Direta"
        
        return {
          id: venda.id,
          tipo: venda.sale_type === "individual_card" ? "cartela" : "bolao" as const,
          descricao: venda.sale_type === "individual_card" ? "Cartela Individual" : "Cota de Bolão",
          cliente: venda.customer.name,
          valor: `R$ ${venda.amount.toFixed(2).replace('.', ',')}`,
          tempo,
          created_at: venda.created_at
        }
      }) || []

      setAtividadeRecente(atividades)

    } catch (error) {
      console.error("Error fetching recent activity:", error)
    }
  }

  const fetchProximosEventos = async () => {
    try {
      const { data: edicoes, error } = await supabase
        .from("editions")
        .select("*")
        .eq("status", "active")
        .order("draw_date", { ascending: true })
        .limit(3)

      if (error) throw error

      const eventos: ProximosEventos[] = edicoes?.map(edicao => {
        const hoje = new Date()
        const dataSorteio = new Date(edicao.draw_date)
        const diffTime = dataSorteio.getTime() - hoje.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return {
          id: edicao.id,
          tipo: "sorteio" as const,
          titulo: `Sorteio Edição #${edicao.edition_number}`,
          data: edicao.draw_date,
          dias_restantes: diffDays
        }
      }) || []

      setProximosEventos(eventos)

    } catch (error) {
      console.error("Error fetching upcoming events:", error)
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchAtividadeRecente(),
        fetchProximosEventos()
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    stats,
    atividadeRecente,
    proximosEventos,
    loading,
    refetch: fetchDashboardData
  }
}