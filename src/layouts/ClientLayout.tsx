import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/contexts/auth.context';
import {
  CalendarDays,
  User as UserIcon,
  Compass,
  LogOut,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { openPwaInstallModal } from '@/components/common/PwaInstallPrompt';

export const ClientLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
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

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-[#F8FAFC]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg',
                    isActive
                      ? 'text-[#14B8A6] bg-teal-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User profile & Install & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={openPwaInstallModal}
              title="Instalar Aplicativo no Celular / Desktop"
              className="p-2 rounded-xl text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">Instalar App</span>
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#F8FAFC] leading-none">
                {user?.name || 'Cliente'}
              </p>
              <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                {user?.phone || user?.email}
              </p>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Encerrar Sessão"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (padding-bottom for mobile bottom nav) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8">
        <Outlet />
      </main>

      {/* PWA Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium rounded-xl transition-all duration-150',
                isActive
                  ? 'text-[#14B8A6] font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'p-1.5 rounded-lg transition-transform',
                    isActive && 'bg-teal-500/10 scale-110'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="mt-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
