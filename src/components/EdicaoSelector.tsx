import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Check, 
  Archive,
  Clock,
  DollarSign,
  History
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEdicoes, type Edicao } from "@/hooks/useEdicoes"
import { useEdicaoSelecionada } from "@/contexts/EdicaoSelecionada"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EdicaoSelectorProps {
  showControls?: boolean
  allowHistoryNavigation?: boolean
}

export function EdicaoSelector({ showControls = true, allowHistoryNavigation = false }: EdicaoSelectorProps) {
  const { toast } = useToast()
  const { 
    edicoes, 
    getEdicaoAtual,
    finalizarEdicao,
    criarNovaEdicao 
  } = useEdicoes()
  
  const { edicaoSelecionada, setEdicaoSelecionada, isVisualizandoHistorico } = useEdicaoSelecionada()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    numero: "",
    status: "ativa",
    valorCartela: "25.00",
    valorCota: "5.00",
    cotasPorGrupo: "10",
    cartelasPorGrupo: "15",
    dataSorteio: "",
  })

  const edicaoAtual = getEdicaoAtual()
  const edicaoParaMostrar = allowHistoryNavigation ? edicaoSelecionada : edicaoAtual

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-success/10 text-success border-success/20" : "bg-primary/10 text-primary border-primary/20"
  }

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? "Ativa" : "Finalizada"
  }

  const handleFinalizarEdicao = async () => {
    if (edicaoParaMostrar?.is_active) {
      await finalizarEdicao(edicaoParaMostrar.edition_number)
    }
  }

  const handleEdicaoChange = (editionId: string) => {
    if (allowHistoryNavigation) {
      const edicao = edicoes.find(e => e.id === editionId)
      if (edicao) {
        setEdicaoSelecionada(edicao)
      }
    }
  }

  const handleCriarNovaEdicao = async () => {
    try {
      await criarNovaEdicao(formData)
      setIsDialogOpen(false)
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM", { locale: ptBR })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {edicaoParaMostrar ? `Edição #${edicaoParaMostrar.edition_number}` : "Nenhuma edição ativa"}
                {allowHistoryNavigation && isVisualizandoHistorico && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <History className="h-3 w-3 mr-1" />
                    Histórico
                  </Badge>
                )}
              </CardTitle>
              {edicaoParaMostrar && (
                <p className="text-sm text-muted-foreground">
                  Sorteio: {formatarData(edicaoParaMostrar.draw_date)} • 
                  Cartela: R$ {edicaoParaMostrar.individual_card_price.toFixed(2).replace(".", ",")}
                </p>
              )}
            </div>
            {edicaoParaMostrar && (
              <Badge className={getStatusColor(edicaoParaMostrar.is_active)}>
                {getStatusLabel(edicaoParaMostrar.is_active)}
              </Badge>
            )}
          </div>

          {showControls && (
            <div className="flex items-center gap-2">
              {allowHistoryNavigation && (
                <Select
                  value={edicaoSelecionada?.id || ""}
                  onValueChange={handleEdicaoChange}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {edicoes
                      .sort((a, b) => b.edition_number - a.edition_number)
                      .map((edicao) => (
                      <SelectItem key={edicao.id} value={edicao.id}>
                        <div className="flex items-center gap-2">
                          <span>#{edicao.edition_number}</span>
                          <Badge 
                            variant="outline" 
                            className={`${getStatusColor(edicao.is_active)} text-xs`}
                          >
                            {getStatusLabel(edicao.is_active)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {edicaoParaMostrar?.is_active && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleFinalizarEdicao}
                  className="text-primary"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Finalizar
                </Button>
              )}

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Edição
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md" aria-describedby="dialog-description">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Edição</DialogTitle>
                    <p id="dialog-description" className="text-sm text-muted-foreground">
                      Configure os parâmetros da nova edição
                    </p>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          type="number"
                          value={formData.numero}
                          onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                          placeholder="Auto"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dataSorteio">Data Sorteio</Label>
                        <Input
                          id="dataSorteio"
                          type="date"
                          value={formData.dataSorteio}
                          onChange={(e) => setFormData(prev => ({ ...prev, dataSorteio: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="valorCartela">Cartela (R$)</Label>
                        <Input
                          id="valorCartela"
                          type="number"
                          step="0.01"
                          value={formData.valorCartela}
                          onChange={(e) => setFormData(prev => ({ ...prev, valorCartela: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="valorCota">Cota (R$)</Label>
                        <Input
                          id="valorCota"
                          type="number"
                          step="0.01"
                          value={formData.valorCota}
                          onChange={(e) => setFormData(prev => ({ ...prev, valorCota: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <Button onClick={handleCriarNovaEdicao} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Edição
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}