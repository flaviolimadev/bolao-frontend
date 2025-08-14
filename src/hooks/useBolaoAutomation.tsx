import { useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useWhatsApp, WhatsAppMessage } from "@/hooks/useWhatsApp"

export function useBolaoAutomation() {
  const { toast } = useToast()
  const { sendBulkWhatsApp } = useWhatsApp()

  const checkAndSendReadyGroups = async () => {
    try {
      // Buscar grupos que estão prontos mas ainda não enviaram WhatsApp
      const { data: readyGroups, error } = await supabase
        .from("bolao_groups")
        .select(`
          *,
          quotas:bolao_quotas(
            *,
            sale:sales(
              *,
              customer:customers(*)
            )
          ),
          uploads:card_uploads(*)
        `)
        .eq("is_complete", true)
        .eq("cards_uploaded", true)
        .eq("cards_sent", false)

      if (error) throw error

      if (!readyGroups || readyGroups.length === 0) {
        return
      }

      for (const group of readyGroups) {
        // Verificar se há upload de cartelas
        const cartela = group.uploads?.find(upload => upload.upload_type === "group_cards")
        
        if (!cartela || !group.quotas || group.quotas.length === 0) {
          continue
        }

        try {
          // Preparar mensagens para WhatsApp
          const messages: WhatsAppMessage[] = group.quotas.map(quota => ({
            saleId: quota.sale_id,
            customerPhone: quota.sale.customer.phone,
            customerName: quota.sale.customer.name,
            messageType: 'quota',
            content: `Cotas: ${quota.quota_numbers.join(', ')}`,
            mediaUrl: cartela.file_url
          }))

          // Enviar mensagens via WhatsApp
          await sendBulkWhatsApp(messages)

          // Marcar como enviado
          await supabase
            .from("bolao_groups")
            .update({ cards_sent: true })
            .eq("id", group.id)

          toast({
            title: "Auto-envio concluído",
            description: `Grupo ${group.group_number}: Cartelas enviadas automaticamente para ${messages.length} participantes`
          })

        } catch (sendError) {
          console.error(`Erro ao enviar grupo ${group.group_number}:`, sendError)
          toast({
            title: "Erro no auto-envio",
            description: `Grupo ${group.group_number}: Falha no envio automático. Envie manualmente.`,
            variant: "destructive"
          })
        }
      }

    } catch (error) {
      console.error("Erro na verificação de grupos prontos:", error)
    }
  }

  const autoProcessPendingSales = async () => {
    try {
      // Buscar edição ativa
      const { data: activeEdition, error: editionError } = await supabase
        .from("editions")
        .select("id")
        .eq("status", "active")
        .single()

      if (editionError || !activeEdition) {
        return
      }

      // Buscar vendas de bolão pagas sem cotas
      const { data: pendingSales, error: salesError } = await supabase
        .from('sales')
        .select('id, edition_id')
        .eq('sale_type', 'bolao_quota')
        .eq('edition_id', activeEdition.id)
        .eq('payment_status', 'paid')

      if (salesError || !pendingSales || pendingSales.length === 0) {
        return
      }

      // Verificar quais vendas já têm cotas
      const { data: existingQuotas, error: quotasError } = await supabase
        .from('bolao_quotas')
        .select('sale_id')
        .in('sale_id', pendingSales.map(s => s.id))

      if (quotasError) return

      const salesWithQuotas = new Set(existingQuotas?.map(q => q.sale_id) || [])
      const salesNeedingProcessing = pendingSales.filter(s => !salesWithQuotas.has(s.id))

      if (salesNeedingProcessing.length === 0) {
        return
      }

      // Processar vendas automaticamente
      for (const sale of salesNeedingProcessing) {
        try {
          await supabase.functions.invoke('process-bolao-quotas', {
            body: {
              saleId: sale.id,
              editionId: sale.edition_id
            }
          })
        } catch (processError) {
          console.error(`Erro ao processar venda ${sale.id}:`, processError)
        }
      }

      if (salesNeedingProcessing.length > 0) {
        toast({
          title: "Auto-processamento",
          description: `${salesNeedingProcessing.length} vendas de bolão processadas automaticamente`
        })
      }

    } catch (error) {
      console.error("Erro no processamento automático:", error)
    }
  }

  // Executar verificações periódicas
  useEffect(() => {
    // Verificação inicial
    checkAndSendReadyGroups()
    autoProcessPendingSales()

    // Verificar a cada 2 minutos
    const interval = setInterval(() => {
      checkAndSendReadyGroups()
      autoProcessPendingSales()
    }, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    checkAndSendReadyGroups,
    autoProcessPendingSales
  }
}