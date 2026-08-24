import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from '@/services/appointments.service';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import {
  Calendar as CalendarIcon,
  Clock,
  Scissors,
  Phone,
  CheckCircle2,
  Check
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { AppointmentStatus } from '@/types/appointment.types';

export const OwnerCalendarPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [completingId, setCompletingId] = useState<string | null>(null);

  // 1. Fetch Company Appointments for selected date
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['company-appointments', selectedDate],
    queryFn: () => appointmentsService.getCompanyAppointments({ date: selectedDate })
  });

  // 2. Complete Mutation
  const completeMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentsService.completeAppointment(appointmentId),
    onMutate: (id) => setCompletingId(id),
    onSuccess: () => {
      toast.success('Atendimento marcado como concluído! Saldo liberado.');
      queryClient.invalidateQueries({ queryKey: ['company-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['company-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
    },
    onError: () => {
      toast.error('Não foi possível concluir o atendimento.');
    },
    onSettled: () => setCompletingId(null)
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
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0F172A] border border-slate-800 self-start sm:self-auto">
          {[
            { key: 'ALL', label: 'Todos' },
            { key: 'CONFIRMED', label: 'Confirmados' },
            { key: 'COMPLETED', label: 'Concluídos' }
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
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
            const time = new Date(app.appointmentDate).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            });
            const remaining = Math.max(0, (app.servicePrice || 0) - (app.downPaymentAmount || 0));
            const isCompleted = app.status === 'COMPLETED';
            const isCompleting = completingId === app.id;

            return (
              <Card
                key={app.id}
                className={cn(
                  'p-5 bg-[#0F172A] border-slate-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4',
                  isCompleted && 'opacity-75 bg-[#0F172A]/60'
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
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline pt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{app.client.phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Financial Settlement & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-1 text-xs text-left md:text-right">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Sinal Pix</span>
                      <span className="font-bold text-teal-400">
                        {formatCurrency(app.downPaymentAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-amber-400 font-bold block uppercase">
                        Cobrar no Balcão
                      </span>
                      <span className="font-black text-amber-300 text-sm">
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto">
                    {app.status === 'CONFIRMED' && (
                      <Button
                        size="sm"
                        className="w-full sm:w-auto h-10 font-bold text-xs"
                        isLoading={isCompleting}
                        disabled={isCompleting}
                        onClick={() => completeMutation.mutate(app.id)}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Concluir
                      </Button>
                    )}

                    {app.status === 'COMPLETED' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                        <Check className="w-4 h-4" />
                        <span>Concluído</span>
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
    </div>
  );
};
