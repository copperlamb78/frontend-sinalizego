import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from '@/services/appointments.service';
import { companyService } from '@/services/company.service';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import {
  Calendar as CalendarIcon,
  Clock,
  Scissors,
  Phone,
  CheckCircle2,
  Check,
  Lock,
  UserX
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Appointment, AppointmentStatus } from '@/types/appointment.types';

export const OwnerCalendarPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [noShowTarget, setNoShowTarget] = useState<Appointment | null>(null);

  // 1. Fetch Company Profile (for subaccount check)
  const { data: company } = useQuery({
    queryKey: ['owner-company-profile'],
    queryFn: () => companyService.getCompanyByUserId(),
    staleTime: 1000 * 60 * 5
  });

  const hasSubaccount = Boolean(
    company?.walletId ||
      company?.financialProfile?.walletId ||
      company?.financialProfile?.status === 'APPROVED' ||
      company?.financialProfile?.status === 'ACTIVE'
  );

  // 2. Fetch Company Appointments for selected date
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['company-appointments', selectedDate],
    queryFn: () => appointmentsService.getCompanyAppointments({ date: selectedDate })
  });

  // 3. Complete Mutation
  const completeMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentsService.completeAppointment(appointmentId),
    onMutate: (id) => setCompletingId(id),
    onSuccess: () => {
      toast.success('Atendimento marcado como concluído! Saldo liberado.');
      queryClient.invalidateQueries({ queryKey: ['company-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['company-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Não foi possível concluir o atendimento antes do horário agendado.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
    onSettled: () => setCompletingId(null)
  });

  // 4. No-Show Mutation
  const noShowMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentsService.registerNoShow(appointmentId),
    onSuccess: () => {
      toast.success('Falta (No-Show) registrada com sucesso! Sinal liberado para o seu saldo.');
      queryClient.invalidateQueries({ queryKey: ['company-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['company-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
      setNoShowTarget(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'A falta só pode ser registrada após 15 minutos de tolerância do horário agendado.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  });

  // Days Navigation Strip (Previous 3 days, Today, Next 7 days)
  const daysStrip = useMemo(() => {
    const list = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    for (let i = -2; i <= 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
      list.push({
        dateStr,
        dayNum: d.getDate(),
        dayName,
        isToday: i === 0
      });
    }
    return list;
  }, []);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    if (statusFilter === 'ALL') return appointments;
    return appointments.filter((app) => app.status === statusFilter);
  }, [appointments, statusFilter]);

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="teal" size="sm">Confirmado</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" size="sm">Concluído</Badge>;
      case 'NO_SHOW':
        return <Badge variant="warning" size="sm">Falta (No-Show)</Badge>;
      case 'PENDING_PAYMENT':
        return <Badge variant="warning" size="sm">Aguardando Pix</Badge>;
      case 'CANCELED':
        return <Badge variant="destructive" size="sm">Cancelado</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-teal-400" />
            <span>Agenda Operacional</span>
          </h1>
          <p className="text-xs text-slate-400">
            Visualize os atendimentos agendados, confirme a presença e receba o saldo restante no balcão.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0F172A] border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { key: 'ALL', label: 'Todos' },
            { key: 'CONFIRMED', label: 'Confirmados' },
            { key: 'COMPLETED', label: 'Concluídos' },
            { key: 'NO_SHOW', label: 'Faltas (No-Show)' },
            { key: 'CANCELED', label: 'Cancelados' }
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap',
                statusFilter === f.key
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warning Gate: Subconta Pendente */}
      {!hasSubaccount && (
        <Card className="p-4 bg-gradient-to-r from-amber-500/10 via-[#1E293B] to-[#0F172A] border-amber-500/30 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">
              Sua agenda online só receberá novos agendamentos após a <strong>ativação da sua subconta Asaas</strong> no menu Financeiro.
            </span>
          </div>
          <Badge variant="warning" size="sm">Aguardando Ativação</Badge>
        </Card>
      )}

      {/* Days Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {daysStrip.map((item) => {
          const isSelected = selectedDate === item.dateStr;
          return (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDate(item.dateStr)}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] h-[72px] rounded-2xl border transition-all duration-200 cursor-pointer select-none',
                isSelected
                  ? 'bg-[#14B8A6] border-[#14B8A6] text-white shadow-lg shadow-teal-500/25 scale-105'
                  : 'bg-[#0F172A] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#1E293B]'
              )}
            >
              <span className="text-[10px] font-bold">{item.dayName}</span>
              <span className="text-base font-black">{item.dayNum}</span>
              {item.isToday && (
                <span className={cn('text-[9px] font-bold', isSelected ? 'text-white' : 'text-teal-400')}>
                  Hoje
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Appointments List for Day */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-3">
          {filteredAppointments.map((app) => {
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

            const remaining = Math.max(0, (app.servicePrice || 0) - (app.downPaymentAmount || 0));
            const isCompleted = app.status === 'COMPLETED';
            const isNoShow = app.status === 'NO_SHOW';
            const isCompleting = completingId === app.id;
            const isNoShowing = noShowMutation.isPending && noShowTarget?.id === app.id;

            return (
              <Card
                key={app.id}
                className={cn(
                  'p-5 bg-[#0F172A] border-slate-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4',
                  (isCompleted || isNoShow) && 'opacity-80 bg-[#0F172A]/70'
                )}
              >
                {/* Left: Time & Client Details */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#1E293B] border border-slate-700/80 flex flex-col items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-teal-400 mb-0.5" />
                    <span className="text-sm font-black text-white font-mono">{time}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">
                        {app.client?.name || 'Cliente'}
                      </h3>
                      {getStatusBadge(app.status)}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Scissors className="w-3.5 h-3.5 text-teal-400" />
                        {app.service?.name || 'Serviço'}
                      </span>
                      <span>•</span>
                      <span>{app.service?.durationMinutes || 30} min</span>
                    </div>

                    {app.client?.phone && (
                      <a
                        href={`https://wa.me/55${app.client.phone.replace(/\D/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline pt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{app.client.phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Financial Settlement & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-1 text-xs text-left md:text-right">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                        Sinal Pix
                      </span>
                      <span className="font-bold text-teal-400">
                        {formatCurrency(app.downPaymentAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                        Cobrar no Balcão
                      </span>
                      <span className="font-black text-amber-300 text-sm">
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto">
                    {app.status === 'CONFIRMED' && (
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <Button
                          size="sm"
                          className="h-10 font-bold text-xs"
                          isLoading={isCompleting}
                          disabled={!canComplete || isCompleting || isNoShowing}
                          onClick={() => completeMutation.mutate(app.id)}
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          title={
                            !canComplete
                              ? `Disponível a partir das ${time}`
                              : 'Concluir atendimento e liberar custódia'
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
                              : 'Registrar falta do cliente e liberar sinal'
                          }
                        >
                          {canNoShow ? 'Faltou' : `Tolerância (${minutesUntilNoShow}m)`}
                        </Button>
                      </div>
                    )}

                    {app.status === 'COMPLETED' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                        <Check className="w-4 h-4" />
                        <span>Concluído</span>
                      </div>
                    )}

                    {app.status === 'NO_SHOW' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                        <UserX className="w-4 h-4" />
                        <span>Falta (Sinal Retido)</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0F172A] border border-slate-800 rounded-3xl space-y-2">
          <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">Nenhum atendimento agendado</h3>
          <p className="text-xs text-slate-400">
            Não há agendamentos para a data selecionada ({new Date(selectedDate).toLocaleDateString('pt-BR')}).
          </p>
        </div>
      )}

      {/* Modal de Confirmação de No-Show */}
      <Modal
        isOpen={!!noShowTarget}
        onClose={() => setNoShowTarget(null)}
        title="Confirmar Falta do Cliente (No-Show)"
        description="Esta ação libera o sinal de reserva diretamente para a sua conta."
        size="sm"
      >
        {noShowTarget && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente:</span>
                <strong className="text-white">{noShowTarget.client?.name || 'Cliente'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Serviço:</span>
                <span className="text-slate-200 font-medium">{noShowTarget.service?.name || 'Serviço'}</span>
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
    </div>
  );
};
