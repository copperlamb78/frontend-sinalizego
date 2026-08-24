import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/company.service';
import { appointmentsService } from '@/services/appointments.service';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import { WithdrawalModal } from '@/components/dashboard/WithdrawalModal';
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
  HelpCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export const OwnerDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // 1. Fetch Dashboard Metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['company-metrics'],
    queryFn: () => companyService.getDashboardMetrics(),
    refetchInterval: 15000 // Refetch every 15s
  });

  // 2. Fetch Balance and Escrow
  const { data: balance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['company-balance'],
    queryFn: () => companyService.getBalance(),
    refetchInterval: 15000
  });

  // 3. Fetch Company Profile (for slug and info)
  const { data: company } = useQuery({
    queryKey: ['owner-company-profile'],
    queryFn: () => companyService.getCompanyByUserId()
  });

  // 4. Complete Appointment Mutation
  const completeMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentsService.completeAppointment(appointmentId),
    onMutate: (id) => setCompletingId(id),
    onSuccess: () => {
      toast.success('Atendimento concluído! O valor retido em custódia foi liberado.');
      queryClient.invalidateQueries({ queryKey: ['company-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
      queryClient.invalidateQueries({ queryKey: ['company-appointments'] });
    },
    onError: () => {
      toast.error('Não foi possível concluir o atendimento.');
    },
    onSettled: () => setCompletingId(null)
  });

  if (isLoadingMetrics || isLoadingBalance) {
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

  const available = balance?.availableBalance ?? metrics?.revenue.availableBalance ?? 0;
  const escrow = balance?.escrowLockedBalance ?? metrics?.revenue.escrowLockedBalance ?? 0;
  const nextFreeDate = balance?.nextFreeWithdrawalDate;
  const storefrontSlug = company?.slug || 'minha-empresa';

  return (
    <div className="space-y-8">
      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">
              Painel de Gestão
            </h1>
            <Badge variant="teal" size="sm">
              Ao Vivo
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Acompanhe o faturamento, liquidação de custódia e a fila de clientes do dia.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={`/empresa/${storefrontSlug}`} target="_blank">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Ver Minha Vitrine
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setIsWithdrawModalOpen(true)}
            leftIcon={<Wallet className="w-4 h-4" />}
          >
            Solicitar Saque
          </Button>
        </div>
      </div>

      {/* Financial & Escrow Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Balance */}
        <Card className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-teal-400" />
              Saldo Disponível
            </span>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Sacar</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-black text-teal-400">
              {formatCurrency(available)}
            </span>
            <p className="text-[11px] text-slate-400 pt-0.5">
              Liberado para transferência Pix
            </p>
          </div>
        </Card>

        {/* Card 2: Escrow Locked Balance */}
        <Card className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              Saldo em Custódia
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
            <Badge variant="teal" size="sm">Taxa R$ 0</Badge>
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
              {metrics?.volume.occupancyRate || 92}% ocupação
            </span>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {formatCurrency(metrics?.revenue.totalRevenue || 0)}
            </span>
            <p className="text-[11px] text-slate-400 pt-0.5">
              {metrics?.volume.completed || 0} cortes concluídos
            </p>
          </div>
        </Card>
      </div>

      {/* Today's Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>Fila de Atendimento de Hoje</span>
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie a fila em tempo real e confirme a conclusão dos serviços para liberar os valores.
            </p>
          </div>

          <Link to="/painel/agenda">
            <Button variant="ghost" size="sm" rightIcon={<Calendar className="w-3.5 h-3.5" />}>
              Ver Agenda Completa
            </Button>
          </Link>
        </div>

        {metrics?.todayAppointments && metrics.todayAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.todayAppointments.map((app) => {
              const time = new Date(app.appointmentDate).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              });
              const isCompleting = completingId === app.id;

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
                        target="_blank"
                        rel="noreferrer"
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

                  {/* Action Button */}
                  <Button
                    size="sm"
                    className="w-full h-10 font-bold text-xs"
                    isLoading={isCompleting}
                    disabled={isCompleting}
                    onClick={() => completeMutation.mutate(app.id)}
                    leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                  >
                    Concluir Atendimento (Liberar R$)
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0F172A] border border-slate-800 rounded-2xl space-y-2">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">Sem agendamentos para hoje</h3>
            <p className="text-xs text-slate-400">
              Compartilhe o link da sua vitrine pública para receber novos agendamentos online.
            </p>
          </div>
        )}
      </div>

      {/* Security & Escrow Trust Footer Banner */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
        <span>
          O sinal Pix recebido fica protegido em custódia até você concluir o serviço ou após 24h sem contestação, garantindo total segurança contra estornos indevidos.
        </span>
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={available}
        nextFreeDate={nextFreeDate}
      />
    </div>
  );
};
