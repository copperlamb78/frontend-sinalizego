import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/contexts/auth.context';
import { Role } from '@/types/auth.types';
import { Menu, X, LogIn, LayoutDashboard, ShieldCheck, ArrowRight } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) return '/admin';
    if (user.role === Role.COMPANY_OWNER) return '/painel';
    return '/meus-agendamentos';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-[#F8FAFC]">
      {/* Institutional Topbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94A3B8]">
            <Link to="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <a href="/#como-funciona" className="hover:text-white transition-colors">
              Como Funciona
            </a>
            <a href="/#recursos" className="hover:text-white transition-colors">
              Recursos
            </a>
            <Link
              to="/cadastro"
              className="text-[#14B8A6] hover:text-teal-300 transition-colors flex items-center gap-1.5"
            >
              <span>Para Barbearias & Salões</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">
                Novo
              </span>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<LayoutDashboard className="w-4 h-4 text-[#14B8A6]" />}
                  onClick={() => navigate(getDashboardPath())}
                >
                  Meu Painel ({user.name.split(' ')[0]})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-slate-400 hover:text-red-400"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
                    Entrar
                  </Button>
                </Link>
                <Link to="/cadastro">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Cadastrar Grátis
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#0F172A] px-4 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-base font-medium text-slate-300">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-800"
              >
                Início
              </Link>
              <a
                href="/#como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-800"
              >
                Como Funciona
              </a>
              <Link
                to="/cadastro"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-teal-400 hover:bg-slate-800"
              >
                Para Barbearias & Salões
              </Link>
            </nav>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
              {isAuthenticated && user ? (
                <>
                  <Button
                    variant="secondary"
                    className="w-full justify-center"
                    leftIcon={<LayoutDashboard className="w-4 h-4 text-[#14B8A6]" />}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(getDashboardPath());
                    }}
                  >
                    Meu Painel
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-red-400"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="secondary" className="w-full justify-center" leftIcon={<LogIn className="w-4 h-4" />}>
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/cadastro" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="primary" className="w-full justify-center">
                      Criar Conta Grátis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content View */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0F172A] py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <Logo size="md" />
            <p className="text-sm text-[#94A3B8] max-w-sm leading-relaxed">
              O ecossistema definitivo para barbearias, salões e estúdios. Agendamentos sem no-show com sinal Pix automatizado e split bancário instantâneo.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Pagamentos processados com segurança via Asaas Gateway</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Plataforma
            </h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Encontrar Estabelecimentos
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="hover:text-white transition-colors">
                  Cadastrar Barbearia
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Área do Cliente
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Segurança & Termos
            </h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li>
                <a href="#politica" className="hover:text-white transition-colors">
                  Política de Cancelamento (&gt;24h)
                </a>
              </li>
              <li>
                <a href="#termos" className="hover:text-white transition-colors">
                  Termos de Uso do Split Pix
                </a>
              </li>
              <li>
                <a href="#privacidade" className="hover:text-white transition-colors">
                  Privacidade LGPD
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SinalizeGO SaaS. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Feito para alta performance e zero vacância.
          </p>
        </div>
      </footer>
    </div>
  );
};
