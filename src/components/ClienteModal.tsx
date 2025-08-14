import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
 
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

type Cliente = any

interface ClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: Cliente | null
  onSave: (data: TablesInsert<"customers"> | TablesUpdate<"customers">) => Promise<any>
}

interface FormData {
  name: string
  cpf: string
  phone: string
  email?: string
}

export function ClienteModal({ open, onOpenChange, cliente, onSave }: ClienteModalProps) {
  const [saving, setSaving] = useState(false)
  const isEditing = !!cliente

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      email: ""
    }
  })

  useEffect(() => {
    if (cliente) {
      form.reset({
        name: (cliente.name || cliente.nome || ""),
        cpf: cliente.cpf || "",
        phone: (cliente.phone || cliente.contato || ""),
        email: cliente.email || ""
      })
    } else {
      form.reset({
        name: "",
        cpf: "",
        phone: "",
        email: ""
      })
    }
  }, [cliente, form])

  const handleSave = async (data: FormData) => {
    setSaving(true)
    try {
      const saveData = {
        ...data,
        email: data.email || null
      }

      const result = await onSave(saveData)
      if (result.error) {
        throw result.error
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving cliente:", error)
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
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="email"
              rules={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email deve ter um formato válido"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="cliente@email.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
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