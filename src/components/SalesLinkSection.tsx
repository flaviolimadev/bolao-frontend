import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Copy, 
  ExternalLink, 
  QrCode, 
  Check,
  Link as LinkIcon,
  RefreshCw 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SalesLinkSectionProps {
  automaticLinkId?: string | null
  manualLinkId?: string | null
  name: string
  type: "promotora" | "revendedor"
}

export function SalesLinkSection({ 
  automaticLinkId, 
  manualLinkId, 
  name, 
  type 
}: SalesLinkSectionProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  const baseUrl = window.location.origin
  
  const getFullUrl = (linkId: string) => {
    return `${baseUrl}/vendas/${type}/${linkId}`
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      toast({
        title: "Link copiado!",
        description: `${label} foi copiado para a área de transferência.`
      })
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      })
    }
  }

  const openInNewTab = (url: string) => {
    window.open(url, '_blank')
  }

  const generateQRCode = (linkId: string) => {
    const url = getFullUrl(linkId)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
    window.open(qrUrl, '_blank')
  }

  if (!automaticLinkId && !manualLinkId) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <LinkIcon className="h-4 w-4" />
            Links de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Nenhum link disponível
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <LinkIcon className="h-4 w-4" />
            Links de Vendas
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {(automaticLinkId ? 1 : 0) + (manualLinkId ? 1 : 0)} link(s)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Link Automático */}
        {automaticLinkId && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full" />
                <span className="text-sm font-medium">Link Automático</span>
                <Badge variant="default" className="text-xs">Ativo</Badge>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">URL Completa:</p>
                <div className="font-mono text-sm bg-background border rounded px-2 py-1 break-all">
                  {getFullUrl(automaticLinkId)}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(getFullUrl(automaticLinkId), "Link Automático")}
                  className="flex-1"
                >
                  {copied === "Link Automático" ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openInNewTab(getFullUrl(automaticLinkId))}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => generateQRCode(automaticLinkId)}
                  title="Gerar QR Code"
                >
                  <QrCode className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Link Manual */}
        {manualLinkId && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-secondary rounded-full" />
                <span className="text-sm font-medium">Link Manual</span>
                <Badge variant="secondary" className="text-xs">Personalizado</Badge>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">URL Completa:</p>
                <div className="font-mono text-sm bg-background border rounded px-2 py-1 break-all">
                  {getFullUrl(manualLinkId)}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(getFullUrl(manualLinkId), "Link Manual")}
                  className="flex-1"
                >
                  {copied === "Link Manual" ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openInNewTab(getFullUrl(manualLinkId))}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => generateQRCode(manualLinkId)}
                  title="Gerar QR Code"
                >
                  <QrCode className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>💡 <strong>Dica:</strong> Compartilhe estes links para que {name} possa receber comissões das vendas.</p>
        </div>
      </CardContent>
    </Card>
  )
}