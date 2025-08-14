import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { usePIX } from "@/hooks/usePIX"

export interface VendaPublicaData {
  nome: string
  telefone: string
  cpf: string
  email?: string
  quantidadeCartelas: number
  quantidadeCotas: number
  promotorId?: string
  revendedorId?: string
  edicaoId: string
  valorTotal: number
}

export function useVendasPublicas() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { generatePIX } = usePIX()

  const criarVendaPublica = async (vendaData: VendaPublicaData) => {
    try {
      setLoading(true)

      // 1. Buscar edição para cálculo dos preços
      const { data: edicao } = await supabase
        .from('editions')
        .select('*')
        .eq('id', vendaData.edicaoId)
        .single()

      if (!edicao) throw new Error("Edição não encontrada")
      if (edicao.status !== 'active') throw new Error("Esta edição não está mais ativa para vendas")

      // 2. Registrar/buscar cliente
      const { data: customerId, error: customerError } = await supabase.rpc(
        'register_customer_from_sale',
        {
          p_name: vendaData.nome,
          p_phone: vendaData.telefone,
          p_cpf: vendaData.cpf,
          p_email: vendaData.email || null
        }
      )

      if (customerError) throw customerError

      // 3. Determinar origem da venda
      let sale_origin: "direct" | "promotora" | "revendedor" = "direct"
      if (vendaData.promotorId) sale_origin = "promotora"
      if (vendaData.revendedorId) sale_origin = "revendedor"

      // 4. Criar vendas (cartelas individuais e cotas separadamente)
      const sales = []
      
      // Criar vendas individuais para cada cartela
      if (vendaData.quantidadeCartelas > 0) {
        for (let i = 0; i < vendaData.quantidadeCartelas; i++) {
          const { data: cardSale, error: cardSaleError } = await supabase
            .from('sales')
            .insert({
              customer_id: customerId,
              edition_id: vendaData.edicaoId,
              promotora_id: vendaData.promotorId || null,
              revendedor_id: vendaData.revendedorId || null,
              sale_type: 'individual_card',
              sale_origin: sale_origin,
              amount: Number(edicao.individual_card_price),
              quotas_quantity: 1,
              payment_status: 'pending'
            })
            .select()
            .single()
            
          if (cardSaleError) throw cardSaleError
          sales.push(cardSale)
        }
      }
      
      // Criar vendas individuais para cada cota de bolão
      if (vendaData.quantidadeCotas > 0) {
        for (let i = 0; i < vendaData.quantidadeCotas; i++) {
          const { data: quotaSale, error: quotaSaleError } = await supabase
            .from('sales')
            .insert({
              customer_id: customerId,
              edition_id: vendaData.edicaoId,
              promotora_id: vendaData.promotorId || null,
              revendedor_id: vendaData.revendedorId || null,
              sale_type: 'bolao_quota',
              sale_origin: sale_origin,
              amount: Number(edicao.bolao_quota_price),
              quotas_quantity: 1,
              payment_status: 'pending'
            })
            .select()
            .single()
            
          if (quotaSaleError) throw quotaSaleError
          sales.push(quotaSale)

          // Processar cada cota individualmente para distribuir em grupos diferentes
          try {
            const { data: quotaResult, error: quotaProcessError } = await supabase.functions.invoke(
              'process-bolao-quotas',
              {
                body: {
                  saleId: quotaSale.id,
                  editionId: vendaData.edicaoId
                }
              }
            )
            
            if (quotaProcessError) {
              console.error('Erro ao processar cota de bolão:', quotaProcessError)
              // Não falhar a venda, apenas logar o erro
            } else {
              console.log('Cota de bolão processada:', quotaResult)
            }
          } catch (quotaError) {
            console.error('Erro ao chamar função de processamento de cota:', quotaError)
            // Não falhar a venda, apenas logar o erro
          }
        }
      }
      
      if (sales.length === 0) {
        throw new Error("Nenhum produto selecionado")
      }
      
      // Usar a primeira venda para o PIX (ou combinar se necessário)
      const sale = sales[0]
        
      // 5. Gerar PIX
      const pixData = await generatePIX({
        saleId: sale.id,
        amount: vendaData.valorTotal,
        customerName: vendaData.nome,
        customerCpf: vendaData.cpf,
        customerEmail: vendaData.email
      })

      if (!pixData) {
        throw new Error("Falha ao gerar PIX")
      }

      toast({
        title: "Venda criada com sucesso!",
        description: "PIX gerado. Complete o pagamento para finalizar.",
      })

      return {
        success: true,
        sales,
        pix: pixData
      }

    } catch (error: any) {
      console.error("Erro ao criar venda pública:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível processar a venda",
        variant: "destructive"
      })
      return {
        success: false,
        error: error.message
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    criarVendaPublica,
    loading
  }
}