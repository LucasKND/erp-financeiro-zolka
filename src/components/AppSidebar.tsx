import { LayoutDashboard, TrendingUp, TrendingDown, Users, Building, Activity, Calendar, FileText, Settings } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
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
  return <Sidebar className="border-r bg-white dark:bg-gray-900 shadow-lg" collapsible="icon">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">Zolka ERP</span>
          </div>}
        <SidebarTrigger className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" />
      </div>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {!isCollapsed ? "Módulos Principais" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map(item => <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => setActiveModule(item.id)} className={`w-full justify-start px-3 py-2 rounded-lg transition-all duration-200 ${activeModule === item.id ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-l-4 border-yellow-600 dark:border-yellow-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100"}`} tooltip={isCollapsed ? item.title : undefined}>
                    <item.icon className="w-4 h-4" />
                    {!isCollapsed && <span className="ml-3 font-medium">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          {isCollapsed ? <img src="/lovable-uploads/c41c9428-bce8-4d15-bc92-f2bf789c5576.png" alt="Zolka Logo" className="w-12 h-12 object-contain filter brightness-0" /> : <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/c41c9428-bce8-4d15-bc92-f2bf789c5576.png" alt="Zolka Logo" className="w-12 h-12 object-contain filter brightness-0" />
              <div className="text-center">
                
                <div className="text-xs text-gray-500 dark:text-gray-400">ERP System</div>
              </div>
            </div>}
        </div>
      </SidebarFooter>
    </Sidebar>;
}
