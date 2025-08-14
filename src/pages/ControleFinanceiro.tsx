import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Search,
  Download,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  CreditCard,
  Banknote
} from "lucide-react"
import { useControleFinanceiro } from "@/hooks/useControleFinanceiro"
import { useEdicaoSelecionada } from "@/contexts/EdicaoSelecionada"
import { EdicaoSelector } from "@/components/EdicaoSelector"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ControleFinanceiro() {
  const { edicaoSelecionada } = useEdicaoSelecionada()
  const { vendas, resumoFinanceiro, loading, updatePaymentStatus, exportarRelatorio } = useControleFinanceiro(edicaoSelecionada?.id)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [originFilter, setOriginFilter] = useState<string>("all")

  const filteredVendas = vendas.filter(venda => {
    const matchesSearch = 
      venda.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.customers?.phone?.includes(searchTerm) ||
      venda.customers?.cpf?.includes(searchTerm)
    
    const matchesStatus = statusFilter === "all" || venda.payment_status === statusFilter
    const matchesOrigin = originFilter === "all" || venda.sale_origin === originFilter
    
    return matchesSearch && matchesStatus && matchesOrigin
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: { variant: "default" as const, icon: CheckCircle, text: "Pago", color: "text-green-600" },
      pending: { variant: "secondary" as const, icon: Clock, text: "Pendente", color: "text-yellow-600" },
      failed: { variant: "destructive" as const, icon: XCircle, text: "Falhou", color: "text-red-600" },
      cancelled: { variant: "outline" as const, icon: XCircle, text: "Cancelado", color: "text-gray-600" }
    }
    
    const config = variants[status as keyof typeof variants] || variants.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const getOriginBadge = (origin: string) => {
    const variants = {
      direct: { text: "Direto", color: "bg-blue-100 text-blue-800" },
      promotora: { text: "Promotora", color: "bg-purple-100 text-purple-800" },
      revendedor: { text: "Revendedor", color: "bg-green-100 text-green-800" }
    }
    
    const config = variants[origin as keyof typeof variants] || variants.direct
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.text}
      </Badge>
    )
  }

  const handleStatusChange = async (saleId: string, newStatus: string) => {
    await updatePaymentStatus(saleId, newStatus)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Controle Financeiro</h2>
          <p className="text-muted-foreground">
            Acompanhe vendas, pagamentos e comissões
          </p>
        </div>
        <Button onClick={exportarRelatorio}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Seletor de Edição */}
      <EdicaoSelector allowHistoryNavigation={true} />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {resumoFinanceiro.receitaTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {resumoFinanceiro.vendasConfirmadas} vendas confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Receita Líquida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {resumoFinanceiro.receitaLiquida.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Após comissões
            </p>
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
            <p className="text-xs text-muted-foreground">
              Revendedores (Qtd × R$ 25,00 × 10%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {resumoFinanceiro.vendasPendentes}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando pagamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, telefone ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status do pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={originFilter} onValueChange={setOriginFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Origem da venda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as origens</SelectItem>
                <SelectItem value="direct">Direto</SelectItem>
                <SelectItem value="promotora">Promotora</SelectItem>
                <SelectItem value="revendedor">Revendedor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Histórico de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell>
                        {format(new Date(venda.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{venda.customers?.name}</div>
                          <div className="text-sm text-muted-foreground">{venda.customers?.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {Number(venda.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(venda.payment_status)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {venda.sale_type === 'individual_card' ? 'Cartela Individual' : 'Cota Bolão'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getOriginBadge(venda.sale_origin)}
                      </TableCell>
                      <TableCell>
                        {venda.promotoras?.name || venda.revendedores?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {venda.payment_status !== 'paid' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(venda.id, 'paid')}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar como Pago
                              </DropdownMenuItem>
                            )}
                            {venda.payment_status === 'pending' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(venda.id, 'failed')}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Marcar como Falhou
                              </DropdownMenuItem>
                            )}
                            {venda.payment_status !== 'cancelled' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(venda.id, 'cancelled')}
                                className="text-gray-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredVendas.length === 0 && (
                <div className="text-center py-8">
                  <Banknote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma venda encontrada</h3>
                  <p className="text-muted-foreground">
                    {vendas.length === 0 
                      ? "Ainda não há vendas registradas."
                      : "Não há vendas que correspondam aos filtros aplicados."
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Comissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Comissões Revendedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                R$ {resumoFinanceiro.comissaoRevendedores.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                Quantidade de vendas × R$ 25,00 × 10%
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Receita Total:</span>
                <span className="font-medium">R$ {resumoFinanceiro.receitaTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Comissões:</span>
                <span className="font-medium text-red-600">- R$ {resumoFinanceiro.comissaoRevendedores.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">Receita Líquida:</span>
                <span className="font-bold text-green-600">R$ {resumoFinanceiro.receitaLiquida.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}