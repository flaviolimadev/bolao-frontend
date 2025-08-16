import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/integrations/api/client"

export default function ResetPassword() {
  const [search] = useSearchParams()
  const tokenFromUrl = search.get("token") || ""
  const [stage, setStage] = useState<"request"|"reset">(tokenFromUrl ? "reset" : "request")
  const [email, setEmail] = useState("")
  const [token, setToken] = useState(tokenFromUrl)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (tokenFromUrl) setStage("reset")
  }, [tokenFromUrl])

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!api.isEnabled()) {
      toast({ title: "Indisponível", description: "Configure VITE_API_URL para usar este recurso", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      await api.post("/auth/password/request", { email })
      toast({ title: "E-mail enviado", description: "Verifique sua caixa de entrada para continuar" })
      setStage("reset")
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || "Falha ao solicitar redefinição", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6 || password !== confirm) {
      toast({ title: "Senha inválida", description: "As senhas devem coincidir e ter ao menos 6 caracteres", variant: "destructive" })
      return
    }
    if (!api.isEnabled()) {
      toast({ title: "Indisponível", description: "Configure VITE_API_URL para usar este recurso", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      await api.post("/auth/password/reset", { token, new_password: password })
      toast({ title: "Senha redefinida", description: "Faça login com a nova senha" })
      navigate("/auth")
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || "Falha ao redefinir senha", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Recuperação de Senha</CardTitle>
            <CardDescription className="text-center">
              {stage === "request" ? "Informe seu e-mail para receber o link de redefinição" : "Defina sua nova senha"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stage === "request" ? (
              <form onSubmit={handleRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar link"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                {!tokenFromUrl && (
                  <div className="space-y-2">
                    <Label htmlFor="token">Código/Token</Label>
                    <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} required />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar senha</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Salvando..." : "Redefinir senha"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


