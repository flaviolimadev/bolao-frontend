import { useState } from "react"
import { Search, User, CreditCard, Calendar, Phone, Mail, AlertCircle, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BolaoGroupWithQuotas } from "@/hooks/useBolao"

interface GroupParticipantsModalProps {
  grupo: BolaoGroupWithQuotas | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GroupParticipantsModal({ grupo, open, onOpenChange }: GroupParticipantsModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  if (!grupo) return null

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success/10 text-success border-success/20"
      case "pending":
        return "bg-warning/10 text-warning border-warning/20"
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20"
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago"
      case "pending":
        return "Pendente"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-3 w-3 mr-1" />
      case "pending":
        return <AlertCircle className="h-3 w-3 mr-1" />
      case "cancelled":
        return <AlertCircle className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  // Filtrar participantes
  const filteredParticipants = grupo.quotas.filter(quota => {
    const customer = quota.sale.customer
    const searchLower = searchTerm.toLowerCase()
    
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm) ||
      customer.cpf.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower))
    )
  })

  // Estatísticas dos participantes
  const totalParticipants = grupo.quotas.length
  const paidParticipants = grupo.quotas.filter(q => q.sale.payment_status === "paid").length
  const pendingParticipants = grupo.quotas.filter(q => q.sale.payment_status === "pending").length
  const totalValue = grupo.quotas.reduce((sum, quota) => sum + quota.sale.amount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Participantes - Grupo {grupo.group_number}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto space-y-4">
          {/* Estatísticas Resumidas */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalParticipants}</div>
                <div className="text-sm text-muted-foreground">Participantes</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{paidParticipants}</div>
                <div className="text-sm text-muted-foreground">Pagos</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{pendingParticipants}</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">R$ {totalValue.toFixed(2).replace('.', ',')}</div>
                <div className="text-sm text-muted-foreground">Valor Total</div>
              </div>
            </Card>
          </div>

          {/* Busca */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone, CPF ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Lista de Participantes */}
          <div className="space-y-3 max-h-96 overflow-auto">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium">Nenhum participante encontrado</div>
                <div className="text-sm">Ajuste o termo de busca</div>
              </div>
            ) : (
              filteredParticipants.map((quota) => {
                const customer = quota.sale.customer
                const paymentStatus = quota.sale.payment_status
                
                return (
                  <Card key={quota.id} className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar>
                        <AvatarFallback>
                          {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Informações do Participante */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-foreground">{customer.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                              {customer.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              CPF: {customer.cpf}
                            </div>
                          </div>
                          
                          {/* Status e Valor */}
                          <div className="text-right space-y-2">
                            <Badge className={getPaymentStatusColor(paymentStatus)}>
                              {getPaymentStatusIcon(paymentStatus)}
                              {getPaymentStatusLabel(paymentStatus)}
                            </Badge>
                            <div className="text-sm font-medium">
                              R$ {quota.sale.amount.toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        </div>
                        
                        {/* Informações Adicionais */}
                        <div className="mt-3 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            Cotas: {quota.quota_numbers.join(', ')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(quota.sale.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}