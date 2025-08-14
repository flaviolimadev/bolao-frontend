import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function useBolaoProcessing() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const processarVendasPendentes = async (editionId: string) => {
    try {
      setLoading(true)

      // Buscar vendas de bolão sem cotas atribuídas
      const { data: vendasPendentes, error: vendasError } = await supabase
        .from('sales')
        .select(`
          id,
          quotas_quantity,
          edition_id,
          payment_status
        `)
        .eq('sale_type', 'bolao_quota')
        .eq('edition_id', editionId)
        .eq('payment_status', 'paid')

      if (vendasError) throw vendasError

      if (!vendasPendentes || vendasPendentes.length === 0) {
        toast({
          title: "Nenhuma venda pendente",
          description: "Não há vendas de bolão pendentes para processar.",
        })
        return
      }

      // Verificar quais vendas já têm cotas atribuídas
      const { data: cotasExistentes, error: cotasError } = await supabase
        .from('bolao_quotas')
        .select('sale_id')
        .in('sale_id', vendasPendentes.map(v => v.id))

      if (cotasError) throw cotasError

      const salesComCotas = new Set(cotasExistentes?.map(c => c.sale_id) || [])
      const vendasSemCotas = vendasPendentes.filter(v => !salesComCotas.has(v.id))

      if (vendasSemCotas.length === 0) {
        toast({
          title: "Todas as vendas já processadas",
          description: "Todas as vendas de bolão já possuem cotas atribuídas.",
        })
        return
      }

      // Processar cada venda sem cotas
      let processadas = 0
      let erros = 0

      for (const venda of vendasSemCotas) {
        try {
          const { error: processError } = await supabase.functions.invoke(
            'process-bolao-quotas',
            {
              body: {
                saleId: venda.id,
                editionId: venda.edition_id
              }
            }
          )

          if (processError) {
            console.error(`Erro ao processar venda ${venda.id}:`, processError)
            erros++
          } else {
            processadas++
          }
        } catch (error) {
          console.error(`Erro ao processar venda ${venda.id}:`, error)
          erros++
        }
      }

      toast({
        title: "Processamento concluído",
        description: `${processadas} vendas processadas com sucesso. ${erros > 0 ? `${erros} erros encontrados.` : ''} Recarregando página...`,
        variant: erros > 0 ? "destructive" : "default"
      })

      // Recarregar página para atualizar dados
      if (processadas > 0) {
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }

      return {
        processadas,
        erros,
        total: vendasSemCotas.length
      }

    } catch (error: any) {
      console.error("Erro ao processar vendas pendentes:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível processar as vendas pendentes",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const criarGrupoBolao = async (editionId: string, maxQuotas: number = 10) => {
    try {
      setLoading(true)

      // Buscar o maior número de grupo existente
      const { data: lastGroup } = await supabase
        .from('bolao_groups')
        .select('group_number')
        .eq('edition_id', editionId)
        .order('group_number', { ascending: false })
        .limit(1)

      const nextGroupNumber = lastGroup && lastGroup.length > 0 
        ? lastGroup[0].group_number + 1 
        : 1

      // Criar novo grupo
      const { data: newGroup, error: createError } = await supabase
        .from('bolao_groups')
        .insert({
          edition_id: editionId,
          group_number: nextGroupNumber,
          max_quotas: maxQuotas,
          total_quotas: 0,
          is_complete: false
        })
        .select()
        .single()

      if (createError) throw createError

      toast({
        title: "Grupo criado",
        description: `Grupo de bolão #${nextGroupNumber} criado com sucesso. Recarregando página...`,
      })

      // Recarregar página para mostrar novo grupo
      setTimeout(() => {
        window.location.reload()
      }, 1500)

      return newGroup

    } catch (error: any) {
      console.error("Erro ao criar grupo de bolão:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o grupo",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    processarVendasPendentes,
    criarGrupoBolao,
    loading
  }
}