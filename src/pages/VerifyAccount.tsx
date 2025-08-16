import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/integrations/api/client"

export default function VerifyAccount() {
  const [search] = useSearchParams()
  const userFromUrl = search.get("user") || ""
  const [userId, setUserId] = useState(userFromUrl)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!api.isEnabled()) {
      toast({ title: "Indisponível", description: "Configure VITE_API_URL para usar este recurso", variant: "destructive" })
      return
    }
    if (!userId || !code) {
      toast({ title: "Dados incompletos", description: "Informe usuário e código", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      await api.post(`/users/${userId}/verify-email`, { code })
      toast({ title: "Conta verificada", description: "Faça login para continuar" })
      navigate("/auth")
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || "Falha ao verificar conta", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Verificação de Conta</CardTitle>
            <CardDescription className="text-center">
              Informe o código recebido por e-mail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">ID do Usuário</Label>
                <Input id="user" value={userId} onChange={(e) => setUserId(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verificando..." : "Verificar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


