import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Calendar, Clock, MapPin, Download, Home } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, Button, Badge } from '@/design-system';
import { formatCurrencyBRL } from '@/core/formatters/currency';
import { checkoutService } from '../services/checkoutService';
import type { AppointmentDetails } from '../types/checkout.types';

interface PaymentSuccessCardProps {
  appointment: AppointmentDetails;
  onGoHome: () => void;
}

export const PaymentSuccessCard: React.FC<PaymentSuccessCardProps> = ({
  appointment,
  onGoHome,
}) => {
  // Dispara confetes na montagem para feedback positivo imediato
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignora silenciosamente se o ambiente não suportar canvas
    }
  }, []);

  const formattedDate = React.useMemo(() => {
    try {
      const date = new Date(appointment.appointmentDate);
      return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      return appointment.appointmentDate;
    }
  }, [appointment.appointmentDate]);

  const formattedTime = React.useMemo(() => {
    try {
      const date = new Date(appointment.appointmentDate);
      return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return '';
    }
  }, [appointment.appointmentDate]);

  const handleDownloadIcs = () => {
    void checkoutService.downloadAppointmentIcs(appointment.id);
  };

  const address = appointment.company
    ? [
        appointment.company.street,
        appointment.company.number,
        appointment.company.district,
        appointment.company.city,
        appointment.company.state,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <Card className="max-w-md mx-auto shadow-md border-border" data-testid="payment-success-card">
      <CardHeader className="text-center pb-3 border-b border-border bg-emerald-500/5">
        <div className="flex items-center justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Badge variant="success" size="sm" dot className="whitespace-nowrap">
            Confirmado
          </Badge>
        </div>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">
          Cadeira Garantida com Sucesso!
        </h2>
        <p className="text-xs text-text-secondary">
          Seu sinal Pix foi confirmado e seu horário está bloqueado.
        </p>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Detalhes do Agendamento */}
        <div className="p-3.5 rounded-lg bg-surface-raised border border-border space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                {appointment.company?.businessName}
              </span>
              <h4 className="text-sm font-bold text-text-primary">
                {appointment.service?.name}
              </h4>
            </div>
            <span className="text-xs font-bold text-text-primary">
              {formatCurrencyBRL(Number(appointment.servicePrice))}
            </span>
          </div>

          <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs text-text-secondary">
            <div className="flex items-center gap-2 font-medium capitalize">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                {formattedTime} ({appointment.service?.durationMinutes} min)
              </span>
            </div>
            {address && (
              <div className="flex items-start gap-2 pt-1 text-[11px] text-text-muted">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="leading-snug">{address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-surface border border-border/70">
          <div>
            <span className="text-text-muted block text-[11px]">Sinal Pago:</span>
            <strong className="text-success font-bold">
              {formatCurrencyBRL(Number(appointment.downPaymentAmount))}
            </strong>
          </div>
          <span className="text-border">|</span>
          <div className="text-right">
            <span className="text-text-muted block text-[11px]">Restante no local:</span>
            <span className="text-text-secondary font-medium">
              {formatCurrencyBRL(
                Math.max(
                  0,
                  Number(appointment.servicePrice) - Number(appointment.downPaymentAmount)
                )
              )}
            </span>
          </div>
        </div>

        {/* Botão de Adicionar à Agenda (.ics) */}
        <Button
          variant="outline"
          size="md"
          onClick={handleDownloadIcs}
          leftIcon={<Download className="h-4 w-4 text-primary" />}
          className="w-full text-xs font-semibold"
          data-testid="download-ics-btn"
        >
          Adicionar à Agenda (Google / Apple / Outlook)
        </Button>
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t border-border/60 bg-surface-raised/20 flex items-center justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={onGoHome}
          leftIcon={<Home className="h-4 w-4" />}
          className="w-full text-xs font-bold tracking-wider"
          data-testid="success-home-btn"
        >
          Concluir e Voltar ao Início
        </Button>
      </CardFooter>
    </Card>
  );
};
