import React, { useState } from 'react';
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Modal,
  Skeleton,
  Toaster,
  toast,
} from '@/design-system';
import {
  StorefrontView,
  BookingStepTwoView,
  type StorefrontService,
  type StorefrontCompany,
  type BookingSelectionData,
} from '@/features/storefront';
import {
  Calendar,
  Copy,
  ArrowRight,
  Sun,
  Moon,
  Check,
  Scissors,
  AlertTriangle,
  Search,
  Phone,
  User,
  Mail,
  Eye,
  EyeOff,
  Lock,
  Tag,
  Clock,
  Sparkles,
  QrCode,
  ShieldCheck,
  Bell,
  CheckCircle,
  XCircle,
  Store,
  Layers,
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'storefront' | 'workbench'>('storefront');
  const [selectedBooking, setSelectedBooking] = useState<{
    service: StorefrontService;
    company: StorefrontCompany;
  } | null>(null);
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

  const handleCopy = () => {
    setCopied(true);
    toast.success('Código Pix copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateBooking = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Cadeira garantida! Seu Pix está aguardando pagamento.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
      {/* Notificações Flutuantes (Toast) */}
      <Toaster position="bottom-right" />

      {/* Top Navigation Bar Global para Alternar Telas */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-sm px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-primary rounded-full" />
            <span className="font-extrabold text-sm tracking-wider uppercase text-text-primary hidden sm:inline">
              SinalizeGO
            </span>
          </div>

          {/* Seletor de Telas */}
          <div className="flex items-center gap-1 p-1 rounded-[6px] bg-surface-raised border border-border">
            <Button
              variant={activeView === 'storefront' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('storefront')}
              leftIcon={<Store className="h-3.5 w-3.5" />}
              className="text-xs normal-case tracking-normal font-semibold h-7 px-2.5"
              data-testid="nav-storefront-btn"
            >
              Vitrine
            </Button>

            <Button
              variant={activeView === 'workbench' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('workbench')}
              leftIcon={<Layers className="h-3.5 w-3.5" />}
              className="text-xs normal-case tracking-normal font-semibold h-7 px-2.5"
              data-testid="nav-workbench-btn"
            >
              Design System
            </Button>
          </div>

          {/* Alternador de Tema */}
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleTheme}
            leftIcon={isDark ? <Sun className="h-3.5 w-3.5 text-warning" /> : <Moon className="h-3.5 w-3.5 text-primary" />}
            data-testid="theme-toggle-button"
            className="h-7 text-xs font-semibold px-2.5"
          >
            {isDark ? 'Claro' : 'Escuro'}
          </Button>
        </div>
      </nav>

      {/* RENDERIZAÇÃO CONDICIONAL: VITRINE vs BANCADA */}
      {activeView === 'storefront' ? (
        selectedBooking ? (
          <BookingStepTwoView
            company={selectedBooking.company}
            service={selectedBooking.service}
            onBack={() => setSelectedBooking(null)}
            onProceedToCheckout={(data: BookingSelectionData) => {
              toast.success(
                `Reserva para ${data.time} confirmada! Sinal: R$ ${data.downPaymentAmount.toFixed(2)} via Pix.`
              );
            }}
          />
        ) : (
          <StorefrontView
            slug="barbers-club"
            onSelectService={(service, company) => {
              setSelectedBooking({ service, company });
            }}
          />
        )
      ) : (
        <main className="p-6 md:p-12">
          <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Header da Bancada de Componentes */}
            <header className="space-y-1 pb-6 border-b border-border">
              <div className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-primary rounded-full" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  SinalizeGO — Design System
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary uppercase">
                Bancada de Componentes Atômicos
              </h1>
              <p className="text-sm text-text-secondary">
                Consumo estrito de tokens do <code className="text-primary font-mono text-xs">index.css</code> · Fonte única: <strong className="text-text-primary">Plus Jakarta Sans</strong>
              </p>
            </header>

            {/* =========================================================================
                SEÇÃO 1: COMPONENTE BUTTON
                ========================================================================= */}
            <section className="space-y-4">
              <div className="border-l-4 border-primary pl-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-text-primary">
                  1. Componente Button (Ações &amp; Conversão)
                </h2>
                <p className="text-xs text-text-muted">
                  Bordas limpas, fonte branca pura no CTA primário e feedback tátil
                </p>
              </div>

          <div className="p-6 bg-surface border border-border rounded-lg flex flex-wrap gap-4 items-center shadow-sm">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSimulateBooking}
              isLoading={isLoading}
              loadingText="Garantindo Cadeira..."
              rightIcon={<ArrowRight className="h-4 w-4" />}
              data-testid="primary-cta-button"
            >
              Garantir Cadeira às 16:30
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            >
              {copied ? 'Código Copiado!' : 'Copiar Código Pix'}
            </Button>

            <Button variant="outline" size="md" leftIcon={<Calendar className="h-4 w-4" />}>
              Ver Outros Dias
            </Button>

            <Button
              variant="danger"
              size="md"
              leftIcon={<AlertTriangle className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Cancelar Reserva (Abrir Modal)
            </Button>

            <Button variant="ghost" size="md">
              Voltar ao Início
            </Button>

            <Button variant="link" size="md">
              Termos de agendamento
            </Button>
          </div>
        </section>

        {/* =========================================================================
            SEÇÃO 2: COMPONENTE INPUT
            ========================================================================= */}
        <section className="space-y-4">
          <div className="border-l-4 border-primary pl-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-text-primary">
              2. Componente Input (Formulários &amp; Busca)
            </h2>
            <p className="text-xs text-text-muted">
              Bordas limpas de 1px, anel de foco em Teal e tratamento humanizado de validação
            </p>
          </div>

          <div className="p-6 bg-surface border border-border rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome do Cliente"
                placeholder="Ex: Carlos Alberto"
                leftIcon={<User className="h-4 w-4" />}
                helperText="Nome que aparecerá no agendamento"
              />

              <Input
                label="WhatsApp para Confirmação"
                placeholder="(11) 98765-4321"
                leftIcon={<Phone className="h-4 w-4" />}
                helperText="Enviaremos o comprovante e código Pix"
              />

              <Input
                label="Busca de Serviços"
                placeholder="Corte degradê, barba, selagem..."
                leftIcon={<Search className="h-4 w-4" />}
              />

              <Input
                label="Senha de Acesso"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                leftIcon={<Lock className="h-4 w-4" />}
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    className="p-1 text-text-muted hover:text-text-primary transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                helperText="Mínimo de 8 caracteres"
              />

              <Input
                label="E-mail Profissional"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                errorMessage="Informe um endereço de e-mail válido"
              />

              <Input
                label="Código da Reserva (Bloqueado)"
                value="SIN-9281-CONF"
                leftIcon={<Tag className="h-4 w-4" />}
                disabled
                helperText="Identificador único gerado pelo sistema"
              />
            </div>
          </div>
        </section>

        {/* =========================================================================
            SEÇÃO 3: COMPONENTE BADGE
            ========================================================================= */}
        <section className="space-y-4">
          <div className="border-l-4 border-primary pl-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-text-primary">
              3. Componente Badge (Status, Selos &amp; Metadados)
            </h2>
            <p className="text-xs text-text-muted">
              Acabamento fosco e sóbrio — zero neon, com indicadores cirúrgicos de status
            </p>
          </div>

          <div className="p-6 bg-surface border border-border rounded-lg shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                Status de Agendamento com Dots Sólidos
              </span>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge variant="success" dot>
                  Confirmado
                </Badge>
                <Badge variant="warning" dot>
                  Aguardando Pix (15 min)
                </Badge>
                <Badge variant="danger" dot>
                  Não comparecimento
                </Badge>
                <Badge variant="brand" dot>
                  Em Atendimento
                </Badge>
                <Badge variant="neutral">
                  Finalizado
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                Selos de Política de Sinal &amp; Destaques
              </span>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge variant="brand" icon={<Sparkles className="h-3 w-3" />}>
                  Sinal Flexível (30%)
                </Badge>
                <Badge variant="brand">
                  Sinal 50%
                </Badge>
                <Badge variant="outline">
                  Sinal 100% Integral
                </Badge>
                <Badge variant="success" icon={<ShieldCheck className="h-3 w-3" />}>
                  Pagamento Protegido
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SEÇÃO 4: COMPONENTE CARD
            ========================================================================= */}
        <section className="space-y-4">
          <div className="border-l-4 border-primary pl-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-text-primary">
              4. Componente Card (Vitrine de Serviços &amp; Checkout)
            </h2>
            <p className="text-xs text-text-muted">
              Estrutura modular combinando botões, badges e caixas de dados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Item de Serviço na Vitrine */}
            <Card variant="interactive">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle>Corte Degradê &amp; Barba Terapia</CardTitle>
                    <CardDescription>
                      Corte na tesoura/máquina com acabamento na navalha e toalha quente.
                    </CardDescription>
                  </div>
                  <Badge variant="brand">
                    Flexível
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm" icon={<Clock className="h-3 w-3" />}>
                    50 minutos
                  </Badge>
                  <Badge variant="neutral" size="sm" icon={<Scissors className="h-3 w-3" />}>
                    3 cadeiras
                  </Badge>
                </div>

                <div className="pt-2 flex items-baseline justify-between border-t border-border">
                  <div>
                    <span className="text-xs text-text-muted block">Total do serviço</span>
                    <span className="text-2xl font-extrabold text-text-primary">R$ 75,00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-text-muted block">Sinal de reserva (Pix)</span>
                    <span className="text-sm font-bold text-primary">R$ 22,50 (30%)</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="justify-between">
                <span className="text-xs text-text-muted">
                  Restante pago na cadeira
                </span>
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Escolher Horário
                </Button>
              </CardFooter>
            </Card>

            {/* Card 2: Resumo de Checkout Pix */}
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <QrCode className="h-5 w-5 text-primary" />
                    Garantia de Reserva Pix
                  </CardTitle>
                  <Badge variant="warning" dot>
                    14:59 restantes
                  </Badge>
                </div>
                <CardDescription>
                  Seu horário fica reservado por 15 minutos enquanto você conclui o Pix.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="p-4 bg-surface-raised rounded-md space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Serviço:</span>
                    <span className="font-bold text-text-primary">Corte Degradê &amp; Barba</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Horário reservado:</span>
                    <span className="font-bold text-text-primary">Hoje às 16:30</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border text-sm">
                    <span className="font-extrabold text-text-primary">Total a pagar agora (Sinal):</span>
                    <span className="font-extrabold text-primary text-base">R$ 22,50</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handleCopy}
                  leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                >
                  {copied ? 'Código Pix Copiado!' : 'Copiar Código Pix'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* =========================================================================
            SEÇÃO 5: COMPONENTE SKELETON (CARREGAMENTO SÓBRIO)
            ========================================================================= */}
        <section className="space-y-4">
          <div className="border-l-4 border-primary pl-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-text-primary">
              5. Componente Skeleton (Carregamento / Zero Tela em Branco)
            </h2>
            <p className="text-xs text-text-muted">
              Animação suave de pulso sem flash neon para carregamento de catálogo e horários
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simulação de Card Carregando */}
            <div className="p-6 bg-surface border border-border rounded-lg shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-3/4">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-2/3" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>

              <div className="flex gap-2 pt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-center">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* Simulação de Grade de Horários Carregando */}
            <div className="p-6 bg-surface border border-border rounded-lg shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-20" />
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SEÇÃO 6: COMPONENTE TOAST (NOTIFICAÇÕES FLUTUANTES)
            ========================================================================= */}
        <section className="space-y-4">
          <div className="border-l-4 border-primary pl-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-text-primary">
              6. Componente Toast (Notificações Flutuantes Sonner)
            </h2>
            <p className="text-xs text-text-muted">
              Mensagens amigáveis e anti-jargão no canto da tela
            </p>
          </div>

          <div className="p-6 bg-surface border border-border rounded-lg shadow-sm flex flex-wrap gap-3 items-center">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
              onClick={() => toast.success('Código Pix copiado para a área de transferência!')}
            >
              Testar Toast Sucesso
            </Button>

            <Button
              variant="secondary"
              size="md"
              leftIcon={<Bell className="h-4 w-4 text-amber-500" />}
              onClick={() => toast.info('Seu horário fica reservado por 15 minutos.')}
            >
              Testar Toast Aviso
            </Button>

            <Button
              variant="secondary"
              size="md"
              leftIcon={<XCircle className="h-4 w-4 text-red-500" />}
              onClick={() => toast.error('Esse horário acabou de ser reservado por outro cliente.')}
            >
              Testar Toast Erro Humanizado
            </Button>
          </div>
        </section>
      </div>

      {/* =========================================================================
          MODAL INTERATIVO DE CANCELAMENTO / REGRAS DE NEGÓCIO
          ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cancelar Reserva?"
        description="Esta ação liberará sua cadeira para outros clientes da barbearia."
      >
        <div className="space-y-5">
          {/* Box de Resumo do Atendimento */}
          <div className="p-4 bg-surface-raised border border-border rounded-md space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Serviço:</span>
              <span className="font-bold text-text-primary">Corte Degradê &amp; Barba</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Horário agendado:</span>
              <span className="font-bold text-text-primary">Hoje às 16:30</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-text-muted">Sinal pago via Pix:</span>
              <span className="font-bold text-primary">R$ 22,50</span>
            </div>
          </div>

          {/* Aviso com a Regra de 24h Humanizada */}
          <div className="p-3 bg-surface-raised border border-border rounded-md flex items-start gap-2.5 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-text-secondary leading-relaxed">
              Como o cancelamento está sendo feito com <strong>mais de 24h de antecedência</strong>, o valor do sinal será <strong>estornado integralmente</strong> para sua conta de origem.
            </p>
          </div>

          {/* Ações do Modal */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>
              Manter Horário
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => {
                setIsModalOpen(false);
                toast.success('Reserva cancelada com sucesso. O sinal Pix foi estornado.');
              }}
            >
              Sim, Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  )}
</div>
  );
};

export default App;
