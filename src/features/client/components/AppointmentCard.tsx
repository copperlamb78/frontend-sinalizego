import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Download,
  XCircle,
  Scissors,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, toast } from '@/design-system';
import type { ClientAppointment } from '../types';
import { clientService } from '../services/clientService';

interface AppointmentCardProps {
  appointment: ClientAppointment;
  onCancelRequest: (appointment: ClientAppointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancelRequest,
}) => {
  const [isDownloadingIcs, setIsDownloadingIcs] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  // Contagem regressiva do hold de 15 minutos para agendamentos pendentes
  useEffect(() => {
    if (appointment.status !== 'PENDING_PAYMENT' || !appointment.expiresAt) {
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const expiresAtMs = new Date(appointment.expiresAt!).getTime();
      const diffMs = expiresAtMs - now;

      if (diffMs <= 0) {
        setTimeLeft('Expirado');
        setIsExpired(true);
        return;
      }

      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [appointment.status, appointment.expiresAt]);

  const handleDownloadIcs = async () => {
    setIsDownloadingIcs(true);
    try {
      await clientService.downloadAppointmentIcs(appointment.id);
      toast.success('Calendário Baixado', {
        description: 'Arquivo .ics exportado com sucesso.',
      });
    } catch {
      toast.error('Erro ao Baixar', {
        description: 'Não foi possível gerar o arquivo de calendário.',
      });
    } finally {
      setIsDownloadingIcs(false);
    }
  };

  // Formatação de data e horário no fuso do usuário
  const apptDateObj = new Date(appointment.appointmentDate);
  const formattedDate = apptDateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedStartTime = apptDateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const apptEndDateObj = new Date(appointment.appointmentEndDate);
  const formattedEndTime = apptEndDateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const servicePriceNum = Number(appointment.servicePrice);
  const downPaymentNum = Number(appointment.downPaymentAmount);
  const remainingNum = Math.max(0, servicePriceNum - downPaymentNum);

  // Status Badge Helper
  const renderStatusBadge = () => {
    switch (appointment.status) {
      case 'CONFIRMED':
        return (
          <Badge
            variant="success"
            size="sm"
            icon={<CheckCircle2 className="h-3 w-3 shrink-0" />}
            className="whitespace-nowrap font-bold"
          >
            Sinal Confirmado
          </Badge>
        );
      case 'PENDING_PAYMENT':
        return isExpired ? (
          <Badge
            variant="danger"
            size="sm"
            icon={<AlertCircle className="h-3 w-3 shrink-0" />}
            className="whitespace-nowrap font-bold"
          >
            Hold Expirado
          </Badge>
        ) : (
          <Badge
            variant="warning"
            size="sm"
            icon={<Clock className="h-3 w-3 shrink-0" />}
            className="whitespace-nowrap font-bold"
          >
            Aguardando Pix: {timeLeft || 'Calculando...'}
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge
            variant="neutral"
            size="sm"
            icon={<CheckCircle2 className="h-3 w-3 shrink-0" />}
            className="whitespace-nowrap font-medium"
          >
            Concluído
          </Badge>
        );
      case 'CANCELED':
        return (
          <Badge
            variant="danger"
            size="sm"
            icon={<XCircle className="h-3 w-3 shrink-0" />}
            className="whitespace-nowrap font-medium"
          >
            Cancelado
          </Badge>
        );
      case 'NO_SHOW':
        return (
          <Badge
            variant="danger"
            size="sm"
            icon={<AlertCircle className="h-3 w-3 shrink-0" />}
            className="whitespace-nowrap font-bold"
          >
            Não Compareceu
          </Badge>
        );
      default:
        return null;
    }
  };

  const isConfirmed = appointment.status === 'CONFIRMED';
  const isPending = appointment.status === 'PENDING_PAYMENT' && !isExpired;

  return (
    <Card
      className="overflow-hidden border-border bg-surface transition-all duration-200 hover:border-border-strong hover:shadow-sm"
      data-testid={`appointment-card-${appointment.id}`}
    >
      {/* Faixa decorativa superior */}
      <div
        className={`h-1 w-full ${isConfirmed
          ? 'bg-primary'
          : isPending
            ? 'bg-warning'
            : appointment.status === 'COMPLETED'
              ? 'bg-border-strong'
              : 'bg-danger/60'
          }`}
      />

      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* CABEÇALHO DO CARD: EMPRESA E STATUS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-raised border border-border text-primary font-black text-base shrink-0">
              {appointment.company.logoPhoto ? (
                <img
                  src={appointment.company.logoPhoto}
                  alt={appointment.company.businessName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                appointment.company.businessName.slice(0, 2).toUpperCase()
              )}
            </div>

            <div className="space-y-0.5">
              <Link
                to={`/empresa/${appointment.company.slug}`}
                className="text-base sm:text-lg font-bold text-text-primary hover:text-primary transition-colors inline-block"
              >
                {appointment.company.businessName}
              </Link>
              <p className="text-xs text-text-muted flex items-center gap-1">
                <MapPin className="h-3 w-3 text-text-muted shrink-0" />
                {appointment.company.district
                  ? `${appointment.company.district}, ${appointment.company.city || 'DF'}`
                  : 'Brasília - DF'}
              </p>
            </div>
          </div>

          <div className="self-start sm:self-auto shrink-0">
            {renderStatusBadge()}
          </div>
        </div>

        {/* LINHA DE DIVISÃO SUTIL */}
        <div className="h-px w-full bg-border/60" />

        {/* DETALHES DO AGENDAMENTO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          {/* SERVIÇO */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Serviço Agendado
            </span>
            <p className="font-bold text-text-primary flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5 text-primary shrink-0" />
              {appointment.service.name}
            </p>
            <p className="text-xs text-text-muted">
              Duração prevista: {appointment.service.durationMinutes} min
            </p>
          </div>

          {/* DATA & HORÁRIO */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Data &amp; Horário
            </span>
            <p className="font-bold text-text-primary capitalize flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              {formattedDate}
            </p>
            <p className="text-xs font-semibold text-primary flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {formattedStartTime} às {formattedEndTime}
            </p>
          </div>

          {/* VALORES FINANCEIROS ZERO TRUST */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Resumo Financeiro
            </span>
            <p className="font-bold text-text-primary">
              Total: R$ {servicePriceNum.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-text-muted">
              Sinal Pago:{' '}
              <strong className="text-text-primary">
                R$ {downPaymentNum.toFixed(2).replace('.', ',')}
              </strong>
              {remainingNum > 0 && (
                <span> • Restam: R$ {remainingNum.toFixed(2).replace('.', ',')}</span>
              )}
            </p>
          </div>
        </div>

        {/* BARRA DE AÇÕES INFERIOR */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60">
          {isPending ? (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <div className="text-xs text-warning flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>Vaga reservada temporariamente por 15 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancelRequest(appointment)}
                  className="text-xs text-text-muted hover:text-danger h-9"
                  data-testid="btn-desistir-reserva"
                >
                  Desistir
                </Button>
                <Link to={`/pagamento/${appointment.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<QrCode className="h-3.5 w-3.5 shrink-0" />}
                    className="font-bold text-xs h-9"
                    data-testid="btn-pagar-sinal-pix"
                  >
                    Pagar Sinal Pix (R$ {downPaymentNum.toFixed(2).replace('.', ',')})
                  </Button>
                </Link>
              </div>
            </div>
          ) : isConfirmed ? (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadIcs}
                isLoading={isDownloadingIcs}
                leftIcon={<Download className="h-3.5 w-3.5 shrink-0" />}
                className="text-xs h-9 font-semibold"
                data-testid="btn-download-ics"
              >
                Salvar na Agenda (.ics)
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancelRequest(appointment)}
                leftIcon={<XCircle className="h-3.5 w-3.5 text-danger shrink-0" />}
                className="text-xs text-danger hover:bg-danger/10 hover:text-danger h-9 font-semibold"
                data-testid="btn-cancelar-agendamento"
              >
                Cancelar Agendamento
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end w-full">
              <Link to={`/empresa/${appointment.company.slug}`}>
                <Button variant="secondary" size="sm" className="text-xs h-8">
                  Agendar Novamente
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
