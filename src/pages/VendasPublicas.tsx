import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft,
  Phone,
  MessageCircle,
  User,
  Calendar,
  DollarSign,
  Trophy,
  ShoppingCart,
  Users
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Tables } from "@/integrations/supabase/types"
import { useToast } from "@/hooks/use-toast"

type Promotora = Tables<"promotoras">
type Revendedor = Tables<"revendedores">
type Edition = Tables<"editions">

export default function VendasPublicas() {
  const { type, linkId } = useParams<{ type: string; linkId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [promotora, setPromotora] = useState<Promotora | null>(null)
  const [revendedor, setRevendedor] = useState<Revendedor | null>(null)
  const [activeEdition, setActiveEdition] = useState<Edition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSellerAndEdition()
  }, [type, linkId])

  const loadSellerAndEdition = async () => {
    if (!type || !linkId) {
      setError("Parâmetros inválidos")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Carregar edição ativa
      const { data: editionData, error: editionError } = await supabase
        .from("editions")
        .select("*")
        .eq("is_active", true)
        .eq("status", "active")
        .single()

      if (editionError && editionError.code !== 'PGRST116') {
        throw editionError
      }
      
      setActiveEdition(editionData)

      // Carregar promotora ou revendedor
      if (type === "promotora") {
        const { data, error } = await supabase
          .from("promotoras")
          .select("*")
          .or(`automatic_link_id.eq.${linkId},manual_link_id.eq.${linkId}`)
          .eq("is_active", true)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            setError("Promotora não encontrada ou inativa")
          } else {
            throw error
          }
        } else {
          setPromotora(data)
        }
      } else if (type === "revendedor") {
        const { data, error } = await supabase
          .from("revendedores")
          .select("*")
          .eq("automatic_link_id", linkId)
          .eq("is_active", true)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            setError("Revendedor não encontrado ou inativo")
          } else {
            throw error
          }
        } else {
          setRevendedor(data)
        }
      } else {
        setError("Tipo de vendedor inválido")
      }
    } catch (error) {
      console.error("Error loading seller:", error)
      setError("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const seller = promotora || revendedor
  const sellerType = promotora ? "promotora" : "revendedor"

  const handleWhatsAppContact = () => {
    if (!seller) return
    
    const message = `Olá ${seller.name}! Vi seu link de vendas e gostaria de comprar cartelas. Pode me ajudar?`
    const whatsappUrl = `https://wa.me/55${seller.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleBuyCards = () => {
    if (!activeEdition) {
      toast({
        title: "Vendas indisponíveis",
        description: "Não há edição ativa no momento.",
        variant: "destructive"
      })
      return
    }
    
    // Aqui você pode implementar a lógica de compra
    // Por enquanto, vamos apenas redirecionar para WhatsApp
    handleWhatsAppContact()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Link Inválido</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Início
          </Button>
          <Badge variant="secondary">
            {sellerType === "promotora" ? "Promotora" : "Revendedor"}
          </Badge>
        </div>

        {/* Perfil do Vendedor */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={seller.photo_url || undefined} />
                <AvatarFallback className="text-lg">
                  {seller.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{seller.name}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {seller.phone}
                </p>
                {revendedor?.ranking_position && (
                  <Badge className="mt-2">
                    <Trophy className="h-3 w-3 mr-1" />
                    #{revendedor.ranking_position} no ranking
                  </Badge>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{seller.total_sales}</p>
                <p className="text-xs text-muted-foreground">Vendas Realizadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  R$ {Number(seller.commission_total).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Comissões</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edição Ativa */}
        {activeEdition ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Edição Ativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Edição #{activeEdition.edition_number}</span>
                  <Badge variant="default">Ativa</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cartela Individual</p>
                    <p className="font-semibold text-primary">
                      R$ {Number(activeEdition.individual_card_price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cota do Bolão</p>
                    <p className="font-semibold text-primary">
                      R$ {Number(activeEdition.bolao_quota_price).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Data do Sorteio</p>
                  <p className="font-semibold">
                    {new Date(activeEdition.draw_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {activeEdition.prize_image_url && (
                  <div className="mt-4">
                    <img 
                      src={activeEdition.prize_image_url} 
                      alt="Prêmio da edição"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground text-4xl mb-4">⏸️</div>
              <h3 className="text-lg font-semibold mb-2">Vendas Pausadas</h3>
              <p className="text-muted-foreground">
                Não há edição ativa no momento. Entre em contato para mais informações.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        <div className="space-y-4">
          <Button 
            onClick={handleBuyCards}
            size="lg"
            className="w-full"
            disabled={!activeEdition}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {activeEdition ? "Comprar Cartelas" : "Vendas Pausadas"}
          </Button>

          <Button 
            onClick={handleWhatsAppContact}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Conversar no WhatsApp
          </Button>
        </div>

        {/* Rodapé */}
        <div className="text-center mt-8 pt-8 border-t border-muted">
          <p className="text-sm text-muted-foreground">
            Sistema de Vendas • Vendedor verificado ✓
          </p>
        </div>
      </div>
    </div>
  )
}