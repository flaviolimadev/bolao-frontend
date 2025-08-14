import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEdicoes } from "@/hooks/useEdicoes"
import { useBolao, BolaoGroupWithQuotas } from "@/hooks/useBolao"

interface BolaoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  grupo?: BolaoGroupWithQuotas
  mode: "create" | "edit"
}

export function BolaoModal({ open, onOpenChange, grupo, mode }: BolaoModalProps) {
  const { edicoes } = useEdicoes()
  const { createGroup, updateGroup } = useBolao()
  
  const [formData, setFormData] = useState({
    edition_id: grupo?.edition_id || "",
    group_number: grupo?.group_number || 1,
    max_quotas: grupo?.max_quotas || 10,
  })
  
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (mode === "create") {
        const result = await createGroup(formData)
        if (result.data) {
          onOpenChange(false)
          setFormData({ edition_id: "", group_number: 1, max_quotas: 10 })
        }
      } else if (grupo) {
        const result = await updateGroup(grupo.id, formData)
        if (result.data) {
          onOpenChange(false)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const editionOptions = edicoes.filter(e => e.status === 'active')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Criar Grupo de Bolão" : "Editar Grupo de Bolão"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edition_id">Edição</Label>
            <Select 
              value={formData.edition_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, edition_id: value }))}
              disabled={mode === "edit"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma edição" />
              </SelectTrigger>
              <SelectContent>
                {editionOptions.map((edicao) => (
                  <SelectItem key={edicao.id} value={edicao.id}>
                    Edição #{edicao.edition_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="group_number">Número do Grupo</Label>
            <Input
              id="group_number"
              type="number"
              min="1"
              value={formData.group_number}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                group_number: parseInt(e.target.value) || 1 
              }))}
              disabled={mode === "edit"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_quotas">Máximo de Cotas</Label>
            <Input
              id="max_quotas"
              type="number"
              min="1"
              max="100"
              value={formData.max_quotas}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                max_quotas: parseInt(e.target.value) || 10 
              }))}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : mode === "create" ? "Criar" : "Atualizar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}