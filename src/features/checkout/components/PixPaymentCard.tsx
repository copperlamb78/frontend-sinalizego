import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, toast } from '@/design-system';
import { formatCurrencyBRL } from '@/core/formatters/currency';
import { useCountdown } from '../hooks/useCountdown';
import type { AppointmentDetails, PixChargeResponse } from '../types/checkout.types';

interface PixPaymentCardProps {
  appointment: AppointmentDetails;
  pixData: PixChargeResponse;
  onExpired: () => void;
}

export const PixPaymentCard: React.FC<PixPaymentCardProps> = ({
  appointment,
  pixData,
  onExpired,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Contagem regressiva de 15 minutos baseada no expiresAt do agendamento / cobrança
  const expirationIso = appointment.expiresAt || pixData.expirationDate;
  const { formattedTime, isExpired, progressPercent } = useCountdown({
    expiresAt: expirationIso,
    onExpire: onExpired,
  });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixData.qrCodePayload);
      setCopied(true);
      toast.success('Código Pix Copia e Cola copiado com sucesso!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Não foi possível copiar automaticamente. Selecione e copie o código.');
    }
  };

  return (
    <Card className="max-w-md mx-auto shadow-md border-border" data-testid="pix-payment-card">
      {/* Cabeçalho */}
      <CardHeader className="text-center pb-3 border-b border-border bg-surface-raised/40">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Badge variant="brand" size="sm" dot className="whitespace-nowrap">
            Aguardando Pagamento
          </Badge>
        </div>
        <h2 className="text-lg font-bold text-text-primary tracking-tight">
          Pague com Pix para Garantir sua Vaga
        </h2>
        <p className="text-xs text-text-secondary">
          {appointment.company?.businessName} • {appointment.service?.name}
        </p>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Valor do Sinal */}
        <div className="text-center p-3.5 rounded-lg bg-surface-raised border border-border">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
            Valor do Sinal de Reserva
          </span>
          <div className="text-2xl font-black text-primary tracking-tight mt-0.5">
            {formatCurrencyBRL(pixData.totalValue)}
          </div>
          <span className="text-[11px] text-text-secondary mt-1 block">
            Restante de{' '}
            {formatCurrencyBRL(
              Math.max(
                0,
                Number(appointment.servicePrice) - Number(appointment.downPaymentAmount)
              )
            )}{' '}
            pago no local
          </span>
        </div>

        {/* Contador Regressivo de 15 Minutos */}
        <div className="p-3.5 rounded-lg bg-surface border border-border/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-text-secondary">
              <Clock className="h-4 w-4 text-warning" />
              Tempo restante da sua reserva:
            </span>
            <strong
              className={`font-mono text-sm font-bold ${
                isExpired ? 'text-danger' : 'text-text-primary'
              }`}
            >
              {formattedTime}
            </strong>
          </div>

          {/* Barra de Progresso do Tempo */}
          <div className="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                progressPercent < 20 ? 'bg-danger' : 'bg-primary'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-border shadow-xs">
          {pixData.qrCodePayload ? (
            <QRCodeSVG
              value={pixData.qrCodePayload}
              size={192}
              level="M"
              includeMargin={false}
              className="w-44 h-44 sm:w-48 sm:h-48"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-text-muted text-xs">
              Carregando QR Code...
            </div>
          )}
          <span className="text-[11px] text-zinc-600 font-medium mt-2">
            Aponte a câmera do aplicativo do seu banco
          </span>
        </div>

        {/* Código Copia e Cola */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary block">
            Ou use o Pix Copia e Cola:
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 text-[11px] font-mono text-text-muted bg-surface-raised border border-border rounded-md truncate select-all">
              {pixData.qrCodePayload}
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={handleCopyCode}
              leftIcon={copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              className="shrink-0 text-xs font-semibold"
              data-testid="copy-pix-btn"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </div>

        {/* Status de Polling em Tempo Real */}
        <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-2 border-t border-border/60">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>Aguardando confirmação do banco em tempo real...</span>
        </div>

        {/* Garantia do Hold */}
        <div className="flex items-start gap-2 text-[11px] text-text-muted bg-surface-raised/40 p-2.5 rounded-lg border border-border/50">
          <ShieldCheck className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Seu pagamento é identificado de forma 100% automática. Não é necessário enviar comprovante.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
