import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Calendar, Wallet, User as UserIcon, Sun, Moon, LogOut } from 'lucide-react';
import { Button, Badge } from '@/design-system';
import { useAuth } from '@/features/auth';

interface ClientPortalLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badgeCount?: number;
  creditTotal?: number;
}

export const ClientPortalLayout: React.FC<ClientPortalLayoutProps> = ({
  children,
  title,
  subtitle,
  badgeCount,
  creditTotal,
}) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const tabs = [
    {
      label: 'Barbearias',
      path: '/barbearias',
      icon: <Compass className="h-4 w-4 shrink-0" />,
    },
    {
      label: 'Meus Agendamentos',
      path: '/meus-agendamentos',
      icon: <Calendar className="h-4 w-4 shrink-0" />,
      badge: badgeCount !== undefined && badgeCount > 0 ? String(badgeCount) : undefined,
    },
    {
      label: 'Meus Créditos',
      path: '/meus-creditos',
      icon: <Wallet className="h-4 w-4 shrink-0" />,
      badge: creditTotal !== undefined && creditTotal > 0 ? `R$ ${creditTotal.toFixed(0)}` : undefined,
    },
    {
      label: 'Meu Perfil',
      path: '/perfil',
      icon: <UserIcon className="h-4 w-4 shrink-0" />,
    },
  ];

  const userFirstName = user?.name ? user.name.split(' ')[0] : 'Cliente';
  const userInitials = user?.name
    ? user.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('')
    : 'CL';

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans transition-colors duration-200">
      {/* 1. TOP HEADER INSTITUCIONAL */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-md px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo SinalizeGO */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="SinalizeGO - Ir para o início">
            <img
              src={isDark ? '/logo-dark.png' : '/logo-light.png'}
              alt="SinalizeGO"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* User actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              leftIcon={
                isDark ? (
                  <Sun className="h-3.5 w-3.5 text-warning shrink-0" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-primary shrink-0" />
                )
              }
              className="h-8 text-xs font-semibold px-2.5 sm:px-3 leading-none"
              data-testid="portal-theme-toggle"
            >
              {isDark ? 'Claro' : 'Escuro'}
            </Button>

            {/* User Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-raised border border-border text-xs font-semibold">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold shrink-0">
                  {userInitials}
                </span>
                <span className="hidden sm:inline text-text-primary">{userFirstName}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                leftIcon={<LogOut className="h-3.5 w-3.5 shrink-0" />}
                className="h-8 text-xs px-2 text-text-muted hover:text-danger"
                title="Encerrar sessão"
                data-testid="portal-logout-btn"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. SUBNAV PILLS (PORTAL TABS) */}
      <section className="w-full bg-surface border-b border-border/80 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center overflow-x-auto no-scrollbar gap-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 shrink-0 ${isActive
                  ? 'bg-primary text-white shadow-xs font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-transparent'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <Badge
                    variant={isActive ? 'neutral' : 'brand'}
                    size="sm"
                    className={`text-[10px] py-0 px-1.5 whitespace-nowrap ${isActive ? 'bg-white/20 text-white border-transparent' : ''
                      }`}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </main>

      {/* 4. FOOTER SIMPLES & SÓBRIO */}
      <footer className="w-full border-t border-border bg-surface px-4 sm:px-8 py-4 text-center text-xs text-text-muted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SinalizeGO Platform • Governança Zero-Trust com Hold de 15 Minutos</span>
          <span className="text-[11px] text-text-muted">Conformidade CDC Art. 51 e Código Civil</span>
        </div>
      </footer>
    </div>
  );
};
