import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/config/api.config';
import { appointmentsService } from '@/services/appointments.service';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Scissors,
  ShieldCheck,
  Zap,
  Flame,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { CompanyStorefront, CompanyService } from '@/types/company.types';

export const CheckoutPage: React.FC = () => {
  const { companyId, serviceId } = useParams<{ companyId: string; serviceId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch company data to extract service details and working hours
  const { data: company, isLoading: isLoadingCompany } = useQuery<CompanyStorefront>({
    queryKey: ['company-checkout', companyId],
    queryFn: async () => {
      const response = await api.get<CompanyStorefront>(`/company/${companyId}`);
      return response.data;
    },
    enabled: !!companyId,
    retry: 1
  });

  // Extract selected service from company catalog
  const selectedService: CompanyService | undefined = useMemo(() => {
    if (!company?.serviceGroups) return undefined;
    for (const group of company.serviceGroups) {
      const found = group.services?.find((s) => s.id === serviceId);
      if (found) return found;
    }
    return undefined;
  }, [company, serviceId]);

  // Fetch available slots from backend
  const {
    data: slotsData,
    isLoading: isLoadingSlots,
    isFetching: isFetchingSlots
  } = useQuery({
    queryKey: ['available-slots', companyId, serviceId, selectedDate],
    queryFn: () => appointmentsService.getAvailableSlots(companyId!, serviceId!, selectedDate),
    enabled: !!companyId && !!serviceId && !!selectedDate,
    staleTime: 1000 * 30 // 30 seconds
  });

  // Calculate next 14 calendar days
  const nextDays = useMemo(() => {
    const days: Array<{
      dateStr: string;
      dayNum: number;
      dayLabel: string;
      dayOfWeek: number;
      isClosed: boolean;
      isPeakDay: boolean;
    }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();

      const wh = company?.workingHours?.find((item) => item.dayOfWeek === dayOfWeek);
      const isClosed = wh ? wh.isClosed : false;

      // Friday (5) and Saturday (6) or Thursday (4) are typically high demand peak days
      const isPeakDay = !isClosed && (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 4);

      const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      days.push({
        dateStr,
        dayNum: d.getDate(),
        dayLabel: dayLabel.toUpperCase(),
        dayOfWeek,
        isClosed,
        isPeakDay
      });
    }
    return days;
  }, [company]);

  // Direct calculation of deposit based on service configuration and Safety Gate
  const totalPrice = selectedService?.totalPrice || 0;
  const isMicroTransaction = totalPrice < 15.0;
  const configuredDepositPercent =
    selectedService?.downPaymentPercent || selectedService?.depositPercentage || 50;
  const effectiveDepositPercent = isMicroTransaction ? 100 : configuredDepositPercent;
  const downPaymentAmount = (totalPrice * effectiveDepositPercent) / 100;
  const remainingAtVenue = Math.max(0, totalPrice - downPaymentAmount);

  // Helper to identify peak hours
  const isPeakHour = (slot: string) => {
    const hour = parseInt(slot.split(':')[0], 10);
    return (hour >= 10 && hour <= 12) || (hour >= 16 && hour <= 19);
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot) {
      toast.error('Por favor, selecione um horário disponível para continuar.');
      return;
    }

    if (!isAuthenticated) {
      toast.info('Faça login ou crie sua conta para concluir a reserva.');
      navigate('/login', {
        state: { from: { pathname: `/reserva/${companyId}/${serviceId}` } }
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Compose full ISO date time
      const [hours, minutes] = selectedSlot.split(':');
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      const payload = {
        companyId: companyId!,
        serviceId: serviceId!,
        appointmentDate: appointmentDateTime.toISOString(),
        downPaymentPercent: effectiveDepositPercent,
        depositPercentage: effectiveDepositPercent
      };

      const appointment = await appointmentsService.createAppointment(payload);
      toast.success('Horário reservado com sucesso! Conclua o Pix para garantir sua cadeira.');
      navigate(`/pagamento/pix/${appointment.id}`);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Não foi possível realizar o agendamento. O horário pode ter sido preenchido por outro cliente.';
      const formattedMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(formattedMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCompany) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1120] rounded-lg"
          aria-label="Voltar para a vitrine"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Vitrine</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Reserva de Cadeira Garantida</span>
        </div>
      </div>

      {/* Selected Service Card */}
      <Card className="p-6 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-teal-400" />
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                {company?.businessName || 'Estabelecimento'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#F8FAFC]">
              {selectedService?.name || 'Serviço'}
            </h1>
            {selectedService?.description && (
              <p className="text-xs text-[#94A3B8]">{selectedService.description}</p>
            )}
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-2xl font-black text-teal-400">
              {formatCurrency(totalPrice)}
            </span>
            <div className="flex items-center sm:justify-end gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{selectedService?.durationMinutes || 30} minutos</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Step 1: Date Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-teal-400" />
            <span>1. Escolha o Dia</span>
          </h2>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Sextas e Sábados são mais concorridos
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          {nextDays.map((day) => {
            const isSelected = selectedDate === day.dateStr;
            return (
              <button
                key={day.dateStr}
                disabled={day.isClosed}
                onClick={() => {
                  setSelectedDate(day.dateStr);
                  setSelectedSlot(null);
                }}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[68px] h-[82px] rounded-2xl border transition-all duration-200 cursor-pointer select-none relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1120]',
                  isSelected
                    ? 'bg-[#14B8A6] border-[#14B8A6] text-white shadow-lg shadow-teal-500/25 scale-105'
                    : day.isClosed
                    ? 'bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-[#0F172A] border-slate-800 text-slate-300 hover:border-teal-500/50 hover:bg-[#1E293B]'
                )}
                aria-label={`Selecionar dia ${day.dayNum}, ${day.dayLabel}${day.isClosed ? ' (Fechado)' : ''}${day.isPeakDay ? ' (Disputado)' : ''}`}
                aria-pressed={isSelected}
              >
                {day.isPeakDay && !day.isClosed && (
                  <span
                    className={cn(
                      'absolute -top-1.5 px-1.5 py-0.2 rounded-full text-[8px] font-bold tracking-tight uppercase flex items-center gap-0.5 shadow-sm',
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    )}
                  >
                    <Flame className="w-2.5 h-2.5" />
                    Pico
                  </span>
                )}

                <span className="text-[10px] font-bold mt-1">{day.dayLabel}</span>
                <span className="text-base font-extrabold">{day.dayNum}</span>
                {day.isClosed ? (
                  <span className="text-[9px] text-red-400">Fechado</span>
                ) : day.isPeakDay ? (
                  <span
                    className={cn(
                      'text-[9px] font-semibold',
                      isSelected ? 'text-teal-100' : 'text-amber-400/90'
                    )}
                  >
                    Disputado
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Available Time Slots */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>2. Escolha o Horário</span>
          </h2>
          {isFetchingSlots ? (
            <span className="text-xs text-teal-400 animate-pulse">Atualizando vagas...</span>
          ) : slotsData?.slots && slotsData.slots.length > 0 ? (
            <span className="text-xs text-slate-400">
              {slotsData.slots.length} horário{slotsData.slots.length > 1 ? 's' : ''} disponível{slotsData.slots.length > 1 ? 's' : ''}
            </span>
          ) : null}
        </div>

        {/* Dynamic Urgency / Scarcity Banner */}
        {slotsData?.slots && slotsData.slots.length > 0 && slotsData.slots.length <= 4 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold">
                Últimos horários disponíveis para esta data! Garanta sua cadeira antes que esgote.
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-mono shrink-0">
              {slotsData.slots.length} restantes
            </span>
          </div>
        )}

        {isLoadingSlots ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : slotsData?.slots && slotsData.slots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {slotsData.slots.map((slot, index) => {
              const isSelected = selectedSlot === slot;
              const peak = isPeakHour(slot);
              const isLast = index === slotsData.slots.length - 1 && slotsData.slots.length <= 4;
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    'h-14 rounded-xl font-bold text-xs border transition-all duration-200 flex flex-col items-center justify-center cursor-pointer select-none relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1120]',
                    isSelected
                      ? 'bg-[#14B8A6] border-[#14B8A6] text-white shadow-md shadow-teal-500/20 scale-105'
                      : 'bg-[#0F172A] border-slate-800 text-slate-300 hover:border-teal-500/50 hover:bg-[#1E293B]'
                  )}
                  aria-label={`Selecionar horário ${slot}${isLast ? ' (Último)' : ''}${peak ? ' (Horário de pico)' : ''}`}
                  aria-pressed={isSelected}
                >
                  <span className="text-sm font-extrabold">{slot}</span>
                  {isLast ? (
                    <span
                      className={cn(
                        'text-[8px] font-bold uppercase tracking-tight',
                        isSelected ? 'text-teal-100' : 'text-red-400'
                      )}
                    >
                      Último
                    </span>
                  ) : peak ? (
                    <span
                      className={cn(
                        'text-[8px] font-bold uppercase tracking-tight',
                        isSelected ? 'text-teal-100' : 'text-amber-400'
                      )}
                    >
                      Pico
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-[#0F172A] border border-slate-800 rounded-2xl space-y-1">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-300">
              Nenhum horário livre nesta data
            </p>
            <p className="text-[11px] text-slate-500">
              Selecione outro dia no calendário acima para encontrar vagas disponíveis.
            </p>
          </div>
        )}
      </div>

      {/* Step 3: Reserva de Horário Garantida (Resumo Transparente & Direto) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>3. Reserva de Horário Garantida</span>
          </h2>
          <Badge variant="teal" size="sm">
            {isMicroTransaction ? 'Sinal 100%' : `Sinal ${effectiveDepositPercent}%`}
          </Badge>
        </div>

        {isMicroTransaction && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Para serviços abaixo de R$ 15,00, o pagamento é integral (100%) conforme a política de segurança financeira.
            </span>
          </div>
        )}

        {/* Direct Transparent Summary Card */}
        <Card className="p-5 bg-[#0F172A] border-slate-800 space-y-4 shadow-xl">
          <div className="space-y-2.5 text-xs divide-y divide-slate-800/80">
            {/* Valor do Serviço */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400 font-medium">Valor do Serviço</span>
              <span className="font-bold text-white text-sm">{formatCurrency(totalPrice)}</span>
            </div>

            {/* Sinal de Reserva (Pix) */}
            <div className="flex items-center justify-between pt-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-300">
                  Sinal de Reserva (Pix)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold">
                  {effectiveDepositPercent}%
                </span>
              </div>
              <span className="font-black text-teal-400 text-base">
                {formatCurrency(downPaymentAmount)}
              </span>
            </div>

            {/* Saldo Restante no Estabelecimento */}
            <div className="flex items-center justify-between pt-2.5">
              <div className="space-y-0.5">
                <span className="text-slate-400 font-medium block">Saldo Restante no Estabelecimento</span>
                <span className="text-[10px] text-slate-500 block">Pago diretamente após o atendimento</span>
              </div>
              <span className="font-bold text-slate-200 text-sm">{formatCurrency(remainingAtVenue)}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-400 leading-relaxed bg-teal-500/5 p-3.5 rounded-xl border border-teal-500/10 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-teal-300 font-semibold">Garantia de Horário:</strong> Sua taxa de confirmação garante cadeira reservada e atendimento pontual sem filas. Caso precise cancelar com mais de 24h de antecedência, o valor é estornado integralmente.
            </span>
          </div>
        </Card>
      </div>

      {/* CTA Action Button */}
      <div className="space-y-2">
        <Button
          onClick={handleBookingSubmit}
          disabled={!selectedSlot || isSubmitting}
          isLoading={isSubmitting}
          className="w-full h-14 text-base font-bold shadow-xl shadow-teal-500/20"
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          {selectedSlot
            ? `Garantir Cadeira às ${selectedSlot} (${formatCurrency(downPaymentAmount)} via Pix)`
            : 'Selecione um Horário para Continuar'}
        </Button>

        {!isAuthenticated && (
          <p className="text-center text-[11px] text-slate-500">
            Você será direcionado para login rápido antes de emitir o Pix da reserva.
          </p>
        )}
      </div>
    </div>
  );
};
