
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Dashboard } from "@/components/Dashboard";
import { FluxoCaixa } from "@/components/FluxoCaixa";
import { ContasReceber } from "@/components/ContasReceber";
import { ContasPagar } from "@/components/ContasPagar";
import { Contratos } from "@/components/Contratos";
import { Clientes } from "@/components/Clientes";
import { Fornecedores } from "@/components/Fornecedores";
import { CalendarioContas } from "@/components/CalendarioContas";
import { Relatorios } from "@/components/Relatorios";
import { Configuracoes } from "@/components/Configuracoes";
import { Auth } from "@/components/Auth";
import CRM from "@/components/CRM";
import GerenciarClientes from "@/components/GerenciarClientes";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { SelectedCompanyProvider } from "@/contexts/SelectedCompanyContext";

const Index = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const { user, loading: authLoading } = useAuth();
  const { profile, company, loading: profileLoading } = useProfile();

  // Always show login screen first - no loading screens
  if (!user) {
    return <Auth />;
  }

  // Show loading while fetching profile
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-lg">ERP</span>
          </div>
          <div className="text-lg text-muted-foreground">Carregando seu perfil...</div>
        </div>
      </div>
    );
  }

  // If user is authenticated but doesn't have profile/company, 
  // they shouldn't reach here (login should handle this validation)
  // But if they do, just redirect back to login
  if (!profile || !company) {
    return <Auth />;
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
      case "contratos":
        return <Contratos />;
      case "crm":
        return <CRM />;
      case "gerenciar-clientes":
        return <GerenciarClientes />;
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
    <SelectedCompanyProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar activeModule={activeModule} setActiveModule={setActiveModule} />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar setActiveModule={setActiveModule} />
            <main className="flex-1 p-6 overflow-auto bg-background">
              {renderActiveModule()}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SelectedCompanyProvider>
  );
};

export default Index;
