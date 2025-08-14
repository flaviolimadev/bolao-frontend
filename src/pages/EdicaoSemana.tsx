import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEdicoes, Edicao } from "@/hooks/useEdicoes"
import { EdicaoCard } from "@/components/EdicaoCard"
import { EdicaoModal } from "@/components/EdicaoModal"

export default function EdicaoSemana() {
  const { toast } = useToast()
  const { edicoes, criarNovaEdicao, atualizarEdicao, excluirEdicao, loading } = useEdicoes()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEdicao, setEditingEdicao] = useState<Edicao | null>(null)

  const handleNewEdicao = () => {
    setEditingEdicao(null)
    setModalOpen(true)
  }

  const handleEditEdicao = (edicao: Edicao) => {
    setEditingEdicao(edicao)
    setModalOpen(true)
  }

  const handleDeleteEdicao = async (id: string) => {
    await excluirEdicao(id)
  }

  const handleSaveEdicao = async (edicaoData: any) => {
    try {
      if (editingEdicao) {
        await atualizarEdicao(editingEdicao.id, edicaoData)
      } else {
        await criarNovaEdicao(edicaoData)
      }
      setModalOpen(false)
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Edições</h2>
          <p className="text-muted-foreground">
            Gerencie as edições do sorteio e configure os parâmetros
          </p>
        </div>
        <Button onClick={handleNewEdicao} className="bg-destructive hover:bg-destructive/90">
          <Plus className="h-4 w-4 mr-2" />
          Nova Edição
        </Button>
      </div>

      {/* Grid de Edições */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Carregando edições...</p>
          </div>
        ) : edicoes.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Nenhuma edição encontrada.</p>
          </div>
        ) : (
          edicoes
            .sort((a, b) => b.edition_number - a.edition_number)
            .map((edicao) => (
              <EdicaoCard
                key={edicao.id}
                edicao={edicao}
                onEdit={handleEditEdicao}
                onDelete={handleDeleteEdicao}
              />
            ))
        )}
      </div>

      {/* Modal de Nova/Editar Edição */}
      <EdicaoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        edicao={editingEdicao}
        onSave={handleSaveEdicao}
      />
    </div>
  )
}