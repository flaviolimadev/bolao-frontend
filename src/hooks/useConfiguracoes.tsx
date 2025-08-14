import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export interface ConfiguracaoSistema {
  id: string
  chave: string
  valor: string
  descricao?: string
  tipo: 'texto' | 'numero' | 'boolean' | 'json'
  categoria: 'geral' | 'edicoes' | 'comissoes' | 'notificacoes' | 'integracao'
}

export function useConfiguracoes() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Configurações padrão do sistema
  const configuracoesDefault: ConfiguracaoSistema[] = [
    // Configurações Gerais
    {
      id: 'config_1',
      chave: 'nome_sistema',
      valor: 'Sistema de Vendas',
      descricao: 'Nome do sistema exibido no cabeçalho',
      tipo: 'texto',
      categoria: 'geral'
    },
    {
      id: 'config_2',
      chave: 'timezone',
      valor: 'America/Sao_Paulo',
      descricao: 'Fuso horário do sistema',
      tipo: 'texto',
      categoria: 'geral'
    },
    {
      id: 'config_3',
      chave: 'moeda',
      valor: 'BRL',
      descricao: 'Moeda padrão do sistema',
      tipo: 'texto',
      categoria: 'geral'
    },
    
    // Configurações de Edições
    {
      id: 'config_4',
      chave: 'preco_cartela_individual_default',
      valor: '25.00',
      descricao: 'Preço padrão para cartelas individuais',
      tipo: 'numero',
      categoria: 'edicoes'
    },
    {
      id: 'config_5',
      chave: 'preco_cota_bolao_default',
      valor: '2.50',
      descricao: 'Preço padrão para cotas de bolão',
      tipo: 'numero',
      categoria: 'edicoes'
    },
    {
      id: 'config_6',
      chave: 'max_cotas_por_grupo',
      valor: '10',
      descricao: 'Número máximo de cotas por grupo de bolão',
      tipo: 'numero',
      categoria: 'edicoes'
    },
    
    // Configurações de Comissões
    {
      id: 'config_7',
      chave: 'comissao_promotora_percentual',
      valor: '10',
      descricao: 'Percentual de comissão para promotoras (%)',
      tipo: 'numero',
      categoria: 'comissoes'
    },
    {
      id: 'config_8',
      chave: 'comissao_revendedor_percentual',
      valor: '5',
      descricao: 'Percentual de comissão para revendedores (%)',
      tipo: 'numero',
      categoria: 'comissoes'
    },
    
    // Configurações de Notificações
    {
      id: 'config_9',
      chave: 'whatsapp_ativo',
      valor: 'true',
      descricao: 'Envio automático via WhatsApp',
      tipo: 'boolean',
      categoria: 'notificacoes'
    },
    {
      id: 'config_10',
      chave: 'email_ativo',
      valor: 'false',
      descricao: 'Envio automático via email',
      tipo: 'boolean',
      categoria: 'notificacoes'
    },
    
    // Configurações de Integração
    {
      id: 'config_11',
      chave: 'api_whatsapp_url',
      valor: '',
      descricao: 'URL da API do WhatsApp',
      tipo: 'texto',
      categoria: 'integracao'
    },
    {
      id: 'config_12',
      chave: 'webhook_pagamento_url',
      valor: '',
      descricao: 'URL do webhook para notificações de pagamento',
      tipo: 'texto',
      categoria: 'integracao'
    }
  ]

  const fetchConfiguracoes = async () => {
    try {
      setLoading(true)
      
      // Buscar configurações do localStorage
      const savedConfigs = localStorage.getItem('system_configs')
      
      if (savedConfigs) {
        const parsedConfigs = JSON.parse(savedConfigs)
        setConfiguracoes(parsedConfigs)
      } else {
        // Se não há configurações salvas, usar as padrão
        setConfiguracoes(configuracoesDefault)
        localStorage.setItem('system_configs', JSON.stringify(configuracoesDefault))
      }
    } catch (error) {
      console.error("Error fetching configurações:", error)
      // Em caso de erro, usar configurações padrão
      setConfiguracoes(configuracoesDefault)
      toast({
        title: "Aviso",
        description: "Carregadas configurações padrão do sistema",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateConfiguracao = async (chave: string, valor: string) => {
    try {
      const novasConfigs = configuracoes.map(config => 
        config.chave === chave ? { ...config, valor } : config
      )
      
      setConfiguracoes(novasConfigs)
      localStorage.setItem('system_configs', JSON.stringify(novasConfigs))

      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso"
      })
    } catch (error) {
      console.error("Error updating config:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração",
        variant: "destructive"
      })
    }
  }

  const getConfiguracao = (chave: string) => {
    const config = configuracoes.find(c => c.chave === chave)
    return config?.valor || ''
  }

  const exportarConfiguracoes = () => {
    const dataStr = JSON.stringify(configuracoes, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `configuracoes_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importarConfiguracoes = async (file: File) => {
    try {
      const text = await file.text()
      const importedConfigs = JSON.parse(text)
      
      // Validar estrutura
      if (!Array.isArray(importedConfigs)) {
        throw new Error("Formato de arquivo inválido")
      }

      // Validar se cada configuração tem a estrutura correta
      const validConfigs = importedConfigs.filter(config => 
        config.chave && config.valor !== undefined && config.id && config.tipo && config.categoria
      )

      if (validConfigs.length === 0) {
        throw new Error("Nenhuma configuração válida encontrada no arquivo")
      }

      setConfiguracoes(validConfigs)
      localStorage.setItem('system_configs', JSON.stringify(validConfigs))

      toast({
        title: "Sucesso",
        description: `${validConfigs.length} configurações importadas com sucesso`
      })
    } catch (error) {
      console.error("Error importing configs:", error)
      toast({
        title: "Erro",
        description: "Não foi possível importar as configurações. Verifique o formato do arquivo.",
        variant: "destructive"
      })
    }
  }

  const resetarConfiguracoes = async () => {
    try {
      setConfiguracoes(configuracoesDefault)
      localStorage.setItem('system_configs', JSON.stringify(configuracoesDefault))
      
      toast({
        title: "Configurações resetadas",
        description: "Todas as configurações foram restauradas para os valores padrão"
      })
    } catch (error) {
      console.error("Error resetting configs:", error)
      toast({
        title: "Erro",
        description: "Não foi possível resetar as configurações",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchConfiguracoes()
  }, [])

  return {
    configuracoes,
    loading,
    updateConfiguracao,
    getConfiguracao,
    exportarConfiguracoes,
    importarConfiguracoes,
    resetarConfiguracoes,
    fetchConfiguracoes
  }
}