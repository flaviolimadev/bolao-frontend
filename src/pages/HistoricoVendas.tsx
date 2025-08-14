import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  History, 
  Search, 
  Download,
  User,
  FileText,
  Trophy,
  Plus,
  Edit,
  Trash2
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useVendas } from "@/hooks/useVendas"
import VendaModal from "@/components/VendaModal"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function HistoricoVendas() {
  const { vendas, loading, createSale, updateSale, deleteSale } = useVendas()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")
  const [filterTipo, setFilterTipo] = useState("todos")
  const [filterPeriodo, setFilterPeriodo] = useState("30")
  const [isVendaModalOpen, setIsVendaModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<any | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago": return "bg-success/10 text-success border-success/20"
      case "pendente": return "bg-warning/10 text-warning border-warning/20"
      case "cancelado": return "bg-destructive/10 text-destructive border-destructive/20"
      default: return "bg-muted/50 text-muted-foreground border-muted"
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "individual": return "bg-primary/10 text-primary border-primary/20"
      case "bolao": return "bg-secondary/10 text-secondary border-secondary/20"
      default: return "bg-muted/50 text-muted-foreground border-muted"
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getVendedorInfo = (venda: any) => {
    if (venda.promotora) {
      const n = venda.promotora.nome || venda.promotora.name || ""
      return `${n} (Promotora)`
    } else if (venda.revendedor) {
      const n = venda.revendedor.nome || venda.revendedor.name || ""
      return `${n} (Revendedor)`
    }
    return "Venda Direta"
  }

  const filteredVendas = vendas.filter((venda: any) => {
    const vendedorInfo = getVendedorInfo(venda)
    const customerName = (venda.customer?.nome || venda.customer?.name || '').toLowerCase()
    const matchesSearch = customerName.includes(searchTerm.toLowerCase()) ||
      vendedorInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.id.toString().includes(searchTerm)
    
    const matchesStatus = filterStatus === "todos" || venda.payment_status === filterStatus
    const saleTypeDisplay = venda.sale_type === "individual_card" ? "individual" : "bolao"
    const matchesTipo = filterTipo === "todos" || saleTypeDisplay === filterTipo
    
    // Filtro de período (últimos X dias)
    const hoje = new Date()
    const dataVenda = new Date(venda.created_at)
    const diffDays = Math.ceil((hoje.getTime() - dataVenda.getTime()) / (1000 * 3600 * 24))
    const matchesPeriodo = filterPeriodo === "todos" || diffDays <= parseInt(filterPeriodo)
    
    return matchesSearch && matchesStatus && matchesTipo && matchesPeriodo
  })

  // Estatísticas
  const totalVendas = filteredVendas.length
  const valorTotal = filteredVendas.reduce((sum, v) => sum + Number(v.amount), 0)
  const comissaoTotal = filteredVendas.reduce((sum, v) => {
    const comissaoPercent = v.promotora ? 0.1 : v.revendedor ? 0.05 : 0
    return sum + (Number(v.amount) * comissaoPercent)
  }, 0)
  const vendasPagas = filteredVendas.filter(v => v.payment_status === "paid").length

  const exportarRelatorio = () => {
    // Simular export de relatório
    console.log("Exportando relatório...")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Histórico de Vendas</h2>
          <p className="text-muted-foreground">
            Acompanhe todas as vendas realizadas e gerencie pagamentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsVendaModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </Button>
          <Button variant="outline" onClick={exportarRelatorio}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendas}</div>
            <p className="text-xs text-success">No período selecionado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {valorTotal.toFixed(2).replace(".", ",")}</div>
            <p className="text-xs text-success">Faturamento bruto</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {comissaoTotal.toFixed(2).replace(".", ",")}</div>
            <p className="text-xs text-success">Total de comissões</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vendas Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendasPagas}</div>
            <p className="text-xs text-success">
              {totalVendas > 0 ? Math.round((vendasPagas / totalVendas) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, vendedor ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="todos">Todos os períodos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="individual">Cartela Individual</SelectItem>
                <SelectItem value="bolao">Cota de Bolão</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Vendas Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Vendas Realizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Edição</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    Carregando vendas...
                  </TableCell>
                </TableRow>
              ) : filteredVendas.map((venda) => {
                const vendedorInfo = getVendedorInfo(venda)
                const saleTypeDisplay = venda.sale_type === "individual_card" ? "individual" : "bolao"
                const comissaoPercent = venda.promotora ? 0.1 : venda.revendedor ? 0.05 : 0
                const comissaoValue = Number(venda.amount) * comissaoPercent
                
                return (
                  <TableRow key={venda.id}>
                    <TableCell className="font-medium">#{venda.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {format(new Date(venda.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(venda.created_at), "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {(venda.customer?.nome || venda.customer?.name)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{vendedorInfo.split(" (")[0]}</div>
                        <div className="text-xs text-muted-foreground">
                          ({vendedorInfo.split(" (")[1]?.replace(")", "")})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(saleTypeDisplay)}>
                        {saleTypeDisplay === "individual" ? (
                          <>
                            <FileText className="h-3 w-3 mr-1" />
                            Individual
                          </>
                        ) : (
                          <>
                            <Trophy className="h-3 w-3 mr-1" />
                            Bolão
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{venda.quotas_quantity || 1}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(venda.amount))}</TableCell>
                    <TableCell className="font-medium text-success">
                      {formatCurrency(comissaoValue)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(venda.payment_status === "paid" ? "pago" : venda.payment_status === "pending" ? "pendente" : "cancelado")}>
                        {venda.payment_status === "paid" ? "pago" : venda.payment_status === "pending" ? "pendente" : "cancelado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">#{(venda.edition?.edition_number)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingSale(venda); setIsVendaModalOpen(true) }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredVendas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium">Nenhuma venda encontrada</div>
              <div className="text-sm">Ajuste os filtros para ver mais resultados</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Nova Venda */}
      <VendaModal
        isOpen={isVendaModalOpen}
        onClose={() => { setIsVendaModalOpen(false); setEditingSale(null); }}
        onSubmit={(data) => editingSale ? updateSale(editingSale.id, data) : createSale(data)}
        sale={editingSale}
      />
    </div>
  )
}