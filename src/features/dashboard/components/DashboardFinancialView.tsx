import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  History,
  AlertCircle,
  CheckCircle,
  FileText,
  X,
  CreditCard,
} from 'lucide-react';
import { Card } from '@/design-system/ui/card';
import { Badge } from '@/design-system/ui/badge';
import { Button } from '@/design-system/ui/button';
import { Input } from '@/design-system/ui/input';
import { Skeleton } from '@/design-system/ui/skeleton';
import { formatCurrency } from '@/core/formatters/currency';
import type {
  CompanyBalance,
  WithdrawalTransaction,
  CompanyTransaction,
} from '../types';

export interface DashboardFinancialViewProps {
  balance: CompanyBalance | null;
  withdrawals: WithdrawalTransaction[];
  transactions: CompanyTransaction[];
  isLoading: boolean;
  onRequestWithdrawal: (amount?: number) => Promise<void>;
}

export const DashboardFinancialView: React.FC<DashboardFinancialViewProps> = ({
  balance,
  withdrawals,
  transactions,
  isLoading,
  onRequestWithdrawal,
}) => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  const available = balance?.availableBalance || 0;
  const escrow = balance?.escrowLockedBalance || 0;
  const fee = balance?.instantTransferFee || 5.0;

  const handleOpenWithdraw = () => {
    setWithdrawAmount(available.toFixed(2));
    setWithdrawError(null);
    setWithdrawSuccess(null);
    setIsWithdrawModalOpen(true);
  };

  const handleConfirmWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const amountNum = Number(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= fee) {
      setWithdrawError(
        `O valor do saque deve ser maior que a taxa de transferência (${formatCurrency(fee)}).`
      );
      return;
    }

    if (amountNum > available) {
      setWithdrawError('Valor superior ao saldo disponível para saque.');
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      await onRequestWithdrawal(amountNum);
      setWithdrawSuccess('Saque avulso solicitado com sucesso para a sua conta Pix!');
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setWithdrawSuccess(null);
      }, 2500);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setWithdrawError(
        errObj.response?.data?.message || 'Falha ao processar saque. Tente novamente.'
      );
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-36" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const nextPayoutDate = balance?.nextFreeWithdrawalDate
    ? new Date(balance.nextFreeWithdrawalDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
      })
    : null;

  return (
    <div className="space-y-8">
      {/* Cards de Saldo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo Disponível para Saque */}
        <Card className="p-5 flex flex-col justify-between border-primary/20 bg-primary/5">
          <div>
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Saldo Disponível
              </span>
              <div className="h-8 w-8 rounded-md bg-primary/15 text-primary flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-text-primary tracking-tight">
              {formatCurrency(available)}
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Liberado de atendimentos concluídos
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-primary/10">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              disabled={available <= fee}
              onClick={handleOpenWithdraw}
              leftIcon={<ArrowUpRight className="h-4 w-4" />}
            >
              Solicitar Saque Pix
            </Button>
          </div>
        </Card>

        {/* Saldo em Custódia (Escrow Hold) */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Em Custódia (Escrow)
              </span>
              <div className="h-8 w-8 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {formatCurrency(escrow)}
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Retido até a realização do serviço
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border text-[11px] text-text-muted">
            Liberado automaticamente após marcar o agendamento como concluído.
          </div>
        </Card>

        {/* Ciclo Semanal Gratuito & Total Sacado */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Saque Gratuito
              </span>
              <div className="h-8 w-8 rounded-md bg-surface-raised text-text-secondary flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-base font-bold text-text-primary">
              {nextPayoutDate ? `Próximo: ${nextPayoutDate}` : 'Semanal (Segundas-feiras)'}
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Transferência automática gratuita acima de R$ 100,00
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-text-muted">Total já sacado:</span>
            <span className="font-bold text-text-primary">
              {formatCurrency(balance?.totalWithdrawn || 0)}
            </span>
          </div>
        </Card>
      </div>

      {/* Grid de Histórico de Saques e Extrato */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histórico de Saques */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-bold text-text-primary tracking-tight">
              Histórico de Saques & Transferências
            </h2>
          </div>

          {withdrawals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-xs text-text-muted">
              Nenhum saque realizado até o momento.
            </div>
          ) : (
            <div className="space-y-2.5">
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-raised text-xs"
                >
                  <div>
                    <span className="font-bold text-text-primary block">
                      {formatCurrency(w.netAmountTransferred)}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {new Date(w.transferredAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {w.isFreeWeekly ? ' • Ciclo Gratuito' : ` • Tarifa: ${formatCurrency(w.transferFee)}`}
                    </span>
                  </div>

                  <Badge variant={w.status === 'CONFIRMED' ? 'success' : 'neutral'} size="sm">
                    {w.status === 'CONFIRMED' ? 'Efetuado' : w.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Extrato Financeiro */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-bold text-text-primary tracking-tight">
              Extrato Financeiro Recente
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-xs text-text-muted">
              Nenhuma movimentação registrada no extrato.
            </div>
          ) : (
            <div className="space-y-2.5">
              {transactions.slice(0, 10).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-raised text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-text-primary block truncate">
                      {t.description || t.type}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {new Date(t.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black ${
                        t.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-danger'
                      }`}
                    >
                      {t.amount >= 0 ? '+' : ''}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal Canônico (.modal-card) de Saque Sob Demanda */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="modal-card w-full max-w-md bg-surface border border-border rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header fixo shrink-0 */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    Solicitar Saque Avulso Pix
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Transferência instantânea via gateway Asaas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-raised cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Corpo rolável flex-1 min-h-0 */}
            <form id="withdraw-form" onSubmit={handleConfirmWithdraw} className="flex-1 overflow-y-auto min-h-0 p-5 space-y-4">
              {withdrawError && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2 text-danger text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{withdrawSuccess}</span>
                </div>
              )}

              <div className="p-3.5 rounded-lg bg-surface-raised border border-border space-y-1.5 text-xs">
                <div className="flex justify-between text-text-muted">
                  <span>Saldo disponível total:</span>
                  <span className="font-bold text-text-primary">{formatCurrency(available)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Tarifa de transferência Asaas:</span>
                  <span className="font-bold text-danger">-{formatCurrency(fee)}</span>
                </div>
                <div className="flex justify-between text-text-primary font-bold border-t border-border pt-1.5">
                  <span>Você receberá:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(Math.max(0, Number(withdrawAmount || 0) - fee))}
                  </span>
                </div>
              </div>

              <Input
                label="Valor a sacar (R$)"
                type="number"
                step="0.01"
                min={fee + 1}
                max={available}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />

              <p className="text-[11px] text-text-muted leading-relaxed">
                * Os saques do ciclo semanal às segundas-feiras são 100% gratuitos acima de R$ 100,00. Solicitações avulsas sob demanda possuem tarifa fixa de R$ 5,00 debitada do valor sacado.
              </p>
            </form>

            {/* Rodapé fixo shrink-0 */}
            <div className="p-4 border-t border-border flex items-center justify-end gap-2 shrink-0 bg-surface">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsWithdrawModalOpen(false)}
                disabled={isSubmittingWithdraw}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="withdraw-form"
                variant="primary"
                size="sm"
                isLoading={isSubmittingWithdraw}
                disabled={Boolean(withdrawSuccess)}
                leftIcon={<ArrowUpRight className="h-4 w-4" />}
              >
                Confirmar Saque
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
