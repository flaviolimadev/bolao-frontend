import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  PieChart,
  Activity,
  Award,
  Target
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Pie
} from "recharts"
import { useToast } from "@/hooks/use-toast"
import { useRelatorios } from "@/hooks/useRelatorios"
import { useEdicaoSelecionada } from "@/contexts/EdicaoSelecionada"
import { EdicaoSelector } from "@/components/EdicaoSelector"

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))']

export default function Relatorios() {
  const { toast } = useToast()
  const { edicaoSelecionada } = useEdicaoSelecionada()
  const { relatorioVendas, relatorioPromotoras, relatorioRevendedores, loading, fetchRelatorios } = useRelatorios(edicaoSelecionada?.id)
  
  const [periodo, setPeriodo] = useState("30")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  const aplicarFiltros = () => {
    let inicio = ""
    let fim = ""

    if (periodo === "custom" && dataInicio && dataFim) {
      inicio = dataInicio
      fim = dataFim
    } else if (periodo !== "all") {
      const days = parseInt(periodo)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - days)
      
      inicio = startDate.toISOString().split('T')[0]
      fim = endDate.toISOString().split('T')[0]
    }

    fetchRelatorios(inicio, fim, edicaoSelecionada?.id)
  }

  const exportarRelatorio = () => {
    toast({
      title: "Exportando relatório",
      description: "O relatório será baixado em breve...",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Relatórios</h2>
          <p className="text-muted-foreground">
            Análise completa de vendas, performance e estatísticas
          </p>
        </div>
        <Button onClick={exportarRelatorio}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Seletor de Edição */}
      <EdicaoSelector allowHistoryNavigation={true} />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                  <SelectItem value="custom">Período customizado</SelectItem>
                  <SelectItem value="all">Todos os dados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodo === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button onClick={aplicarFiltros} disabled={loading}>
              {loading ? "Carregando..." : "Aplicar Filtros"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg">Carregando relatórios...</div>
        </div>
      ) : (
        <Tabs defaultValue="vendas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="promotoras">Promotoras</TabsTrigger>
            <TabsTrigger value="revendedores">Revendedores</TabsTrigger>
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          </TabsList>

          {/* Relatório de Vendas */}
          <TabsContent value="vendas" className="space-y-6">
            {relatorioVendas && (
              <>
                {/* Stats de Vendas */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Total de Vendas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{relatorioVendas.totalVendas}</div>
                      <p className="text-xs text-muted-foreground">Vendas realizadas</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Faturamento Total
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R$ {relatorioVendas.valorTotal.toFixed(2).replace('.', ',')}
                      </div>
                      <p className="text-xs text-success">Receita bruta</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Cartelas Individuais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{relatorioVendas.cartelasIndividuais}</div>
                      <p className="text-xs text-muted-foreground">
                        {relatorioVendas.totalVendas > 0 
                          ? Math.round((relatorioVendas.cartelasIndividuais / relatorioVendas.totalVendas) * 100)
                          : 0
                        }% do total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Cotas de Bolão</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{relatorioVendas.cotasBolao}</div>
                      <p className="text-xs text-muted-foreground">
                        {relatorioVendas.totalVendas > 0 
                          ? Math.round((relatorioVendas.cotasBolao / relatorioVendas.totalVendas) * 100)
                          : 0
                        }% do total
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráficos de Vendas */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vendas por Mês</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={relatorioVendas.vendasPorMes}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'vendas' ? value : `R$ ${Number(value).toFixed(2)}`,
                              name === 'vendas' ? 'Vendas' : 'Valor'
                            ]}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="vendas" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))" 
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Vendas por Origem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={relatorioVendas.vendasPorOrigem}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="vendas"
                          >
                            {relatorioVendas.vendasPorOrigem.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Clientes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Top 10 Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Total de Compras</TableHead>
                          <TableHead>Valor Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatorioVendas.topClientes.map((cliente, index) => (
                          <TableRow key={cliente.telefone}>
                            <TableCell>
                              <Badge variant={index < 3 ? "default" : "outline"}>
                                #{index + 1}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{cliente.nome}</TableCell>
                            <TableCell>{cliente.telefone}</TableCell>
                            <TableCell>{cliente.totalCompras}</TableCell>
                            <TableCell className="font-medium">
                              R$ {cliente.valorTotal.toFixed(2).replace('.', ',')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Relatório de Promotoras */}
          <TabsContent value="promotoras" className="space-y-6">
            {relatorioPromotoras && (
              <>
                {/* Stats de Promotoras */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Total de Promotoras
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{relatorioPromotoras.totalPromotoras}</div>
                      <p className="text-xs text-muted-foreground">Cadastradas no sistema</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Promotoras Ativas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{relatorioPromotoras.promotorasAtivas}</div>
                      <p className="text-xs text-success">
                        {relatorioPromotoras.totalPromotoras > 0 
                          ? Math.round((relatorioPromotoras.promotorasAtivas / relatorioPromotoras.totalPromotoras) * 100)
                          : 0
                        }% do total
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Comissões
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R$ {relatorioPromotoras.totalComissoes.toFixed(2).replace('.', ',')}
                      </div>
                      <p className="text-xs text-muted-foreground">Comissões acumuladas</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Ranking de Promotoras */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Ranking de Promotoras
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Total de Vendas</TableHead>
                          <TableHead>Comissão Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatorioPromotoras.ranking.map((promotora, index) => (
                          <TableRow key={promotora.id}>
                            <TableCell>
                              <Badge variant={index < 3 ? "default" : "outline"}>
                                #{index + 1}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{promotora.nome}</TableCell>
                            <TableCell>{promotora.vendas}</TableCell>
                            <TableCell className="font-medium">
                              R$ {promotora.comissao.toFixed(2).replace('.', ',')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Relatório de Revendedores */}
          <TabsContent value="revendedores" className="space-y-6">
            {relatorioRevendedores && (
              <>
                {/* Stats de Revendedores */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Total de Revendedores
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{relatorioRevendedores.totalRevendedores}</div>
                      <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Revendedores Ativos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{relatorioRevendedores.revendedoresAtivos}</div>
                      <p className="text-xs text-success">
                        {relatorioRevendedores.totalRevendedores > 0 
                          ? Math.round((relatorioRevendedores.revendedoresAtivos / relatorioRevendedores.totalRevendedores) * 100)
                          : 0
                        }% do total
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Comissões
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R$ {relatorioRevendedores.totalComissoes.toFixed(2).replace('.', ',')}
                      </div>
                      <p className="text-xs text-muted-foreground">Comissões acumuladas</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Ranking de Revendedores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Ranking de Revendedores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Total de Vendas</TableHead>
                          <TableHead>Comissão Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatorioRevendedores.ranking.map((revendedor, index) => (
                          <TableRow key={revendedor.id}>
                            <TableCell>
                              <Badge variant={index < 3 ? "default" : "outline"}>
                                #{index + 1}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{revendedor.nome}</TableCell>
                            <TableCell>{revendedor.vendas}</TableCell>
                            <TableCell className="font-medium">
                              R$ {revendedor.comissao.toFixed(2).replace('.', ',')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Visão Geral */}
          <TabsContent value="geral" className="space-y-6">
            {relatorioVendas && relatorioPromotoras && relatorioRevendedores && (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R$ {relatorioVendas.valorTotal.toFixed(2).replace('.', ',')}
                      </div>
                      <p className="text-xs text-success">Faturamento bruto</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R$ {(relatorioPromotoras.totalComissoes + relatorioRevendedores.totalComissoes).toFixed(2).replace('.', ',')}
                      </div>
                      <p className="text-xs text-muted-foreground">Total de comissões</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Vendedores Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {relatorioPromotoras.promotorasAtivas + relatorioRevendedores.revendedoresAtivos}
                      </div>
                      <p className="text-xs text-muted-foreground">Promotoras + Revendedores</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        R$ {relatorioVendas.totalVendas > 0 
                          ? (relatorioVendas.valorTotal / relatorioVendas.totalVendas).toFixed(2).replace('.', ',')
                          : '0,00'
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">Por venda</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Vendas por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { tipo: 'Cartelas Individuais', vendas: relatorioVendas.cartelasIndividuais },
                        { tipo: 'Cotas de Bolão', vendas: relatorioVendas.cotasBolao }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tipo" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="vendas" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}