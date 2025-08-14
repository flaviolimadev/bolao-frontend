import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Save, 
  Camera, 
  Lock, 
  Mail, 
  Phone, 
  CreditCard,
  Calendar,
  Shield,
  Eye,
  EyeOff
} from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/hooks/useAuth"
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload"
import * as formatters from "@/lib/formatters"

export default function Perfil() {
  const { user } = useAuth()
  const { profile, loading, updateProfile, updatePassword } = useProfile()
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    cpf: profile?.cpf || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Atualizar formData quando profile carregar
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        cpf: profile.cpf || ''
      })
    }
  }, [profile])

  const handleSaveProfile = async () => {
    await updateProfile(formData)
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return
    }
    
    await updatePassword(passwordData.currentPassword, passwordData.newPassword)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.slice(0, 2).toUpperCase() || "AD"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Meu Perfil</h2>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary">
          <Shield className="h-4 w-4 mr-2" />
          {profile?.user_type === 'admin' ? 'Administrador' : 'Usuário'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={profile?.photo_url || undefined} alt="Foto do perfil" />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-brand text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <ProfilePhotoUpload
                  onPhotoUploaded={(url) => updateProfile({ photo_url: url })}
                  currentPhotoUrl={profile?.photo_url}
                  className="absolute -bottom-2 -right-2"
                />
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold">{profile?.full_name || 'Nome não informado'}</h3>
                <p className="text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile?.email}</span>
              </div>
              
              {profile?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{formatters.formatPhone(profile.phone)}</span>
                </div>
              )}
              
              {profile?.cpf && (
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>{formatters.formatCPF(profile.cpf)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Desde {new Date(profile?.created_at || '').toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="dados" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            </TabsList>

            {/* Dados Pessoais */}
            <TabsContent value="dados" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O e-mail não pode ser alterado por questões de segurança
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Digite seu nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Segurança */}
            <TabsContent value="seguranca" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Alterar Senha
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Digite sua senha atual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Digite sua nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirme sua nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {passwordData.newPassword && passwordData.confirmPassword && 
                   passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-sm text-destructive">As senhas não coincidem</p>
                  )}

                  <Button 
                    onClick={handleChangePassword} 
                    className="w-full"
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || 
                             passwordData.newPassword !== passwordData.confirmPassword}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </Button>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">💡 Dicas de Segurança</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use no mínimo 8 caracteres</li>
                      <li>• Inclua letras maiúsculas e minúsculas</li>
                      <li>• Adicione números e símbolos</li>
                      <li>• Evite informações pessoais</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}