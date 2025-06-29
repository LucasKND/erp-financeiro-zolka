
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Dashboard } from "@/components/Dashboard";
import { FluxoCaixa } from "@/components/FluxoCaixa";
import { ContasReceber } from "@/components/ContasReceber";
import { ContasPagar } from "@/components/ContasPagar";
import { Clientes } from "@/components/Clientes";
import { Fornecedores } from "@/components/Fornecedores";
import { CalendarioContas } from "@/components/CalendarioContas";
import { Relatorios } from "@/components/Relatorios";
import { Configuracoes } from "@/components/Configuracoes";
import { Auth } from "@/components/Auth";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const Index = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const { user, loading: authLoading } = useAuth();
  const { profile, company, loading: profileLoading } = useProfile();

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <div className="text-lg text-gray-600">Carregando Zolka ERP...</div>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <Auth />;
  }

  // Show loading while fetching profile
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <div className="text-lg text-gray-600">Carregando seu perfil...</div>
        </div>
      </div>
    );
  }

  // Show error message if user doesn't have profile or company access
  if (!profile || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-center">
              <div className="mb-2 font-semibold">Acesso não autorizado</div>
              <div className="text-sm">
                Seu usuário não possui perfil ou empresa configurados no sistema. 
                Entre em contato com o administrador para solicitar acesso.
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />;
      case "fluxo-caixa":
        return <FluxoCaixa />;
      case "contas-receber":
        return <ContasReceber />;
      case "contas-pagar":
        return <ContasPagar />;
      case "clientes":
        return <Clientes />;
      case "fornecedores":
        return <Fornecedores />;
      case "calendario":
        return <CalendarioContas />;
      case "relatorios":
        return <Relatorios />;
      case "configuracoes":
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar activeModule={activeModule} setActiveModule={setActiveModule} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar setActiveModule={setActiveModule} />
          <main className="flex-1 p-6 overflow-auto">
            {renderActiveModule()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
