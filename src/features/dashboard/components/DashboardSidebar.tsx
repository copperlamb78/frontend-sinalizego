import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Users,
  Clock,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  LogOut,
  Store,
  X,
} from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { Badge } from '@/design-system/ui/badge';
import type { DashboardCompany, DashboardTab } from '../types';

export interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  company: DashboardCompany | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  pendingCount?: number;
}

interface NavItem {
  id: DashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
  company,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  isDark,
  onToggleTheme,
  onLogout,
  pendingCount = 0,
}) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    void onLogout();
    navigate('/login', { replace: true });
  };

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: LayoutDashboard,
    },
    {
      id: 'appointments',
      label: 'Agendamentos',
      icon: CalendarDays,
      badge: pendingCount,
    },
    {
      id: 'services',
      label: 'Serviços',
      icon: Scissors,
    },
    {
      id: 'employees',
      label: 'Funcionários & Equipe',
      icon: Users,
    },
    {
      id: 'schedule',
      label: 'Horários & Grade',
      icon: Clock,
    },
    {
      id: 'financial',
      label: 'Financeiro & Saques',
      icon: Wallet,
    },
    {
      id: 'settings',
      label: 'Estabelecimento',
      icon: Settings,
    },
  ];

  const storefrontUrl = company?.slug ? `/b/${company.slug}` : null;

  return (
    <>
      {/* Overlay escurecido para mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-surface border-r border-border transition-all duration-300 ease-in-out md:static shrink-0',
          isCollapsed ? 'md:w-20' : 'md:w-64',
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Cabeçalho da Sidebar */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
              <Store className="h-5 w-5" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm text-text-primary tracking-tight truncate">
                  {company?.businessName || 'Estabelecimento'}
                </span>
                <span className="text-[11px] text-text-muted truncate">
                  Painel de Gestão
                </span>
              </div>
            )}
          </div>

          {/* Botão fechar no mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-raised"
            aria-label="Fechar navegação"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Botão colapsar no desktop */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
            title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Link rápido para ver a vitrine pública */}
        {storefrontUrl && (!isCollapsed || isMobileOpen) && (
          <div className="px-3 pt-3">
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md bg-primary/5 hover:bg-primary/10 text-primary border border-primary/15 transition-colors group"
            >
              <span className="truncate">Ver vitrine pública</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-1.5 opacity-70 group-hover:opacity-100" />
            </a>
          </div>
        )}

        {/* Lista de Navegação Principal */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={cn(
                  'w-full flex items-center rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer group',
                  isCollapsed && !isMobileOpen
                    ? 'justify-center p-3'
                    : 'justify-between px-3 py-2.5',
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-transform group-hover:scale-105',
                      isActive ? 'text-white' : 'text-text-muted group-hover:text-text-primary'
                    )}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate tracking-wide">{item.label}</span>
                  )}
                </div>

                {(!isCollapsed || isMobileOpen) && item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    size="sm"
                    variant={isActive ? 'brand' : 'warning'}
                    className={isActive ? 'bg-white/20 text-white border-transparent' : undefined}
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-border shrink-0 space-y-2">
          {/* Alternador de Tema Dark / Light */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={cn(
              'w-full flex items-center rounded-md text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer',
              isCollapsed && !isMobileOpen ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
            )}
            title={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            aria-label="Alternar tema visual"
          >
            <div className="flex items-center gap-2.5">
              {isDark ? (
                <Sun className="h-4 w-4 text-warning shrink-0" />
              ) : (
                <Moon className="h-4 w-4 text-primary shrink-0" />
              )}
              {(!isCollapsed || isMobileOpen) && (
                <span className="truncate">Modo {isDark ? 'Escuro' : 'Claro'}</span>
              )}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-[10px] uppercase font-bold text-text-muted">
                {isDark ? 'Dark' : 'Light'}
              </span>
            )}
          </button>

          {/* Botão de Logout Seguro */}
          <button
            type="button"
            onClick={handleLogoutClick}
            className={cn(
              'w-full flex items-center rounded-md text-xs font-semibold text-danger/80 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer',
              isCollapsed && !isMobileOpen ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
            )}
            title="Sair do painel"
            aria-label="Sair da conta"
            data-testid="sidebar-logout-btn"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span className="truncate">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
