import React from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Scissors,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/design-system/ui/card';
import { Badge } from '@/design-system/ui/badge';
import { Button } from '@/design-system/ui/button';
import { Skeleton } from '@/design-system/ui/skeleton';
import { formatCurrency } from '@/core/formatters/currency';
import type { DashboardMetrics } from '../types';

export interface DashboardMetricsOverviewProps {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  onGoToAppointments: () => void;
  onGoToFinancial: () => void;
}

export const DashboardMetricsOverview: React.FC<DashboardMetricsOverviewProps> = ({
  metrics,
  isLoading,
  onGoToAppointments,
  onGoToFinancial,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-40" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </Card>
          <Card className="p-5 space-y-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className="p-8 text-center border-dashed">
        <AlertCircle className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <h3 className="text-sm font-bold text-text-primary mb-1">
          Nenhuma métrica disponível no período
        </h3>
        <p className="text-xs text-text-muted">
          As métricas de faturamento e agendamentos serão atualizadas assim que você receber os primeiros atendimentos.
        </p>
      </Card>
    );
  }

  const { financial, volume, topServices, upcomingToday } = metrics;

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Total */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Receita Bruta</span>
            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-text-primary tracking-tight">
              {formatCurrency(financial?.totalRevenue || 0)}
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Valor acumulado no período
            </p>
          </div>
        </Card>

        {/* Adiantamento Sinal Coletado */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sinal Garantido</span>
            <div className="h-8 w-8 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(financial?.totalDownPaymentCollected || 0)}
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Protegido contra falta do cliente
            </p>
          </div>
        </Card>

        {/* Receita Líquida */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Receita Líquida</span>
            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-text-primary tracking-tight">
              {formatCurrency(financial?.netIncome || 0)}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-text-muted">
                Taxa de plataforma: {formatCurrency(financial?.totalPlatformFees || 0)}
              </span>
              <button
                type="button"
                onClick={onGoToFinancial}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Ver extrato &rarr;
              </button>
            </div>
          </div>
        </Card>

        {/* Taxa de Conclusão / Volume */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Taxa de Conclusão</span>
            <div className="h-8 w-8 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-text-primary tracking-tight">
              {volume?.completionRate || 0}%
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              {volume?.completed || 0} de {volume?.total || 0} atendimentos
            </p>
          </div>
        </Card>
      </div>

      {/* Grid com Próximos de Hoje e Serviços Mais Populares */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos Atendimentos do Dia */}
        <Card className="lg:col-span-2 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-bold text-text-primary tracking-tight">
                Próximos Atendimentos de Hoje
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoToAppointments}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Ver todos
            </Button>
          </div>

          {!upcomingToday || upcomingToday.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <Clock className="h-8 w-8 text-text-muted mb-2 opacity-50" />
              <p className="text-xs text-text-muted">
                Nenhum agendamento pendente para o restante do dia de hoje.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingToday.map((item) => {
                const dateObj = new Date(item.appointmentDate);
                const timeStr = dateObj.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-border bg-surface-raised hover:border-primary/30 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-primary shrink-0">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-black">{timeStr}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-text-primary truncate">
                          {item.clientName}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-text-muted">
                          <span>{item.serviceName}</span>
                          <span>•</span>
                          <span>{item.durationMinutes} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                      <div>
                        <div className="text-xs font-bold text-text-primary">
                          {formatCurrency(item.servicePrice)}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Sinal: {formatCurrency(item.downPaymentAmount)}
                        </span>
                      </div>
                      <Badge variant="brand" size="sm">
                        Agendado
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Top Serviços Mais Rentáveis */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-bold text-text-primary tracking-tight">
                Top Serviços
              </h2>
            </div>
          </div>

          {!topServices || topServices.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <Scissors className="h-8 w-8 text-text-muted mb-2 opacity-50" />
              <p className="text-xs text-text-muted">
                Nenhum serviço computado no período.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topServices.map((svc, idx) => (
                <div
                  key={svc.serviceId || idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-raised"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-text-primary block truncate">
                      {svc.serviceName}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {svc.appointmentsCount} atendimentos realizados
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-primary block">
                      {formatCurrency(svc.totalRevenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
