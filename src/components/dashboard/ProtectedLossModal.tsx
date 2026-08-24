import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  ShieldCheck,
  Clock,
  UserX,
  Scissors,
  Calendar,
  Phone,
  HelpCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ProtectedLossSummary, ProtectedLossItem } from '@/types/company.types';

interface ProtectedLossModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary?: ProtectedLossSummary;
  items?: ProtectedLossItem[];
}

export const ProtectedLossModal: React.FC<ProtectedLossModalProps> = ({
  isOpen,
  onClose,
  summary,
  items = []
}) => {
  const totalSaved = summary?.totalSavedAmount ?? items.reduce((acc, i) => acc + (i.retainedAmount || 0), 0);
  const totalMinutes =
    summary?.totalProtectedMinutes ?? items.reduce((acc, i) => acc + (i.durationMinutes || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}min`;

  const noShows = summary?.noShowsCount ?? items.filter((i) => i.reason === 'NO_SHOW').length;
  const lateCancels =
    summary?.lateCancellationsCount ?? items.filter((i) => i.reason === 'LATE_CANCELLATION').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Relatório: Prejuízo Evitado com SinalizeGO"
      description="Auditoria de valores retidos e repassados por faltas ou cancelamentos tardios de clientes"
      size="lg"
    >
      <div className="space-y-6">
        {/* KPI Header Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1120] to-[#1E293B] border border-teal-500/30 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Valor Total Salvo
            </span>
            <p className="text-2xl font-black text-teal-400">{formatCurrency(totalSaved)}</p>
            <span className="text-[10px] text-slate-500 block">Direto no seu saldo</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1120] to-[#1E293B] border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Cadeira Remunerada
            </span>
            <p className="text-2xl font-black text-white">{timeFormatted}</p>
            <span className="text-[10px] text-slate-500 block">Tempo protegido</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1120] to-[#1E293B] border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5 text-amber-400" />
              Ocorrências
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-sm font-bold text-amber-400">{noShows} faltas</span>
              <span className="text-slate-600">•</span>
              <span className="text-sm font-bold text-slate-300">{lateCancels} cancel.</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Compromissos quebrados</span>
          </div>
        </div>

        {/* Legal Basis Disclaimer */}
        <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/20 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span>
            Os sinais retidos são transferidos para sua carteira com base nos artigos 417 a 420 do Código Civil (Arras Confirmatórias), compensando o profissional pela indisponibilidade da cadeira e o tempo de espera.
          </span>
        </div>

        {/* Audit List of Protected Occurrences */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>Extrato de Ocorrências Protegidas</span>
          </h4>

          {items && items.length > 0 ? (
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-[#0B1120]">
              {items.map((item) => {
                const dateFormatted = new Date(item.appointmentDate).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#1E293B]/40 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.clientName}</span>
                        <Badge
                          variant={item.reason === 'NO_SHOW' ? 'warning' : 'neutral'}
                          size="sm"
                        >
                          {item.reason === 'NO_SHOW' ? 'Falta (No-Show)' : 'Cancelamento < 24h'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Scissors className="w-3 h-3 text-teal-400" />
                          {item.serviceName} ({item.durationMinutes} min)
                        </span>
                        <span>•</span>
                        <span>{dateFormatted}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {item.clientPhone && (
                        <a
                          href={`https://wa.me/55${item.clientPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                          title="Conversar no WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                          Sinal Recuperado
                        </span>
                        <span className="text-sm font-black text-teal-400">
                          {formatCurrency(item.retainedAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#0B1120] border border-slate-800 rounded-2xl space-y-1">
              <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-300">Nenhum prejuízo registrado</p>
              <p className="text-[11px] text-slate-500">
                Quando um cliente faltar ou cancelar em cima da hora, o valor do sinal aparecerá auditado aqui.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 flex justify-end border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar Relatório
          </Button>
        </div>
      </div>
    </Modal>
  );
};
