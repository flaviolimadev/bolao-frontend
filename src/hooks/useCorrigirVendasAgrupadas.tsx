import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function useCorrigirVendasAgrupadas() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const corrigirVendasAgrupadas = async () => {
    try {
      setLoading(true)

      // 1. Buscar vendas com quotas_quantity > 1
      const { data: vendasAgrupadas, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .gt('quotas_quantity', 1)

      if (fetchError) throw fetchError

      if (!vendasAgrupadas || vendasAgrupadas.length === 0) {
        toast({
          title: "Nenhuma venda agrupada encontrada",
          description: "Todas as vendas já estão corretamente separadas."
        })
        return { success: true, processed: 0 }
      }

      let totalProcessed = 0

      for (const venda of vendasAgrupadas) {
        const quantidadeOriginal = venda.quotas_quantity
        const valorUnitario = Number(venda.amount) / quantidadeOriginal

        // 2. Criar vendas individuais
        const novasVendas = []
        for (let i = 0; i < quantidadeOriginal; i++) {
          const { data: novaVenda, error: insertError } = await supabase
            .from('sales')
            .insert({
              customer_id: venda.customer_id,
              edition_id: venda.edition_id,
              promotora_id: venda.promotora_id,
              revendedor_id: venda.revendedor_id,
              sale_type: venda.sale_type,
              sale_origin: venda.sale_origin,
              amount: valorUnitario,
              quotas_quantity: 1,
              payment_status: venda.payment_status,
              payment_id: venda.payment_id,
              payment_qr_code: venda.payment_qr_code,
              payment_pix_copy_paste: venda.payment_pix_copy_paste,
              card_sent: venda.card_sent,
              whatsapp_sent: venda.whatsapp_sent,
              created_at: venda.created_at
            })
            .select()
            .single()

          if (insertError) {
            console.error('Erro ao criar venda individual:', insertError)
            continue
          }

          novasVendas.push(novaVenda)

          // 3. Se for bolão, processar cada cota individualmente
          if (venda.sale_type === 'bolao_quota') {
            try {
              await supabase.functions.invoke('process-bolao-quotas', {
                body: {
                  saleId: novaVenda.id,
                  editionId: venda.edition_id
                }
              })
            } catch (quotaError) {
              console.error('Erro ao processar cota:', quotaError)
            }
          }
        }

        // 4. Remover venda agrupada original
        if (novasVendas.length === quantidadeOriginal) {
          const { error: deleteError } = await supabase
            .from('sales')
            .delete()
            .eq('id', venda.id)

          if (deleteError) {
            console.error('Erro ao remover venda agrupada:', deleteError)
          } else {
            totalProcessed += quantidadeOriginal
          }
        }
      }

      toast({
        title: "Vendas corrigidas com sucesso!",
        description: `${totalProcessed} vendas foram separadas corretamente.`
      })

      return { success: true, processed: totalProcessed }

    } catch (error: any) {
      console.error("Erro ao corrigir vendas agrupadas:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível corrigir as vendas",
        variant: "destructive"
      })
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    corrigirVendasAgrupadas,
    loading
  }
}