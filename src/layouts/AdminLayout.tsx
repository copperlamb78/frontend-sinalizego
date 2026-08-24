import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/contexts/auth.context';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  Building2,
  Users,
  Activity,
  LogOut,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', label: 'Platform Intelligence', icon: Activity, end: true },
    { to: '/admin/empresas', label: 'Empresas', icon: Building2, end: false },
    { to: '/admin/usuarios', label: 'Usuários & Moderação', icon: Users, end: false }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-[#F8FAFC]">
      {/* Top Executive Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="flex items-center gap-2">
              <Logo size="sm" />
            </Link>

            <Badge variant="destructive" size="md" dot>
              SUPER ADMIN
            </Badge>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#1E293B] p-1.5 rounded-2xl border border-slate-700/60">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[#14B8A6] text-white shadow-md shadow-teal-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-3">
            <Link to="/explorar">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Compass className="w-3.5 h-3.5 text-teal-400" />}
                className="text-xs h-8 border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer"
              >
                Visão de Cliente
              </Button>
            </Link>

            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{user?.name || 'Administrador'}</p>
              <p className="text-[11px] text-teal-400 font-mono">{user?.email}</p>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sair do Modo Admin"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Submenu */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-2 bg-[#1E293B]/60">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                  isActive
                    ? 'text-[#14B8A6] bg-teal-500/10 font-bold'
                    : 'text-slate-400'
                )
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
