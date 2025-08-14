import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileImage, Trash2, Download, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Tables } from "@/integrations/supabase/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface GroupCardUploadProps {
  groupId: string
  groupNumber: number
  onUploadComplete?: () => void
}

type CardUpload = Tables<"card_uploads">

export function GroupCardUpload({ groupId, groupNumber, onUploadComplete }: GroupCardUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploads, setUploads] = useState<CardUpload[]>([])
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const fetchUploads = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("card_uploads")
        .select("*")
        .eq("bolao_group_id", groupId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setUploads(data || [])
    } catch (error) {
      console.error("Error fetching uploads:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os uploads",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({
        title: "Erro",
        description: "Apenas imagens e PDFs são permitidos",
        variant: "destructive"
      })
      return
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. Máximo 10MB",
        variant: "destructive"
      })
      return
    }

    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      
      // Gerar nome único para o arquivo
      const fileName = `grupo-${groupNumber}-${Date.now()}-${file.name}`
      const filePath = `cartelas/${fileName}`

      // Upload do arquivo para o storage (simulado - você precisa configurar o storage)
      // Por enquanto, vamos simular apenas o registro no banco
      const fileUrl = `https://placeholder.com/${fileName}` // URL placeholder

      // Registrar upload no banco
      const { data, error } = await supabase
        .from("card_uploads")
        .insert({
          bolao_group_id: groupId,
          file_name: fileName,
          file_url: fileUrl,
          upload_type: "group_cards"
        })
        .select()
        .single()

      if (error) throw error

      // Marcar grupo como tendo cartelas uploadadas
      await supabase
        .from("bolao_groups")
        .update({ cards_uploaded: true })
        .eq("id", groupId)

      toast({
        title: "Sucesso",
        description: "Cartelas enviadas com sucesso! Grupo pronto para envio via WhatsApp."
      })

      await fetchUploads()
      onUploadComplete?.()
      
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Erro",
        description: "Erro ao enviar as cartelas",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteUpload = async (uploadId: string) => {
    try {
      const { error } = await supabase
        .from("card_uploads")
        .delete()
        .eq("id", uploadId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Upload removido com sucesso"
      })

      await fetchUploads()
      
      // Se não há mais uploads, marcar grupo como não tendo cartelas
      const remainingUploads = uploads.filter(u => u.id !== uploadId)
      if (remainingUploads.length === 0) {
        await supabase
          .from("bolao_groups")
          .update({ cards_uploaded: false })
          .eq("id", groupId)
        onUploadComplete?.()
      }
    } catch (error) {
      console.error("Error deleting upload:", error)
      toast({
        title: "Erro",
        description: "Erro ao remover upload",
        variant: "destructive"
      })
    }
  }

  const downloadFile = (upload: CardUpload) => {
    // Simular download
    toast({
      title: "Download iniciado",
      description: `Baixando ${upload.file_name}...`
    })
  }

  const previewFile = (upload: CardUpload) => {
    setPreviewUrl(upload.file_url)
  }

  // Buscar uploads ao montar o componente
  useEffect(() => {
    fetchUploads()
  }, [groupId])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Cartelas - Grupo {groupNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Faça upload das cartelas do grupo (imagem ou PDF)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Enviando..." : "Selecionar Arquivo"}
            </Button>
          </div>

          {/* Lista de Uploads */}
          {uploads.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Cartelas Enviadas</h4>
              {uploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileImage className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{upload.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(upload.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => previewFile(upload)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadFile(upload)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteUpload(upload.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview das Cartelas</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex justify-center">
              <img 
                src={previewUrl} 
                alt="Preview das cartelas"
                className="max-w-full max-h-96 object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}