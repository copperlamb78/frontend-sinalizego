import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionsService } from '@/services/transactions.service';
import { appointmentsService } from '@/services/appointments.service';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import {
  QrCode,
  Copy,
  Check,
  Clock,
  ArrowLeft,
  Smartphone,
  AlertCircle,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { triggerHaptic } from '@/lib/haptics';

export const PixPaymentPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(15 * 60);

  // 1. Generate Pix QR Code and Payload
  const {
    data: pixData,
    isLoading: isLoadingPix,
    isError: isErrorPix,
    refetch: refetchPix
  } = useQuery({
    queryKey: ['pix-transaction', appointmentId],
    queryFn: () => transactionsService.generatePix(appointmentId!),
    enabled: !!appointmentId,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    retry: 1
  });

  // 2. Reactive Polling for Payment Confirmation (refetch every 3s)
  const { data: appointment } = useQuery({
    queryKey: ['appointment-polling', appointmentId],
    queryFn: () => appointmentsService.getAppointmentById(appointmentId!),
    enabled: !!appointmentId,
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status;
      // Stop polling once confirmed or completed
      if (currentStatus === 'CONFIRMED' || currentStatus === 'COMPLETED') {
        return false;
      }
      return 3000; // 3 seconds polling
    }
  });

  // Watch appointment status and auto-redirect upon confirmation
  useEffect(() => {
    if (appointment?.status === 'CONFIRMED' || appointment?.status === 'COMPLETED') {
      toast.success('Pagamento confirmado com sucesso!');
      navigate(`/reserva/confirmada/${appointmentId}`, { replace: true });
    }
  }, [appointment?.status, appointmentId, navigate]);

  // Calculate Countdown Timer
  useEffect(() => {
    if (!pixData?.expirationDate) return;

    const interval = setInterval(() => {
      const expTime = new Date(pixData.expirationDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expTime - now) / 1000));
      setTimeLeftSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pixData?.expirationDate]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyPix = async () => {
    if (!pixData?.qrCodePayload) return;
    try {
      await navigator.clipboard.writeText(pixData.qrCodePayload);
      triggerHaptic('light');
      setCopied(true);
      toast.success('Código Pix Copia e Cola copiado com sucesso!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Não foi possível copiar automaticamente. Selecione e copie o código.');
    }
  };

  if (isLoadingPix) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (isErrorPix || !pixData) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Erro ao Gerar Pix</h2>
        <p className="text-xs text-slate-400">
          Não foi possível gerar a cobrança Pix para este agendamento. Verifique se o agendamento ainda está ativo.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            Voltar
          </Button>
          <Button variant="primary" size="sm" onClick={() => refetchPix()} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const isExpired = timeLeftSeconds <= 0;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ambiente Seguro Asaas</span>
        </div>
      </div>

      {/* Timer Banner (Urgency Trigger) */}
      <div
        className={cn(
          'p-4 rounded-2xl border flex items-center justify-between text-xs transition-colors',
          isExpired
            ? 'bg-red-500/10 border-red-500/40 text-red-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        )}
      >
        <div className="flex items-center gap-2">
          <Clock className={cn('w-4 h-4', isExpired ? 'text-red-400' : 'text-amber-400')} />
          <span className="font-medium">
            {isExpired
              ? 'Este QR Code Pix expirou'
              : 'Sua cadeira está pré-reservada. Tempo restante:'}
          </span>
        </div>
        <span className="font-black text-sm tracking-wider font-mono text-amber-300">
          {formatTimer(timeLeftSeconds)}
        </span>
      </div>

      {/* Main Payment Card */}
      <Card className="p-6 sm:p-8 bg-[#0F172A] border-slate-800 space-y-6 text-center shadow-2xl">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Taxa de Confirmação de Reserva
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F8FAFC]">
            {formatCurrency(pixData.totalValue)}
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Pague pelo aplicativo do seu banco para confirmar seu horário e cadeira reservada na hora.
          </p>
        </div>

        {/* QR Code Frame */}
        <div className="p-4 rounded-2xl bg-white max-w-[240px] mx-auto shadow-inner flex items-center justify-center">
          {pixData.qrCodeImage ? (
            <img
              src={
                pixData.qrCodeImage.startsWith('data:')
                  ? pixData.qrCodeImage
                  : `data:image/png;base64,${pixData.qrCodeImage}`
              }
              alt="QR Code Pix"
              className="w-full h-auto object-contain"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-900">
              <QrCode className="w-32 h-32" />
            </div>
          )}
        </div>

        {/* Pix Copia e Cola */}
        <div className="space-y-2 text-left">
          <label className="block text-xs font-semibold text-slate-400">
            Código Pix Copia e Cola
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={pixData.qrCodePayload}
              className="w-full h-11 px-3 rounded-xl bg-[#1E293B] border border-slate-700 text-xs text-slate-300 font-mono focus:outline-none select-all truncate"
            />
            <Button
              type="button"
              variant={copied ? 'secondary' : 'primary'}
              onClick={handleCopyPix}
              className="h-11 shrink-0 px-4 font-bold"
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </div>

        {/* Polling Indicator */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
          <span>Aguardando pagamento... Seu agendamento será validado na hora.</span>
        </div>
      </Card>

      {/* How to Pay Guide */}
      <Card className="p-5 bg-[#0F172A] border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-teal-400" />
          <span>Como Realizar o Pagamento</span>
        </h3>

        <div className="space-y-2.5 text-xs text-slate-400">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
              1
            </span>
            <span>Abra o aplicativo do seu banco no celular.</span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
              2
            </span>
            <span>
              Escolha pagar via <strong>Pix Copia e Cola</strong> ou aponte a câmera para o <strong>QR Code</strong>.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
              3
            </span>
            <span>
              Conclua o Pix de {formatCurrency(pixData.totalValue)}. Seu agendamento e cadeira reservada serão confirmados imediatamente!
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
