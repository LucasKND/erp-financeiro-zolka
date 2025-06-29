import { LayoutDashboard, TrendingUp, TrendingDown, Users, Building, Activity, Calendar, FileText, Settings } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
interface AppSidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}
const menuItems = [{
  id: "dashboard",
  title: "Dashboard",
  icon: LayoutDashboard
}, {
  id: "fluxo-caixa",
  title: "Fluxo de Caixa",
  icon: Activity
}, {
  id: "contas-receber",
  title: "Contas a Receber",
  icon: TrendingUp
}, {
  id: "contas-pagar",
  title: "Contas a Pagar",
  icon: TrendingDown
}, {
  id: "clientes",
  title: "Clientes",
  icon: Users
}, {
  id: "fornecedores",
  title: "Fornecedores",
  icon: Building
}, {
  id: "calendario",
  title: "Calendário",
  icon: Calendar
}, {
  id: "relatorios",
  title: "Relatórios",
  icon: FileText
}, {
  id: "configuracoes",
  title: "Configurações",
  icon: Settings
}];
export function AppSidebar({
  activeModule,
  setActiveModule
}: AppSidebarProps) {
  const {
    state
  } = useSidebar();
  const isCollapsed = state === "collapsed";
  return <Sidebar className="border-r bg-white shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="font-semibold text-gray-800">Zolka ERP</span>
          </div>}
        <SidebarTrigger className="text-gray-600 hover:text-gray-800" />
      </div>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            {!isCollapsed ? "Módulos Principais" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map(item => <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => setActiveModule(item.id)} className={`w-full justify-start px-3 py-2 rounded-lg transition-all duration-200 ${activeModule === item.id ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"}`} tooltip={isCollapsed ? item.title : undefined}>
                    <item.icon className="w-4 h-4" />
                    {!isCollapsed && <span className="ml-3 font-medium">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}