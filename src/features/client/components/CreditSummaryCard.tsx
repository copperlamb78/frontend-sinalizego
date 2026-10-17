import React from 'react';
import { Wallet, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/design-system';

interface CreditSummaryCardProps {
  totalAvailable: number;
}

export const CreditSummaryCard: React.FC<CreditSummaryCardProps> = ({ totalAvailable }) => {
  const formattedTotal = `R$ ${totalAvailable.toFixed(2).replace('.', ',')}`;

  return (
    <Card
      className="border-border bg-surface shadow-xs overflow-hidden"
      data-testid="credit-summary-card"
    >
      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 dark:bg-teal-950/50 dark:border-teal-800/60 dark:text-teal-300 shrink-0">
            <Wallet className="h-6 w-6" />
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Saldo Total de Créditos Disponíveis
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              {formattedTotal}
            </div>
            <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                Abatimento automático no sinal da sua próxima reserva na barbearia correspondente.
              </span>
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-surface-raised border border-border text-xs font-semibold text-text-muted text-center shrink-0">
          Validade: 90 dias após emissão
        </div>
      </CardContent>
    </Card>
  );
};
