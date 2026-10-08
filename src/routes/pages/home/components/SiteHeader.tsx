import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Badge } from '@/design-system';
import { useAuth } from '@/features/auth';
import { Sun, Moon, LogIn, LogOut, User } from 'lucide-react';

interface SiteHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ isDark, onToggleTheme }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Clientes', path: '/para-clientes' },
    { label: 'Barbearias', path: '/para-barbearias' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-md px-4 sm:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* LOGO E BADGE */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center" aria-label="SinalizeGO - Página Inicial">
            <img
              src={isDark ? '/logo-dark.png' : '/logo-light.png'}
              alt="SinalizeGO"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </Link>
          <Badge variant="brand" size="sm" className="hidden lg:inline-flex text-[10px]">
            Sinal Pix &amp; Zero No-Show
          </Badge>
        </div>

        {/* LINKS PRINCIPAIS DE NAVEGAÇÃO ENTRE PÚBLICOS */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-surface-raised/80 border border-border/60 text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-primary text-white shadow-xs font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* AÇÕES (TEMA, AUTH E CTA DEMO) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleTheme}
            leftIcon={isDark ? <Sun className="h-3.5 w-3.5 text-warning shrink-0" /> : <Moon className="h-3.5 w-3.5 text-primary shrink-0" />}
            data-testid="home-theme-toggle"
            className="h-8 text-xs font-semibold px-2.5 sm:px-3 leading-none"
          >
            {isDark ? 'Claro' : 'Escuro'}
          </Button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-surface-raised border border-border text-text-primary">
                <User className="h-3.5 w-3.5 text-primary" />
                {user.name.split(' ')[0]}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                leftIcon={<LogOut className="h-3.5 w-3.5" />}
                className="h-8 text-xs px-2.5 text-text-muted hover:text-danger"
                title="Encerrar sessão"
                data-testid="nav-logout-btn"
              >
                Sair
              </Button>
            </div>
          ) : (
            <Link to="/login" className="inline-flex items-center">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<LogIn className="h-3.5 w-3.5 text-primary shrink-0" />}
                className="h-8 text-xs font-semibold px-3 leading-none"
                data-testid="nav-login-btn"
              >
                Entrar
              </Button>
            </Link>
          )}

          <Link to="/empresa/barbers-club" className="hidden lg:inline-flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold px-3 leading-none"
              data-testid="nav-cta-demo"
            >
              Vitrine Demo
            </Button>
          </Link>
        </div>
      </div>

      {/* SUB-MENU MOBILE DE PÁGINAS */}
      <div className="flex md:hidden items-center justify-center gap-2 pt-2.5 mt-2.5 border-t border-border/50 text-xs font-medium">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`px-2.5 py-1 rounded-md transition-colors ${isActive
                ? 'text-primary font-bold bg-primary/10'
                : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
