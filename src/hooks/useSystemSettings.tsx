import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface SystemSettings {
  company_info: {
    name: string
    email: string
    phone: string
    address: string
    logo_url: string
  }
  commission_rates: {
    promotora: number
    revendedor: number
    gerente: number
    bonus_mensal: number
  }
  notifications: {
    email_vendas: boolean
    whatsapp_vendas: boolean
    email_relatorios: boolean
    notif_comissoes: boolean
    alertas_pagamento: boolean
  }
  whatsapp_config: {
    api_key: string
    mensagem_cartela: string
    mensagem_bolao: string
    mensagem_comissao: string
    auto_envio: boolean
  }
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching settings:', error)
        return
      }

      // Converter array de configurações para objeto estruturado
      const settingsObj: any = {}
      data?.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value
      })

      setSettings(settingsObj as SystemSettings)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: keyof SystemSettings, value: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key)

      if (error) {
        toast({
          title: "Erro ao salvar configuração",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      // Atualizar estado local
      setSettings(prev => prev ? { ...prev, [key]: value } : null)
      
      toast({
        title: "Configuração salva",
        description: "As configurações foram atualizadas com sucesso"
      })

      return { error: null }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar configuração",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      })
      return { error }
    }
  }

  const updateCompanyInfo = async (companyInfo: SystemSettings['company_info']) => {
    return await updateSetting('company_info', companyInfo)
  }

  const updateCommissionRates = async (commissionRates: SystemSettings['commission_rates']) => {
    return await updateSetting('commission_rates', commissionRates)
  }

  const updateNotificationSettings = async (notifications: SystemSettings['notifications']) => {
    return await updateSetting('notifications', notifications)
  }

  const updateWhatsAppConfig = async (whatsappConfig: SystemSettings['whatsapp_config']) => {
    return await updateSetting('whatsapp_config', whatsappConfig)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    updateCompanyInfo,
    updateCommissionRates,
    updateNotificationSettings,
    updateWhatsAppConfig,
    refetch: fetchSettings
  }
}