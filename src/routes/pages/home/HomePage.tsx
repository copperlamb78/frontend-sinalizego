import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  FadeIn,
} from '@/design-system';
import { cn } from '@/core/utils/cn';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Scissors,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { DemoStorefrontCard } from './components/DemoStorefrontCard';
import { ServicesDepositTable } from './components/ServicesDepositTable';
import { HeroVantaFog } from './components/HeroVantaFog';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';

export const HomePage: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

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
      question: 'O que é o SinalizeGO?',
      answer:
        'O SinalizeGO é a plataforma moderna de agendamento online com sinal no Pix. Desenvolvida para barbearias, salões de beleza e profissionais de estética, ela elimina o não-comparecimento (no-show) e garante que o cliente chegue e seja atendido pontualmente sem filas.',
    },
    {
      question: 'O cliente precisa baixar algum aplicativo?',
      answer:
        'Não! A plataforma é 100% web e otimizada para navegadores mobile. O cliente acessa o link exclusivo da empresa, escolhe o serviço e o horário, acessa sua conta com segurança, paga o sinal no Pix e garante a reserva em poucos cliques.',
    },
    {
      question: 'Como funciona o sinal Pix e o repasse para o estabelecimento?',
      answer:
        'O sinal é cobrado no momento do agendamento via Pix imediato com confirmação automática. O valor fica garantido com segurança para a barbearia e cai direto na sua conta bancária após o atendimento.',
    },
    {
      question: 'Como funcionam os cancelamentos e estornos?',
      answer:
        'A plataforma opera com regras transparentes anti-vacância (Regras N1–N7): cancelamentos com mais de 24h de antecedência estornam 100% do sinal de volta para o cliente via Pix. Cancelamentos de última hora compensam o profissional pelo tempo que a cadeira ficou ociosa.',
    },
    {
      question: 'Como a plataforma impede dois clientes de escolherem o mesmo horário?',
      answer:
        'Ao clicar no horário, o motor de agendamento ativa um hold temporário de 15 minutos (Regra N6) congelando aquela cadeira exclusivamente para a conclusão do Pix. Se não for pago dentro do prazo, a vaga é liberada automaticamente para outros clientes.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. TOP NAVBAR COMPARTILHADA */}
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      {/* 2. HERO SECTION — APRESENTAÇÃO GERAL */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface/80 via-background to-background px-4 sm:px-8 pt-10 sm:pt-16 pb-14 sm:pb-20 border-b border-border/50">
        {/* Efeito Vanta FOG atmosférico institucional */}
        <HeroVantaFog isDark={isDark} />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Plataforma Oficial de Agendamento com Sinal Pix</span>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-text-primary leading-[1.12]">
              Agendamento online com sinal no Pix que <span className="text-primary">valoriza o tempo de todos</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-text-secondary">
              Para o estabelecimento: fim dos cancelamentos de última hora e receita garantida. Para o cliente: cadeira reservada na hora marcada e zero tempo perdido em filas.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
              <Link to="/para-barbearias" className="w-full sm:w-auto group">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Scissors className="h-4 w-4" />}
                  rightIcon={<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />}
                  className="w-full sm:w-auto font-bold px-6 text-sm"
                  data-testid="hero-barber-cta"
                >
                  Sou Estabelecimento
                </Button>
              </Link>

              <Link to="/para-clientes" className="w-full sm:w-auto group">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<UserCheck className="h-4 w-4" />}
                  className="w-full sm:w-auto font-bold px-6 text-sm"
                  data-testid="hero-client-cta"
                >
                  Quero Agendar como Cliente
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Destaques rápidos da plataforma */}
          <FadeIn delay={400}>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5 transition-colors hover:text-text-primary">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Sem aplicativo para baixar
              </span>
              <span className="flex items-center gap-1.5 transition-colors hover:text-text-primary">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Sinal cai direto na conta bancária
              </span>
              <span className="flex items-center gap-1.5 transition-colors hover:text-text-primary">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Hold de 15 minutos anti-furo
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL CENTRALIZADO */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-14 sm:py-20 space-y-20">
        {/* 3. OS DOIS LADOS DO ECOSSISTEMA */}
        <section aria-labelledby="ecossistema" className="space-y-6">
          <FadeIn>
            <div className="text-left space-y-1.5">
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Soluções Integradas
                </span>
              </div>
              <h2 id="ecossistema" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                Criado para quem atende e para quem é atendido
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                O SinalizeGO alinha os interesses de quem trabalha na barbearia e de quem precisa de um horário garantido:
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Estabelecimento */}
            <FadeIn delay={100} className="h-full">
              <Card className="h-full bg-surface border-border p-6 space-y-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Scissors className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">
                    Para Barbearias &amp; Profissionais
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Elimine até 95% do não-comparecimento com o sinal no Pix. Tenha previsão real de faturamento, capacidade inteligente de cadeiras simultâneas e repasse automático direto na sua conta bancária.
                  </p>
                  <ul className="space-y-1.5 text-xs text-text-secondary pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Sinal de 50%, 30% ou 100% conforme o valor
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Link exclusivo para bio do Instagram e WhatsApp
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Proteção contra vacância e furos de agenda
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <Link to="/para-barbearias" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                    Ver página completa para barbearias <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            </FadeIn>

            {/* Card Cliente */}
            <FadeIn delay={200} className="h-full">
              <Card className="h-full bg-surface border-border p-6 space-y-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">
                    Para Clientes
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Marque seu horário em menos de 1 minuto sem baixar nenhum aplicativo. Tenha a certeza de sentar na cadeira no horário combinado sem perder manhãs em salas de espera.
                  </p>
                  <ul className="space-y-1.5 text-xs text-text-secondary pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Cadeira 100% garantida na hora marcada
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Estorno total do sinal em cancelamentos com +24h
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Funciona direto no navegador do smartphone
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <Link to="/para-clientes" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                    Ver experiência do cliente <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            </FadeIn>
          </div>
        </section>

        {/* 4. VEJA A VITRINE FUNCIONANDO */}
        <section aria-labelledby="vitrine-demo" className="space-y-6">
          <FadeIn>
            <div className="text-left space-y-1.5">
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Vitrine Interativa
                </span>
              </div>
              <h2 id="vitrine-demo" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                A mesma facilidade para todos os públicos
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                O cliente escolhe o serviço e o horário; o profissional recebe a notificação e a garantia do sinal. Experimente na vitrine real abaixo:
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <DemoStorefrontCard />
          </FadeIn>
        </section>

        {/* 5. TABELA DE REGRAS CANÔNICAS N1-N7 */}
        <section id="servicos-sinal" aria-labelledby="tabela-sinal" className="space-y-6">
          <FadeIn>
            <div className="text-left space-y-1.5">
              <h2 id="tabela-sinal" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                Regras transparentes de sinal e retenção (N1–N7)
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                A cobrança do sinal protege a operação e equilibra as responsabilidades entre cliente e estabelecimento:
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <ServicesDepositTable />
          </FadeIn>
        </section>

        {/* 6. PERGUNTAS FREQUENTES (FAQ GERAL) */}
        <section id="faq" aria-labelledby="faq-titulo" className="space-y-6">
          <FadeIn>
            <div className="text-left space-y-1.5">
              <div className="inline-flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Perguntas Frequentes
                </span>
              </div>
              <h2 id="faq-titulo" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                Tire suas dúvidas sobre a plataforma
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <FadeIn key={index} delay={index * 60}>
                  <div className="rounded-xl border border-border bg-surface overflow-hidden transition-colors">
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
                </FadeIn>
              );
            })}
          </div>
        </section>

        {/* 7. BANNER FINAL CTA */}
        <FadeIn delay={100}>
          <section className="relative overflow-hidden rounded-2xl bg-surface border border-primary/30 p-8 sm:p-12 space-y-6 shadow-lg text-left transition-all duration-300 hover:border-primary/50">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                Modernize seus agendamentos com o SinalizeGO
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Proteja a rentabilidade do seu salão ou garanta que você nunca mais espere em filas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link to="/para-barbearias" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto font-bold text-sm px-7"
                  data-testid="banner-barber-btn"
                >
                  Conhecer para Barbearias
                </Button>
              </Link>
              <Link to="/para-clientes" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto font-bold text-sm px-7"
                  data-testid="banner-client-btn"
                >
                  Conhecer para Clientes
                </Button>
              </Link>
            </div>
          </section>
        </FadeIn>
      </main>

      {/* 8. FOOTER COMPARTILHADO */}
      <SiteFooter isDark={isDark} />
    </div>
  );
};

export default HomePage;
