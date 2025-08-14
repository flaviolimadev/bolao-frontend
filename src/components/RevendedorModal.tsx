import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PhotoUpload } from "@/components/PhotoUpload"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

type Revendedor = any

interface RevendedorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  revendedor?: Revendedor | null
  onSave: (data: TablesInsert<"revendedores"> | TablesUpdate<"revendedores">) => Promise<any>
}

interface FormData {
  name: string
  cpf: string
  phone: string
  email?: string
  photo_url?: string
  is_active: boolean
  ranking_position?: number
}

export function RevendedorModal({ open, onOpenChange, revendedor, onSave }: RevendedorModalProps) {
  const [saving, setSaving] = useState(false)
  const isEditing = !!revendedor
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>("")

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      email: "",
      photo_url: "",
      is_active: true,
      ranking_position: undefined
    }
  })

  useEffect(() => {
    if (revendedor) {
      setCurrentPhotoUrl(revendedor.photo_url || "")
      form.reset({
        name: (revendedor.name || revendedor.nome || ""),
        cpf: revendedor.cpf || "",
        phone: (revendedor.phone || revendedor.contato || ""),
        email: revendedor.email || "",
        photo_url: revendedor.photo_url || "",
        is_active: revendedor.is_active,
        ranking_position: revendedor.ranking_position || undefined
      })
    } else {
      form.reset({
        name: "",
        cpf: "",
        phone: "",
        email: "",
        photo_url: "",
        is_active: true,
        ranking_position: undefined
      })
    }
  }, [revendedor, form])

  const handleSave = async (data: FormData) => {
    setSaving(true)
    try {
      // Gerar link automático baseado no nome
      const automaticLinkId = data.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      const saveData = {
        ...data,
        automatic_link_id: automaticLinkId,
        ranking_position: data.ranking_position || null
      }

      const result = await onSave(saveData)
      if (result.error) {
        throw result.error
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving revendedor:", error)
    } finally {
      setSaving(false)
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    return value
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
    return value
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Revendedor" : "Novo Revendedor"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <div className="border rounded-lg p-4">
              <Label className="text-sm font-medium mb-3 block">Foto do Revendedor</Label>
              <PhotoUpload currentPhotoUrl={currentPhotoUrl} onPhotoUploaded={(url) => { setCurrentPhotoUrl(url); form.setValue('photo_url', url); }} name={form.watch('name') || 'Revendedor'} />
            </div>
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nome é obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              rules={{ 
                required: "CPF é obrigatório",
                pattern: {
                  value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                  message: "CPF deve ter o formato XXX.XXX.XXX-XX"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="000.000.000-00" 
                      {...field}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value)
                        field.onChange(formatted)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              rules={{ 
                required: "Telefone é obrigatório",
                pattern: {
                  value: /^\(\d{2}\) \d{5}-\d{4}$/,
                  message: "Telefone deve ter o formato (XX) XXXXX-XXXX"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      {...field}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value)
                        field.onChange(formatted)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="email" rules={{
              pattern: {
                value: /^[\w.!#$%&'*+/=?`{|}~^-]+@[\w-]+(?:\.[\w-]+)+$/,
                message: "E-mail inválido",
              }
            }} render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField
              control={form.control}
              name="ranking_position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posição no Ranking (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Ex: 1" 
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined
                        field.onChange(value)
                      }}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Revendedor Ativo</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}