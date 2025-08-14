import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhotoUpload } from "@/components/PhotoUpload";
type PromotoraLike = {
  id?: string
  // nomes legacy (supabase) e novos (api)
  name?: string
  nome?: string
  cpf?: string
  phone?: string
  contato?: string | null
  email?: string | null
  is_active?: boolean
  manual_link_id?: string | null
  automatic_link_id?: string | null
  photo_url?: string | null
};
interface PromotoraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotora?: PromotoraLike | null;
  onSave: (data: any) => Promise<any>;
}
interface FormData {
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  is_active: boolean;
  manual_link_id?: string;
  photo_url?: string;
}
export function PromotoraModal({
  open,
  onOpenChange,
  promotora,
  onSave
}: PromotoraModalProps) {
  const [saving, setSaving] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>("");
  const isEditing = !!promotora;
  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      email: "",
      is_active: true,
      manual_link_id: "",
      photo_url: ""
    }
  });
  useEffect(() => {
    if (promotora) {
      const photoUrl = promotora.photo_url || "";
      setCurrentPhotoUrl(photoUrl);
      form.reset({
        name: (promotora.name || promotora.nome || ""),
        cpf: promotora.cpf || "",
        phone: (promotora.phone || (promotora.contato as string) || ""),
        email: promotora.email || "",
        is_active: typeof promotora.is_active === 'boolean' ? promotora.is_active : true,
        manual_link_id: promotora.manual_link_id || "",
        photo_url: photoUrl
      });
    } else {
      setCurrentPhotoUrl("");
      form.reset({
        name: "",
        cpf: "",
        phone: "",
        is_active: true,
        manual_link_id: "",
        photo_url: ""
      });
    }
  }, [promotora, form]);
  const handleSave = async (data: FormData) => {
    setSaving(true);
    try {
      // Gerar link automático baseado no nome
      const automaticLinkId = data.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      const saveData = {
        ...data,
        automatic_link_id: automaticLinkId,
        manual_link_id: data.manual_link_id || null,
        photo_url: data.photo_url || null
      };
      const result = await onSave(saveData);
      if (result.error) {
        throw result.error;
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving promotora:", error);
    } finally {
      setSaving(false);
    }
  };
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };
  const handlePhotoUploaded = (url: string) => {
    setCurrentPhotoUrl(url);
    form.setValue('photo_url', url);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Promotora" : "Nova Promotora"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            {/* Upload de Foto */}
            <div className="border rounded-lg p-4">
              <Label className="text-sm font-medium mb-3 block">Foto da Promotora</Label>
              <PhotoUpload currentPhotoUrl={currentPhotoUrl} onPhotoUploaded={handlePhotoUploaded} name={form.watch('name') || 'Promotora'} />
            </div>

            <FormField control={form.control} name="name" rules={{
            required: "Nome é obrigatório"
          }} render={({
            field
          }) => <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="cpf" rules={{
            required: "CPF é obrigatório",
            pattern: {
              value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
              message: "CPF deve ter o formato XXX.XXX.XXX-XX"
            }
          }} render={({
            field
          }) => <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} onChange={e => {
                const formatted = formatCPF(e.target.value);
                field.onChange(formatted);
              }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="phone" rules={{
            required: "Telefone é obrigatório",
            pattern: {
              value: /^\(\d{2}\) \d{5}-\d{4}$/,
              message: "Telefone deve ter o formato (XX) XXXXX-XXXX"
            }
          }} render={({
            field
          }) => <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} onChange={e => {
                const formatted = formatPhone(e.target.value);
                field.onChange(formatted);
              }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

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

            <FormField control={form.control} name="manual_link_id" render={({
            field
          }) => {}} />

            <FormField control={form.control} name="is_active" render={({
            field
          }) => <FormItem className="flex items-center justify-between">
                  <FormLabel>Promotora Ativa</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>} />

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
}