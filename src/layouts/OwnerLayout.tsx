import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/contexts/auth.context';
import { companyService } from '@/services/company.service';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Clock,
  Wallet,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Store,
  User as UserIcon,
  Smartphone,
  CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';
import { openPwaInstallModal } from '@/components/common/PwaInstallPrompt';

export const OwnerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Check subaccount state from cache
  const { data: company } = useQuery({
    queryKey: ['owner-company-profile'],
    queryFn: () => companyService.getCompanyByUserId(),
    staleTime: 1000 * 60 * 5
  });

  const hasSubaccount = Boolean(
    company?.walletId ||
      company?.financialProfile?.walletId ||
      company?.financialProfile?.status === 'APPROVED' ||
      company?.financialProfile?.status === 'ACTIVE'
  );

  const navigation = [
    { name: 'Dashboard', href: '/painel', icon: LayoutDashboard, end: true },
    { name: 'Agenda Operacional', href: '/painel/agenda', icon: Calendar, end: false },
    {
      name: 'Serviços & Cadeiras',
      href: '/painel/servicos',
      icon: Scissors,
      end: false,
      badge: !hasSubaccount ? 'Bloqueado' : undefined
    },
    { name: 'Expediente', href: '/painel/expediente', icon: Clock, end: false },
    {
      name: 'Financeiro Asaas',
      href: '/painel/financeiro',
      icon: Wallet,
      end: false,
      badge: !hasSubaccount ? 'Ativar' : undefined
    },
    { name: 'Configurações', href: '/painel/configuracoes', icon: Settings, end: false }
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] flex">
      {/* Desktop Sidebar (Sticky & Full Screen Height) */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 bg-[#0F172A] border-r border-slate-800 transition-all duration-300 z-30 shrink-0 select-none',
          isSidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <Link to="/painel" className="flex items-center gap-2 overflow-hidden">
            <Logo size="sm" showText={!isSidebarCollapsed} />
          </Link>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            aria-expanded={!isSidebarCollapsed}
            aria-label={isSidebarCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-[#14B8A6] text-white font-semibold shadow-lg shadow-teal-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )
              }
              title={isSidebarCollapsed ? item.name : undefined}
            >
              <div className="flex items-center gap-3 overflow-hidden min-w-0">
                <item.icon className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
              </div>

              {!isSidebarCollapsed && item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer User Box */}
        <div className="p-3 border-t border-slate-800 shrink-0 space-y-2">
          {/* Link para o Perfil Pessoal de Usuário */}
          {!isSidebarCollapsed ? (
            <Link
              to="/minha-conta"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0B1120] hover:bg-[#1E293B] border border-slate-800/80 transition-colors group"
              title="Acessar meu perfil pessoal de usuário / cliente"
            >
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:border-teal-500/40 transition-colors shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-white truncate group-hover:text-teal-300 transition-colors">
                    {user?.name || 'Proprietário'}
                  </p>
                  <Badge variant="teal" size="sm" className="text-[9px] px-1.5 py-0 shrink-0">
                    DONO
                  </Badge>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  Minha Conta & Perfil
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/minha-conta"
              className="flex items-center justify-center p-2.5 rounded-xl bg-[#0B1120] hover:bg-[#1E293B] text-teal-400 border border-slate-800 transition-colors"
              title="Meu Perfil Pessoal (Minha Conta)"
              aria-label="Meu Perfil Pessoal"
            >
              <UserIcon className="w-4 h-4" />
            </Link>
          )}

          {/* Botão de Encerrar Sessão */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Encerrar Sessão"
            aria-label="Encerrar Sessão"
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors cursor-pointer',
              isSidebarCollapsed ? 'justify-center' : 'justify-between'
            )}
          >
            {!isSidebarCollapsed && <span>Encerrar Sessão</span>}
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Menu */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-72 bg-[#0F172A] border-r border-slate-800 p-4 flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <Logo size="sm" />
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.end}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#14B8A6] text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Drawer User & Profile Link */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <Link
                to="/minha-conta"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0B1120] border border-slate-800"
              >
                <UserIcon className="w-4 h-4 text-teal-400" />
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-teal-400 font-mono">Minha Conta Pessoal</p>
                </div>
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-slate-800 cursor-pointer"
              >
                <span>Encerrar Sessão</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-[#0F172A] border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Abrir Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-[#F8FAFC]">
                Painel do Estabelecimento
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/empresa/vintage-club"
              target="_blank" rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
              aria-label="Ver Vitrine Pública"
            >
              <Store className="w-3.5 h-3.5 text-teal-400" />
              <span>Ver Vitrine Pública</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              onClick={openPwaInstallModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-xs font-semibold text-teal-400 border border-teal-500/30 transition-colors cursor-pointer"
              title="Instalar o SinalizeGO no Celular ou Desktop"
              aria-label="Instalar App"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>

            <Link
              to="/meus-agendamentos"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-xs font-semibold text-teal-300 border border-teal-500/30 transition-colors"
              title="Acessar meus agendamentos como cliente"
              aria-label="Área do Cliente"
            >
              <CalendarDays className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Área do Cliente</span>
            </Link>

            <Link
              to="/minha-conta"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
              title="Meu perfil pessoal de cliente / usuário"
              aria-label="Minha Conta"
            >
              <UserIcon className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Minha Conta</span>
            </Link>

            <div className="h-6 w-px bg-slate-800 hidden md:block" />

            <Link
              to="/minha-conta"
              className="text-right hidden md:block group"
              title="Acessar meu perfil pessoal"
            >
              <p className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors">
                {user?.name || 'Proprietário'}
              </p>
              <p className="text-[11px] text-[#94A3B8]">{user?.email}</p>
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
