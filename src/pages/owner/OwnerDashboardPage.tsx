import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/company.service';
import { appointmentsService } from '@/services/appointments.service';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import { WithdrawalModal } from '@/components/dashboard/WithdrawalModal';
import { FinancialProfileModal } from '@/components/dashboard/FinancialProfileModal';
import { ProtectedLossModal } from '@/components/dashboard/ProtectedLossModal';
import {
  Wallet,
  Lock,
  Calendar,
  Clock,
  Scissors,
  Phone,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  UserX
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { ProtectedLossSummary, ProtectedLossItem, TodayAppointmentMetric } from '@/types/company.types';

export const OwnerDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  const [isProtectedLossModalOpen, setIsProtectedLossModalOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [noShowTarget, setNoShowTarget] = useState<TodayAppointmentMetric | null>(null);

  // 1. Fetch Company Profile (Source of truth for subaccount and slug)
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['owner-company-profile'],
    queryFn: () => companyService.getCompanyByUserId(),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // 2. Fetch Balance and Escrow (safe query)
  const { data: balance } = useQuery({
    queryKey: ['company-balance'],
    queryFn: () => companyService.getBalance(),
    retry: false,
    staleTime: 1000 * 30
  });

  // Check whether the company has an active Asaas subaccount
  const hasSubaccount = Boolean(
    balance?.walletId ||
      company?.walletId ||
      company?.financialProfile?.walletId ||
      company?.financialProfile?.status === 'APPROVED' ||
      company?.financialProfile?.status === 'ACTIVE'
  );

  // 3. Fetch Dashboard Metrics (only enabled and polling if company exists)
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['company-metrics'],
    queryFn: () => companyService.getDashboardMetrics(),
    retry: false,
    staleTime: 1000 * 30,
    refetchInterval: hasSubaccount ? 30000 : false // Poll every 30s only when subaccount is active
  });

  // 4. Fetch All Appointments for Loss Avoidance Audit
  const { data: allAppointments } = useQuery({
    queryKey: ['company-appointments-loss-audit'],
    queryFn: () => appointmentsService.getCompanyAppointments(),
    enabled: hasSubaccount,
    staleTime: 1000 * 60 * 2
  });

  // 5. Complete Appointment Mutation
  const completeMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentsService.completeAppointment(appointmentId),
    onMutate: (id) => setCompletingId(id),
    onSuccess: () => {
      toast.success('Atendimento concluído! O valor retido em garantia foi liberado.');
      queryClient.invalidateQueries({ queryKey: ['company-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
      queryClient.invalidateQueries({ queryKey: ['company-appointments'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Não foi possível concluir o atendimento antes do horário agendado.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
    onSettled: () => setCompletingId(null)
  });

  // 6. No-Show Mutation
  const noShowMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentsService.registerNoShow(appointmentId),
    onSuccess: () => {
      toast.success('Não comparecimento registrado com sucesso! A garantia de reserva foi liberada para seu saldo.');
      queryClient.invalidateQueries({ queryKey: ['company-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
      queryClient.invalidateQueries({ queryKey: ['company-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['company-appointments-loss-audit'] });
      setNoShowTarget(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'A falta só pode ser registrada após 15 minutos de tolerância do horário de início.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  });

  // Aggregated Protected Loss Metrics
  const protectedLossData: ProtectedLossSummary = useMemo(() => {
    if (metrics?.protectedLoss) return metrics.protectedLoss;

    const noShows = (allAppointments || []).filter((a) => a.status === 'NO_SHOW');
    const lateCancels = (allAppointments || []).filter(
      (a) => a.status === 'CANCELED' && (a.retainedDepositAmount || 0) > 0
    );

    const items: ProtectedLossItem[] = [
      ...noShows.map((a) => ({
        id: a.id,
        clientName: a.client?.name || 'Cliente',
        clientPhone: a.client?.phone,
        serviceName: a.service?.name || 'Serviço',
        appointmentDate: a.appointmentDate,
        durationMinutes: a.service?.durationMinutes || 30,
        retainedAmount: a.retainedDepositAmount || a.downPaymentAmount || 0,
        reason: 'NO_SHOW' as const
      })),
      ...lateCancels.map((a) => ({
        id: a.id,
        clientName: a.client?.name || 'Cliente',
        clientPhone: a.client?.phone,
        serviceName: a.service?.name || 'Serviço',
        appointmentDate: a.appointmentDate,
        durationMinutes: a.service?.durationMinutes || 30,
        retainedAmount: a.retainedDepositAmount || a.downPaymentAmount || 0,
        reason: 'LATE_CANCELLATION' as const
      }))
    ];

    const totalSavedAmount = items.reduce((acc, i) => acc + i.retainedAmount, 0);
    const totalProtectedMinutes = items.reduce((acc, i) => acc + i.durationMinutes, 0);

    return {
      totalSavedAmount,
      totalProtectedMinutes,
      totalProtectedHours: Math.round((totalProtectedMinutes / 60) * 10) / 10,
      noShowsCount: noShows.length,
      lateCancellationsCount: lateCancels.length,
      totalOccurrences: items.length,
      items
    };
  }, [metrics?.protectedLoss, allAppointments]);

  if (isLoadingCompany || (isLoadingMetrics && hasSubaccount)) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  // Safe property extraction avoiding any undefined crashes
  const financialData = metrics?.financial || metrics?.revenue;
  const available = balance?.availableBalance ?? financialData?.availableBalance ?? 0;
  const escrow = balance?.escrowLockedBalance ?? financialData?.escrowLockedBalance ?? 0;
  const totalRevenue = financialData?.totalRevenue ?? 0;
  const occupancyRate = metrics?.volume?.occupancyRate ?? metrics?.volume?.completionRate ?? 0;
  const completedCount = metrics?.volume?.completed ?? 0;
  const nextFreeDate = balance?.nextFreeWithdrawalDate;
  const storefrontSlug = company?.slug || 'minha-empresa';
  const todayAppointments = metrics?.todayAppointments || metrics?.upcomingToday || [];

  return (
    <div className="space-y-8">
      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">
              Painel de Gestão
            </h1>
            <Badge variant={hasSubaccount ? 'teal' : 'warning'} size="sm">
              {hasSubaccount ? 'Ao Vivo' : 'Configuração Pendente'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Acompanhe o faturamento, liberação de valores e a fila de clientes do dia.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={`/empresa/${storefrontSlug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Ver Minha Vitrine
            </Button>
          </Link>

          {hasSubaccount ? (
            <Button
              size="sm"
              onClick={() => setIsWithdrawModalOpen(true)}
              leftIcon={<Wallet className="w-4 h-4" />}
            >
              Solicitar Saque
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsFinancialModalOpen(true)}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="font-bold shadow-lg shadow-teal-500/20"
            >
              Ativar Subconta Asaas
            </Button>
          )}
        </div>
      </div>

      {/* Warning Banner: Carteira Travada (Quando subconta não existe) */}
      {!hasSubaccount && (
        <Card className="p-6 bg-gradient-to-r from-amber-500/10 via-[#1E293B] to-amber-500/5 border-amber-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white">
                    Subconta Bancária Asaas Não Configurada (Carteira Travada)
                  </h3>
                  <Badge variant="warning" size="sm">CADASTRO PENDENTE</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Para começar a receber o dinheiro dos cortes direto na sua conta, com Pix garantido e saques grátis toda semana, finalize seus dados bancários. O cadastro de novos serviços será liberado assim que sua conta for ativada
                </p>
              </div>
            </div>

            <Button
              size="md"
              onClick={() => setIsFinancialModalOpen(true)}
              className="shrink-0 font-bold shadow-lg shadow-amber-500/10"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Completar Cadastro Financeiro
            </Button>
          </div>
        </Card>
      )}

      {/* Financial & Escrow Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Balance */}
        <Card className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-teal-400" />
              Saldo Disponível
            </span>
            {hasSubaccount ? (
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Sacar</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            ) : (
              <Badge variant="warning" size="sm">Travado</Badge>
            )}
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-black text-teal-400">
              {formatCurrency(available)}
            </span>
            <p className="text-[11px] text-slate-400 pt-0.5">
              {hasSubaccount ? 'Liberado para transferência Pix' : 'Complete o cadastro para movimentar'}
            </p>
          </div>
        </Card>

        {/* Card 2: Escrow Locked Balance */}
        <Card className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              Saldo em Garantia
            </span>
            <div className="group relative cursor-pointer" title="Valores retidos de agendamentos futuros. Liberados automaticamente após a conclusão do serviço.">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
            </div>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              {formatCurrency(escrow)}
            </span>
            <p className="text-[11px] text-slate-400 pt-0.5">
              Liberado após concluir atendimentos
            </p>
          </div>
        </Card>

        {/* Card 3: Free Weekly Withdrawal */}
        <Card className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Saque Semanal
            </span>
            <Badge variant={hasSubaccount ? 'teal' : 'neutral'} size="sm">Taxa R$ 0</Badge>
          </div>

          <div>
            <span className="text-sm font-extrabold text-white block">
              Toda Segunda às 06:00
            </span>
            <p className="text-[11px] text-slate-400 pt-0.5">
              Automático e gratuito (Mínimo R$ 100,00)
            </p>
          </div>
        </Card>

        {/* Card 4: Monthly Net Revenue */}
        <Card className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Receita do Mês
            </span>
            <span className="text-[11px] font-semibold text-emerald-400">
              {occupancyRate > 0 ? `${occupancyRate}% ocupação` : 'Ativação pendente'}
            </span>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {formatCurrency(totalRevenue)}
            </span>
            <p className="text-[11px] text-slate-400 pt-0.5">
              {completedCount} cortes concluídos
            </p>
          </div>
        </Card>
      </div>

      {/* Prejuízo Evitado com SinalizeGO Banner / Card */}
      {hasSubaccount && (
        <Card className="p-6 bg-gradient-to-r from-emerald-950/40 via-[#0F172A] to-[#0F172A] border border-emerald-500/30 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">
                  Prejuízo Evitado com SinalizeGO
                </h3>
                <Badge variant="teal" size="sm">GARANTIA DE HORÁRIOS</Badge>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Valores e tempo de cadeira 100% resguardados pelo sinal antecipado. Quando o cliente falta ou cancela em cima da hora, você não fica no prejuízo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="p-3.5 rounded-2xl bg-[#0B1120] border border-slate-800 min-w-[130px]">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Valor Total Salvo
                </span>
                <span className="text-xl font-black text-emerald-400">
                  {formatCurrency(protectedLossData.totalSavedAmount)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B1120] border border-slate-800 min-w-[130px]">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Cadeira Paga
                </span>
                <span className="text-xl font-black text-white">
                  {protectedLossData.totalProtectedHours > 0
                    ? `${protectedLossData.totalProtectedHours}h`
                    : `${protectedLossData.totalProtectedMinutes}m`}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-11 font-bold text-xs"
                onClick={() => setIsProtectedLossModalOpen(true)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Ver Auditoria ({protectedLossData.totalOccurrences})
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Today's Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>Fila de Atendimento de Hoje</span>
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie a fila em tempo real, confirme a conclusão dos serviços ou registre faltas após a tolerância de 15 minutos.
            </p>
          </div>

          <Link to="/painel/agenda">
            <Button variant="ghost" size="sm" rightIcon={<Calendar className="w-3.5 h-3.5" />}>
              Ver Agenda Completa
            </Button>
          </Link>
        </div>

        {todayAppointments && todayAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayAppointments.map((app) => {
              const apptDate = new Date(app.appointmentDate);
              const time = apptDate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              });
              const now = Date.now();
              const apptTime = apptDate.getTime();
              const canComplete = now >= apptTime;
              const canNoShow = now >= apptTime + 15 * 60 * 1000;
              const minutesUntilNoShow = Math.max(
                0,
                Math.ceil((apptTime + 15 * 60 * 1000 - now) / (1000 * 60))
              );
              const isCompleting = completingId === app.id;
              const isNoShowing = noShowMutation.isPending && noShowTarget?.id === app.id;
              const isNoShowStatus = app.status === 'NO_SHOW';
              const isCompletedStatus = app.status === 'COMPLETED';

              return (
                <Card
                  key={app.id}
                  className="p-5 bg-[#0F172A] border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 font-mono font-bold text-xs">
                          {time}
                        </span>
                        <h3 className="text-base font-bold text-white">
                          {app.clientName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Scissors className="w-3.5 h-3.5 text-teal-400" />
                          {app.serviceName}
                        </span>
                        <span>•</span>
                        <span>{app.durationMinutes} min</span>
                      </div>
                    </div>

                    {app.clientPhone && (
                      <a
                        href={`https://wa.me/55${app.clientPhone.replace(/\D/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#1E293B] hover:bg-[#1E293B]/80 text-emerald-400 border border-slate-700/80 transition-colors"
                        title="Enviar mensagem no WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Financial Settlement Badges */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#0B1120] border border-slate-800 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                        Sinal Pix Pago
                      </span>
                      <span className="font-bold text-teal-400">
                        {formatCurrency(app.downPaymentAmount)}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                        Cobrar no Balcão
                      </span>
                      <span className="font-black text-amber-300 text-sm">
                        {formatCurrency(app.amountToPayInSalon)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons & Temporal Locks */}
                  {isCompletedStatus ? (
                    <div className="w-full p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Atendimento Concluído</span>
                    </div>
                  ) : isNoShowStatus ? (
                    <div className="w-full p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <UserX className="w-4 h-4" />
                      <span>Falta Registrada (Sinal Retido)</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <Button
                        size="sm"
                        className="h-10 font-bold text-xs"
                        isLoading={isCompleting}
                        disabled={!canComplete || isCompleting || isNoShowing}
                        onClick={() => completeMutation.mutate(app.id)}
                        leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                        title={
                          !canComplete
                            ? `Disponível a partir das ${time}`
                            : 'Concluir atendimento e liberar valor'
                        }
                      >
                        {canComplete ? 'Concluir' : `Aguardando ${time}`}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 font-bold text-xs text-amber-300 hover:text-amber-200 border-amber-500/30 hover:bg-amber-500/10"
                        disabled={!canNoShow || isCompleting || isNoShowing}
                        onClick={() => setNoShowTarget(app)}
                        leftIcon={<UserX className="w-4 h-4 text-amber-400" />}
                        title={
                          !canNoShow
                            ? `Tolerância de 15 min até ${new Date(apptTime + 15 * 60 * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Registrar falta do cliente e liberar o sinal retido'
                        }
                      >
                        {canNoShow ? 'Cliente Faltou' : `Tolerância (${minutesUntilNoShow}m)`}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0F172A] border border-slate-800 rounded-2xl space-y-2">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">Sem agendamentos para hoje</h3>
            <p className="text-xs text-slate-400">
              {hasSubaccount
                ? 'Compartilhe o link da sua vitrine pública para receber novos agendamentos online.'
                : 'Ative sua subconta Asaas para desbloquear a agenda e receber reservas online.'}
            </p>
          </div>
        )}
      </div>

      {/* Security & Escrow Trust Footer Banner */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
        <span>
          O sinal Pix recebido fica protegido em garantia até você concluir o atendimento ou registrar a ausência do cliente após a tolerância de 15 minutos, garantindo total segurança contra prejuízos de agenda vazia.
        </span>
      </div>

      {/* Modal de Confirmação de No-Show */}
      <Modal
        isOpen={!!noShowTarget}
        onClose={() => setNoShowTarget(null)}
        title="Confirmar Ausência do Cliente"
        description="Esta ação libera o sinal de reserva diretamente para a sua conta."
        size="sm"
      >
        {noShowTarget && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente:</span>
                <strong className="text-white">{noShowTarget.clientName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Serviço:</span>
                <span className="text-slate-200 font-medium">{noShowTarget.serviceName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-teal-400 font-bold">Sinal a ser transferido:</span>
                <strong className="text-teal-400 text-sm">
                  {formatCurrency(noShowTarget.downPaymentAmount)}
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              O cliente ultrapassou a tolerância máxima de 15 minutos. O sinal pago antecipadamente será liberado integralmente para o seu saldo como compensação de agenda vazia.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNoShowTarget(null)}
                disabled={noShowMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 font-bold"
                isLoading={noShowMutation.isPending}
                onClick={() => noShowMutation.mutate(noShowTarget.id)}
              >
                Confirmar Falta & Liberar Sinal
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Protected Loss Audit Modal */}
      <ProtectedLossModal
        isOpen={isProtectedLossModalOpen}
        onClose={() => setIsProtectedLossModalOpen(false)}
        summary={protectedLossData}
        items={protectedLossData.items}
      />

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={available}
        nextFreeDate={nextFreeDate}
      />

      {/* Subaccount Activation Modal */}
      <FinancialProfileModal
        isOpen={isFinancialModalOpen}
        onClose={() => setIsFinancialModalOpen(false)}
        defaultName={company?.businessName}
        defaultPhone={company?.whatsapp}
      />
    </div>
  );
};
