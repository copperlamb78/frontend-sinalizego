import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/contexts/auth.context';
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

  // User initials calculation
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SA';

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-[#F8FAFC]">
      {/* Top Executive Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* 1. Left: Brand & Super Admin Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/admin" className="flex items-center gap-2">
              <Logo size="sm" />
            </Link>

            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 whitespace-nowrap">
              SUPER ADMIN
            </span>
          </div>

          {/* 2. Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navItems.map((item) => (
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

          {/* 3. Right: Context Switcher, Admin Profile with Avatar & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Switcher to Client Portal */}
            <Link to="/explorar" className="hidden sm:inline-block">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Compass className="w-3.5 h-3.5 text-teal-400" />}
                className="h-8 px-2.5 sm:px-3 text-xs font-semibold whitespace-nowrap border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer"
              >
                Visão de Cliente
              </Button>
            </Link>

            {/* Admin Profile Card with Avatar */}
            <div className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500/20 to-red-800/30 border border-red-500/40 text-red-300 text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
                {userInitials}
              </div>

              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight truncate max-w-[100px] sm:max-w-[130px] lg:max-w-[160px] whitespace-nowrap">
                  {user?.name || 'Administrador'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono leading-tight truncate max-w-[130px] lg:max-w-[160px] hidden md:block whitespace-nowrap">
                  {user?.email || 'superadmin@sinalizego.com'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sair do Modo Admin"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Submenu (< 768px) */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-2 bg-[#1E293B]/80 backdrop-blur-md">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'text-[#14B8A6] bg-teal-500/10 font-bold border border-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                )
              }
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{item.label.split(' ')[0]}</span>
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
