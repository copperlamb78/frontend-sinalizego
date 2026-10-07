import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Badge,
} from '@/design-system';
import { cn } from '@/core/utils/cn';
import {
  Clock,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Users,
  Percent,
} from 'lucide-react';
import { DemoStorefrontCard } from './components/DemoStorefrontCard';
import { ServicesDepositTable } from './components/ServicesDepositTable';

export const HomePage: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  // Estado para controlar os acordeões do FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: 'O cliente precisa baixar aplicativo ou criar conta?',
      answer:
        'Não! O SinalizeGO é 100% web e otimizado para celulares. Seu cliente clica no link da bio do Instagram ou no WhatsApp, escolhe o serviço, informa nome e telefone, paga o sinal no Pix e garante a cadeira em menos de 1 minuto.',
    },
    {
      question: 'Como funciona o sinal Pix e o split financeiro?',
      answer:
        'O sinal é pago via Pix (QR Code e Copia e Cola) processado com split automático via gateway Asaas. O valor do sinal é reservado para o estabelecimento e liberado com segurança após o atendimento.',
    },
    {
      question: 'E se o cliente cancelar ou não comparecer?',
      answer:
        'A plataforma opera com regras transparentes anti-vacância (Regras N1–N7): cancelamentos com mais de 24h de antecedência permitem estorno integral do sinal ao cliente; cancelamentos em cima da hora retêm o sinal para o estabelecimento para compensar a cadeira vazia.',
    },
    {
      question: 'Posso configurar serviços sem sinal ou com valores diferentes?',
      answer:
        'Sim! Para serviços a partir de R$ 400,00 você pode configurar 30% ou 50% de sinal. Para serviços rápidos abaixo de R$ 15,00, a plataforma aplica 100% de sinal para proteger a rentabilidade e cobrir os custos de gateway.',
    },
    {
      question: 'Como o dinheiro cai na minha conta?',
      answer:
        'Após a conclusão do atendimento (status COMPLETED), o saldo é liberado diretamente no extrato da sua empresa no painel, pronto para transferências bancárias sem burocracia.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. TOP NAVBAR */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center" aria-label="SinalizeGO - Página Inicial">
              <img
                src={isDark ? '/logo-dark.png' : '/logo-light.png'}
                alt="SinalizeGO"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </Link>
            <Badge variant="brand" size="sm" className="hidden sm:inline-flex text-[10px]">
              Sinal Pix &amp; Zero No-Show
            </Badge>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-text-secondary">
            <a href="#como-funciona" className="hover:text-primary transition-colors">
              Como Funciona
            </a>
            <a href="#servicos-sinal" className="hover:text-primary transition-colors">
              Serviços &amp; Sinal
            </a>
            <a href="#faq" className="hover:text-primary transition-colors">
              Dúvidas
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              leftIcon={isDark ? <Sun className="h-3.5 w-3.5 text-warning" /> : <Moon className="h-3.5 w-3.5 text-primary" />}
              data-testid="home-theme-toggle"
              className="h-8 text-xs font-semibold px-2.5 sm:px-3"
            >
              {isDark ? 'Claro' : 'Escuro'}
            </Button>

            <Link to="/empresa/barbers-club">
              <Button
                variant="primary"
                size="sm"
                className="h-8 text-xs font-bold px-3"
                data-testid="nav-cta-demo"
              >
                Ver Vitrine Demo
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface/80 via-background to-background px-4 sm:px-8 pt-10 sm:pt-16 pb-14 sm:pb-20 border-b border-border/50">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-6">
          <nav aria-label="Navegação estrutural" className="text-xs text-text-muted animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ol className="flex items-center gap-1.5">
              <li>Início</li>
              <li>/</li>
              <li className="text-primary font-semibold">Sistema para barbearia e estética</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-text-primary leading-[1.12] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Sistema para barbearia com agenda online e <span className="text-primary">sinal no Pix</span>
          </h1>

          <p className="max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-text-secondary animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Procedimentos longos, químicas e horários de pico seguram a cadeira por horas. Uma falta nesses serviços derruba o faturamento do dia. O SinalizeGO organiza a agenda e pede sinal no Pix com reserva garantida.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link to="/empresa/barbers-club" className="w-full sm:w-auto group">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />}
                className="w-full sm:w-auto font-bold px-7 text-sm"
                data-testid="hero-primary-cta"
              >
                Testar Vitrine Online Agora
              </Button>
            </Link>
          </div>

          {/* Destaques rápidos */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-text-muted animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <span className="flex items-center gap-1.5 transition-colors hover:text-text-primary">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Sem app para o cliente baixar
            </span>
            <span className="flex items-center gap-1.5 transition-colors hover:text-text-primary">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Sinal cai na sua subconta Asaas
            </span>
            <span className="flex items-center gap-1.5 transition-colors hover:text-text-primary">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Reserva de 15 minutos anti-concorrência
            </span>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL CENTRALIZADO */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-14 sm:py-20 space-y-20">
        {/* 3. VEJA FUNCIONANDO NA PRÁTICA */}
        <section aria-labelledby="veja-funcionando" className="space-y-6">
          <div className="text-left space-y-1.5">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Demonstração Real
              </span>
            </div>
            <h2 id="veja-funcionando" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              Veja funcionando na prática
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              Um agendamento de verdade: o cliente acessa pelo link, escolhe o serviço com o valor do sinal transparente, seleciona o horário e garante a cadeira no Pix.
            </p>
          </div>

          {/* Card Interativo com Vitrine Integrada */}
          <DemoStorefrontCard />
        </section>

        {/* 4. O QUE MUDA NA ROTINA DO ESTABELECIMENTO */}
        <section aria-labelledby="rotina" className="space-y-6">
          <div className="text-left space-y-1.5">
            <h2 id="rotina" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              O que muda na rotina do estabelecimento
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              Chega de perder manhãs inteiras com clientes que marcaram e não apareceram.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="bg-surface border-border p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Percent className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">
                Compromisso real com sinal
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Com 50% de sinal num corte ou 30% numa química longa, o cliente valoriza o horário reservado. Se desistir de última hora, o sinal compensa o profissional pela cadeira vazia.
              </p>
            </Card>

            <Card className="bg-surface border-border p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">
                Capacidade concorrente inteligente
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Configure a capacidade de cadeiras por grupo de serviços. O motor de agendamento calcula horários livres sem sobreposição nem atrasos no salão.
              </p>
            </Card>

            <Card className="bg-surface border-border p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">
                Hold de 15 minutos anti-furo
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Ao selecionar o horário, a vaga fica temporariamente congelada exclusivamente para o cliente concluir o Pix. Sem disputa simultânea de vagas.
              </p>
            </Card>
          </div>
        </section>

        {/* 5. SERVIÇOS E SINAL: EXEMPLO REAL BASEADO NA API */}
        <section id="servicos-sinal" aria-labelledby="tabela-sinal" className="space-y-6">
          <div className="text-left space-y-1.5">
            <h2 id="tabela-sinal" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              Serviços e sinal: regras práticas de agendamento
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              A cobrança do sinal protege a operação e se adapta ao valor de cada procedimento conforme as regras canônicas da plataforma (Regras N1–N7):
            </p>
          </div>

          <ServicesDepositTable />
        </section>

        {/* 6. COMO O CLIENTE MARCA */}
        <section id="como-funciona" aria-labelledby="como-marcar" className="space-y-6">
          <div className="text-left space-y-1.5">
            <h2 id="como-marcar" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              Como o cliente marca
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              Fluxo rápido, sem atrito e sem necessidade de baixar aplicativo:
            </p>
          </div>

          <ol className="grid grid-cols-1 gap-3.5">
            <li className="group flex items-start gap-4 p-4 rounded-xl bg-surface border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
              <span className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                1
              </span>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-text-primary">
                  Abre o seu link exclusivo
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Coloque na bio do Instagram ou envie diretamente no WhatsApp (<code className="text-primary font-mono text-[11px]">/empresa/seu-negocio</code>).
                </p>
              </div>
            </li>

            <li className="group flex items-start gap-4 p-4 rounded-xl bg-surface border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
              <span className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                2
              </span>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-text-primary">
                  Escolhe o serviço desejado
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Visualiza a lista organizada por categorias com preço total, tempo de duração e o valor do sinal.
                </p>
              </div>
            </li>

            <li className="group flex items-start gap-4 p-4 rounded-xl bg-surface border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
              <span className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                3
              </span>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-text-primary">
                  Seleciona a data e o horário livre
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Grade de horários atualizada em tempo real conforme a disponibilidade da sua equipe.
                </p>
              </div>
            </li>

            <li className="group flex items-start gap-4 p-4 rounded-xl bg-surface border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
              <span className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                4
              </span>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-text-primary">
                  Paga o sinal no Pix
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Geração instantânea de QR Code e chave Copia e Cola com 15 minutos de reserva garantida.
                </p>
              </div>
            </li>

            <li className="group flex items-start gap-4 p-4 rounded-xl bg-surface border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
              <span className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                5
              </span>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-text-primary">
                  Cadeira 100% garantida
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Agendamento confirmado automaticamente sem filas, sem papel e sem risco de duplo agendamento.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* 7. PERGUNTAS FREQUENTES (FAQ) */}
        <section id="faq" aria-labelledby="faq-titulo" className="space-y-6">
          <div className="text-left space-y-1.5">
            <div className="inline-flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Perguntas Frequentes
              </span>
            </div>
            <h2 id="faq-titulo" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              Tire suas dúvidas sobre o sistema
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-surface overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-surface-raised/40 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-text-primary">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-text-muted shrink-0 transition-transform duration-300",
                        isOpen && "rotate-180 text-primary"
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/40">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. BANNER FINAL CTA */}
        <section className="relative overflow-hidden rounded-2xl bg-surface border border-primary/30 p-8 sm:p-12 space-y-6 shadow-lg text-left transition-all duration-300 hover:border-primary/50">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Seu link de agendamento fica pronto em 5 minutos
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Elimine o não-comparecimento, profissionalize seu atendimento e tenha previsão financeira real.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-text-secondary">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Sem aplicativo para baixar
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Split automático na subconta Asaas
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Sem fidelidade contratual
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Proteção contra vacância e furos de agenda
            </li>
          </ul>

          <div className="pt-2">
            <Link to="/empresa/barbers-club" className="inline-block group">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />}
                className="font-bold text-sm px-8"
                data-testid="banner-final-cta"
              >
                Acessar Vitrine de Exemplo
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="w-full border-t border-border bg-surface py-10 px-4 sm:px-8 text-xs text-text-muted mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center" aria-label="SinalizeGO - Página Inicial">
              <img
                src={isDark ? '/logo-dark.png' : '/logo-light.png'}
                alt="SinalizeGO"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </Link>
            <p className="text-text-secondary leading-relaxed">
              Plataforma de agendamento online e pagamento de sinal Pix com split automático para barbearias, estúdios e salões.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-text-primary">Navegação Rápida</h5>
            <ul className="space-y-1.5">
              <li>
                <Link to="/empresa/barbers-club" className="hover:text-primary transition-colors">
                  Vitrine Demo (Barber's Club)
                </Link>
              </li>
              <li>
                <a href="#como-funciona" className="hover:text-primary transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#servicos-sinal" className="hover:text-primary transition-colors">
                  Tabela de Serviços &amp; Sinal
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-text-primary">Conformidade &amp; Segurança</h5>
            <p className="text-text-secondary leading-relaxed">
              Processamento financeiro com subcontas bancárias via Asaas Gateway. Zero retenção de senhas bancárias e regras canônicas N1–N7.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} SinalizeGO. Todos os direitos reservados.</p>
          <p className="text-text-muted">
            Feito para eliminar o não-comparecimento em serviços de beleza.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
