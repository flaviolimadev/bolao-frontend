import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface WhatsAppMessage {
  saleId: string;
  customerPhone: string;
  customerName: string;
  messageType: 'cartela' | 'quota' | 'resultado';
  content?: string;
  mediaUrl?: string;
}

export function useWhatsApp() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const sendWhatsApp = async (message: WhatsAppMessage) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: message
      })

      if (error) throw error

      toast({
        title: "WhatsApp enviado!",
        description: `Mensagem enviada para ${message.customerName}`,
      })

      return { data, error: null }
    } catch (error) {
      console.error("Error sending WhatsApp:", error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar o WhatsApp",
        variant: "destructive"
      })
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const sendBulkWhatsApp = async (messages: WhatsAppMessage[]) => {
    try {
      setLoading(true)
      const results = []

      for (const message of messages) {
        const result = await sendWhatsApp(message)
        results.push(result)
        // Aguardar um pouco entre envios para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      const successful = results.filter(r => !r.error).length
      const failed = results.filter(r => r.error).length

      toast({
        title: "Envio concluído",
        description: `${successful} mensagens enviadas, ${failed} falharam`,
        variant: failed > 0 ? "destructive" : "default"
      })

      return results
    } catch (error) {
      console.error("Error sending bulk WhatsApp:", error)
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagens em lote",
        variant: "destructive"
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    sendWhatsApp,
    sendBulkWhatsApp,
    loading
  }
}