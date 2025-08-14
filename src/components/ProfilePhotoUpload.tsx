import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X, Loader2 } from "lucide-react"
import { api, API_URL } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null
  onPhotoUploaded: (url: string) => Promise<any>
  className?: string
}

export function ProfilePhotoUpload({ currentPhotoUrl, onPhotoUploaded, className }: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

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
      // Gerar chave única p/ o arquivo no bucket
      const ext = file.name.split('.').pop()
      const key = `avatars/${user?.id}-${Date.now()}.${ext}`

      // 1) Priorizar upload via backend (sem CORS)
      try {
        const form = new FormData()
        form.append('file', file)
        form.append('key', key)
        const res = await fetch(`${API_URL}/upload/direct`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}` },
          body: form,
        })
        if (!res.ok) throw new Error('Falha no upload (proxy)')
        const data = await res.json()
        await onPhotoUploaded(data.publicUrl)
      } catch (proxyErr) {
        // 2) Tentativa opcional: presign + PUT (pode falhar por CORS dependendo da R2)
        try {
          const { uploadUrl, publicUrl } = await api<{ uploadUrl: string; publicUrl: string }>(
            '/upload/presign', {
              method: 'POST',
              body: { key, contentType: file.type },
              headers: { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}` }
            }
          )
          const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
          if (!putRes.ok) throw new Error('Falha no upload')
          await onPhotoUploaded(publicUrl)
        } catch (e) {
          throw e
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da foto. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn("", className)}>
      <button
        onClick={triggerFileInput}
        disabled={uploading}
        className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}