import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Minus } from "lucide-react"
import { CreateSaleData } from "@/hooks/useVendas"
import { useEdicoes } from "@/hooks/useEdicoes"
import { usePromotoras } from "@/hooks/usePromotoras"
import { useRevendedores } from "@/hooks/useRevendedores"
import { useClientes } from "@/hooks/useClientes"

interface VendaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateSaleData) => Promise<{ data: any; error: any }>
  sale?: any // opcional: venda para edição
}

export default function VendaModal({ isOpen, onClose, onSubmit, sale }: VendaModalProps) {
  const { edicoes } = useEdicoes()
  const { promotoras } = usePromotoras()
  const { revendedores } = useRevendedores()
  const { clientes } = useClientes()
  
  const [formData, setFormData] = useState<CreateSaleData>({
    customerId: undefined,
    customerName: "",
    customerPhone: "",
    customerCpf: "",
    customerEmail: "",
    editionId: "",
    saleType: "individual_card",
    quotasQuantity: 1,
    saleOrigin: "direct"
  })
  
  const [loading, setLoading] = useState(false)

  const edicaoAtiva = edicoes.find(e => e.status === 'active')

  useEffect(() => {
    if (edicaoAtiva) {
      setFormData(prev => ({ ...prev, editionId: edicaoAtiva.id }))
    }
  }, [edicaoAtiva])

  // Preencher para edição
  useEffect(() => {
    if (sale && isOpen) {
      const origin: 'direct' | 'promotora' | 'revendedor' = sale.promotora_id ? 'promotora' : sale.revendedor_id ? 'revendedor' : 'direct'
      setFormData({
        customerId: sale.customer_id,
        customerName: sale.customer?.nome || sale.customer?.name || '',
        customerPhone: sale.customer?.contato || sale.customer?.phone || '',
        customerCpf: sale.customer?.cpf || '',
        customerEmail: sale.customer?.email || '',
        editionId: sale.edition_id,
        saleType: sale.sale_type,
        quotasQuantity: sale.quotas_quantity || 1,
        promotoraId: sale.promotora_id || undefined,
        revendedorId: sale.revendedor_id || undefined,
        saleOrigin: origin,
      })
    }
  }, [sale, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await onSubmit(formData)
      if (!error) {
        onClose()
        setFormData({
          customerName: "",
          customerPhone: "",
          customerCpf: "",
          customerEmail: "",
          editionId: edicaoAtiva?.id || "",
          saleType: "individual_card",
          quotasQuantity: 1,
          saleOrigin: "direct"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateSaleData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const unitPriceCartela = edicaoAtiva ? (edicaoAtiva.individual_card_price / 100) : 0
  const unitPriceCota = edicaoAtiva ? (edicaoAtiva.bolao_quota_price / 100) : 0

  const calcularTotal = () => {
    if (!edicaoAtiva) return 0
    return formData.saleType === "individual_card"
      ? unitPriceCartela
      : unitPriceCota * formData.quotasQuantity
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sale ? 'Editar Venda' : 'Nova Venda'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados do Cliente</h3>
            <div className="space-y-2">
              <Label>Cliente existente</Label>
              <Select
                value={formData.customerId || ""}
                onValueChange={(value) => {
                  const c = clientes.find(c => c.id === value)
                  if (c) {
                    setFormData(prev => ({
                      ...prev,
                      customerId: c.id,
                      customerName: (c as any).nome || (c as any).name || '',
                      customerPhone: (c as any).contato || (c as any).phone || '',
                      customerCpf: (c as any).cpf || '',
                      customerEmail: (c as any).email || ''
                    }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {(c as any).nome || (c as any).name} - {(c as any).contato || (c as any).phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Se selecionar um cliente, os dados serão usados sem criar novo cadastro.</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nome Completo *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefone *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerCpf">CPF *</Label>
                <Input
                  id="customerCpf"
                  value={formData.customerCpf}
                  onChange={(e) => handleInputChange("customerCpf", e.target.value)}
                  placeholder="123.456.789-00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>

          {/* Dados da Venda */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados da Venda</h3>
            
            <div className="space-y-2">
              <Label>Edição</Label>
              <Select
                value={formData.editionId}
                onValueChange={(value) => handleInputChange("editionId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a edição" />
                </SelectTrigger>
                <SelectContent>
                  {edicoes.map((edicao) => (
                    <SelectItem key={edicao.id} value={edicao.id}>
                      Edição #{edicao.edition_number} - {new Date(edicao.draw_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Venda</Label>
              <RadioGroup
                value={formData.saleType}
                onValueChange={(value: "individual_card" | "bolao_quota") => handleInputChange("saleType", value)}
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="individual_card" id="individual_card" />
                  <Label htmlFor="individual_card" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Cartela Individual</div>
                        <div className="text-sm text-muted-foreground">Uma cartela com números únicos</div>
                      </div>
                      <div className="text-xl font-bold text-primary">
                        {formatCurrency(unitPriceCartela)}
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="bolao_quota" id="bolao_quota" />
                  <Label htmlFor="bolao_quota" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Cota de Bolão</div>
                        <div className="text-sm text-muted-foreground">Participação no grupo</div>
                      </div>
                      <div className="text-xl font-bold text-accent">
                        {formatCurrency(unitPriceCota)}
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.saleType === "bolao_quota" && (
              <div className="space-y-2">
                <Label>Quantidade de Cotas</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleInputChange("quotasQuantity", Math.max(1, formData.quotasQuantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="text-2xl font-bold min-w-[60px] text-center">
                    {formData.quotasQuantity}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleInputChange("quotasQuantity", Math.min(10, formData.quotasQuantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Origem da Venda</Label>
              <Select
                value={formData.saleOrigin}
                onValueChange={(value: "direct" | "promotora" | "revendedor") => {
                  handleInputChange("saleOrigin", value)
                  if (value === "direct") {
                    // Venda direta: limpa ambos
                    handleInputChange("promotoraId", undefined)
                    handleInputChange("revendedorId", undefined)
                  } else if (value === "promotora") {
                    // Promotora: limpa revendedor, mantém promotora para seleção
                    handleInputChange("revendedorId", undefined)
                  } else if (value === "revendedor") {
                    // Revendedor: limpa promotora, mantém revendedor para seleção
                    handleInputChange("promotoraId", undefined)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Venda Direta</SelectItem>
                  <SelectItem value="promotora">Promotora</SelectItem>
                  <SelectItem value="revendedor">Revendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.saleOrigin === "promotora" && (
              <div className="space-y-2">
                <Label>Promotora</Label>
                <Select
                  value={formData.promotoraId}
                  onValueChange={(value) => handleInputChange("promotoraId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a promotora" />
                  </SelectTrigger>
                  <SelectContent>
                     {promotoras.filter(p => p.is_active).map((promotora: any) => (
                      <SelectItem key={promotora.id} value={promotora.id}>
                        {promotora.nome || promotora.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.saleOrigin === "revendedor" && (
              <div className="space-y-2">
                <Label>Revendedor</Label>
                <Select
                  value={formData.revendedorId}
                  onValueChange={(value) => handleInputChange("revendedorId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o revendedor" />
                  </SelectTrigger>
                  <SelectContent>
                     {revendedores.filter(r => r.is_active).map((revendedor: any) => (
                      <SelectItem key={revendedor.id} value={revendedor.id}>
                        {revendedor.nome || revendedor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(calcularTotal())}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.customerName || !formData.customerPhone || !formData.customerCpf || !formData.editionId}
              className="flex-1"
            >
              {loading ? (sale ? "Salvando..." : "Registrando...") : (sale ? "Salvar alterações" : "Registrar Venda")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}