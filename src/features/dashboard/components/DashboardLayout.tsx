import React, { useState } from 'react';
import { Menu, Building2 } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { useDashboardTheme } from '../hooks/useDashboardTheme';
import type { DashboardCompany, DashboardTab } from '../types';

export interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  company: DashboardCompany | null;
  userName?: string;
  onLogout: () => void;
  pendingCount?: number;
  children: React.ReactNode;
}

const TAB_TITLES: Record<DashboardTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Visão Geral & Métricas',
    subtitle: 'Acompanhe o desempenho operacional e financeiro em tempo real',
  },
  appointments: {
    title: 'Gestão de Agendamentos',
    subtitle: 'Controle de atendimentos, confirmações e histórico da equipe',
  },
  services: {
    title: 'Catálogo de Serviços',
    subtitle: 'Gerencie serviços oferecidos, duração e regras de adiantamento',
  },
  employees: {
    title: 'Funcionários & Equipe',
    subtitle: 'Cadastre profissionais, gerencie especialidades, status e indicadores',
  },
  schedule: {
    title: 'Horários & Grade Semanal',
    subtitle: 'Defina o horário de funcionamento e exceções da agenda',
  },
  financial: {
    title: 'Financeiro & Saques',
    subtitle: 'Extrato, saldos em custódia e solicitação de transferências Pix',
  },
  settings: {
    title: 'Dados do Estabelecimento',
    subtitle: 'Informações cadastrais, endereço público e perfil da empresa',
  },
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onSelectTab,
  company,
  userName,
  onLogout,
  pendingCount = 0,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sinalizego-sidebar-collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const { isDark, toggleTheme } = useDashboardTheme();

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sinalizego-sidebar-collapsed', String(next));
      return next;
    });
  };

  const { title, subtitle } = TAB_TITLES[activeTab] || {
    title: 'Painel de Gestão',
    subtitle: 'Visão geral do estabelecimento',
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* Barra de Navegação Lateral Esquerda */}
      <DashboardSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        company={company}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onLogout={onLogout}
        pendingCount={pendingCount}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Superior */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Botão de abrir menu no mobile */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised cursor-pointer"
              aria-label="Abrir navegação"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                {title}
              </h1>
              <p className="hidden sm:block text-xs text-text-muted truncate">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Área do Usuário no Topo */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-text-primary truncate max-w-[150px]">
                {userName || 'Proprietário'}
              </span>
              <span className="text-[10px] text-text-muted">
                {company?.businessName || 'Empresa Ativa'}
              </span>
            </div>

            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs select-none">
              {userName ? userName.slice(0, 2).toUpperCase() : <Building2 className="h-4 w-4" />}
            </div>
          </div>
        </header>

        {/* Área Rolável de Conteúdo */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
