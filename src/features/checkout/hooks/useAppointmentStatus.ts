import { useQuery } from '@tanstack/react-query';
import { checkoutService } from '../services/checkoutService';
import type { AppointmentDetails } from '../types/checkout.types';

export function useAppointmentStatus(
  appointmentId: string | null | undefined,
  options?: {
    enabled?: boolean;
    pollIntervalMs?: number;
  }
) {
  const enabled = options?.enabled ?? true;
  const pollIntervalMs = options?.pollIntervalMs ?? 5000;

  return useQuery<AppointmentDetails, Error>({
    queryKey: ['checkout', 'appointment', appointmentId],
    queryFn: () => {
      if (!appointmentId) throw new Error('ID do agendamento é obrigatório');
      return checkoutService.getAppointmentById(appointmentId);
    },
    enabled: Boolean(appointmentId && enabled),
    refetchInterval: (query) => {
      const data = query.state.data;
      // Mantém o polling ativo apenas enquanto a reserva estiver aguardando pagamento
      if (data && data.status === 'PENDING_PAYMENT') {
        return pollIntervalMs;
      }
      return false;
    },
    refetchIntervalInBackground: false,
    staleTime: 1000 * 2,
  });
}
