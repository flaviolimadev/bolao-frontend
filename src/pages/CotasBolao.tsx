import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Search, 
  Download,
  Eye,
  Plus,
  Send,
  CheckCircle,
  Clock,
  Edit3,
  Trash2,
  Upload
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useBolao, BolaoGroupWithQuotas } from "@/hooks/useBolao"
import { useEdicoes } from "@/hooks/useEdicoes"
import { useEdicaoAtiva } from "@/contexts/EdicaoAtiva"
import { useBolaoProcessing } from "@/hooks/useBolaoProcessing"
import { useBolaoAutomation } from "@/hooks/useBolaoAutomation"
import { BolaoModal } from "@/components/BolaoModal"
import { GroupParticipantsModal } from "@/components/GroupParticipantsModal"
import { GroupCardUpload } from "@/components/GroupCardUpload"

export default function CotasBolao() {
  const { toast } = useToast()
  const { grupos, loading, sending, deleteGroup, marcarCartelasEnviadas } = useBolao()
  const { edicoes } = useEdicoes()
  const { edicaoAtiva } = useEdicaoAtiva()
  const { criarGrupoBolao, processarVendasPendentes, loading: processingLoading } = useBolaoProcessing()
  
  // Ativar automação de grupos prontos
  useBolaoAutomation()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")
  const [filterEdicao, setFilterEdicao] = useState("todas")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<BolaoGroupWithQuotas | undefined>()
  const [detailsGroup, setDetailsGroup] = useState<BolaoGroupWithQuotas | undefined>()
  const [uploadGroup, setUploadGroup] = useState<BolaoGroupWithQuotas | undefined>()

  const getGroupStatus = (grupo: BolaoGroupWithQuotas) => {
    if (grupo.cards_sent) return "whatsapp_enviado"
    if (grupo.is_complete && grupo.cards_uploaded) return "cartelas_prontas"
    if (grupo.cards_uploaded && !grupo.is_complete) return "cartelas_uploaded"
    if (grupo.is_complete) return "grupo_completo"
    return "grupo_aberto"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "whatsapp_enviado": return "bg-success/10 text-success border-success/20"
      case "cartelas_prontas": return "bg-primary/10 text-primary border-primary/20"
      case "cartelas_uploaded": return "bg-warning/10 text-warning border-warning/20"
      case "grupo_completo": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "grupo_aberto": return "bg-muted/10 text-muted-foreground border-muted/20"
      default: return "bg-muted/50 text-muted-foreground border-muted"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "whatsapp_enviado": return <CheckCircle className="h-3 w-3 mr-1" />
      case "cartelas_prontas": return <Send className="h-3 w-3 mr-1" />
      case "cartelas_uploaded": return <Upload className="h-3 w-3 mr-1" />
      case "grupo_completo": return <Users className="h-3 w-3 mr-1" />
      case "grupo_aberto": return <Clock className="h-3 w-3 mr-1" />
      default: return null
    }
  }

  // Filtrar grupos da edição ativa primeiro, depois aplicar outros filtros
  const gruposEdicaoAtiva = edicaoAtiva 
    ? grupos.filter(grupo => grupo.edition_id === edicaoAtiva.id)
    : []

  const filteredGrupos = gruposEdicaoAtiva.filter(grupo => {
    const status = getGroupStatus(grupo)
    const groupSearch = `Grupo ${grupo.group_number}`
    
    const matchesSearch = groupSearch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grupo.edition.edition_number.toString().includes(searchTerm)
    
    const matchesStatus = filterStatus === "todos" || status === filterStatus
    const matchesEdicao = filterEdicao === "todas" || grupo.edition.edition_number.toString() === filterEdicao
    
    return matchesSearch && matchesStatus && matchesEdicao
  })

  // Estatísticas
  const totalGrupos = filteredGrupos.length
  const gruposCompletos = filteredGrupos.filter(g => g.is_complete).length
  const gruposEnviados = filteredGrupos.filter(g => g.cards_sent).length
  const gruposAbertos = filteredGrupos.filter(g => !g.is_complete).length

  const handleEdit = (grupo: BolaoGroupWithQuotas) => {
    setEditingGroup(grupo)
    setModalOpen(true)
  }

  const handleDelete = async (grupo: BolaoGroupWithQuotas) => {
    await deleteGroup(grupo.id)
  }

  const handleDetails = (grupo: BolaoGroupWithQuotas) => {
    setDetailsGroup(grupo)
  }

  const handleSendCards = async (groupId: string) => {
    await marcarCartelasEnviadas(groupId)
  }

  const handleUploadCards = (grupo: BolaoGroupWithQuotas) => {
    setUploadGroup(grupo)
  }

  const handleCriarGrupo = async () => {
    if (!edicaoAtiva) return
    try {
      await criarGrupoBolao(edicaoAtiva.id)
    } catch (error) {
      console.error("Erro ao criar grupo:", error)
    }
  }

  const handleDownloadGroup = (grupo: BolaoGroupWithQuotas) => {
    toast({
      title: "Download iniciado",
      description: `Baixando cartelas do Grupo ${grupo.group_number}...`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Cotas de Bolão</h2>
          <p className="text-muted-foreground">
            Gerencie grupos de bolão e controle de cotas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={async () => {
              if (edicaoAtiva) {
                await processarVendasPendentes(edicaoAtiva.id)
              }
            }}
            disabled={processingLoading || !edicaoAtiva}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="h-4 w-4 mr-2" />
            {processingLoading ? "Processando..." : "Processar Vendas"}
          </Button>
          <Button 
            onClick={handleCriarGrupo}
            disabled={processingLoading || !edicaoAtiva}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Grupo
          </Button>
          <Button onClick={() => { setEditingGroup(undefined); setModalOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Grupo Manual
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Grupos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGrupos}</div>
            <p className="text-xs text-success">Edição atual</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Grupos Completos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gruposCompletos}</div>
            <p className="text-xs text-success">
              {totalGrupos > 0 ? Math.round((gruposCompletos / totalGrupos) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Grupos Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gruposEnviados}</div>
            <p className="text-xs text-success">Cartelas enviadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Grupos Abertos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gruposAbertos}</div>
            <p className="text-xs text-warning">Aguardando participantes</p>
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
                placeholder="Buscar por grupo ou edição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Select value={filterEdicao} onValueChange={setFilterEdicao}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Edição" />
              </SelectTrigger>
              <SelectContent>
                {edicoes.map(edicao => (
                  <SelectItem key={edicao.id} value={edicao.edition_number.toString()}>
                    Edição #{edicao.edition_number}
                  </SelectItem>
                ))}
                <SelectItem value="todas">Todas</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="grupo_aberto">Grupo Aberto</SelectItem>
                <SelectItem value="grupo_completo">Grupo Completo</SelectItem>
                <SelectItem value="cartelas_uploaded">Cartelas Enviadas</SelectItem>
                <SelectItem value="cartelas_prontas">Cartelas Prontas</SelectItem>
                <SelectItem value="whatsapp_enviado">WhatsApp Enviado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Grupos Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Grupos de Bolão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead>Edição</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando grupos...
                  </TableCell>
                </TableRow>
              ) : (
                filteredGrupos.map((grupo) => {
                  const status = getGroupStatus(grupo)
                  const progress = (grupo.total_quotas / grupo.max_quotas) * 100
                  const valorTotal = grupo.quotas.reduce((sum, quota) => {
                    return sum + quota.sale.amount
                  }, 0)
                  
                  return (
                    <TableRow key={grupo.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          Grupo {grupo.group_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Edição #{grupo.edition.edition_number}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{grupo.total_quotas}/{grupo.max_quotas} cotas</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {valorTotal.toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(status)}>
                          {getStatusIcon(status)}
                          {status === "grupo_aberto" && "Aberto"}
                          {status === "grupo_completo" && "Completo"}
                          {status === "cartelas_uploaded" && "Cartelas Enviadas"}
                          {status === "cartelas_prontas" && "Pronto"}
                          {status === "whatsapp_enviado" && "WhatsApp Enviado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDetails(grupo)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver ({grupo.quotas.length})
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUploadCards(grupo)}
                            title="Upload de cartelas"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadGroup(grupo)}
                            title="Baixar cartelas"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {status === "cartelas_prontas" && (
                            <Button
                              size="sm"
                              onClick={() => handleSendCards(grupo.id)}
                              disabled={sending}
                              title="Enviar cartelas via WhatsApp"
                              className="bg-success text-success-foreground hover:bg-success/90"
                            >
                              <Send className="h-4 w-4" />
                              {sending ? " Enviando..." : ""}
                            </Button>
                          )}
                          {status === "grupo_completo" && !grupo.cards_uploaded && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUploadCards(grupo)}
                              title="Upload de cartelas necessário"
                              className="border-warning text-warning hover:bg-warning/10"
                            >
                              <Upload className="h-4 w-4" />
                              Upload
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(grupo)}
                            title="Editar grupo"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" title="Excluir grupo">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Grupo</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o Grupo {grupo.group_number}? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(grupo)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          
          {filteredGrupos.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium">Nenhum grupo encontrado</div>
              <div className="text-sm">Crie um novo grupo ou ajuste os filtros</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BolaoModal 
        open={modalOpen} 
        onOpenChange={setModalOpen}
        grupo={editingGroup}
        mode={editingGroup ? "edit" : "create"}
      />

      {/* Modal de Detalhes dos Participantes Melhorado */}
      <GroupParticipantsModal 
        grupo={detailsGroup}
        open={!!detailsGroup}
        onOpenChange={() => setDetailsGroup(undefined)}
      />

      {/* Modal de Upload de Cartelas */}
      <Dialog open={!!uploadGroup} onOpenChange={() => setUploadGroup(undefined)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Upload de Cartelas - Grupo {uploadGroup?.group_number}
            </DialogTitle>
          </DialogHeader>
          {uploadGroup && (
            <GroupCardUpload 
              groupId={uploadGroup.id}
              groupNumber={uploadGroup.group_number}
              onUploadComplete={() => {
                setUploadGroup(undefined)
                // Recarregar dados para atualizar status
                window.location.reload()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}