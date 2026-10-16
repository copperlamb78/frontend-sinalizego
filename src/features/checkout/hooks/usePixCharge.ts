import { useQuery } from '@tanstack/react-query';
import { checkoutService } from '../services/checkoutService';
import type { PixChargeResponse } from '../types/checkout.types';

export function usePixCharge(appointmentId: string | null | undefined, enabled: boolean = true) {
  return useQuery<PixChargeResponse, Error>({
    queryKey: ['checkout', 'pix', appointmentId],
    queryFn: () => {
      if (!appointmentId) throw new Error('ID do agendamento é obrigatório');
      return checkoutService.getPixCharge(appointmentId);
    },
    enabled: Boolean(appointmentId && enabled),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache para a cobrança gerada
    retry: 1,
  });
}
