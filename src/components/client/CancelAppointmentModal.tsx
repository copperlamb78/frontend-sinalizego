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
  MapPin,
  Ticket
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
      queryClient.invalidateQueries({ queryKey: ['client-credits'] });
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

  // Política em 3 faixas (Regra N6 / Arts. 417 a 420 Código Civil e CDC Art. 51)
  const isRefundScenario = diffHours > 24;
  const isCreditScenario = diffHours >= 2 && diffHours <= 24;
  const isRetainedScenario = diffHours < 2;

  const downPayment = appointment.downPaymentAmount || 0;

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
      description="Confira os detalhes e a política de estorno/crédito antes de confirmar"
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

        {/* Cancellation Scenario Breakdown (3 Faixas) */}
        {isRefundScenario && (
          /* Faixa 1: Mais de 24h -> Estorno Pix Integral do Sinal */
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Estorno Integral Garantido (100% via Pix)</span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              Este cancelamento está sendo solicitado com <strong>mais de 24 horas de antecedência</strong> do horário marcado ({diffHours.toFixed(1)}h restantes).
            </p>

            <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Sinal Pago:</span>
                <span className="font-semibold text-white">{formatCurrency(downPayment)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                <span>Devolução via Pix:</span>
                <span className="text-emerald-300 font-black text-xs">
                  {formatCurrency(downPayment)} (Estorno automático)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              O valor do sinal será devolvido automaticamente para a mesma conta bancária de origem do seu pagamento Pix.
            </p>
          </div>
        )}

        {isCreditScenario && (
          /* Faixa 2: Entre 2h e 24h -> Sinal Vira Crédito com Validade de 90 dias */
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Ticket className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Sinal Convertido em Crédito 🎟️ (Validade 90 dias)</span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              Cancelamento solicitado com antecedência entre <strong>2h e 24h</strong> ({diffHours.toFixed(1)}h restantes). Conforme os <strong>Arts. 417 a 420 do Código Civil</strong> e a política da plataforma, você <strong>não perde o seu dinheiro</strong>!
            </p>

            <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Sinal Pago:</span>
                <span className="font-semibold text-white">{formatCurrency(downPayment)}</span>
              </div>
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span>Crédito na Barbearia:</span>
                <span className="text-amber-300 font-black text-xs">+ {formatCurrency(downPayment)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-slate-400">
                <span>Devolução via Pix:</span>
                <span>R$ 0,00 (Convertido em crédito)</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-200/90 leading-relaxed font-medium">
              ✨ O valor de <strong>{formatCurrency(downPayment)}</strong> ficará disponível na sua conta para você remarcar ou agendar outro serviço neste mesmo estabelecimento a qualquer momento nos próximos <strong>90 dias</strong>.
            </p>
          </div>
        )}

        {isRetainedScenario && (
          /* Faixa 3: Menos de 2h -> Retenção de Vacância */
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Cancelamento Tardio (Menos de 2 horas de antecedência)</span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              Cancelamento solicitado com <strong>menos de 2 horas de antecedência</strong> ({Math.max(0, Math.round(diffHours * 60))} minutos restantes).
            </p>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              Conforme os <strong>Artigos 417 a 420 do Código Civil</strong> (Arras Confirmatórias) e os termos de uso, devido à impossibilidade de preenchimento da cadeira pelo profissional neste prazo, <strong>100% do sinal é retido pelo estabelecimento</strong> como compensação por vacância da agenda.
            </p>

            <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Sinal Pago:</span>
                <span className="font-semibold text-white">{formatCurrency(downPayment)}</span>
              </div>
              <div className="flex items-center justify-between text-red-400 font-medium">
                <span>Retenção por Vacância:</span>
                <span>- {formatCurrency(downPayment)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-bold text-white">
                <span>Devolução via Pix:</span>
                <span className="text-slate-500 font-semibold">R$ 0,00 (Sem estorno)</span>
              </div>
            </div>
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
            {isCreditScenario ? 'Confirmar e Converter em Crédito' : 'Confirmar Cancelamento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
