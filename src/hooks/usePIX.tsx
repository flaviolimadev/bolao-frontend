import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface PIXPaymentRequest {
  saleId: string;
  amount: number;
  customerName: string;
  customerCpf: string;
  customerEmail?: string;
}

export interface PIXPaymentResponse {
  success: boolean;
  txid: string;
  qrCode: string;
  pixCopyPaste: string;
  expires: number;
}

export function usePIX() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const generatePIX = async (request: PIXPaymentRequest): Promise<PIXPaymentResponse | null> => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.functions.invoke('process-pix-payment', {
        body: request
      })

      if (error) throw error

      toast({
        title: "PIX gerado!",
        description: "QR Code e chave PIX criados com sucesso",
      })

      return data
    } catch (error) {
      console.error("Error generating PIX:", error)
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PIX",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (saleId: string) => {
    try {
      const { data: sale, error } = await supabase
        .from('sales')
        .select('payment_status, payment_id')
        .eq('id', saleId)
        .single()

      if (error) throw error

      return sale
    } catch (error) {
      console.error("Error checking payment status:", error)
      return null
    }
  }

  const copyPixToClipboard = async (pixCode: string) => {
    try {
      await navigator.clipboard.writeText(pixCode)
      toast({
        title: "Copiado!",
        description: "Chave PIX copiada para a área de transferência",
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Erro",
        description: "Não foi possível copiar a chave PIX",
        variant: "destructive"
      })
    }
  }

  return {
    generatePIX,
    checkPaymentStatus,
    copyPixToClipboard,
    loading
  }
}