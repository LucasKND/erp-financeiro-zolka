
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Dashboard } from "@/components/Dashboard";
import { ContasReceber } from "@/components/ContasReceber";
import { ContasPagar } from "@/components/ContasPagar";
import { Clientes } from "@/components/Clientes";
import { Fornecedores } from "@/components/Fornecedores";
import { FluxoCaixa } from "@/components/FluxoCaixa";
import { CalendarioContas } from "@/components/CalendarioContas";
import { Relatorios } from "@/components/Relatorios";
import { Configuracoes } from "@/components/Configuracoes";
import { Auth } from "@/components/Auth";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const { user, loading } = useAuth();

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />;
      case "contas-receber":
        return <ContasReceber />;
      case "contas-pagar":
        return <ContasPagar />;
      case "clientes":
        return <Clientes />;
      case "fornecedores":
        return <Fornecedores />;
      case "fluxo-caixa":
        return <FluxoCaixa />;
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

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show auth component if user is not authenticated
  if (!user) {
    return <Auth onAuthSuccess={() => window.location.reload()} />;
  }

  // Show main app if user is authenticated
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar activeModule={activeModule} setActiveModule={setActiveModule} />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-6 overflow-auto">
            {renderModule()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
