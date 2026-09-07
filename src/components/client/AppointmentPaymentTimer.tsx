import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentTimerProps {
  createdAt: string;
  expiresAt?: string | null;
  className?: string;
  onExpire?: () => void;
}

const calculateSecondsLeft = (createdAt: string, expiresAt?: string | null): number => {
  const now = Date.now();
  const MAX_WINDOW_MS = 15 * 60 * 1000; // 15 minutos padrão

  let targetTime: number;

  if (expiresAt) {
    const exp = new Date(expiresAt).getTime();
    if (!isNaN(exp) && exp > now) {
      targetTime = exp;
    } else if (!isNaN(exp) && exp <= now) {
      return 0;
    } else {
      const created = new Date(createdAt).getTime();
      targetTime = !isNaN(created) ? created + MAX_WINDOW_MS : now;
    }
  } else {
    const created = new Date(createdAt).getTime();
    targetTime = !isNaN(created) ? created + MAX_WINDOW_MS : now;
  }

  const diffMs = targetTime - now;
  return Math.max(0, Math.floor(diffMs / 1000));
};

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Badge com contagem regressiva em tempo real MM:SS para o Pix
 */
export const AppointmentPaymentTimer: React.FC<PaymentTimerProps> = ({
  createdAt,
  expiresAt,
  className,
  onExpire
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    calculateSecondsLeft(createdAt, expiresAt)
  );

  useEffect(() => {
    // Atualização a cada 1 segundo
    const interval = setInterval(() => {
      const remaining = calculateSecondsLeft(createdAt, expiresAt);
      setSecondsLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, expiresAt, onExpire]);

  const isExpired = secondsLeft <= 0;
  const isUrgent = secondsLeft > 0 && secondsLeft <= 180; // Menos de 3 minutos

  if (isExpired) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-800/80 text-slate-400 border-slate-700 select-none',
          className
        )}
      >
        <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
        <span>Expirado</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border transition-colors select-none',
        isUrgent
          ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse'
          : 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        className
      )}
      title="Tempo restante para efetuar o Pix e garantir sua cadeira"
    >
      <Clock className={cn('w-3 h-3 shrink-0', isUrgent ? 'text-rose-400 animate-spin' : 'text-amber-400')} />
      <span>{formatTime(secondsLeft)}</span>
    </span>
  );
};

/**
 * Aviso explicativo humanizado abaixo do botão de ação ("Cadeira reservada por mais MM:SS")
 */
export const AppointmentPaymentNotice: React.FC<PaymentTimerProps> = ({
  createdAt,
  expiresAt,
  className
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    calculateSecondsLeft(createdAt, expiresAt)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateSecondsLeft(createdAt, expiresAt);
      setSecondsLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, expiresAt]);

  const isExpired = secondsLeft <= 0;
  const isUrgent = secondsLeft > 0 && secondsLeft <= 180;

  if (isExpired) {
    return (
      <p className={cn('text-[11px] text-slate-400 font-medium flex items-center gap-1', className)}>
        <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
        <span>Reserva expirada</span>
      </p>
    );
  }

  return (
    <p
      className={cn(
        'text-[11px] font-medium flex items-center gap-1 transition-colors',
        isUrgent ? 'text-rose-400 font-semibold' : 'text-amber-400/90',
        className
      )}
    >
      <Clock className={cn('w-3 h-3 shrink-0', isUrgent && 'animate-pulse')} />
      <span>Cadeira reservada por mais <strong className="font-mono">{formatTime(secondsLeft)}</strong></span>
    </p>
  );
};
