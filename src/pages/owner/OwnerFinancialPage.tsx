import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/company.service';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { WithdrawalModal } from '@/components/dashboard/WithdrawalModal';
import {
  Wallet,
  Lock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  ExternalLink,
  Clock,
  CheckCircle2,
  HelpCircle,
  Building2,
  History
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const OwnerFinancialPage: React.FC = () => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // 1. Fetch Real-time Balance
  const { data: balance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['company-balance'],
    queryFn: () => companyService.getBalance(),
    refetchInterval: 15000
  });

  // 2. Fetch Withdrawals History
  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['withdrawals-history'],
    queryFn: () => companyService.getWithdrawalsHistory()
  });

  if (isLoadingBalance) {
    return (
      <div className="space-y-6 max-w-5xl animate-pulse">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  const available = balance?.availableBalance || 0;
  const escrow = balance?.escrowLockedBalance || 0;
  const totalWithdrawn = balance?.totalWithdrawn || 0;
  const nextFreeDate = balance?.nextFreeWithdrawalDate;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-teal-400" />
            <span>Financeiro & Subconta Asaas</span>
          </h1>
          <p className="text-xs text-slate-400">
            Acompanhe o saldo liberado, valores em custódia de agendamentos e solicite saques antecipados.
          </p>
        </div>

        {/* Action Button: Saque Antecipado */}
        <Button
          onClick={() => setIsWithdrawModalOpen(true)}
          className="h-11 px-5 text-sm font-bold shadow-lg shadow-teal-500/20 self-start sm:self-auto cursor-pointer"
          leftIcon={<ArrowUpRight className="w-4 h-4 text-white" />}
        >
          Solicitar Saque Antecipado
        </Button>
      </div>

      {/* 3 Financial Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Saldo Disponível */}
        <Card className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-teal-400" />
              Saldo Disponível
            </span>
            <Badge variant="teal" size="sm">Liberado</Badge>
          </div>

          <div>
            <span className="text-3xl font-black text-teal-400">
              {formatCurrency(available)}
            </span>
            <p className="text-[11px] text-slate-400 pt-1">
              Pronto para transferência via Pix
            </p>
          </div>
        </Card>

        {/* Card 2: Saldo em Custódia (Escrow) */}
        <Card className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              Saldo em Custódia
            </span>
            <div className="group relative cursor-pointer" title="Valores de sinais retidos de agendamentos futuros. O valor é liberado após o atendimento ser concluído.">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
            </div>
          </div>

          <div>
            <span className="text-3xl font-black text-amber-400">
              {formatCurrency(escrow)}
            </span>
            <p className="text-[11px] text-slate-400 pt-1">
              Liberado após a conclusão dos serviços
            </p>
          </div>
        </Card>

        {/* Card 3: Total Já Transferido */}
        <Card className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Total Sacado
            </span>
            <Badge variant="success" size="sm">Auditado</Badge>
          </div>

          <div>
            <span className="text-3xl font-black text-white">
              {formatCurrency(totalWithdrawn)}
            </span>
            <p className="text-[11px] text-slate-400 pt-1">
              Transferências realizadas com sucesso
            </p>
          </div>
        </Card>
      </div>

      {/* Asaas Subaccount & Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box: Subconta Asaas Integrada */}
        <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Subconta Bancária Asaas</h3>
            </div>
            <Badge variant="teal" dot>ATIVA</Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Wallet ID Asaas</span>
              <p className="font-mono font-bold text-teal-400">
                {balance?.walletId || 'wal_demo_vintage_89234'}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1120] border border-slate-800 text-slate-400">
              <span>Chave Pix Cadastrada:</span>
              <span className="font-mono text-white font-semibold">11.99999-8888 (Telefone)</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://sandbox.asaas.com"
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
            >
              <span>Acessar Portal Oficial Asaas</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </Card>

        {/* Box: Políticas de Saque (Semanal vs Antecipado) */}
        <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Modalidades de Transferência</h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Opção 1: Semanal */}
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-300">1. Saque Semanal Automático</span>
                <Badge variant="teal" size="sm">Mínimo R$ 100,00 • Taxa R$ 0</Badge>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Toda <strong>segunda-feira às 06:00</strong> o sistema transfere o saldo liberado diretamente para seu Pix com taxa 100% gratuita para saldos acumulados a partir de <strong>R$ 100,00</strong>.
              </p>
            </div>

            {/* Opção 2: Antecipado / Avulso */}
            <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">2. Saque Antecipado / Avulso</span>
                <Badge variant="neutral" size="sm">Tarifa Asaas: R$ 5,00</Badge>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Resgate imediato a qualquer momento em dias úteis ou finais de semana, com débito da taxa de transferência bancária Asaas de R$ 5,00.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Histórico Auditado de Saques */}
      <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-teal-400" />
              <span>Extrato & Histórico de Saques</span>
            </h3>
            <p className="text-xs text-slate-400">
              Registros auditados de todas as transferências realizadas para sua conta bancária.
            </p>
          </div>
        </div>

        {isLoadingHistory ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Carregando histórico financeiro...
          </div>
        ) : history && history.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {history.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {formatCurrency(item.netAmountTransferred)}
                    </span>
                    <Badge variant={item.isFreeWeekly ? 'teal' : 'neutral'} size="sm">
                      {item.isFreeWeekly ? 'Semanal Grátis (R$ 0)' : 'Avulso (-R$ 5)'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(item.transferredAt).toLocaleString('pt-BR')}</span>
                    {item.transferFee > 0 && (
                      <span className="text-amber-400 font-medium">
                        (Valor Solicitado: {formatCurrency(item.requestedAmount)} - Taxa: {formatCurrency(item.transferFee)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Transferido no Pix
                  </span>
                  {item.asaasTransferId && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      ID: {item.asaasTransferId}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0B1120] border border-slate-800 rounded-2xl space-y-1">
            <Clock className="w-6 h-6 text-slate-600 mx-auto mb-1" />
            <p className="text-xs text-slate-400">Nenhum saque registrado ainda.</p>
          </div>
        )}
      </Card>

      {/* Escrow Legal Shielding Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
        <span>
          Os sinais retidos em custódia estão em conformidade com os artigos 417 a 420 do Código Civil (Arras Confirmatórias) e são liberados automaticamente para saque após o atendimento.
        </span>
      </div>

      {/* Modal de Saque */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={available}
        nextFreeDate={nextFreeDate}
      />
    </div>
  );
};
