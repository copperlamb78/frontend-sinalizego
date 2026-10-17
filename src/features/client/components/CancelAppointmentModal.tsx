import React, { useState } from 'react';
import { AlertTriangle, Clock, Wallet, ShieldCheck, X } from 'lucide-react';
import { Modal, Button, Badge, toast } from '@/design-system';
import type { ClientAppointment, CancellationPolicy } from '../types';
import { clientService } from '../services/clientService';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: ClientAppointment | null;
  onCanceledSuccess: (appointmentId: string) => void;
}

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onCanceledSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('IMPREVISTO');

  if (!appointment) return null;

  // Cálculo da política de cancelamento CDC / Regra N6
  const appointmentTime = new Date(appointment.appointmentDate).getTime();
  const now = Date.now();
  const diffHours = (appointmentTime - now) / (1000 * 60 * 60);

  let policy: CancellationPolicy = 'RETAINED';
  if (diffHours > 24) {
    policy = 'REFUND';
  } else if (diffHours >= 2) {
    policy = 'CREDIT';
  }

  const downPaymentVal = Number(appointment.downPaymentAmount).toFixed(2).replace('.', ',');

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    try {
      const response = await clientService.cancelAppointmentByClient(appointment.id);
      
      let message = 'Agendamento cancelado com sucesso.';
      if (response.policy === 'REFUND') {
        message = `Cancelamento confirmado com estorno integral de 100% via Pix (R$ ${downPaymentVal}).`;
      } else if (response.policy === 'CREDIT') {
        message = `Cancelamento confirmado. O sinal de R$ ${downPaymentVal} foi convertido em crédito válido por 90 dias.`;
      } else {
        message = 'Cancelamento tardio confirmado. Conforme as regras da agenda, o sinal foi retido.';
      }

      toast.success('Reserva Cancelada', {
        description: message,
      });

      onCanceledSuccess(appointment.id);
      onClose();
    } catch (error: any) {
      toast.error('Erro ao Cancelar', {
        description:
          error?.response?.data?.message || 'Não foi possível cancelar o agendamento no momento.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" data-testid="cancel-appointment-modal">
      {/* PADRÃO CANÔNICO .modal-card COM HEADER, CORPO E FOOTER FIXOS */}
      <div className="flex flex-col max-h-[85vh] text-text-primary">
        
        {/* 1. CABEÇALHO FIXO (shrink-0) */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-border flex items-start justify-between bg-surface">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-text-primary">
                Cancelar Agendamento
              </h3>
              <p className="text-xs text-text-muted">
                Política transparente de estorno e crédito (Regra N6 CDC)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. CORPO ROLÁVEL (flex-1 overflow-y-auto min-h-0) */}
        <div className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6 space-y-4">
          {/* Box de Resumo da Reserva */}
          <div className="p-3.5 rounded-lg bg-surface-raised border border-border space-y-1 text-xs">
            <span className="font-semibold text-text-muted uppercase tracking-wider text-[10px]">
              Reserva Selecionada
            </span>
            <p className="font-bold text-sm text-text-primary">
              {appointment.company.businessName} • {appointment.service.name}
            </p>
            <p className="text-text-secondary">
              📅 {new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')} às{' '}
              {new Date(appointment.appointmentDate).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              • Sinal Pago: <strong>R$ {downPaymentVal}</strong>
            </p>
          </div>

          {/* BOX DA POLÍTICA APLICÁVEL (CALCULADA DINAMICAMENTE) */}
          {policy === 'REFUND' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="success"
                  size="sm"
                  icon={<ShieldCheck className="h-3.5 w-3.5 shrink-0" />}
                  className="font-bold"
                >
                  Antecedência &gt; 24 Horas
                </Badge>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                  {Math.floor(diffHours)}h para o serviço
                </span>
              </div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Você receberá 100% de estorno via Pix
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Como você está cancelando com mais de 24 horas de antecedência, o valor integral do sinal de{' '}
                <strong>R$ {downPaymentVal}</strong> será devolvido automaticamente na mesma conta Pix utilizada.
              </p>
            </div>
          )}

          {policy === 'CREDIT' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="warning"
                  size="sm"
                  icon={<Wallet className="h-3.5 w-3.5 shrink-0" />}
                  className="font-bold"
                >
                  Antecedência entre 2h e 24h
                </Badge>
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400">
                  {diffHours.toFixed(1)}h restantes
                </span>
              </div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Seu sinal será convertido em Crédito de 90 dias
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Pelo Código Civil (Art. 417 a 420), o valor pago de <strong>R$ {downPaymentVal}</strong>{' '}
                será transformado em crédito exclusivo nesta barbearia, válido por 90 dias e abatido automaticamente na sua próxima reserva.
              </p>
            </div>
          )}

          {policy === 'RETAINED' && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="danger"
                  size="sm"
                  icon={<Clock className="h-3.5 w-3.5 shrink-0" />}
                  className="font-bold"
                >
                  Cancelamento Tardio (&lt; 2h)
                </Badge>
                <span className="text-[11px] font-semibold text-red-800 dark:text-red-400">
                  Menos de 2h
                </span>
              </div>
              <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                Sinal retido como compensação de vacância
              </h4>
              <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                Devido à impossibilidade de reabertura do horário em tempo hábil para outro cliente, o sinal de{' '}
                <strong>R$ {downPaymentVal}</strong> é retido pelo estabelecimento como indenização pelo horário reservado.
              </p>
            </div>
          )}

          {/* Motivo do Cancelamento */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-text-secondary">
              Motivo do cancelamento (opcional):
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary outline-none focus:border-primary"
            >
              <option value="IMPREVISTO">Imprevisto pessoal ou de trabalho</option>
              <option value="HORARIO">Preciso de outro dia ou horário</option>
              <option value="OUTRO">Outro motivo</option>
            </select>
          </div>
        </div>

        {/* 3. RODAPÉ FIXO DE AÇÕES (shrink-0) */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-border bg-surface-raised flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold h-9"
          >
            Manter Reserva
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleConfirmCancel}
            className="text-xs font-bold h-9 shadow-xs"
            data-testid="btn-confirmar-cancelamento-modal"
          >
            {policy === 'REFUND' ? 'Confirmar e Estornar Pix' : 'Confirmar Cancelamento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
