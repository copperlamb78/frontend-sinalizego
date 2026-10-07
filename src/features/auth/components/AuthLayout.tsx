import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Badge } from '@/design-system';
import { cn } from '@/core/utils/cn';
import { Sun, Moon, ArrowLeft, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const maxWidthClasses: Record<'md' | 'lg' | 'xl' | '2xl' | '3xl', string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  maxWidth = 'md',
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    const handleStorage = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('sinalizego-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('sinalizego-theme', 'light');
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* CABEÇALHO SUPERIOR */}
      <header className="w-full px-4 sm:px-8 py-4 border-b border-border/60 bg-surface/80 backdrop-blur-md flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Voltar para o início</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleTheme}
            leftIcon={
              isDark ? (
                <Sun className="h-3.5 w-3.5 text-warning" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-primary" />
              )
            }
            className="h-8 text-xs font-semibold px-2.5 sm:px-3"
            data-testid="auth-theme-toggle"
          >
            {isDark ? 'Claro' : 'Escuro'}
          </Button>
        </div>
      </header>

      {/* ÁREA CENTRAL COM O CARD DE AUTENTICAÇÃO */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className={cn('w-full transition-all duration-300', maxWidthClasses[maxWidth])}>
          {/* LOGO E APRESENTAÇÃO */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-3" aria-label="SinalizeGO Home">
              <img
                src={isDark ? '/logo-dark.png' : '/logo-light.png'}
                alt="SinalizeGO"
                className="h-9 sm:h-10 w-auto mx-auto object-contain"
              />
            </Link>

            <div className="flex items-center justify-center mb-2.5">
              <Badge
                variant="brand"
                size="sm"
                icon={<Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />}
              >
                Agendamento Inteligente
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              {title}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* FORMULÁRIO ENVOLVIDO */}
          <div className="bg-surface rounded-xl border border-border shadow-lg p-6 sm:p-8 transition-colors">
            {children}
          </div>

          {/* PILARES DE SEGURANÇA E CONFIANÇA */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              Sessão Criptografada
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Zap className="h-4 w-4 text-warning shrink-0" />
              Pix Instantâneo
            </span>
          </div>
        </div>
      </main>

      {/* RODAPÉ DISCRETO */}
      <footer className="py-4 text-center text-xs text-text-muted border-t border-border/40">
        © {new Date().getFullYear()} SinalizeGO Tecnologia. Todos os direitos reservados.
      </footer>
    </div>
  );
};
