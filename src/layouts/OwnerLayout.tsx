import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/contexts/auth.context';
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
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';

export const OwnerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/painel', icon: LayoutDashboard, end: true },
    { name: 'Agenda Operacional', href: '/painel/agenda', icon: Calendar, end: false },
    { name: 'Serviços & Grupos', href: '/painel/servicos', icon: Scissors, end: false },
    { name: 'Expediente', href: '/painel/expediente', icon: Clock, end: false },
    { name: 'Financeiro Asaas', href: '/painel/financeiro', icon: Wallet, end: false },
    { name: 'Configurações', href: '/painel/configuracoes', icon: Settings, end: false }
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-[#0F172A] border-r border-slate-800 transition-all duration-300 relative z-30',
          isSidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800">
          <Link to="/painel" className="flex items-center gap-2 overflow-hidden">
            <Logo size="sm" showText={!isSidebarCollapsed} />
          </Link>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isSidebarCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-[#14B8A6] text-white font-semibold shadow-lg shadow-teal-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )
              }
              title={isSidebarCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer User Box */}
        <div className="p-4 border-t border-slate-800">
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50',
              isSidebarCollapsed ? 'justify-center' : 'justify-between'
            )}
          >
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                  {user?.name || 'Proprietário'}
                </p>
                <Badge variant="teal" size="sm" className="mt-1">
                  DONO
                </Badge>
              </div>
            )}

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sair"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Menu */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-72 bg-[#0F172A] border-r border-slate-800 p-4 flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <Logo size="sm" />
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-1.5">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.end}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#14B8A6] text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">{user?.name}</p>
                <p className="text-xs text-teal-400 font-mono">COMPANY_OWNER</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-lg text-red-400 hover:bg-slate-800"
              >
                <LogOut className="w-5 h-5" />
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
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
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
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-teal-400" />
              <span>Ver Vitrine Pública</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-white">{user?.name}</p>
              <p className="text-[11px] text-[#94A3B8]">{user?.email}</p>
            </div>
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
