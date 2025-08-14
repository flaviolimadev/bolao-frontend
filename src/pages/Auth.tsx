import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { LogIn, UserPlus, Trophy, Eye, EyeOff } from "lucide-react"
import { formatPhone } from "@/lib/formatters"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nome, setNome] = useState("")
  const [sobrenome, setSobrenome] = useState("")
  const [contato, setContato] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPasswordSignIn, setShowPasswordSignIn] = useState(false)
  const [showPasswordSignUp, setShowPasswordSignUp] = useState(false)
  const { signIn, signUp, user, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in and is admin
  useEffect(() => {
    if (user && isAdmin) {
      navigate("/dashboard")
    }
  }, [user, isAdmin, navigate])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error, unverifiedUserId } = await signIn(email, password)
    
    if (!error) {
      navigate("/dashboard")
    } else if (unverifiedUserId) {
      navigate(`/verify?user=${unverifiedUserId}`)
    }
    
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Validações básicas antes da API
    if (password.length < 8) {
      setLoading(false)
      alert('A senha deve ter no mínimo 8 caracteres')
      return
    }
    if (!nome || !sobrenome) {
      setLoading(false)
      alert('Informe nome e sobrenome')
      return
    }

    const { error, userId } = await signUp({ nome, sobrenome, email, contato: contato || email, password })
    if (!error) {
      // Se a API exigir verificação, redirecionar para /verify com o id (quando disponível)
      if (userId) {
        navigate(`/verify?user=${userId}`)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Trophy className="h-8 w-8" />
              <span>Bolão Admin</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            Sistema de gerenciamento de bolões
          </p>
        </div>

        {/* Auth Tabs */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Acesso Administrativo</CardTitle>
            <CardDescription className="text-center">
              Faça login ou cadastre-se para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">E-mail</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="admin@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPasswordSignIn ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordSignIn(v => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPasswordSignIn ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPasswordSignIn ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Entrando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Entrar
                      </div>
                    )}
                  </Button>
                  <div className="text-right">
                    <Link to="/reset-password" className="text-sm text-primary hover:underline">Esqueci minha senha</Link>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome">Nome</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      placeholder="Seu nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-sobrenome">Sobrenome</Label>
                    <Input
                      id="signup-sobrenome"
                      type="text"
                      placeholder="Seu sobrenome"
                      value={sobrenome}
                      onChange={(e) => setSobrenome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="admin@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-contato">Contato (telefone)</Label>
                    <Input
                      id="signup-contato"
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={contato}
                      onChange={(e) => setContato(formatPhone(e.target.value))}
                      inputMode="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPasswordSignUp ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordSignUp(v => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPasswordSignUp ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPasswordSignUp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Cadastrando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Cadastrar
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Sistema exclusivo para administradores
        </p>
      </div>
    </div>
  )
}