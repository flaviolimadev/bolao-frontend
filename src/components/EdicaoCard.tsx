import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Image, ImageOff } from "lucide-react";
import { Edicao } from "@/hooks/useEdicoes";
interface EdicaoCardProps {
  edicao: Edicao;
  onEdit: (edicao: Edicao) => void;
  onDelete: (id: string) => void;
}
export function EdicaoCard({
  edicao,
  onEdit,
  onDelete
}: EdicaoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "finalized":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativa";
      case "finalized":
        return "Finalizada";
      case "draft":
        return "Rascunho";
      default:
        return status;
    }
  };
  const status = edicao.status;
  const canEdit = true;
  return <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Edição #{edicao.edition_number}</h3>
              <p className="text-sm text-muted-foreground">
                Sorteio: {new Date(edicao.draw_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Badge variant={getStatusColor(status)}>
              {getStatusText(status)}
            </Badge>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-2 gap-4 py-2 border-t border-b border-muted">
            <div>
              <p className="text-xs text-muted-foreground">Cartela Individual</p>
              <p className="font-semibold">R$ {(edicao.individual_card_price / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cota do Bolão</p>
              <p className="font-semibold">R$ {(edicao.bolao_quota_price / 100).toFixed(2)}</p>
            </div>
          </div>

          {/* Quantidades */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Cotas por Grupo</p>
              <p className="font-medium">{edicao.quotas_per_group}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cartelas por Grupo</p>
              <p className="font-medium">{edicao.cards_per_group}</p>
            </div>
          </div>

          {/* Status da Imagem */}
          

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(edicao)} disabled={!canEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(edicao.id)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}