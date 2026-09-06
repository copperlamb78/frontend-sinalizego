import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from '@/services/appointments.service';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import {
  ShieldCheck,
  AlertTriangle,
  Calendar,
  XCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { Appointment } from '@/types/appointment.types';

interface CancelAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      return appointmentsService.cancelAppointmentByClient(id);
    },
    onSuccess: () => {
      toast.success('Agendamento cancelado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['user-appointments'] });
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.message ||
        'Não foi possível processar o estorno e cancelamento no momento.';
      toast.error(errorMessage);
    }
  });

  if (!appointment) return null;

  const aptTime = new Date(appointment.appointmentDate).getTime();
  const now = Date.now();
  const diffHours = (aptTime - now) / (1000 * 60 * 60);
  const isMoreThan24Hours = diffHours >= 24;

  const downPayment = appointment.downPaymentAmount || 0;
  const retainedAmount = isMoreThan24Hours ? 0 : downPayment;
  const refundAmount = isMoreThan24Hours ? downPayment : 0;

  const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = new Date(appointment.appointmentDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const address = appointment.company
    ? [appointment.company.street, appointment.company.number, appointment.company.district, appointment.company.city ? `${appointment.company.city}/${appointment.company.state}` : ''].filter(Boolean).join(', ')
    : 'Endereço não informado';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancelar Agendamento"
      description="Confira os detalhes e a política de estorno antes de confirmar"
      size="md"
    >
      <div className="space-y-4">
        {/* Appointment Details Box */}
        <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-white font-bold">
            <span className="text-sm">{appointment.service?.name}</span>
            <span className="text-teal-400 text-sm">{formatCurrency(appointment.servicePrice)}</span>
          </div>

          <p className="text-slate-300 font-semibold">{appointment.company?.businessName}</p>

          <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px] pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-teal-400" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-teal-400" />
              {formattedTime}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{address}</span>
          </p>
        </div>

        {/* Cancellation Scenario Breakdown */}
        {isMoreThan24Hours ? (
          /* Scenario 1: More than 24h */
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Estorno Integral Garantido (100% Pix)</span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              Este cancelamento está sendo solicitado com <strong>mais de 24 horas de antecedência</strong> do horário marcado.
            </p>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              O valor total de <strong>{formatCurrency(downPayment)}</strong> pago no sinal será estornado automaticamente para a mesma conta bancária do Pix de origem.
            </p>
          </div>
        ) : (
          /* Scenario 2: Less than 24h */
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Cancelamento com menos de 24 horas de antecedência</span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              Conforme os <strong>Artigos 417 a 420 do Código Civil</strong> (Arras Confirmatórias) e a política de reservas, para cancelamentos realizados com menos de 24 horas de antecedência, <strong>100% do sinal é retido</strong> para cobrir a vacância da cadeira reservada do profissional.
            </p>

            {/* Financial Balance Breakdown */}
            <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Sinal Pago no Agendamento:</span>
                <span className="font-semibold text-white">{formatCurrency(downPayment)}</span>
              </div>
              <div className="flex items-center justify-between text-amber-400 font-medium">
                <span>Retenção por Vacância de Cadeira:</span>
                <span>- {formatCurrency(retainedAmount)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-bold text-white">
                <span>Devolução via Pix:</span>
                <span className="text-slate-400 font-semibold">
                  {formatCurrency(refundAmount)} (Sem estorno)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              O horário será liberado na agenda do estabelecimento. Não haverá estorno financeiro devido à proximidade do atendimento.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Manter Agendamento
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            isLoading={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate(appointment.id)}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Confirmar Cancelamento
          </Button>
        </div>
      </div>
    </Modal>
  );
};
