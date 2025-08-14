import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  ShoppingCart,
  DollarSign,
  Calendar,
  Phone,
  Mail
} from "lucide-react"
import { useClientes } from "@/hooks/useClientes"
import { ClienteModal } from "@/components/ClienteModal"
 
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type Cliente = {
  id: string
  user_id: string
  nome: string
  contato?: string | null
  email?: string | null
  cpf?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // campos opcionais antigos
  phone?: string | null
  name?: string | null
}

export default function Clientes() {
  const { clientes, loading, createCliente, updateCliente, deleteCliente } = useClientes()
  const [searchTerm, setSearchTerm] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null)
  
  // Helpers para lidar com campos ausentes no mock (ex.: total_purchases, first_purchase_date)
  const getSafeTotalPurchases = (c: Cliente) => Number((c as any).total_purchases ?? 0)
  const getFirstPurchaseDate = (c: Cliente) => (c as any).first_purchase_date || c.created_at || c.updated_at || null

  const filteredClientes = clientes.filter((cliente: any) => {
    const nome = (cliente.nome || cliente.name || '').toLowerCase()
    const telefone = (cliente.contato || cliente.phone || '')
    const email = (cliente.email || '').toLowerCase()
    const cpf = (cliente.cpf || '')
    const matchesSearch = 
      nome.includes(searchTerm.toLowerCase()) ||
      telefone.includes(searchTerm) ||
      cpf.includes(searchTerm) ||
      email.includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Calcular estatísticas
  const totalClientes = clientes.length
  const clientesAtivos = clientes.filter(c => getSafeTotalPurchases(c) > 0).length
  const totalCompras = clientes.reduce((acc, c) => acc + getSafeTotalPurchases(c), 0)
  const ticketMedio = totalClientes > 0 ? totalCompras / totalClientes : 0

  const handleCreateNew = () => {
    setEditingCliente(null)
    setModalOpen(true)
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setModalOpen(true)
  }

  const handleSave = async (data: any) => {
    if (editingCliente) {
      return updateCliente(editingCliente.id, data)
    } else {
      return createCliente(data)
    }
  }

  const handleDelete = (cliente: Cliente) => {
    setClienteToDelete(cliente)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (clienteToDelete) {
      await deleteCliente(clienteToDelete.id)
      setDeleteDialogOpen(false)
      setClienteToDelete(null)
    }
  }

  const getClienteBadge = (totalPurchases: number) => {
    if (totalPurchases === 0) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Novo</Badge>
    } else if (totalPurchases <= 3) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Regular</Badge>
    } else if (totalPurchases <= 10) {
      return <Badge variant="outline" className="bg-purple-100 text-purple-800">Fiel</Badge>
    } else {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">VIP</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Clientes</h2>
          <p className="text-muted-foreground">
            Gerencie os clientes e histórico de compras
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Total Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalClientes}</div>
            <p className="text-xs text-muted-foreground">Cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-green-600" />
              Clientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">Com compras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              Total Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalCompras}</div>
            <p className="text-xs text-muted-foreground">Realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{ticketMedio.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Compras/cliente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, telefone, CPF ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
                  <div className="h-16 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClientes.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header do Cliente */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-semibold">{cliente.nome || cliente.name}</h3>
                        <p className="text-sm text-muted-foreground">{cliente.cpf}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getClienteBadge(getSafeTotalPurchases(cliente))}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(cliente)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(cliente)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Informações de Contato */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                       <span>{cliente.contato || cliente.phone}</span>
                    </div>
                    {cliente.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{cliente.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-t border-muted">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{getSafeTotalPurchases(cliente)}</p>
                      <p className="text-xs text-muted-foreground">Compras</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Cliente desde</p>
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const d = getFirstPurchaseDate(cliente)
                          try {
                            return d ? format(new Date(d), "MM/yyyy", { locale: ptBR }) : "-"
                          } catch {
                            return "-"
                          }
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(cliente)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredClientes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {clientes.length === 0 
                ? "Ainda não há clientes cadastrados."
                : "Não há clientes que correspondam à busca."
              }
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              {clientes.length === 0 ? "Cadastrar Primeiro Cliente" : "Novo Cliente"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <ClienteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        cliente={editingCliente}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente {clienteToDelete?.nome || clienteToDelete?.name}? 
              Esta ação não pode ser desfeita e removerá todo o histórico de compras.
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