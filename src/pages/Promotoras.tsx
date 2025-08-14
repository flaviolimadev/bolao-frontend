import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  MoreHorizontal, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign,
  TrendingUp,
  CheckCircle,
  Power,
  PowerOff,
  Trophy,
  Star
} from "lucide-react"
import { usePromotoras } from "@/hooks/usePromotoras"
import { PromotoraModal } from "@/components/PromotoraModal"
import { SalesLinkSection } from "@/components/SalesLinkSection"
type Promotora = {
  id: string
  user_id: string
  nome: string
  contato?: string | null
  email?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  ranking_position?: number | null
  total_sales?: number
  commission_total?: number
  automatic_link_id?: string | null
  manual_link_id?: string | null
  photo_url?: string | null
}

export default function Promotoras() {
  const { promotoras, loading, createPromotora, updatePromotora, deletePromotora, togglePromotoraStatus } = usePromotoras()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPromotora, setEditingPromotora] = useState<Promotora | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [promotoraToDelete, setPromotoraToDelete] = useState<Promotora | null>(null)
  
  const filteredPromotoras = promotoras.filter(promotora => {
    const name = (promotora.nome || '').toLowerCase()
    const phone = (promotora.contato || '')
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "ativa" && promotora.is_active) ||
                         (statusFilter === "inativa" && !promotora.is_active)
    
    return matchesSearch && matchesStatus
  })

  // Ordenar por ranking (menores posições primeiro) e depois por vendas
  const sortedPromotoras = [...filteredPromotoras].sort((a, b) => {
    if (a.ranking_position && b.ranking_position) {
      return a.ranking_position - b.ranking_position
    }
    if (a.ranking_position && !b.ranking_position) return -1
    if (!a.ranking_position && b.ranking_position) return 1
    return b.total_sales - a.total_sales
  })

  const totalVendas = promotoras.reduce((acc, p: any) => acc + (p.total_sales || 0), 0)
  const promotorasAtivas = promotoras.filter(p => p.is_active).length
  const promotorasComRanking = promotoras.filter(p => p.ranking_position).length

  const handleCreateNew = () => {
    setEditingPromotora(null)
    setModalOpen(true)
  }

  const handleEdit = (promotora: Promotora) => {
    setEditingPromotora(promotora)
    setModalOpen(true)
  }

  const handleSave = async (data: any) => {
    if (editingPromotora) {
      return updatePromotora(editingPromotora.id, data)
    } else {
      return createPromotora(data)
    }
  }

  const handleDelete = (promotora: Promotora) => {
    setPromotoraToDelete(promotora)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (promotoraToDelete) {
      await deletePromotora(promotoraToDelete.id)
      setDeleteDialogOpen(false)
      setPromotoraToDelete(null)
    }
  }

  const handleToggleStatus = async (promotora: Promotora) => {
    await togglePromotoraStatus(promotora.id, !promotora.is_active)
  }

  const getRankingIcon = (position: number | null) => {
    if (!position) return null
    if (position === 1) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (position === 2) return <Trophy className="h-4 w-4 text-gray-400" />
    if (position === 3) return <Trophy className="h-4 w-4 text-amber-600" />
    return <Star className="h-4 w-4 text-blue-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Promotoras</h2>
          <p className="text-muted-foreground">
            Gerencie as promotoras e suas vendas
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Promotora
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Promotoras Ativas</p>
                <p className="text-2xl font-bold">{promotorasAtivas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold">{totalVendas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">No Ranking</p>
                <p className="text-2xl font-bold">{promotorasComRanking}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="ativa">Ativas</SelectItem>
                <SelectItem value="inativa">Inativas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Promotoras */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-muted rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="h-20 bg-muted rounded" />
                  <div className="h-16 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedPromotoras.map((promotora) => (
            <Card key={promotora.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header da Promotora */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={promotora.photo_url || undefined} />
                          <AvatarFallback>
                            {(promotora.nome || '').split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {promotora.ranking_position && (
                          <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                            {getRankingIcon(promotora.ranking_position)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{promotora.nome}</h3>
                          {promotora.ranking_position && (
                            <Badge variant="outline" className="text-xs">
                              #{promotora.ranking_position}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{promotora.contato}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={promotora.is_active ? "default" : "secondary"}>
                        {promotora.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(promotora)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(promotora)}>
                            {promotora.is_active ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(promotora)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Estatísticas de Vendas */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-t border-b border-muted">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{promotora.total_sales}</p>
                      <p className="text-xs text-muted-foreground">Total Vendas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">R$ {Number(promotora.commission_total).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Comissão</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {promotora.automatic_link_id ? "✓" : "✗"}
                      </p>
                      <p className="text-xs text-muted-foreground">Link Auto</p>
                    </div>
                  </div>

                  {/* Links de Vendas */}
                  <SalesLinkSection
                    automaticLinkId={promotora.automatic_link_id}
                    manualLinkId={promotora.manual_link_id}
                    name={promotora.name}
                    type="promotora"
                  />

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(promotora)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      variant={promotora.is_active ? "default" : "secondary"}
                      onClick={() => handleToggleStatus(promotora)}
                    >
                      {promotora.is_active ? (
                        <>
                          <PowerOff className="h-4 w-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && sortedPromotoras.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma promotora encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {promotoras.length === 0 
                ? "Ainda não há promotoras cadastradas."
                : "Não há promotoras que correspondam aos filtros aplicados."
              }
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              {promotoras.length === 0 ? "Cadastrar Primeira Promotora" : "Nova Promotora"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <PromotoraModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        promotora={editingPromotora}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a promotora {promotoraToDelete?.name}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}