import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Search, 
  Download,
  Eye,
  Upload,
  Send,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useCartelasIndividuais } from "@/hooks/useCartelasIndividuais"
import { useEdicoes } from "@/hooks/useEdicoes"
import { supabase } from "@/integrations/supabase/client"
import { FileUploadModal } from "@/components/FileUploadModal"

export default function CartelasIndividuais() {
  const { toast } = useToast()
  const { cartelas, loading, markAsSent, updateNotes, deleteCard, fetchCartelas, sendCardFile } = useCartelasIndividuais()
  const { edicoes } = useEdicoes()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")
  const [filterEdicao, setFilterEdicao] = useState("todas")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string>("")
  const [sendFileModalOpen, setSendFileModalOpen] = useState(false)
  const [selectedCardForFile, setSelectedCardForFile] = useState<{ id: string; cardNumber: string; customerName: string } | null>(null)

  // Carregar cartelas quando a página carregar
  useEffect(() => {
    fetchCartelas()
  }, []) // Removido fetchCartelas da dependência para evitar loop

  const getStatus = (cartela: any) => {
    if (cartela.card_sent) return "enviada"
    if (!cartela.card_sent && cartela.whatsapp_sent) return "pendente"
    return "aguardando"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "enviada": return "bg-success/10 text-success border-success/20"
      case "pendente": return "bg-warning/10 text-warning border-warning/20"
      case "aguardando": return "bg-muted/10 text-muted-foreground border-muted/20"
      default: return "bg-muted/50 text-muted-foreground border-muted"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "enviada": return <CheckCircle className="h-3 w-3 mr-1" />
      case "pendente": return <Clock className="h-3 w-3 mr-1" />
      case "aguardando": return <AlertCircle className="h-3 w-3 mr-1" />
      default: return null
    }
  }

  const filteredCartelas = cartelas.filter((cartela) => {
    const customerName = (cartela.sale.customer?.nome || '').toLowerCase()
    const matchesSearch = customerName.includes(searchTerm.toLowerCase()) ||
      cartela.card_number.toLowerCase().includes(searchTerm.toLowerCase())
    
    const status = getStatus(cartela)
    const matchesStatus = filterStatus === "todos" || status === filterStatus
    
    const matchesEdicao = filterEdicao === "todas" || cartela.sale.edition.edition_number.toString() === filterEdicao
    
    return matchesSearch && matchesStatus && matchesEdicao
  })

  // Estatísticas
  const totalCartelas = filteredCartelas.length
  const cartelasEnviadas = filteredCartelas.filter(c => c.card_sent).length
  const cartelasPendentes = filteredCartelas.filter(c => !c.card_sent && c.whatsapp_sent).length
  const cartelasAguardando = filteredCartelas.filter(c => !c.card_sent && !c.whatsapp_sent).length

  const exportarRelatorio = () => {
    // Simular export de relatório
    console.log("Exportando relatório...")
  }

  const handleMarkAsSent = async (cardId: string, type: 'card' | 'whatsapp') => {
    await markAsSent(cardId, type)
  }

  const handleSendFile = (card: any) => {
    setSelectedCardForFile({
      id: card.id,
      cardNumber: card.card_number,
      customerName: card.sale.customer.nome
    })
    setSendFileModalOpen(true)
  }

  const handleFileSubmit = async (file: File, notes?: string) => {
    if (selectedCardForFile) {
      await sendCardFile(selectedCardForFile.id, file, notes)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Cartelas Individuais</h2>
          <p className="text-muted-foreground">
            Gerencie as cartelas individuais vendidas e controle o envio
          </p>
        </div>
        <div className="flex gap-2">
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
            <CardTitle className="text-sm font-medium">Total de Cartelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCartelas}</div>
            <p className="text-xs text-success">No período selecionado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{cartelasEnviadas}</div>
            <p className="text-xs text-success">Cartelas entregues</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{cartelasPendentes}</div>
            <p className="text-xs text-success">WhatsApp enviado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{cartelasAguardando}</div>
            <p className="text-xs text-success">Aguardando envio</p>
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
                placeholder="Buscar por cliente ou número da cartela..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Select value={filterEdicao} onValueChange={setFilterEdicao}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Edição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as edições</SelectItem>
                {edicoes.map((edicao) => (
                  <SelectItem key={edicao.id} value={edicao.edition_number.toString()}>
                    Edição #{edicao.edition_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aguardando">Aguardando</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Cartelas Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cartelas Individuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Edição</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando cartelas...
                  </TableCell>
                </TableRow>
              ) : filteredCartelas.map((cartela) => {
                const status = getStatus(cartela)
                const vendedor = cartela.sale.promotora?.nome || cartela.sale.revendedor?.nome || "Venda Direta"
                const tipoVendedor = cartela.sale.sale_origin === "promotora" ? "Promotora" : 
                                   cartela.sale.sale_origin === "revendedor" ? "Revendedor" : "Direto"
                
                return (
                  <TableRow key={cartela.id}>
                    <TableCell className="font-medium">#{cartela.card_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{cartela.sale.customer.nome}</div>
                          <div className="text-xs text-muted-foreground">CPF: {cartela.sale.customer.cpf}</div>
                          <div className="text-xs text-muted-foreground">{cartela.sale.customer.contato}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{vendedor}</div>
                        <div className="text-xs text-muted-foreground">({tipoVendedor})</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(cartela.sale.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {(cartela.sale.amount / 100).toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">#{cartela.sale.edition.edition_number}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!cartela.card_sent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendFile(cartela)}
                            title="Enviar arquivo da cartela"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {!cartela.whatsapp_sent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsSent(cartela.id, 'whatsapp')}
                            title="Marcar WhatsApp como enviado"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {!loading && filteredCartelas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium">Nenhuma cartela individual encontrada</div>
              <div className="text-sm">
                {cartelas.length === 0 
                  ? "Crie uma venda do tipo 'Cartela Individual' para gerar cartelas automaticamente"
                  : "Ajuste os filtros para ver mais resultados"
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de envio de arquivo */}
      {selectedCardForFile && (
        <FileUploadModal
          isOpen={sendFileModalOpen}
          onClose={() => {
            setSendFileModalOpen(false)
            setSelectedCardForFile(null)
          }}
          onSubmit={handleFileSubmit}
          cardNumber={selectedCardForFile.cardNumber}
          customerName={selectedCardForFile.customerName}
        />
      )}
    </div>
  )
}