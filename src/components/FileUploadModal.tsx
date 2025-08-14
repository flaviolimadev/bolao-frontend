import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Send, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (file: File, notes?: string) => Promise<void>
  cardNumber: string
  customerName: string
}

export function FileUploadModal({ isOpen, onClose, onSubmit, cardNumber, customerName }: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para enviar",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(file, notes)
      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso!",
      })
      onClose()
      resetForm()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar arquivo",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setNotes("")
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="file-upload-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Cartela #{cardNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4" id="file-upload-description">
          <div>
            <Label htmlFor="customer">Cliente</Label>
            <Input id="customer" value={customerName} disabled />
          </div>

          <div>
            <Label htmlFor="file">Arquivo da Cartela</Label>
            <div className="mt-2">
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre o envio..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
