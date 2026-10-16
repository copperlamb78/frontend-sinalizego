import { useState, useEffect, useMemo } from 'react';

interface UseCountdownProps {
  expiresAt: string | null | undefined;
  onExpire?: () => void;
}

export interface UseCountdownResult {
  formattedTime: string;
  isExpired: boolean;
  secondsRemaining: number;
  progressPercent: number; // 0 a 100
}

const TOTAL_HOLD_SECONDS = 15 * 60; // 15 minutos em segundos

export function useCountdown({ expiresAt, onExpire }: UseCountdownProps): UseCountdownResult {
  const targetTimestamp = useMemo(() => {
    if (!expiresAt) return null;
    const time = new Date(expiresAt).getTime();
    return isNaN(time) ? null : time;
  }, [expiresAt]);

  const calculateRemaining = () => {
    if (!targetTimestamp) return 0;
    const diff = Math.floor((targetTimestamp - Date.now()) / 1000);
    return Math.max(0, diff);
  };

  const [secondsRemaining, setSecondsRemaining] = useState<number>(calculateRemaining);

  useEffect(() => {
    setSecondsRemaining(calculateRemaining());

    if (!targetTimestamp) return;

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, onExpire]);

  const isExpired = secondsRemaining <= 0 && Boolean(targetTimestamp);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [secondsRemaining]);

  const progressPercent = useMemo(() => {
    return Math.min(100, Math.max(0, (secondsRemaining / TOTAL_HOLD_SECONDS) * 100));
  }, [secondsRemaining]);

  return {
    formattedTime,
    isExpired,
    secondsRemaining,
    progressPercent,
  };
}
