import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Badge,
} from '@/design-system';
import {
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  Store,
  Lock,
  Scissors,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

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
    <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-sm px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 bg-primary rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
            <span className="font-extrabold text-base tracking-wider uppercase text-text-primary">
              Sinalize<span className="text-primary">GO</span>
            </span>
            <Badge variant="brand" size="sm" className="hidden sm:inline-flex text-[10px]">
              v1.0 Live
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              leftIcon={isDark ? <Sun className="h-3.5 w-3.5 text-warning" /> : <Moon className="h-3.5 w-3.5 text-primary" />}
              data-testid="home-theme-toggle"
              className="h-8 text-xs font-semibold px-3"
            >
              {isDark ? 'Claro' : 'Escuro'}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-12 sm:py-20 flex flex-col items-center justify-center text-center space-y-10">
        <div className="space-y-4 max-w-3xl">
          <Badge variant="brand" size="md" className="mx-auto uppercase tracking-wider text-[11px] font-bold">
            <Sparkles className="h-3 w-3 mr-1" />
            Plataforma de Agendamento Inteligente & Sinal Pix
          </Badge>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-text-primary leading-[1.1]">
            Elimine o <span className="text-primary">Não-Comparecimento</span> no seu estabelecimento
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Vitrine pública de alta conversão para barbearias e estúdios. O cliente escolhe o serviço, agenda seu horário e garante a cadeira com sinal antecipado via Pix com split automático Asaas.
          </p>
        </div>

        {/* CTA Principal de Navegação para a Vitrine */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link to="/empresa/barbers-club" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto font-bold px-8 shadow-lg shadow-primary/20"
              data-testid="cta-open-demo-storefront"
            >
              Acessar Vitrine de Exemplo
            </Button>
          </Link>
        </div>

        {/* Card de Destaque da Vitrine Demo */}
        <Card className="w-full max-w-xl text-left bg-surface border-border hover:border-primary/50 transition-colors shadow-md">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                  <Scissors className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Barber's Club</h3>
                  <p className="text-xs text-text-muted">Avenida Artêmia Pires Freitas • Feira de Santana, BA</p>
                </div>
              </div>
              <Badge variant="success" size="sm">
                Aberto Hoje
              </Badge>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Explore a vitrine pública em funcionamento real: navegue pelas categorias (Cabelo, Barba, Combos), veja o cálculo transparente do sinal Pix e selecione data e horário.
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-border/60">
              <span className="text-xs text-text-muted flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-primary" /> Rota: <code className="font-mono text-primary text-xs">/empresa/barbers-club</code>
              </span>
              <Link to="/empresa/barbers-club">
                <Button variant="link" size="sm" className="p-0 text-xs text-primary font-semibold">
                  Abrir Vitrine &rarr;
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pilares do Sistema */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl pt-6">
          <div className="p-5 rounded-lg bg-surface border border-border text-left space-y-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm text-text-primary">Zero No-Show</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Regras N1–N7: sinal de 100% para serviços abaixo de R$ 15,00 e sinal padronizado de 50% ou 30% flexível.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-surface border border-border text-left space-y-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm text-text-primary">Hold de 15 Minutos</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Ao avançar para o Pix, o horário é retido exclusivamente pelo cliente contra conflitos de concorrência.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-surface border border-border text-left space-y-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Lock className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm text-text-primary">Split Asaas Nativo</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Divisão automática e segura de taxas de conveniência e repasse direto para a subconta bancária do parceiro.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-surface py-6 px-4 text-center text-xs text-text-muted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} SinalizeGO. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link to="/empresa/barbers-club" className="hover:text-primary transition-colors">
              Vitrine Demo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
