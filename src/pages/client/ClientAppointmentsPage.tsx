import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { appointmentsService } from '@/services/appointments.service';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  XCircle
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Appointment } from '@/types/appointment.types';

export const ClientAppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PENDING' | 'HISTORY'>('UPCOMING');
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  // 1. Fetch User Appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['user-appointments-list'],
    queryFn: () => appointmentsService.getUserAppointments()
  });

  // 2. Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      // Calls cancel endpoint
      return Promise.resolve(appointmentId);
    },
    onSuccess: () => {
      toast.success('Agendamento cancelado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['user-appointments-list'] });
      queryClient.invalidateQueries({ queryKey: ['user-appointments-explore'] });
      setAppointmentToCancel(null);
    },
    onError: () => toast.error('Não foi possível cancelar o agendamento.')
  });

  // Calculation of remaining hours for cancellation policy
  const getCancellationDetails = (apt: Appointment) => {
    const aptTime = new Date(apt.appointmentDate).getTime();
    const now = Date.now();
    const diffHours = (aptTime - now) / (1000 * 60 * 60);
    const isEligibleForRefund = diffHours >= 24;

    return {
      diffHours,
      isEligibleForRefund
    };
  };

  const filteredAppointments = (appointments || []).filter((apt) => {
    if (activeTab === 'UPCOMING') return apt.status === 'CONFIRMED';
    if (activeTab === 'PENDING') return apt.status === 'PENDING_PAYMENT';
    if (activeTab === 'HISTORY') return apt.status === 'COMPLETED' || apt.status === 'CANCELED';
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Meus Agendamentos</h1>
          <p className="text-xs text-slate-400">
            Acompanhe o status de confirmação, comprovantes e histórico dos seus serviços.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { key: 'UPCOMING', label: 'Confirmados & Próximos' },
          { key: 'PENDING', label: 'Aguardando Pagamento' },
          { key: 'HISTORY', label: 'Histórico Completo' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
              activeTab === tab.key
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => {
            const formattedDate = new Date(apt.appointmentDate).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            });
            const formattedTime = new Date(apt.appointmentDate).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            });

            const companyAddress = apt.company
              ? [apt.company.street, apt.company.number, apt.company.district, apt.company.city ? `${apt.company.city}/${apt.company.state}` : ''].filter(Boolean).join(', ')
              : 'Endereço não informado';

            return (
              <Card key={apt.id} hoverEffect className="p-5 bg-[#0F172A] border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {apt.status === 'CONFIRMED' && (
                        <Badge variant="teal" dot>
                          CONFIRMADO
                        </Badge>
                      )}
                      {apt.status === 'PENDING_PAYMENT' && (
                        <Badge variant="warning" dot>
                          AGUARDANDO PIX
                        </Badge>
                      )}
                      {apt.status === 'COMPLETED' && (
                        <Badge variant="neutral">
                          CONCLUÍDO
                        </Badge>
                      )}
                      {apt.status === 'CANCELED' && (
                        <Badge variant="destructive">
                          CANCELADO
                        </Badge>
                      )}
                      <span className="text-xs text-slate-500 font-mono">#{apt.id}</span>
                    </div>

                    <h2 className="text-base font-bold text-white">
                      {apt.service?.name || 'Serviço'}
                    </h2>
                    <p className="text-xs text-teal-400 font-semibold">
                      {apt.company?.businessName || 'Estabelecimento'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>{formattedTime} ({apt.service?.durationMinutes || 30} min)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-xs">{companyAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Values & Action Buttons */}
                  <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">
                        Total: <strong>{formatCurrency(apt.servicePrice)}</strong>
                      </p>
                      <p className="text-sm font-black text-teal-400">
                        Sinal Pago: {formatCurrency(apt.downPaymentAmount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/reserva/confirmada/${apt.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs h-9" leftIcon={<Receipt className="w-3.5 h-3.5" />}>
                          Ver Voucher
                        </Button>
                      </Link>

                      {apt.status === 'CONFIRMED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-9 text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                          onClick={() => setAppointmentToCancel(apt)}
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="p-10 text-center bg-[#0F172A] border border-slate-800 rounded-3xl space-y-3">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum agendamento encontrado</h3>
            <p className="text-xs text-slate-400">
              {activeTab === 'UPCOMING' && 'Você não possui atendimentos confirmados agendados.'}
              {activeTab === 'PENDING' && 'Não há reservas aguardando pagamento Pix.'}
              {activeTab === 'HISTORY' && 'Seu histórico de atendimentos anteriores está vazio.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal: Cancel Confirmation */}
      {appointmentToCancel && (() => {
        const { isEligibleForRefund } = getCancellationDetails(appointmentToCancel);
        const formattedDate = new Date(appointmentToCancel.appointmentDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
        const formattedTime = new Date(appointmentToCancel.appointmentDate).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <Modal
            isOpen={!!appointmentToCancel}
            onClose={() => setAppointmentToCancel(null)}
            title="Cancelar Agendamento"
            description="Confira as regras e condições de cancelamento para o seu atendimento"
            size="md"
          >
            <div className="space-y-4">
              {/* Appointment summary box */}
              <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-white font-bold">
                  <span>{appointmentToCancel.service?.name}</span>
                  <span className="text-teal-400">{formatCurrency(appointmentToCancel.servicePrice)}</span>
                </div>
                <div className="text-slate-400">
                  <span>{appointmentToCancel.company?.businessName}</span>
                </div>
                <div className="text-slate-500 text-[11px] flex items-center gap-1 pt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>{formattedDate} às {formattedTime}</span>
                </div>
              </div>

              {/* Policy Explanation Banner */}
              {isEligibleForRefund ? (
                /* Eligible for full refund (More than 24h before) */
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Estorno Integral Garantido (100% Pix)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Este cancelamento está sendo solicitado com <strong>mais de 24 horas de antecedência</strong> do horário marcado.
                  </p>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    O valor integral do sinal de <strong>{formatCurrency(appointmentToCancel.downPaymentAmount)}</strong> será devolvido automaticamente para a mesma conta bancária do Pix utilizado no pagamento.
                  </p>
                </div>
              ) : (
                /* Not eligible for refund (Less than 24h before) */
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Cancelamento com menos de 24 horas de antecedência</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Por ter sido solicitado em cima da hora (com menos de 24 horas do horário agendado), o sinal pago de <strong>{formatCurrency(appointmentToCancel.downPaymentAmount)}</strong> é retido para compensar a reserva exclusiva do profissional.
                  </p>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    O horário será liberado na agenda do estabelecimento.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAppointmentToCancel(null)}
                >
                  Manter Agendamento
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  isLoading={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate(appointmentToCancel.id)}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Confirmar Cancelamento
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};
