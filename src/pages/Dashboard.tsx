import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, ShoppingCart, Trophy, TrendingUp, Calendar, DollarSign, FileText, Activity, Clock, Plus, Send, BarChart3, AlertCircle, CheckCircle, RefreshCw, Target, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useDashboard } from "@/hooks/useDashboard";
import { useEdicoes } from "@/hooks/useEdicoes";
import { useNavigate } from "react-router-dom";
const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];
export default function Dashboard() {
  const {
    stats,
    atividadeRecente,
    proximosEventos,
    loading,
    refetch
  } = useDashboard();
  const {
    edicoes
  } = useEdicoes();
  const navigate = useNavigate();
  const edicaoAtiva = edicoes.find(e => e.status === 'active');
  if (loading) {
    return <div className="space-y-6">
        <div className="bg-gradient-brand text-white p-8 rounded-2xl shadow-xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2">Dashboard</h2>
              <p className="text-white/90 text-lg">Carregando dados...</p>
            </div>
            <div className="animate-spin">
              <RefreshCw className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>;
  }
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };
  const formatPercentage = (value: number) => {
    const signal = value >= 0 ? '+' : '';
    return `${signal}${value.toFixed(1)}%`;
  };
  const diasProximoSorteio = proximosEventos[0]?.dias_restantes || 0;
  return <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-brand text-white p-8 rounded-2xl shadow-xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">Dashboard</h2>
            <p className="text-white/90 text-lg">Bem-vindo ao painel de controle do Gestão de Vendas</p>
          </div>
          <div className="flex items-center gap-4">
            {edicaoAtiva && <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Edição #{edicaoAtiva.edition_number} - 
                  {diasProximoSorteio > 0 ? ` Sorteio em ${diasProximoSorteio} dias` : ' Sorteio hoje!'}
                </span>
              </div>}
            <Button variant="outline" size="sm" onClick={refetch} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Vendas Hoje */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.vendasHoje.valor)}</div>
              <p className={`text-xs ${stats.vendasHoje.mudanca >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatPercentage(stats.vendasHoje.mudanca)} vs ontem
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.vendasHoje.total} vendas realizadas
              </p>
            </CardContent>
          </Card>

          {/* Cartelas Vendidas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cartelas Hoje</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cartelasVendidas.total}</div>
              <p className={`text-xs ${stats.cartelasVendidas.mudanca >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatPercentage(stats.cartelasVendidas.mudanca)} vs ontem
              </p>
              <p className="text-xs text-muted-foreground">Cartelas individuais</p>
            </CardContent>
          </Card>

          {/* Cotas de Bolão */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cotas Hoje</CardTitle>
              <Trophy className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cotasBolao.total}</div>
              <p className={`text-xs ${stats.cotasBolao.mudanca >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatPercentage(stats.cotasBolao.mudanca)} vs ontem
              </p>
              <p className="text-xs text-muted-foreground">Cotas de bolão</p>
            </CardContent>
          </Card>

          {/* Vendedores Ativos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
              <Users className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.promotorasAtivas.total + stats.revendedoresAtivos.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.promotorasAtivas.total} promotoras, {stats.revendedoresAtivos.total} revendedores
              </p>
            </CardContent>
          </Card>
        </div>}

      {/* Faturamento Mensal */}
      {stats && <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Faturamento do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold">{formatCurrency(stats.totalFaturamento.mes)}</div>
                <p className={`text-sm ${stats.totalFaturamento.mudanca >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatPercentage(stats.totalFaturamento.mudanca)} vs mês anterior
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium text-muted-foreground">
                  Mês anterior: {formatCurrency(stats.totalFaturamento.anterior)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/dashboard/edicao')}>
              <Calendar className="h-4 w-4 mr-2" />
              Nova Edição
            </Button>
            
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/dashboard/promotoras')}>
              <Users className="h-4 w-4 mr-2" />
              Cadastrar Promotora
            </Button>
            
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/dashboard/cartelas')}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Cartelas
            </Button>

            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/dashboard/vendas')}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Venda
            </Button>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atividadeRecente.slice(0, 5).map(atividade => <div key={atividade.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${atividade.tipo === 'cartela' ? 'bg-primary' : 'bg-accent'}`} />
                    <div>
                      <div className="font-medium text-sm">{atividade.descricao}</div>
                      <div className="text-xs text-muted-foreground">{atividade.cliente}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{atividade.valor}</div>
                    <div className="text-xs text-muted-foreground">{atividade.tempo}</div>
                  </div>
                </div>)}
              
              {atividadeRecente.length === 0 && <div className="text-center py-4 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Nenhuma atividade recente</div>
                </div>}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proximosEventos.map(evento => <div key={evento.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{evento.titulo}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(evento.data).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <Badge variant={evento.dias_restantes <= 3 ? "destructive" : "outline"}>
                    {evento.dias_restantes <= 0 ? 'Hoje' : `${evento.dias_restantes}d`}
                  </Badge>
                </div>)}
              
              {proximosEventos.length === 0 && <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Nenhum evento programado</div>
                </div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status da Edição Ativa */}
      {edicaoAtiva && <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Status da Edição #{edicaoAtiva.edition_number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(edicaoAtiva.individual_card_price)}
                </div>
                <div className="text-sm text-muted-foreground">Preço Cartela</div>
              </div>
              
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-accent">
                  {formatCurrency(edicaoAtiva.bolao_quota_price)}
                </div>
                <div className="text-sm text-muted-foreground">Preço Cota</div>
              </div>
              
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-warning">
                  {edicaoAtiva.quotas_per_group}
                </div>
                <div className="text-sm text-muted-foreground">Cotas por Grupo</div>
              </div>
              
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-success">
                  {new Date(edicaoAtiva.draw_date).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-sm text-muted-foreground">Data do Sorteio</div>
              </div>
            </div>
          </CardContent>
        </Card>}
    </div>;
}