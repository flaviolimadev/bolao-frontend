import { useState } from "react";
import { Calendar, Users, UserCheck, ShoppingCart, History, FileText, Trophy, BarChart3, Settings, Home, DollarSign, Clock } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
const menuItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: Home
}, {
  title: "Edições",
  url: "/dashboard/edicao",
  icon: Calendar
}, {
  title: "Promotoras",
  url: "/dashboard/promotoras",
  icon: Users
}, {
  title: "Revendedores",
  url: "/dashboard/revendedores",
  icon: UserCheck
}, {
  title: "Controle Financeiro",
  url: "/dashboard/financeiro",
  icon: DollarSign
}, {
  title: "Pendências",
  url: "/dashboard/pendencias",
  icon: Clock
}, {
  title: "Clientes",
  url: "/dashboard/clientes",
  icon: ShoppingCart
}, {
  title: "Histórico de Vendas",
  url: "/dashboard/vendas",
  icon: History
}, {
  title: "Cartelas Individuais",
  url: "/dashboard/cartelas",
  icon: FileText
}, {
  title: "Cotas de Bolão",
  url: "/dashboard/bolao",
  icon: Trophy
}, {
  title: "Relatórios",
  url: "/dashboard/relatorios",
  icon: BarChart3
}, {
  title: "Configurações",
  url: "/dashboard/configuracoes",
  icon: Settings
}];
export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  return <Sidebar className={`sidebar-modern ${collapsed ? "w-16" : "w-64"} transition-all duration-300`} collapsible="icon">
      <SidebarContent className="bg-white border-r border-border/50">
        {/* Logo Header */}
        <div className="sidebar-header p-4 mb-4">
          <div className="flex items-center gap-3">
            
            {!collapsed && <div className="flex flex-col mx-[23px]">
                <h1 className="text-white font-bold text-lg tracking-wide px-0 mx-0">Gestão de Vendas</h1>
                
              </div>}
          </div>
        </div>
        {/* Navigation Menu */}
        <SidebarGroup className="flex-1 px-3">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map(item => {
              const isCurrentlyActive = isActive(item.url);
              return <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-auto p-0">
                      <NavLink to={item.url} end className={`sidebar-nav-item ${isCurrentlyActive ? "sidebar-nav-item-active" : "sidebar-nav-item-inactive"} ${collapsed ? "justify-center px-3 py-4" : "px-4 py-3"}`}>
                        <item.icon className={`h-5 w-5 ${!collapsed && 'mr-4'} transition-colors`} />
                        {!collapsed && <span className="font-medium text-sm tracking-wide">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>;
            })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        {!collapsed && <div className="sidebar-user-section">
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-semibold text-sm">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-foreground font-medium text-sm truncate">Administrador</div>
                <div className="text-muted-foreground text-xs">Sistema Ativo</div>
              </div>
            </div>
          </div>}
      </SidebarContent>
    </Sidebar>;
}