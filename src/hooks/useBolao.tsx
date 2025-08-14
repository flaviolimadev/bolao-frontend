import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types"
import { useToast } from "@/hooks/use-toast"
import { useWhatsApp, WhatsAppMessage } from "@/hooks/useWhatsApp"

type BolaoGroup = Tables<"bolao_groups">
type BolaoQuota = Tables<"bolao_quotas">
type BolaoGroupInsert = TablesInsert<"bolao_groups">
type BolaoQuotaInsert = TablesInsert<"bolao_quotas">

export interface BolaoGroupWithQuotas extends BolaoGroup {
  edition: Tables<"editions">
  quotas: (BolaoQuota & {
    sale: Tables<"sales"> & {
      customer: Tables<"customers">
    }
  })[]
  uploads?: Tables<"card_uploads">[]
}

export function useBolao() {
  const [grupos, setGrupos] = useState<BolaoGroupWithQuotas[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()
  const { sendBulkWhatsApp } = useWhatsApp()

  const fetchGrupos = async (editionId?: string) => {
    try {
      setLoading(true)
      let query = supabase
        .from("bolao_groups")
        .select(`
          *,
          edition:editions(*),
          quotas:bolao_quotas(
            *,
            sale:sales(
              *,
              customer:customers(*)
            )
          ),
          uploads:card_uploads(*)
        `)

      // Se não especificar edição, buscar apenas da edição ativa
      if (!editionId) {
        const { data: edicaoAtiva } = await supabase
          .from("editions")
          .select("id")
          .eq("status", "active")
          .single()

        if (edicaoAtiva) {
          query = query.eq("edition_id", edicaoAtiva.id)
        }
      } else {
        query = query.eq("edition_id", editionId)
      }

      const { data, error } = await query.order("group_number", { ascending: true })

      if (error) throw error
      setGrupos(data || [])
    } catch (error) {
      console.error("Error fetching bolao groups:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os grupos de bolão",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async (data: BolaoGroupInsert) => {
    try {
      const { data: newGroup, error } = await supabase
        .from("bolao_groups")
        .insert(data)
        .select(`
          *,
          edition:editions(*),
          quotas:bolao_quotas(
            *,
            sale:sales(
              *,
              customer:customers(*)
            )
          )
        `)
        .single()

      if (error) throw error

      setGrupos(prev => [...prev, newGroup])
      toast({
        title: "Sucesso",
        description: "Grupo de bolão criado com sucesso"
      })
      
      return { data: newGroup, error: null }
    } catch (error) {
      console.error("Error creating bolao group:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o grupo de bolão",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const updateGroup = async (id: string, data: TablesUpdate<"bolao_groups">) => {
    try {
      const { data: updatedGroup, error } = await supabase
        .from("bolao_groups")
        .update(data)
        .eq("id", id)
        .select(`
          *,
          edition:editions(*),
          quotas:bolao_quotas(
            *,
            sale:sales(
              *,
              customer:customers(*)
            )
          )
        `)
        .single()

      if (error) throw error

      setGrupos(prev => 
        prev.map(g => g.id === id ? updatedGroup : g)
      )
      toast({
        title: "Sucesso",
        description: "Grupo atualizado com sucesso"
      })
      return { data: updatedGroup, error: null }
    } catch (error) {
      console.error("Error updating bolao group:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o grupo",
        variant: "destructive"
      })
      return { data: null, error }
    }
  }

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bolao_groups")
        .delete()
        .eq("id", id)

      if (error) throw error

      setGrupos(prev => prev.filter(g => g.id !== id))
      toast({
        title: "Sucesso",
        description: "Grupo excluído com sucesso"
      })
      return { error: null }
    } catch (error) {
      console.error("Error deleting bolao group:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o grupo",
        variant: "destructive"
      })
      return { error }
    }
  }

  const marcarCartelasEnviadas = async (groupId: string) => {
    try {
      setSending(true)
      
      // Buscar o grupo com suas cotas e uploads
      const { data: grupo, error: groupError } = await supabase
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
        .eq("id", groupId)
        .single()

      if (groupError) throw groupError
      if (!grupo) throw new Error("Grupo não encontrado")

      // Verificar se há uploads de cartelas
      const cartela = grupo.uploads?.find(upload => upload.upload_type === "group_cards")
      if (!cartela) {
        toast({
          title: "Erro",
          description: "Nenhuma cartela foi uploadada para este grupo",
          variant: "destructive"
        })
        return
      }

      // Preparar mensagens para WhatsApp
      const messages: WhatsAppMessage[] = grupo.quotas.map(quota => ({
        saleId: quota.sale_id,
        customerPhone: quota.sale.customer.phone,
        customerName: quota.sale.customer.name,
        messageType: 'quota',
        content: `Cotas: ${quota.quota_numbers.join(', ')}`,
        mediaUrl: cartela.file_url
      }))

      if (messages.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum participante encontrado no grupo",
          variant: "destructive"
        })
        return
      }

      // Enviar mensagens via WhatsApp
      await sendBulkWhatsApp(messages)

      // Marcar como enviado apenas se o WhatsApp foi enviado com sucesso
      const { error: updateError } = await supabase
        .from("bolao_groups")
        .update({ cards_sent: true })
        .eq("id", groupId)

      if (updateError) throw updateError

      await fetchGrupos() // Recarregar dados
      
      toast({
        title: "Sucesso",
        description: `Cartelas enviadas para ${messages.length} participantes via WhatsApp`
      })
    } catch (error) {
      console.error("Error sending cards:", error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar as cartelas via WhatsApp",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    fetchGrupos()
  }, [])

  return {
    grupos,
    loading,
    sending,
    fetchGrupos,
    createGroup,
    updateGroup,
    deleteGroup,
    marcarCartelasEnviadas
  }
}