import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/contexts/auth.context';
import { Role } from '@/types/auth.types';
import {
  CalendarDays,
  User as UserIcon,
  Compass,
  LogOut,
  Smartphone,
  Store,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { openPwaInstallModal } from '@/components/common/PwaInstallPrompt';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end: boolean;
  isSpecial?: boolean;
}

export const ClientLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isOwner = user?.role === Role.COMPANY_OWNER || user?.role === Role.EMPLOYEE;
  const isAdmin = user?.role === Role.SUPER_ADMIN || user?.role === Role.ADMIN;

  const baseNavItems: NavItem[] = [
    {
      to: '/explorar',
      label: 'Explorar',
      icon: Compass,
      end: false
    },
    {
      to: '/meus-agendamentos',
      label: 'Agendamentos',
      icon: CalendarDays,
      end: false
    },
    {
      to: '/minha-conta',
      label: 'Minha Conta',
      icon: UserIcon,
      end: false
    }
  ];

  const mobileNavItems: NavItem[] = [
    ...baseNavItems,
    ...(isOwner
      ? [
          {
            to: '/painel',
            label: 'Barbearia',
            icon: Store,
            end: false,
            isSpecial: true
          }
        ]
      : []),
    ...(isAdmin
      ? [
          {
            to: '/admin',
            label: 'Admin',
            icon: ShieldAlert,
            end: false,
            isSpecial: true
          }
        ]
      : [])
  ];

  // User initials calculation
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-[#F8FAFC]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* 1. Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Logo size="sm" />
          </Link>

          {/* 2. Center: Desktop Nav Links (Medium Screens & Up) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {baseNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'text-xs md:text-sm font-medium transition-all duration-150 flex items-center gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap',
                    isActive
                      ? 'text-[#14B8A6] bg-teal-500/10 font-semibold border border-teal-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  )
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* 3. Right: Context Switcher, Install, User Profile & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Context Switcher Buttons (Desktop / Tablet) */}
            {isOwner && (
              <Link to="/painel" className="hidden sm:inline-block">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Store className="w-3.5 h-3.5 text-teal-400" />}
                  className="text-xs h-8 px-2.5 sm:px-3 font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm whitespace-nowrap"
                >
                  Minha Barbearia
                </Button>
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className="hidden sm:inline-block">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
                  className="text-xs h-8 px-2.5 sm:px-3 font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 shadow-sm whitespace-nowrap"
                >
                  Painel Admin
                </Button>
              </Link>
            )}

            {/* PWA Install Button */}
            <button
              onClick={openPwaInstallModal}
              title="Instalar Aplicativo no Celular / Desktop"
              aria-label="Instalar aplicativo"
              className="p-1.5 sm:p-2 rounded-xl text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap shrink-0"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Instalar App</span>
            </button>

            {/* User Profile Card with Initials Avatar */}
            <Link
              to="/minha-conta"
              className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors group cursor-pointer"
              title="Acessar Minha Conta"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/20 to-teal-800/30 border border-teal-500/40 text-teal-300 text-xs font-black flex items-center justify-center shrink-0 shadow-sm group-hover:border-teal-400 transition-colors">
                {userInitials}
              </div>

              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight truncate max-w-[90px] sm:max-w-[120px] lg:max-w-[160px] group-hover:text-teal-300 transition-colors whitespace-nowrap">
                  {user?.name || 'Cliente'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono leading-tight truncate max-w-[120px] lg:max-w-[160px] hidden md:block whitespace-nowrap">
                  {user?.email || user?.phone || 'Conta Ativa'}
                </p>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Encerrar Sessão"
              aria-label="Encerrar sessão"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (padding-bottom for mobile bottom nav) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* PWA Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around px-2 py-2 safe-area-pb shadow-2xl">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium rounded-xl transition-all duration-150 whitespace-nowrap min-w-0',
                isActive
                  ? item.isSpecial
                    ? 'text-teal-300 font-bold'
                    : 'text-[#14B8A6] font-bold'
                  : item.isSpecial
                  ? 'text-teal-400/80 hover:text-teal-300'
                  : 'text-slate-400 hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'p-1.5 rounded-lg transition-transform',
                    isActive && (item.isSpecial ? 'bg-teal-500/20 scale-110' : 'bg-teal-500/10 scale-110')
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                </div>
                <span className="mt-1 truncate max-w-[64px]">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
