import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Tables } from "@/integrations/supabase/types"
import { useToast } from "@/hooks/use-toast"

export function useControleFinanceiro(editionId?: string) {
  const [vendas, setVendas] = useState<any[]>([])
  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    totalVendas: 0,
    vendasConfirmadas: 0,
    vendasPendentes: 0,
    vendasCanceladas: 0,
    receitaTotal: 0,
    comissaoRevendedores: 0,
    receitaLiquida: 0
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchVendas = async (specificEditionId?: string) => {
    const targetEditionId = specificEditionId || editionId
    try {
      setLoading(true)
      let query = supabase
        .from("sales")
        .select(`
          *,
          customers (name, phone, cpf),
          editions (edition_number),
          promotoras (name),
          revendedores (name)
        `)
      
      if (targetEditionId) {
        query = query.eq("edition_id", targetEditionId)
      }
      
      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) throw error
      setVendas(data || [])
      calcularResumo(data || [])
    } catch (error) {
      console.error("Error fetching vendas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calcularResumo = (vendas: any[]) => {
    const totalVendas = vendas.length
    const vendasConfirmadas = vendas.filter(v => v.payment_status === 'paid').length
    const vendasPendentes = vendas.filter(v => v.payment_status === 'pending').length
    const vendasCanceladas = vendas.filter(v => v.payment_status === 'failed' || v.payment_status === 'cancelled').length
    
    const receitaTotal = vendas
      .filter(v => v.payment_status === 'paid')
      .reduce((acc, v) => acc + Number(v.amount), 0)
    
    // Calcular comissões para revendedores: Quantidade de vendas × Valor da cartela × 10%
    // Assumindo valor da cartela como base das vendas dos revendedores
    const vendasRevendedores = vendas.filter(v => v.payment_status === 'paid' && v.revendedor_id)
    const comissaoRevendedores = vendasRevendedores.length * 25 * 0.10 // 25 = valor médio da cartela
    
    // Promotoras não recebem comissão
    const receitaLiquida = receitaTotal - comissaoRevendedores

    setResumoFinanceiro({
      totalVendas,
      vendasConfirmadas,
      vendasPendentes,
      vendasCanceladas,
      receitaTotal,
      comissaoRevendedores,
      receitaLiquida
    })
  }

  const updatePaymentStatus = async (saleId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("sales")
        .update({ payment_status: newStatus })
        .eq("id", saleId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Status de pagamento atualizado com sucesso"
      })
      
      await fetchVendas() // Recarregar dados
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pagamento",
        variant: "destructive"
      })
    }
  }

  const exportarRelatorio = () => {
    // Criar CSV dos dados
    const csvContent = [
      ["Data", "Cliente", "Valor", "Status", "Tipo", "Origem", "Promotora/Revendedor"].join(","),
      ...vendas.map(venda => [
        new Date(venda.created_at).toLocaleDateString("pt-BR"),
        venda.customers?.name || "N/A",
        `R$ ${Number(venda.amount).toFixed(2)}`,
        venda.payment_status,
        venda.sale_type,
        venda.sale_origin,
        venda.promotoras?.name || venda.revendedores?.name || "Direto"
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Sucesso",
      description: "Relatório exportado com sucesso"
    })
  }

  useEffect(() => {
    fetchVendas()
  }, [editionId])

  return {
    vendas,
    resumoFinanceiro,
    loading,
    updatePaymentStatus,
    exportarRelatorio,
    fetchVendas
  }
}