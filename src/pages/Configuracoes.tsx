import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Save,
  Bell,
  DollarSign,
  Users,
  MessageSquare,
  Shield,
  Palette,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEdicoes } from "@/hooks/useEdicoes"
import { useSystemSettings } from "@/hooks/useSystemSettings"

export default function Configuracoes() {
  const { toast } = useToast()
  const { getEdicaoAtual, toggleSalesStatus } = useEdicoes()
  const { settings, loading, updateCompanyInfo, updateCommissionRates, updateNotificationSettings, updateWhatsAppConfig } = useSystemSettings()
  const [mostrarSenha, setMostrarSenha] = useState(false)
  
  const edicaoAtual = getEdicaoAtual()
  
  // Estados locais para formulários
  const [configGerais, setConfigGerais] = useState({
    nomeEmpresa: "",
    emailContato: "",
    telefoneContato: "",
    endereco: "",
    logoUrl: ""
  })

  const [configComissoes, setConfigComissoes] = useState({
    comissaoPromotora: "10",
    comissaoRevendedor: "15", 
    comissaoGerente: "5",
    bonusVendaMensal: "100"
  })

  const [configNotificacoes, setConfigNotificacoes] = useState({
    emailVendas: true,
    whatsappVendas: true,
    emailRelatorios: true,
    notifComissoes: true,
    alertasPagamento: true
  })

  const [configWhatsApp, setConfigWhatsApp] = useState({
    apiKey: "",
    mensagemCartela: "",
    mensagemBolao: "",
    mensagemComissao: "",
    autoEnvio: true
  })

  // Carregar configurações do banco
  useEffect(() => {
    if (settings) {
      // Configurações gerais
      if (settings.company_info) {
        setConfigGerais({
          nomeEmpresa: settings.company_info.name || "",
          emailContato: settings.company_info.email || "",
          telefoneContato: settings.company_info.phone || "",
          endereco: settings.company_info.address || "",
          logoUrl: settings.company_info.logo_url || ""
        })
      }

      // Comissões
      if (settings.commission_rates) {
        setConfigComissoes({
          comissaoPromotora: settings.commission_rates.promotora?.toString() || "10",
          comissaoRevendedor: settings.commission_rates.revendedor?.toString() || "15",
          comissaoGerente: settings.commission_rates.gerente?.toString() || "5",
          bonusVendaMensal: settings.commission_rates.bonus_mensal?.toString() || "100"
        })
      }

      // Notificações
      if (settings.notifications) {
        setConfigNotificacoes({
          emailVendas: settings.notifications.email_vendas ?? true,
          whatsappVendas: settings.notifications.whatsapp_vendas ?? true,
          emailRelatorios: settings.notifications.email_relatorios ?? true,
          notifComissoes: settings.notifications.notif_comissoes ?? true,
          alertasPagamento: settings.notifications.alertas_pagamento ?? true
        })
      }

      // WhatsApp
      if (settings.whatsapp_config) {
        setConfigWhatsApp({
          apiKey: settings.whatsapp_config.api_key || "",
          mensagemCartela: settings.whatsapp_config.mensagem_cartela || "",
          mensagemBolao: settings.whatsapp_config.mensagem_bolao || "",
          mensagemComissao: settings.whatsapp_config.mensagem_comissao || "",
          autoEnvio: settings.whatsapp_config.auto_envio ?? true
        })
      }
    }
  }, [settings])

  const [configSeguranca, setConfigSeguranca] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
    autenticacao2FA: false,
    sessaoExpira: "8"
  })

  const handleSaveGerais = async () => {
    await updateCompanyInfo({
      name: configGerais.nomeEmpresa,
      email: configGerais.emailContato,
      phone: configGerais.telefoneContato,
      address: configGerais.endereco,
      logo_url: configGerais.logoUrl
    })
  }

  const handleSaveComissoes = async () => {
    await updateCommissionRates({
      promotora: parseFloat(configComissoes.comissaoPromotora),
      revendedor: parseFloat(configComissoes.comissaoRevendedor),
      gerente: parseFloat(configComissoes.comissaoGerente),
      bonus_mensal: parseFloat(configComissoes.bonusVendaMensal)
    })
  }

  const handleSaveNotificacoes = async () => {
    await updateNotificationSettings({
      email_vendas: configNotificacoes.emailVendas,
      whatsapp_vendas: configNotificacoes.whatsappVendas,
      email_relatorios: configNotificacoes.emailRelatorios,
      notif_comissoes: configNotificacoes.notifComissoes,
      alertas_pagamento: configNotificacoes.alertasPagamento
    })
  }

  const handleSaveWhatsApp = async () => {
    await updateWhatsAppConfig({
      api_key: configWhatsApp.apiKey,
      mensagem_cartela: configWhatsApp.mensagemCartela,
      mensagem_bolao: configWhatsApp.mensagemBolao,
      mensagem_comissao: configWhatsApp.mensagemComissao,
      auto_envio: configWhatsApp.autoEnvio
    })
  }

  const handleSaveSeguranca = () => {
    if (configSeguranca.novaSenha !== configSeguranca.confirmarSenha) {
      toast({
        title: "Erro!",
        description: "As senhas não coincidem.",
        variant: "destructive"
      })
      return
    }
    
    toast({
      title: "Segurança atualizada!",
      description: "Suas configurações de segurança foram salvas.",
    })
  }

  const exportarDados = () => {
    toast({
      title: "Exportando dados...",
      description: "Seus dados estão sendo preparados para download.",
    })
  }

  const limparDados = () => {
    toast({
      title: "Limpeza agendada",
      description: "Os dados antigos serão removidos conforme configurado.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema e preferências da conta
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary">
          <Settings className="h-4 w-4 mr-2" />
          Sistema v2.1.0
        </Badge>
      </div>

      <Tabs defaultValue="gerais" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="gerais">Gerais</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="gerais" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                  <Input
                    id="nomeEmpresa"
                    value={configGerais.nomeEmpresa}
                    onChange={(e) => setConfigGerais(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailContato">Email de Contato</Label>
                  <Input
                    id="emailContato"
                    type="email"
                    value={configGerais.emailContato}
                    onChange={(e) => setConfigGerais(prev => ({ ...prev, emailContato: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefoneContato">Telefone de Contato</Label>
                  <Input
                    id="telefoneContato"
                    value={configGerais.telefoneContato}
                    onChange={(e) => setConfigGerais(prev => ({ ...prev, telefoneContato: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL da Logo</Label>
                  <Input
                    id="logoUrl"
                    value={configGerais.logoUrl}
                    onChange={(e) => setConfigGerais(prev => ({ ...prev, logoUrl: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Textarea
                  id="endereco"
                  value={configGerais.endereco}
                  onChange={(e) => setConfigGerais(prev => ({ ...prev, endereco: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveGerais} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações Gerais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Controle de Vendas */}
        <TabsContent value="vendas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Controle de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {edicaoAtual ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Edição Ativa</h4>
                    <p className="text-sm text-muted-foreground">
                      Edição #{edicaoAtual.edition_number} • Sorteio: {new Date(edicaoAtual.draw_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">
                        Status das Vendas
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {edicaoAtual.sales_paused 
                          ? "As vendas estão pausadas para esta edição" 
                          : "As vendas estão ativas e funcionando normalmente"
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={edicaoAtual.sales_paused ? "destructive" : "default"}>
                        {edicaoAtual.sales_paused ? "Pausadas" : "Ativas"}
                      </Badge>
                      <Button
                        variant={edicaoAtual.sales_paused ? "default" : "destructive"}
                        onClick={() => toggleSalesStatus(edicaoAtual.id, !edicaoAtual.sales_paused)}
                      >
                        {edicaoAtual.sales_paused ? "Retomar Vendas" : "Pausar Vendas"}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">💡 Dica</h4>
                    <p className="text-sm text-yellow-700">
                      Pausar vendas impede novas vendas sem afetar vendas já processadas. 
                      Útil para manutenção, problemas técnicos ou estratégias comerciais.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma edição ativa encontrada</p>
                  <p className="text-sm">Crie uma edição ativa para controlar as vendas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Comissões */}
        <TabsContent value="comissoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Taxas de Comissão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="comissaoPromotora">Comissão Promotora (%)</Label>
                  <Input
                    id="comissaoPromotora"
                    type="number"
                    step="0.1"
                    value={configComissoes.comissaoPromotora}
                    onChange={(e) => setConfigComissoes(prev => ({ ...prev, comissaoPromotora: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comissaoRevendedor">Comissão Revendedor (%)</Label>
                  <Input
                    id="comissaoRevendedor"
                    type="number"
                    step="0.1"
                    value={configComissoes.comissaoRevendedor}
                    onChange={(e) => setConfigComissoes(prev => ({ ...prev, comissaoRevendedor: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="comissaoGerente">Comissão Gerente (%)</Label>
                  <Input
                    id="comissaoGerente"
                    type="number"
                    step="0.1"
                    value={configComissoes.comissaoGerente}
                    onChange={(e) => setConfigComissoes(prev => ({ ...prev, comissaoGerente: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonusVendaMensal">Bônus Venda Mensal (R$)</Label>
                  <Input
                    id="bonusVendaMensal"
                    type="number"
                    step="0.01"
                    value={configComissoes.bonusVendaMensal}
                    onChange={(e) => setConfigComissoes(prev => ({ ...prev, bonusVendaMensal: e.target.value }))}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Prévia de Comissões</h4>
                <div className="text-sm space-y-1">
                  <div>Cartela R$ 25,00 → Promotora: R$ {(25 * parseFloat(configComissoes.comissaoPromotora) / 100).toFixed(2)}</div>
                  <div>Cartela R$ 25,00 → Revendedor: R$ {(25 * parseFloat(configComissoes.comissaoRevendedor) / 100).toFixed(2)}</div>
                  <div>Cota R$ 5,00 → Promotora: R$ {(5 * parseFloat(configComissoes.comissaoPromotora) / 100).toFixed(2)}</div>
                </div>
              </div>

              <Button onClick={handleSaveComissoes} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações de Comissão
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Notificações */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por Email - Vendas</Label>
                    <p className="text-sm text-muted-foreground">Receber email a cada nova venda</p>
                  </div>
                  <Switch
                    checked={configNotificacoes.emailVendas}
                    onCheckedChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, emailVendas: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações WhatsApp - Vendas</Label>
                    <p className="text-sm text-muted-foreground">Receber WhatsApp resumo diário</p>
                  </div>
                  <Switch
                    checked={configNotificacoes.whatsappVendas}
                    onCheckedChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, whatsappVendas: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Relatórios Automáticos</Label>
                    <p className="text-sm text-muted-foreground">Enviar relatórios semanais por email</p>
                  </div>
                  <Switch
                    checked={configNotificacoes.emailRelatorios}
                    onCheckedChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, emailRelatorios: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de Comissão</Label>
                    <p className="text-sm text-muted-foreground">Notificar sobre comissões acumuladas</p>
                  </div>
                  <Switch
                    checked={configNotificacoes.notifComissoes}
                    onCheckedChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, notifComissoes: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de Pagamento</Label>
                    <p className="text-sm text-muted-foreground">Notificar sobre pagamentos pendentes</p>
                  </div>
                  <Switch
                    checked={configNotificacoes.alertasPagamento}
                    onCheckedChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, alertasPagamento: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotificacoes} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Preferências de Notificação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações do WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Integração WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key do WhatsApp</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={configWhatsApp.apiKey}
                  onChange={(e) => setConfigWhatsApp(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagemCartela">Mensagem para Cartela Individual</Label>
                <Textarea
                  id="mensagemCartela"
                  value={configWhatsApp.mensagemCartela}
                  onChange={(e) => setConfigWhatsApp(prev => ({ ...prev, mensagemCartela: e.target.value }))}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Variáveis: {`{nome}, {numero}, {valor}, {data}`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagemBolao">Mensagem para Cota de Bolão</Label>
                <Textarea
                  id="mensagemBolao"
                  value={configWhatsApp.mensagemBolao}
                  onChange={(e) => setConfigWhatsApp(prev => ({ ...prev, mensagemBolao: e.target.value }))}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Variáveis: {`{nome}, {grupo}, {cotas}, {valor}`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagemComissao">Mensagem para Comissão</Label>
                <Textarea
                  id="mensagemComissao"
                  value={configWhatsApp.mensagemComissao}
                  onChange={(e) => setConfigWhatsApp(prev => ({ ...prev, mensagemComissao: e.target.value }))}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Variáveis: {`{nome}, {valor}, {periodo}`}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Envio Automático</Label>
                  <p className="text-sm text-muted-foreground">Enviar mensagens automaticamente após vendas</p>
                </div>
                <Switch
                  checked={configWhatsApp.autoEnvio}
                  onCheckedChange={(checked) => setConfigWhatsApp(prev => ({ ...prev, autoEnvio: checked }))}
                />
              </div>

              <Button onClick={handleSaveWhatsApp} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações do WhatsApp
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Segurança */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="senhaAtual"
                    type={mostrarSenha ? "text" : "password"}
                    value={configSeguranca.senhaAtual}
                    onChange={(e) => setConfigSeguranca(prev => ({ ...prev, senhaAtual: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={configSeguranca.novaSenha}
                    onChange={(e) => setConfigSeguranca(prev => ({ ...prev, novaSenha: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={configSeguranca.confirmarSenha}
                    onChange={(e) => setConfigSeguranca(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticação de Dois Fatores (2FA)</Label>
                  <p className="text-sm text-muted-foreground">Adicionar camada extra de segurança</p>
                </div>
                <Switch
                  checked={configSeguranca.autenticacao2FA}
                  onCheckedChange={(checked) => setConfigSeguranca(prev => ({ ...prev, autenticacao2FA: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessaoExpira">Sessão Expira (horas)</Label>
                <Select 
                  value={configSeguranca.sessaoExpira} 
                  onValueChange={(value) => setConfigSeguranca(prev => ({ ...prev, sessaoExpira: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 horas</SelectItem>
                    <SelectItem value="4">4 horas</SelectItem>
                    <SelectItem value="8">8 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveSeguranca} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações de Segurança
              </Button>
            </CardContent>
          </Card>

          {/* Gerenciamento de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Exportar Dados</Label>
                  <p className="text-sm text-muted-foreground">Baixar backup completo dos dados</p>
                </div>
                <Button variant="outline" onClick={exportarDados}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Limpar Dados Antigos</Label>
                  <p className="text-sm text-muted-foreground">Remover dados com mais de 2 anos</p>
                </div>
                <Button variant="outline" onClick={limparDados}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}