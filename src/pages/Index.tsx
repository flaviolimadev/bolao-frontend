import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  Trophy,
  ArrowRight,
  Star,
  Shield,
  Zap,
  LogIn
} from "lucide-react"

const Index = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Dashboard Completo",
      description: "Controle total das vendas, comissões e relatórios em tempo real."
    },
    {
      icon: Users,
      title: "Gestão de Promotoras",
      description: "Cadastre promotoras e revendedores com links personalizados."
    },
    {
      icon: ShoppingCart,
      title: "Site de Vendas",
      description: "Site público otimizado para conversão com pagamento via PIX."
    },
    {
      icon: Trophy,
      title: "Sistema de Bolão",
      description: "Criação automática de grupos e distribuição de cartelas."
    },
    {
      icon: Shield,
      title: "Seguro e Confiável",
      description: "Integração com Evolution API e Efí Bank para máxima segurança."
    },
    {
      icon: Zap,
      title: "Automação Total",
      description: "Envio automático de cartelas e resultados via WhatsApp."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-5xl font-bold text-foreground">
              Sistema Bolão
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A solução completa para gerenciar vendas de cartelas e bolões com 
            automação total e múltiplos canais de venda.
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                <LogIn className="h-5 w-5 mr-2" />
                Acessar Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/site">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ver Site Público
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Links */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Explore o Sistema</CardTitle>
            <CardDescription>
              Acesse as diferentes áreas do sistema para conhecer todas as funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Área Administrativa</h3>
              <div className="space-y-2">
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login Administrativo
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  Faça login para acessar o dashboard e todas as funcionalidades administrativas
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Área Pública</h3>
              <div className="space-y-2">
                <Link to="/site" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Site de Vendas
                  </Button>
                </Link>
                <Link to="/p/1" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Link de Promotora
                  </Button>
                </Link>
                <Link to="/r/1" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="h-4 w-4 mr-2" />
                    Link de Revendedor
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
