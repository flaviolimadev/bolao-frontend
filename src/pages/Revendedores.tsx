import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  TrendingUp,
  Trophy,
  Power,
  PowerOff,
  Star
} from "lucide-react"
import { useRevendedores } from "@/hooks/useRevendedores"
import { RevendedorModal } from "@/components/RevendedorModal"
import { SalesLinkSection } from "@/components/SalesLinkSection"
type Revendedor = {
  id: string
  user_id: string
  nome: string
  contato?: string | null
  email?: string | null
  photo_url?: string | null
  is_active: boolean
  ranking_position?: number | null
  total_sales?: number
  commission_total?: number
  automatic_link_id?: string | null
}

export default function Revendedores() {
  const { revendedores, loading, createRevendedor, updateRevendedor, deleteRevendedor, toggleRevendedorStatus } = useRevendedores()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRevendedor, setEditingRevendedor] = useState<Revendedor | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [revendedorToDelete, setRevendedorToDelete] = useState<Revendedor | null>(null)
  
  const filteredRevendedores = revendedores.filter(revendedor => {
    const name = (revendedor.nome || '').toLowerCase()
    const phone = (revendedor.contato || '')
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "ativa" && revendedor.is_active) ||
                         (statusFilter === "inativa" && !revendedor.is_active)
    
    return matchesSearch && matchesStatus
  })

  // Ordenar por ranking (menores posições primeiro) e depois por vendas
  const sortedRevendedores = [...filteredRevendedores].sort((a, b) => {
    if (a.ranking_position && b.ranking_position) {
      return a.ranking_position - b.ranking_position
    }
    if (a.ranking_position && !b.ranking_position) return -1
    if (!a.ranking_position && b.ranking_position) return 1
    return b.total_sales - a.total_sales
  })

  const totalVendas = revendedores.reduce((acc: number, r: any) => acc + (r.total_sales || 0), 0)
  const revendedoresAtivos = revendedores.filter(r => r.is_active).length
  const revendedoresComRanking = revendedores.filter(r => r.ranking_position).length

  const handleCreateNew = () => {
    setEditingRevendedor(null)
    setModalOpen(true)
  }

  const handleEdit = (revendedor: Revendedor) => {
    setEditingRevendedor(revendedor)
    setModalOpen(true)
  }

  const handleSave = async (data: any) => {
    if (editingRevendedor) {
      return updateRevendedor(editingRevendedor.id, data)
    } else {
      return createRevendedor(data)
    }
  }

  const handleDelete = (revendedor: Revendedor) => {
    setRevendedorToDelete(revendedor)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (revendedorToDelete) {
      await deleteRevendedor(revendedorToDelete.id)
      setDeleteDialogOpen(false)
      setRevendedorToDelete(null)
    }
  }

  const handleToggleStatus = async (revendedor: Revendedor) => {
    await toggleRevendedorStatus(revendedor.id, !revendedor.is_active)
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
          <h2 className="text-3xl font-bold text-foreground">Revendedores</h2>
          <p className="text-muted-foreground">
            Gerencie os revendedores e suas vendas
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Revendedor
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Revendedores Ativos</p>
                <p className="text-2xl font-bold">{revendedoresAtivos}</p>
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
                <p className="text-2xl font-bold">{revendedoresComRanking}</p>
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
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativa">Ativos</SelectItem>
                <SelectItem value="inativa">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Revendedores */}
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
          {sortedRevendedores.map((revendedor) => (
            <Card key={revendedor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header do Revendedor */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={revendedor.photo_url || undefined} />
                          <AvatarFallback>
                            {(revendedor.nome || '').split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {revendedor.ranking_position && (
                          <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                            {getRankingIcon(revendedor.ranking_position)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{revendedor.nome}</h3>
                          {revendedor.ranking_position && (
                            <Badge variant="outline" className="text-xs">
                              #{revendedor.ranking_position}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{revendedor.contato}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={revendedor.is_active ? "default" : "secondary"}>
                        {revendedor.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(revendedor)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(revendedor)}>
                            {revendedor.is_active ? (
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
                            onClick={() => handleDelete(revendedor)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-muted">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{revendedor.total_sales}</p>
                      <p className="text-xs text-muted-foreground">Total Vendas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">R$ {Number(revendedor.commission_total).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Comissão</p>
                    </div>
                  </div>

                  {/* Links de Vendas */}
                  <SalesLinkSection
                    automaticLinkId={revendedor.automatic_link_id}
                    manualLinkId={null}
                    name={revendedor.nome}
                    type="revendedor"
                  />

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(revendedor)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      variant={revendedor.is_active ? "default" : "secondary"}
                      onClick={() => handleToggleStatus(revendedor)}
                    >
                      {revendedor.is_active ? (
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

      {!loading && sortedRevendedores.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum revendedor encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {revendedores.length === 0 
                ? "Ainda não há revendedores cadastrados."
                : "Não há revendedores que correspondam aos filtros aplicados."
              }
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              {revendedores.length === 0 ? "Cadastrar Primeiro Revendedor" : "Novo Revendedor"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <RevendedorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        revendedor={editingRevendedor}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o revendedor {revendedorToDelete?.name}? 
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