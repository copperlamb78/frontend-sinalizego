import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/design-system/ui/button';
import { formatCurrencyBRL } from '@/core/formatters/currency';

interface BookingBottomBarProps {
  dateLabel: string;
  selectedSlot: string | null;
  downPaymentAmount: number;
  remainingAmount: number;
  onAdvance: () => void;
  isLoading?: boolean;
}

export const BookingBottomBar: React.FC<BookingBottomBarProps> = ({
  dateLabel,
  selectedSlot,
  downPaymentAmount,
  remainingAmount,
  onAdvance,
  isLoading = false,
}) => {
  return (
    <footer
      className="sticky bottom-0 z-40 w-full border-t border-border bg-surface/95 backdrop-blur-md px-4 sm:px-6 py-4 shadow-lg"
      data-testid="booking-bottom-bar"
    >
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Resumo da data, horário e valores */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
              Horário selecionado
            </span>
            <div className="text-sm font-bold text-text-primary">
              {selectedSlot ? (
                <span>
                  {dateLabel} às <span className="text-primary font-extrabold">{selectedSlot}</span>
                </span>
              ) : (
                <span className="text-text-muted font-normal italic">
                  Selecione um horário na grade acima
                </span>
              )}
            </div>
          </div>

          {/* Breakdown resumido de valores */}
          <div className="flex items-center gap-3 text-xs bg-surface-raised px-3 py-1.5 rounded-[4px] border border-border">
            <div>
              <span className="text-text-muted">Sinal Pix: </span>
              <strong className="text-text-primary font-bold">
                {formatCurrencyBRL(downPaymentAmount)}
              </strong>
            </div>
            <span className="text-border">|</span>
            <div>
              <span className="text-text-muted">Na cadeira: </span>
              <span className="text-text-secondary font-medium">
                {formatCurrencyBRL(remainingAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Botão Oficial Primary do Design System: Fundo Teal, texto branco puro, bold uppercase */}
        <Button
          variant="primary"
          size="lg"
          disabled={!selectedSlot || isLoading}
          isLoading={isLoading}
          loadingText="Garantindo Horário..."
          onClick={onAdvance}
          rightIcon={<ArrowRight className="h-4 w-4 text-white" />}
          className="w-full text-xs sm:text-sm font-bold tracking-wider"
          data-testid="advance-to-checkout-btn"
        >
          {selectedSlot
            ? `GARANTIR CADEIRA ÀS ${selectedSlot} (${formatCurrencyBRL(downPaymentAmount)} VIA PIX) →`
            : 'ESCOLHA UM HORÁRIO ACIMA PARA CONTINUAR'}
        </Button>

        {/* Garantia de reserva humanizada */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          <span>Seu horário fica reservado por 15 minutos para conclusão do Pix</span>
        </div>
      </div>
    </footer>
  );
};
