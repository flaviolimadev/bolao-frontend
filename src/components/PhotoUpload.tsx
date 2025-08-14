import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, X, Loader2 } from "lucide-react"
import { api, API_URL } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface PhotoUploadProps {
  currentPhotoUrl?: string | null
  onPhotoUploaded: (url: string) => void
  name: string
}

export function PhotoUpload({ currentPhotoUrl, onPhotoUploaded, name }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setPreviewUrl(currentPhotoUrl || null)
  }, [currentPhotoUrl])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive"
      })
      return
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive"
      })
      return
    }

    setUploading(true)

    try {
      // Criar preview local
      const localPreview = URL.createObjectURL(file)
      setPreviewUrl(localPreview)

      // Gerar nome único e chave no bucket
      const fileExt = file.name.split('.').pop()
      const key = `promotoras/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

      // Preferir upload via backend (sem CORS)
      const form = new FormData()
      form.append('file', file)
      form.append('key', key)
      const res = await fetch(`${API_URL}/upload/direct`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}` },
        body: form,
      })
      if (!res.ok) throw new Error('Falha no upload (promotora)')
      const data = await res.json()

      // Limpar preview local
      URL.revokeObjectURL(localPreview)
      
      // Atualizar com URL final
      setPreviewUrl(data.publicUrl)
      onPhotoUploaded(data.publicUrl)

      toast({
        title: "Foto enviada!",
        description: "A foto da promotora foi atualizada com sucesso."
      })
    } catch (error) {
      console.error('Error uploading photo:', error)
      // Limpar preview em caso de erro
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(currentPhotoUrl)
      
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da foto. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return
    
    setUploading(true)
    try {
      // Não apagamos do storage aqui; apenas limpamos a URL no front

      setPreviewUrl(null)
      onPhotoUploaded('')

      toast({
        title: "Foto removida",
        description: "A foto da promotora foi removida com sucesso."
      })
    } catch (error) {
      console.error('Error removing photo:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover a foto.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar com foto atual */}
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || undefined} />
          <AvatarFallback className="text-lg">
            {name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
        
        {/* Camera icon overlay */}
        {!uploading && (
          <button
            onClick={triggerFileInput}
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors"
            disabled={uploading}
          >
            <Camera className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2">
        <Button
          onClick={triggerFileInput}
          disabled={uploading}
          variant="outline"
          size="sm"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Enviando..." : "Escolher Foto"}
        </Button>
        
        {previewUrl && (
          <Button
            onClick={handleRemovePhoto}
            disabled={uploading}
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Remover
          </Button>
        )}
      </div>

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Informações sobre upload */}
      <p className="text-xs text-muted-foreground text-center">
        Tamanho máximo: 2MB<br />
        Formatos: JPG, PNG, GIF
      </p>
    </div>
  )
}