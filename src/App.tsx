import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EdicaoAtivaProvider } from "./contexts/EdicaoAtiva";
import { EdicaoSelecionadaProvider } from "./contexts/EdicaoSelecionada";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EdicaoSemana from "./pages/EdicaoSemana";
import Promotoras from "./pages/Promotoras";
import Revendedores from "./pages/Revendedores";
import ControleFinanceiro from "./pages/ControleFinanceiro";
import PendenciasFinanceiras from "./pages/PendenciasFinanceiras";
import Clientes from "./pages/Clientes";
import HistoricoVendas from "./pages/HistoricoVendas";
import CartelasIndividuais from "./pages/CartelasIndividuais";
import CotasBolao from "./pages/CotasBolao";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Perfil from "./pages/Perfil";
import SitePublico from "./pages/SitePublico";
import VendasPublicas from "./pages/VendasPublicas";
import ResetPassword from "./pages/ResetPassword";
import VerifyAccount from "./pages/VerifyAccount";
import { DashboardLayout } from "./components/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import RedirectIfAuth from "./components/RedirectIfAuth";
import { AuthProvider } from "./hooks/useAuth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <EdicaoAtivaProvider>
        <EdicaoSelecionadaProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<RedirectIfAuth><Auth /></RedirectIfAuth>} />
              <Route path="/site" element={<SitePublico />} />
              <Route path="/vendas/:type/:linkId" element={<VendasPublicas />} />
              <Route path="/p/:promotorId" element={<SitePublico />} />
              <Route path="/r/:revendedorId" element={<SitePublico />} />
              <Route path="/reset-password" element={<RedirectIfAuth><ResetPassword /></RedirectIfAuth>} />
              <Route path="/verify" element={<RedirectIfAuth><VerifyAccount /></RedirectIfAuth>} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="edicao" element={<EdicaoSemana />} />
                <Route path="promotoras" element={<Promotoras />} />
                <Route path="revendedores" element={<Revendedores />} />
                <Route path="financeiro" element={<ControleFinanceiro />} />
                <Route path="pendencias" element={<PendenciasFinanceiras />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="vendas" element={<HistoricoVendas />} />
                <Route path="cartelas" element={<CartelasIndividuais />} />
                <Route path="bolao" element={<CotasBolao />} />
                <Route path="relatorios" element={<Relatorios />} />
                <Route path="configuracoes" element={<Configuracoes />} />
                <Route path="perfil" element={<Perfil />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </EdicaoSelecionadaProvider>
      </EdicaoAtivaProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
