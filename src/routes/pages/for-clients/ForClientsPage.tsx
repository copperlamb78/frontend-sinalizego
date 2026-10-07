import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  FadeIn,
} from '@/design-system';
import { cn } from '@/core/utils/cn';
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { DemoStorefrontCard } from '../home/components/DemoStorefrontCard';
import { HeroVantaFog } from '../home/components/HeroVantaFog';
import { SiteHeader } from '../home/components/SiteHeader';
import { SiteFooter } from '../home/components/SiteFooter';

export const ForClientsPage: React.FC = () => {
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
      question: 'O valor do sinal é uma taxa extra a mais?',
      answer:
        'Não! O sinal é apenas um adiantamento que é abatido do valor total do serviço. Por exemplo: se o corte custa R$ 50,00 e o sinal é R$ 25,00 no Pix, ao chegar na barbearia você só paga os R$ 25,00 restantes.',
    },
    {
      question: 'Preciso baixar algum aplicativo ou criar senha?',
      answer:
        'Zero aplicativo! O SinalizeGO funciona direto no navegador do seu celular. Basta acessar o link da barbearia, escolher o serviço e informar seu nome e WhatsApp para receber o comprovante.',
    },
    {
      question: 'E se eu tiver um imprevisto e precisar cancelar?',
      answer:
        'A plataforma adota a Regra de Ouro anti-vacância (Regra N3): se você cancelar com mais de 24 horas de antecedência, 100% do valor do seu sinal é estornado para você. Cancelamentos de última hora (menos de 24h) compensam a barbearia pelo horário reservado que ficou vago.',
    },
    {
      question: 'Como funciona o pagamento do sinal no Pix?',
      answer:
        'Ao escolher o horário, geramos um QR Code e um código Copia e Cola do Pix. Você tem 15 minutos para fazer a transferência pelo app do seu banco com o horário congelado exclusivamente para você.',
    },
    {
      question: 'Como pago o restante do serviço?',
      answer:
        'O saldo restante é pago diretamente na barbearia ou salão após o término do atendimento, da forma que você preferir (dinheiro, cartão ou Pix no local).',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. TOP NAVBAR */}
      <SiteHeader isDark={isDark} onToggleTheme={toggleTheme} />

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface/80 via-background to-background px-4 sm:px-8 pt-10 sm:pt-16 pb-14 sm:pb-20 border-b border-border/50">
        {/* Efeito Vanta FOG atmosférico institucional */}
        <HeroVantaFog isDark={isDark} />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-6">
          <FadeIn delay={0}>
            <nav aria-label="Navegação estrutural" className="text-xs text-text-muted">
              <ol className="flex items-center gap-1.5">
                <li><Link to="/" className="hover:text-primary transition-colors">Início</Link></li>
                <li>/</li>
                <li className="text-primary font-semibold">Para Clientes</li>
              </ol>
            </nav>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-text-primary leading-[1.12]">
              Agende seu corte na hora, <span className="text-primary">sem filas e sem esperar</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-text-secondary">
              Chega de perder tempo na sala de espera ou mandar mensagem no WhatsApp torcendo por uma resposta. Com o SinalizeGO, você escolhe seu horário livre, garante sua cadeira no Pix e chega para ser atendido na hora.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-2">
              <Link to="/empresa/barbers-club" className="w-full sm:w-auto group">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />}
                  className="w-full sm:w-auto font-bold px-7 text-sm"
                  data-testid="client-hero-cta"
                >
                  Experimentar Agendamento Online
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Destaques rápidos */}
          <FadeIn delay={400}>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5 transition-colors hover:text-text-primary">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Sem cadastro longo ou app para baixar
              </span>
              <span className="flex items-center gap-1.5 transition-colors hover:text-text-primary">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Estorno integral em cancelamento &gt; 24h
              </span>
              <span className="flex items-center gap-1.5 transition-colors hover:text-text-primary">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Cadeira reservada na hora marcada
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL CENTRALIZADO */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-14 sm:py-20 space-y-20">
        {/* 3. EXPERIMENTE NA PRÁTICA */}
        <section aria-labelledby="vitrine-cliente" className="space-y-6">
          <FadeIn>
            <div className="text-left space-y-1.5">
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Como é para você
                </span>
              </div>
              <h2 id="vitrine-cliente" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                Veja como é simples agendar
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                Tudo na palma da sua mão em menos de 1 minuto. Veja a experiência real de quem agenda pela plataforma:
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <DemoStorefrontCard />
          </FadeIn>
        </section>

        {/* 4. BENEFÍCIOS REAIS PARA O CLIENTE */}
        <section aria-labelledby="vantagens-cliente" className="space-y-6">
          <FadeIn>
            <div className="text-left space-y-1.5">
              <h2 id="vantagens-cliente" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                Por que você nunca mais vai agendar do jeito antigo
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                Adeus ao atraso, às filas intermináveis de sábado e à insegurança de não saber se seu horário foi mesmo marcado.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FadeIn delay={100} className="h-full">
              <Card className="h-full bg-surface border-border p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Pontualidade e zero espera
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Como o sinal garante a reserva, a barbearia organiza o fluxo de clientes com precisão. Você chega no seu horário e é atendido sem perder metade do seu dia.
                </p>
              </Card>
            </FadeIn>

            <FadeIn delay={200} className="h-full">
              <Card className="h-full bg-surface border-border p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Cancelamento transparente e justo
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Teve um imprevisto? Se cancelar com mais de 24 horas de antecedência, 100% do seu sinal é devolvido. Sem discussão, sem estresse e direto no Pix.
                </p>
              </Card>
            </FadeIn>

            <FadeIn delay={300} className="h-full">
              <Card className="h-full bg-surface border-border p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  100% no celular sem app
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Nada de ocupar espaço na memória do seu smartphone com mais um aplicativo. Abra o link no WhatsApp ou Instagram, escolha e confirme em segundos.
                </p>
              </Card>
            </FadeIn>
          </div>
        </section>

        {/* 5. PASSO A PASSO DO AGENDAMENTO */}
        <section aria-labelledby="passos-cliente" className="space-y-6">
          <FadeIn>
            <div className="text-left space-y-1.5">
              <h2 id="passos-cliente" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                Como agendar seu horário em 4 passos
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                O processo mais rápido do Brasil para garantir sua cadeira:
              </p>
            </div>
          </FadeIn>

          <ol className="grid grid-cols-1 gap-3.5">
            <FadeIn delay={80}>
              <li className="group flex items-start gap-4 p-4 rounded-xl bg-surface border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
                <span className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                  1
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-text-primary">
                    Abra o link do estabelecimento
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Clique no link disponibilizado na bio do Instagram ou enviado diretamente para você no WhatsApp.
                  </p>
                </div>
              </li>
            </FadeIn>

            <FadeIn delay={160}>
              <li className="group flex items-start gap-4 p-4 rounded-xl bg-surface border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
                <span className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                  2
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-text-primary">
                    Escolha o serviço e o melhor horário
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Veja os serviços com tempo de duração, preço total e o valor do sinal transparente. Escolha a data no calendário.
                  </p>
                </div>
              </li>
            </FadeIn>

            <FadeIn delay={240}>
              <li className="group flex items-start gap-4 p-4 rounded-xl bg-surface border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
                <span className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                  3
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-text-primary">
                    Pague o sinal no Pix com reserva de 15 minutos
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Use o Copia e Cola ou QR Code no app do seu banco. Sua vaga fica congelada temporariamente para ninguém passar na sua frente.
                  </p>
                </div>
              </li>
            </FadeIn>

            <FadeIn delay={320}>
              <li className="group flex items-start gap-4 p-4 rounded-xl bg-surface border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
                <span className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-extrabold text-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                  4
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-text-primary">
                    Compareça e pague o restante no local
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Seu horário está confirmado! No local, você só acerta a diferença restante do serviço com a barbearia.
                  </p>
                </div>
              </li>
            </FadeIn>
          </ol>
        </section>

        {/* 6. FAQ DO CLIENTE */}
        <section id="faq-cliente" aria-labelledby="faq-cliente-titulo" className="space-y-6">
          <FadeIn>
            <div className="text-left space-y-1.5">
              <div className="inline-flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Tire Suas Dúvidas
                </span>
              </div>
              <h2 id="faq-cliente-titulo" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                Perguntas Frequentes de quem agenda
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
                Pronto para garantir seu próximo corte sem fila?
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Acesse a vitrine de demonstração e teste na prática a facilidade de agendar pelo SinalizeGO.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-text-secondary">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Sem filas nem atrasos
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Pagamento do sinal via Pix instantâneo
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Cancelamento justo com estorno integral (&gt;24h)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Funciona direto no navegador do celular
              </li>
            </ul>

            <div className="pt-2">
              <Link to="/empresa/barbers-club" className="inline-block group">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />}
                  className="font-bold text-sm px-8"
                  data-testid="client-banner-cta"
                >
                  Ver Demonstração de Agendamento
                </Button>
              </Link>
            </div>
          </section>
        </FadeIn>
      </main>

      {/* 8. FOOTER */}
      <SiteFooter isDark={isDark} />
    </div>
  );
};

export default ForClientsPage;
