import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Search,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/design-system/ui/card';
import { Badge, type BadgeVariant } from '@/design-system/ui/badge';
import { Button } from '@/design-system/ui/button';
import { Input } from '@/design-system/ui/input';
import { Skeleton } from '@/design-system/ui/skeleton';
import { formatCurrency } from '@/core/formatters/currency';
import type { CompanyAppointment, AppointmentStatus } from '../types';

export interface DashboardAppointmentsViewProps {
  appointments: CompanyAppointment[];
  isLoading: boolean;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onComplete: (id: string) => Promise<void>;
  onMarkNoShow: (id: string) => Promise<void>;
  onRescheduleOwner: (id: string) => Promise<void>;
  onDownloadIcs: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; variant: BadgeVariant }
> = {
  CONFIRMED: { label: 'Confirmado', variant: 'success' },
  COMPLETED: { label: 'Concluído', variant: 'neutral' },
  PENDING_PAYMENT: { label: 'Aguardando Pix', variant: 'warning' },
  CANCELED: { label: 'Cancelado', variant: 'danger' },
  NO_SHOW: { label: 'Cliente Faltou', variant: 'danger' },
  EXPIRED: { label: 'Expirado', variant: 'outline' },
};

export const DashboardAppointmentsView: React.FC<DashboardAppointmentsViewProps> = ({
  appointments,
  isLoading,
  selectedStatus,
  onSelectStatus,
  searchTerm,
  onSearchChange,
  onComplete,
  onMarkNoShow,
  onRescheduleOwner,
  onDownloadIcs,
  onRefresh,
}) => {
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const statusOptions = [
    { id: '', label: 'Todos' },
    { id: 'CONFIRMED', label: 'Confirmados' },
    { id: 'COMPLETED', label: 'Concluídos' },
    { id: 'PENDING_PAYMENT', label: 'Aguardando Pagamento' },
    { id: 'NO_SHOW', label: 'Faltas' },
    { id: 'CANCELED', label: 'Cancelados' },
  ];

  const handleAction = async (id: string, actionFn: (id: string) => Promise<void>) => {
    setActionLoadingId(id);
    try {
      await actionFn(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const clientName = appt.client?.name?.toLowerCase() || '';
    const serviceName = appt.service?.name?.toLowerCase() || '';
    return clientName.includes(term) || serviceName.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Barra de Filtros e Busca */}
      <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar por cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-text-muted" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectStatus(opt.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === opt.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-surface-raised text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              {opt.label}
            </button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            title="Atualizar lista"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Atualizar
          </Button>
        </div>
      </Card>

      {/* Lista de Agendamentos */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <CalendarDays className="h-10 w-10 text-text-muted mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-text-primary mb-1">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-xs text-text-muted">
            {searchTerm || selectedStatus
              ? 'Nenhum atendimento corresponde aos filtros selecionados.'
              : 'Você ainda não possui agendamentos cadastrados.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appt) => {
            const dateObj = new Date(appt.appointmentDate);
            const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              weekday: 'short',
            });
            const timeFormatted = dateObj.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const statusInfo = STATUS_CONFIG[appt.status] || {
              label: appt.status,
              variant: 'neutral' as BadgeVariant,
            };

            const isPendingAction = actionLoadingId === appt.id;
            const canComplete = appt.status === 'CONFIRMED';
            const canMarkNoShow = appt.status === 'CONFIRMED';

            return (
              <Card
                key={appt.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-border hover:border-primary/30 transition-colors"
              >
                {/* Dados da data e horário */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-lg bg-surface-raised border border-border flex flex-col items-center justify-center text-text-primary shrink-0">
                    <span className="text-[10px] font-bold text-text-muted uppercase">
                      {dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                    </span>
                    <span className="text-base font-black tracking-tight leading-none text-primary">
                      {timeFormatted}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-text-primary truncate">
                        {appt.client?.name || 'Cliente'}
                      </span>
                      <Badge variant={statusInfo.variant} size="sm">
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1 flex-wrap">
                      <span className="font-semibold text-text-secondary">
                        {appt.service?.name || 'Serviço'}
                      </span>
                      <span>•</span>
                      <span>{dateFormatted}</span>
                      {appt.client?.phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {appt.client.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preço e Valores */}
                <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-border">
                  <div className="text-left lg:text-right">
                    <div className="text-sm font-black text-text-primary">
                      {formatCurrency(appt.servicePrice)}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Sinal: {formatCurrency(appt.downPaymentAmount)}
                    </div>
                  </div>

                  {/* Ações operacionais do estabelecimento */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Botão Baixar .ics */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(appt.id, onDownloadIcs)}
                      title="Salvar no iPhone / Google Calendar"
                      leftIcon={<Download className="h-3.5 w-3.5" />}
                    >
                      Agenda
                    </Button>

                    {/* Concluir Atendimento */}
                    {canComplete && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isPendingAction}
                        onClick={() => handleAction(appt.id, onComplete)}
                        leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                      >
                        Concluir
                      </Button>
                    )}

                    {/* No-Show */}
                    {canMarkNoShow && (
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={isPendingAction}
                        onClick={() => {
                          if (
                            window.confirm(
                              'Confirmar que o cliente faltou? O valor do sinal ficará com o estabelecimento como compensação pelo horário reservado.'
                            )
                          ) {
                            handleAction(appt.id, onMarkNoShow);
                          }
                        }}
                        leftIcon={<XCircle className="h-3.5 w-3.5" />}
                      >
                        Falta
                      </Button>
                    )}

                    {/* Imprevisto do Dono (Reagendamento / Salvar a Venda) */}
                    {canComplete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={isPendingAction}
                        onClick={() => {
                          if (
                            window.confirm(
                              'Liberar horário por imprevisto? O cliente receberá 100% do sinal pago como crédito válido por 90 dias e poderá reagendar.'
                            )
                          ) {
                            handleAction(appt.id, onRescheduleOwner);
                          }
                        }}
                        title="Liberar horário por imprevisto do estabelecimento"
                        leftIcon={<AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                      >
                        Imprevisto
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
