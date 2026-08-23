import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/company.service';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  History
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  nextFreeDate?: string;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  nextFreeDate
}) => {
  const queryClient = useQueryClient();
  const [amountInput, setAmountInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['withdrawals-history'],
    queryFn: () => companyService.getWithdrawalsHistory(),
    enabled: isOpen
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount?: number) => companyService.requestWithdrawal(amount),
    onSuccess: (data) => {
      toast.success(data.message || 'Saque solicitado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
      queryClient.invalidateQueries({ queryKey: ['company-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals-history'] });
      setAmountInput('');
      setActiveTab('history');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Não foi possível solicitar o saque.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  });

  const parsedAmount = parseFloat(amountInput.replace(',', '.')) || 0;
  const transferFee = 5.0;
  const netAmount = Math.max(0, parsedAmount - transferFee);
  const isValidAmount = parsedAmount > transferFee && parsedAmount <= availableBalance;

  const handleWithdrawAll = () => {
    setAmountInput(availableBalance.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount) {
      toast.error(`O valor mínimo para saque avulso é de R$ ${transferFee + 1},00.`);
      return;
    }
    withdrawMutation.mutate(parsedAmount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestão de Saques & Transferências"
      description="Resgate seu saldo liberado para sua chave Pix cadastrada"
      size="lg"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0B1120] border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('request')}
            className={cn(
              'py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none',
              activeTab === 'request'
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Solicitar Saque</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={cn(
              'py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none',
              activeTab === 'history'
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico de Saques</span>
          </button>
        </div>

        {/* Tab 1: Request Withdrawal */}
        {activeTab === 'request' && (
          <div className="space-y-5">
            {/* Free Weekly Withdrawal Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-[#0F172A] to-teal-950/40 border border-teal-500/30">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-teal-400 font-bold">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>Saque Semanal Automático Gratuito</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Toda <strong>segunda-feira às 06:00</strong>, o saldo liberado é transferido para o seu Pix com <strong>taxa zero (100% gratuita)</strong> para saldos a partir de <strong>R$ 100,00</strong>.
                </p>
                {nextFreeDate && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-teal-300/90 font-medium pt-1">
                    <Calendar className="w-3 h-3 text-teal-400" />
                    Próximo saque gratuito: {new Date(nextFreeDate).toLocaleDateString('pt-BR')} (Mínimo R$ 100,00)
                  </span>
                )}
              </div>
            </div>

            {/* Instant Withdrawal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-teal-400" />
                    Saldo Disponível Liberado:
                  </span>
                  <span className="text-base font-black text-teal-400">
                    {formatCurrency(availableBalance)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Valor do Saque Avulso (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="6"
                      max={availableBalance}
                      placeholder="0,00"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full h-12 pl-10 pr-28 rounded-xl bg-[#1E293B] border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={handleWithdrawAll}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Sacar Tudo
                    </button>
                  </div>
                </div>

                {/* Real-Time Fee Breakdown */}
                {parsedAmount > 0 && (
                  <div className="p-3 rounded-xl bg-[#1E293B]/70 border border-slate-700/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Valor Solicitado</span>
                      <span className="font-semibold text-white">{formatCurrency(parsedAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-400 font-medium">
                      <span>Tarifa de Transferência Asaas</span>
                      <span>- {formatCurrency(transferFee)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-700 font-bold text-white">
                      <span>Você Receberá no Pix</span>
                      <span className="text-teal-400 font-black text-sm">{formatCurrency(netAmount)}</span>
                    </div>
                  </div>
                )}
              </div>

              {availableBalance <= 5.0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Saldo insuficiente para saque avulso com tarifa. Conclua mais atendimentos ou aguarde a segunda-feira.</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={!isValidAmount || withdrawMutation.isPending}
                isLoading={withdrawMutation.isPending}
                className="w-full h-12 text-sm font-bold shadow-lg shadow-teal-500/20"
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                Confirmar Saque de {formatCurrency(netAmount > 0 ? netAmount : parsedAmount)}
              </Button>
            </form>
          </div>
        )}

        {/* Tab 2: Withdrawals History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {isLoadingHistory ? (
              <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
                Carregando histórico de saques...
              </div>
            ) : history && history.length > 0 ? (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {formatCurrency(item.netAmountTransferred)}
                        </span>
                        <Badge variant={item.isFreeWeekly ? 'teal' : 'neutral'} size="sm">
                          {item.isFreeWeekly ? 'Semanal Grátis' : 'Avulso (-R$5)'}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.transferredAt).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Transferido
                      </span>
                      {item.asaasTransferId && (
                        <span className="text-[10px] text-slate-500 block font-mono">
                          ID: {item.asaasTransferId}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#0B1120] border border-slate-800 rounded-2xl space-y-2">
                <History className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Nenhum saque realizado ainda.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
