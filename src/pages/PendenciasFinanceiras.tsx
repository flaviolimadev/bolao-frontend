import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowLeft
} from "lucide-react"
import { useEdicoes } from "@/hooks/useEdicoes"
import { useControleFinanceiro } from "@/hooks/useControleFinanceiro"
import { useEdicaoSelecionada } from "@/contexts/EdicaoSelecionada"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function PendenciasFinanceiras() {
  const { toast } = useToast()
  const { edicoes } = useEdicoes()
  const { edicaoSelecionada, setEdicaoSelecionada, isVisualizandoHistorico, voltarParaAtiva } = useEdicaoSelecionada()
  const { vendas, resumoFinanceiro, loading, updatePaymentStatus } = useControleFinanceiro(edicaoSelecionada?.id)
  
  const [selectedEditionId, setSelectedEditionId] = useState<string>("")

  // Filtrar vendas pendentes
  const vendasPendentes = vendas.filter(v => v.payment_status === 'pending')
  const comissoesPendentes = vendas
    .filter(v => v.payment_status === 'paid' && (v.promotora_id || v.revendedor_id))
    .reduce((acc, venda) => {
      const key = venda.promotora_id ? `promotora_${venda.promotora_id}` : `revendedor_${venda.revendedor_id}`
      const nome = venda.promotoras?.name || venda.revendedores?.name || 'N/A'
      const tipo = venda.promotora_id ? 'Promotora' : 'Revendedor'
      const comissao = venda.promotora_id ? Number(venda.amount) * 0.10 : Number(venda.amount) * 0.05
      
      if (!acc[key]) {
        acc[key] = {
          id: venda.promotora_id || venda.revendedor_id,
          nome,
          tipo,
          vendas: 0,
          comissaoTotal: 0
        }
      }
      
      acc[key].vendas += 1
      acc[key].comissaoTotal += comissao
      
      return acc
    }, {} as Record<string, any>)

  const handleEdicaoChange = (editionId: string) => {
    setSelectedEditionId(editionId)
    const edicao = edicoes.find(e => e.id === editionId)
    if (edicao) {
      setEdicaoSelecionada(edicao)
    }
  }

  const handleMarcarComoPago = async (saleId: string) => {
    await updatePaymentStatus(saleId, 'paid')
    toast({
      title: "Sucesso",
      description: "Pagamento confirmado com sucesso"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Pendências Financeiras</h2>
          <p className="text-muted-foreground">
            Gerencie acertos pendentes e comissões por edição
          </p>
        </div>

        {isVisualizandoHistorico && (
          <Button onClick={voltarParaAtiva} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Ativa
          </Button>
        )}
      </div>

      {/* Seletor de Edição */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edição Selecionada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedEditionId || edicaoSelecionada?.id || ""} onValueChange={handleEdicaoChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione uma edição" />
              </SelectTrigger>
              <SelectContent>
                {edicoes
                  .sort((a, b) => b.edition_number - a.edition_number)
                  .map((edicao) => (
                  <SelectItem key={edicao.id} value={edicao.id}>
                    <div className="flex items-center gap-2">
                      <span>Edição #{edicao.edition_number}</span>
                      <Badge variant={edicao.status === 'active' ? 'default' : 'outline'}>
                        {edicao.status === 'active' ? 'Ativa' : 'Finalizada'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(edicao.draw_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {edicaoSelecionada && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Sorteio: {format(new Date(edicaoSelecionada.draw_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                <span>Cartela: R$ {edicaoSelecionada.individual_card_price.toFixed(2).replace(".", ",")}</span>
                {isVisualizandoHistorico && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Histórico
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {resumoFinanceiro.vendasPendentes}
            </div>
            <p className="text-xs text-muted-foreground">Vendas aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Valor Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {vendasPendentes.reduce((acc, v) => acc + Number(v.amount), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">A receber</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Comissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {resumoFinanceiro.comissaoRevendedores.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">A repassar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {resumoFinanceiro.vendasConfirmadas}
            </div>
            <p className="text-xs text-muted-foreground">Vendas pagas</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg">Carregando dados...</div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vendas Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Vendas Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vendasPendentes.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma pendência!</h3>
                  <p className="text-muted-foreground">
                    Todas as vendas desta edição foram confirmadas.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vendasPendentes.map((venda) => (
                    <div key={venda.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{venda.customers?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {venda.customers?.phone} • R$ {Number(venda.amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(venda.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleMarcarComoPago(venda.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comissões a Pagar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Comissões a Repassar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(comissoesPendentes).length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma comissão pendente!</h3>
                  <p className="text-muted-foreground">
                    Não há comissões a repassar nesta edição.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.values(comissoesPendentes).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.tipo} • {item.vendas} vendas
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">
                          R$ {item.comissaoTotal.toFixed(2)}
                        </div>
                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                          A repassar
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}