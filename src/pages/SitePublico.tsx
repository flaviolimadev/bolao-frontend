import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Calendar, QrCode, Plus, Minus, AlertCircle, Loader2, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEdicoes } from "@/hooks/useEdicoes";
import { usePromotoras } from "@/hooks/usePromotoras";
import { useRevendedores } from "@/hooks/useRevendedores";
import { useVendasPublicas } from "@/hooks/useVendasPublicas";
import { usePIX } from "@/hooks/usePIX";
import { formatName, formatPhone, formatCPF, validatePhone, validateCPF } from "@/lib/formatters";
export default function SitePublico() {
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    promotorId,
    revendedorId
  } = useParams();

  // Hooks para dados
  const {
    getEdicaoAtual,
    loading: edicaoLoading
  } = useEdicoes();
  const {
    promotoras,
    loading: promotorasLoading
  } = usePromotoras();
  const {
    revendedores,
    loading: revendedoresLoading
  } = useRevendedores();
  const {
    criarVendaPublica,
    loading: vendaLoading
  } = useVendasPublicas();
  const {
    copyPixToClipboard
  } = usePIX();

  // Estados
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    cpf: "",
    email: "",
    quantidadeCartelas: 0,
    quantidadeCotas: 0
  });
  const [validation, setValidation] = useState({
    phoneValid: true,
    cpfValid: true
  });
  const [pixData, setPixData] = useState<any>(null);
  const [showPix, setShowPix] = useState(false);

  // Dados dinâmicos
  const edicao = getEdicaoAtual();
  const promotora = promotorId ? promotoras.find(p => p.id === promotorId && p.is_active) : null;
  const revendedor = revendedorId ? revendedores.find(r => r.id === revendedorId && r.is_active) : null;

  // Determinar tipo de venda
  const isVendaDireta = !promotorId && !revendedorId;
  const isPromotora = !!promotorId && !!promotora;
  const isRevendedor = !!revendedorId && !!revendedor;

  // Estados de loading e erro
  const isLoading = edicaoLoading || promotorasLoading || revendedoresLoading || vendaLoading;
  const hasError = !edicao || promotorId && !promotora || revendedorId && !revendedor;
  useEffect(() => {
    // Redirecionar se ID inválido
    if (!isLoading && hasError) {
      toast({
        title: "Link inválido",
        description: "Este link não é válido ou foi desativado.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [isLoading, hasError, navigate, toast]);
  const handleInputChange = (field: string, value: string | number) => {
    let processedValue = value;

    // Aplicar formatações específicas
    if (field === 'nome' && typeof value === 'string') {
      processedValue = formatName(value);
    } else if (field === 'telefone' && typeof value === 'string') {
      processedValue = formatPhone(value);
      setValidation(prev => ({
        ...prev,
        phoneValid: validatePhone(value)
      }));
    } else if (field === 'cpf' && typeof value === 'string') {
      processedValue = formatCPF(value);
      setValidation(prev => ({
        ...prev,
        cpfValid: validateCPF(value)
      }));
    }
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const calcularTotal = () => {
    if (!edicao) return 0;
    const totalCartelas = formData.quantidadeCartelas * Number(edicao.individual_card_price);
    const totalCotas = formData.quantidadeCotas * Number(edicao.bolao_quota_price);
    return totalCartelas + totalCotas;
  };
  const temProdutosSelecionados = () => {
    return formData.quantidadeCartelas > 0 || formData.quantidadeCotas > 0;
  };
  const handleSubmit = async () => {
    // Validações
    if (!formData.nome || !formData.telefone || !formData.cpf || !edicao) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }
    if (!temProdutosSelecionados()) {
      toast({
        title: "Selecione produtos",
        description: "Selecione pelo menos um produto para continuar.",
        variant: "destructive"
      });
      return;
    }
    if (!validation.phoneValid || !validation.cpfValid) {
      toast({
        title: "Dados inválidos",
        description: "Verifique se o telefone e CPF estão corretos.",
        variant: "destructive"
      });
      return;
    }
    const vendaData = {
      nome: formData.nome,
      telefone: formData.telefone,
      cpf: formData.cpf,
      email: formData.email,
      quantidadeCartelas: formData.quantidadeCartelas,
      quantidadeCotas: formData.quantidadeCotas,
      promotorId: promotorId || undefined,
      revendedorId: revendedorId || undefined,
      edicaoId: edicao.id,
      valorTotal: calcularTotal()
    };
    const result = await criarVendaPublica(vendaData);
    if (result.success) {
      setPixData(result.pix);
      setShowPix(true);
    }
  };
  const handleCopyPix = () => {
    if (pixData?.pixCopyPaste) {
      copyPixToClipboard(pixData.pixCopyPaste);
    }
  };

  // Loading state
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>;
  }

  // Error state
  if (hasError) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2">Link inválido</h2>
                <p className="text-muted-foreground">
                  Este link não é válido ou foi desativado.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>;
  }

  // PIX Payment Screen
  if (showPix && pixData) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <CardTitle className="text-2xl">Pagamento PIX</CardTitle>
                <p className="text-muted-foreground">
                  Escaneie o QR Code ou copie o código PIX
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code */}
                <div className="text-center">
                  <img src={`data:image/png;base64,${pixData.qrCode}`} alt="QR Code PIX" className="mx-auto max-w-xs w-full" />
                </div>

                {/* PIX Copy Paste */}
                <div className="space-y-2">
                  <Label>Código PIX (Copiar e Colar)</Label>
                  <div className="flex gap-2">
                    <Input value={pixData.pixCopyPaste} readOnly className="text-xs" />
                    <Button onClick={handleCopyPix} variant="outline" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Como pagar:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Abra o app do seu banco</li>
                    <li>Escolha a opção PIX</li>
                    <li>Escaneie o QR Code ou cole o código</li>
                    <li>Confirme o pagamento</li>
                  </ol>
                </div>

                <Button onClick={() => setShowPix(false)} variant="outline" className="w-full">
                  Voltar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
              <Trophy className="h-5 w-5 mr-2" />
              Edição #{edicao.edition_number}
            </Badge>
            <h1 className="text-3xl font-bold text-foreground">Minas Cap</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Sorteio: {new Date(edicao.draw_date).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {/* Imagem da Premiação */}
          {edicao.prize_image_url && <Card>
              <CardContent className="p-0">
                <img src={edicao.prize_image_url} alt="Premiação" className="w-full h-64 object-cover rounded-lg" />
              </CardContent>
            </Card>}

          {/* Vendedor Info - Só mostra se não for venda direta */}
          {!isVendaDireta && <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={isPromotora ? promotora?.photo_url : revendedor?.photo_url} alt={isPromotora ? promotora?.name : revendedor?.name} />
                    <AvatarFallback>
                      {(isPromotora ? promotora?.name : revendedor?.name)?.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">
                      {isPromotora ? promotora?.name : revendedor?.name}
                    </div>
                    <Badge variant="outline" className="bg-accent/10 text-accent">
                      {isPromotora ? "Promotora Oficial" : "Revendedor Autorizado"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>}

          {/* Formulário de Compra */}
          <Card>
            <CardHeader>
              <CardTitle>Fazer Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" value={formData.nome} onChange={e => handleInputChange("nome", e.target.value)} placeholder="Seu nome completo" className="text-lg" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone (WhatsApp)</Label>
                  <Input id="telefone" value={formData.telefone} onChange={e => handleInputChange("telefone", e.target.value)} placeholder="(11) 99999-9999" className={`text-lg ${!validation.phoneValid && formData.telefone ? 'border-destructive' : ''}`} maxLength={15} />
                  {!validation.phoneValid && formData.telefone && <p className="text-xs text-destructive">Número de telefone inválido</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={formData.cpf} onChange={e => handleInputChange("cpf", e.target.value)} placeholder="123.456.789-00" className={`text-lg ${!validation.cpfValid && formData.cpf ? 'border-destructive' : ''}`} maxLength={14} />
                  {!validation.cpfValid && formData.cpf && <p className="text-xs text-destructive">CPF inválido</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} placeholder="seu@email.com" className="text-lg" />
                </div>
              </div>

              {/* Seleção de Produtos */}
              <div className="space-y-6">
                <Label className="text-lg font-semibold">Escolha seus produtos</Label>
                
                {/* Cartelas Individuais */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Cartelas Individuais</div>
                      <div className="text-sm text-muted-foreground">Cartelas com seus números da sorte</div>
                    </div>
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(Number(edicao.individual_card_price))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" size="icon" onClick={() => handleInputChange("quantidadeCartelas", Math.max(0, formData.quantidadeCartelas - 1))} disabled={formData.quantidadeCartelas === 0}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-2xl font-bold min-w-[60px] text-center">
                      {formData.quantidadeCartelas}
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={() => handleInputChange("quantidadeCartelas", Math.min(20, formData.quantidadeCartelas + 1))}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.quantidadeCartelas > 0 && <div className="text-right text-sm text-muted-foreground">
                      Subtotal: {formatCurrency(formData.quantidadeCartelas * Number(edicao.individual_card_price))}
                    </div>}
                </div>

                {/* Cotas de Bolão */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Cotas de Bolão</div>
                      <div className="text-sm text-muted-foreground">Participe do grupo e aumente suas chances</div>
                    </div>
                    <div className="text-xl font-bold text-accent">
                      {formatCurrency(Number(edicao.bolao_quota_price))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" size="icon" onClick={() => handleInputChange("quantidadeCotas", Math.max(0, formData.quantidadeCotas - 1))} disabled={formData.quantidadeCotas === 0}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-2xl font-bold min-w-[60px] text-center">
                      {formData.quantidadeCotas}
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={() => handleInputChange("quantidadeCotas", Math.min(10, formData.quantidadeCotas + 1))}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.quantidadeCotas > 0 && <div className="text-right text-sm text-muted-foreground">
                      Subtotal: {formatCurrency(formData.quantidadeCotas * Number(edicao.bolao_quota_price))}
                    </div>}
                  
                  <p className="text-xs text-muted-foreground">
                    Máximo de 10 cotas por pessoa
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(calcularTotal())}</span>
                </div>
              </div>

              {/* Botão de Compra */}
              <Button onClick={handleSubmit} disabled={vendaLoading} className="w-full text-lg py-6" size="lg">
                {vendaLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <QrCode className="h-5 w-5 mr-2" />}
                {vendaLoading ? "Processando..." : "Pagar com PIX"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao clicar em "Pagar com PIX", você será redirecionado para finalizar o pagamento.
                Após a confirmação, você receberá suas cartelas via WhatsApp.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}