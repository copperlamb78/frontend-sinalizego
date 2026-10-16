import React, { useState } from 'react';
import { Calendar, Clock, Scissors, ShieldCheck, AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '@/design-system';
import { formatCurrencyBRL } from '@/core/formatters/currency';
import { formatCpf, isValidCpf, cleanCpf } from '../utils/cpf';
import type { StorefrontCompany, StorefrontService } from '@/features/storefront';
import type { User } from '@/features/auth';

interface CheckoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: StorefrontCompany;
  service: StorefrontService;
  date: string;
  dateLabel: string;
  timeSlot: string;
  downPaymentAmount: number;
  user: User;
  onConfirm: (cpfCnpj?: string) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const CheckoutConfirmModal: React.FC<CheckoutConfirmModalProps> = ({
  isOpen,
  onClose,
  company,
  service,
  dateLabel,
  timeSlot,
  downPaymentAmount,
  user,
  onConfirm,
  isLoading,
  errorMessage,
}) => {
  const hasUserCpf = Boolean(user.cpfCnpj);
  const [cpfInput, setCpfInput] = useState<string>('');
  const [cpfError, setCpfError] = useState<string | null>(null);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    setCpfInput(formatted);
    if (cpfError) setCpfError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasUserCpf) {
      if (!cpfInput.trim()) {
        setCpfError('Informe seu CPF para emissão da cobrança Pix');
        return;
      }
      if (!isValidCpf(cpfInput)) {
        setCpfError('Informe um CPF válido (11 dígitos)');
        return;
      }
    }

    await onConfirm(hasUserCpf ? undefined : cleanCpf(cpfInput));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Agendamento"
      description="Revise os detalhes da sua reserva antes de gerar o Pix do sinal."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-medium flex items-start gap-2.5"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Resumo do Serviço e Barbearia */}
        <div className="p-3.5 rounded-lg bg-surface-raised border border-border space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                {company.businessName}
              </span>
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Scissors className="h-3.5 w-3.5 text-primary shrink-0" />
                {service.name}
              </h4>
            </div>
            <span className="text-xs font-bold text-text-primary">
              {formatCurrencyBRL(
                typeof service.totalPrice === 'string'
                  ? parseFloat(service.totalPrice)
                  : service.totalPrice
              )}
            </span>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              {dateLabel}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              {timeSlot} ({service.durationMinutes} min)
            </span>
          </div>
        </div>

        {/* Box de Valores */}
        <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">Sinal Pix para reserva imediata:</span>
            <strong className="text-sm font-extrabold text-primary">
              {formatCurrencyBRL(downPaymentAmount)}
            </strong>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            O restante é pago diretamente no estabelecimento após o atendimento.
          </p>
        </div>

        {/* Campo de CPF se o usuário não tiver no cadastro */}
        {!hasUserCpf ? (
          <div className="space-y-1.5">
            <Input
              label="CPF do titular"
              placeholder="000.000.000-00"
              value={cpfInput}
              onChange={handleCpfChange}
              errorMessage={cpfError || undefined}
              helperText="Obrigatório para emissão da cobrança Pix junto ao Banco Central."
              maxLength={14}
              disabled={isLoading}
              data-testid="checkout-cpf-input"
            />
          </div>
        ) : (
          <div className="text-[11px] text-text-muted flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span>Titular: {user.name} ({formatCpf(user.cpfCnpj || '')})</span>
          </div>
        )}

        {/* Garantia do Hold de 15 Minutos */}
        <div className="flex items-start gap-2 text-xs text-text-secondary bg-surface-raised/40 p-3 rounded-lg border border-border/60">
          <ShieldCheck className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Ao confirmar, sua cadeira será <strong>reservada por 15 minutos</strong> para realização do Pix.
          </p>
        </div>

        {/* Ações / Rodapé */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs"
          >
            Voltar
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            loadingText="Reservando Vaga..."
            className="text-xs font-bold tracking-wider"
            data-testid="confirm-booking-btn"
          >
            Reservar Vaga e Gerar Pix
          </Button>
        </div>
      </form>
    </Modal>
  );
};
