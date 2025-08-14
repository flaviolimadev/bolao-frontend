import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { Edicao } from "@/hooks/useEdicoes";
interface EdicaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edicao?: Edicao | null;
  onSave: (edicaoData: any) => void;
}
export function EdicaoModal({
  open,
  onOpenChange,
  edicao,
  onSave
}: EdicaoModalProps) {
  const [formData, setFormData] = useState({
    numero: "",
    status: "rascunho",
    valorCartela: "",
    valorCota: "5.00",
    cotasPorGrupo: "10",
    cartelasPorGrupo: "15",
    dataSorteio: "",
    imagemPremiacao: null as File | null
  });
  const [dragActive, setDragActive] = useState(false);
  useEffect(() => {
    if (edicao) {
      setFormData({
        numero: edicao.edition_number.toString(),
        status: edicao.status === "active" ? "ativa" : edicao.status === "finalized" ? "finalizada" : "rascunho",
        valorCartela: (Number(edicao.individual_card_price || 0) / 100).toFixed(2),
        valorCota: (Number(edicao.bolao_quota_price || 0) / 100).toFixed(2),
        cotasPorGrupo: edicao.quotas_per_group.toString(),
        cartelasPorGrupo: edicao.cards_per_group.toString(),
        dataSorteio: edicao.draw_date,
        imagemPremiacao: null
      });
    } else {
      // Nova edição - próximo número
      setFormData({
        numero: "",
        status: "rascunho",
        valorCartela: "25.00",
        valorCota: "5.00",
        cotasPorGrupo: "10",
        cartelasPorGrupo: "15",
        dataSorteio: "",
        imagemPremiacao: null
      });
    }
  }, [edicao, open]);
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          imagemPremiacao: file
        }));
      }
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        imagemPremiacao: e.target.files![0]
      }));
    }
  };
  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>
            {edicao ? "Editar Edição" : "Nova Edição"}
          </DialogTitle>
          <p id="dialog-description" className="text-sm text-muted-foreground">
            Configure os parâmetros da edição do sorteio
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número da Edição</Label>
              <Input id="numero" type="number" value={formData.numero} onChange={e => handleInputChange("numero", e.target.value)} placeholder="48" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={value => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorCartela">Preço da Cartela (R$)</Label>
              <Input id="valorCartela" type="number" step="0.01" value={formData.valorCartela} onChange={e => handleInputChange("valorCartela", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorCota">Preço da Cota (R$)</Label>
              <Input id="valorCota" type="number" step="0.01" value={formData.valorCota} onChange={e => handleInputChange("valorCota", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cotasPorGrupo">Cotas por Grupo</Label>
              <Input id="cotasPorGrupo" type="number" value={formData.cotasPorGrupo} onChange={e => handleInputChange("cotasPorGrupo", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cartelasPorGrupo">Cartelas por Grupo</Label>
              <Input id="cartelasPorGrupo" type="number" value={formData.cartelasPorGrupo} onChange={e => handleInputChange("cartelasPorGrupo", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataSorteio">Data do Sorteio</Label>
            <Input id="dataSorteio" type="date" value={formData.dataSorteio} onChange={e => handleInputChange("dataSorteio", e.target.value)} />
          </div>

          {/* Upload de Imagem */}
          

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar Edição
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}