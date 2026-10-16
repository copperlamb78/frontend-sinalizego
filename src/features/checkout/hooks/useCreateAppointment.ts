import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutService } from '../services/checkoutService';
import type { CreateAppointmentPayload, AppointmentDetails } from '../types/checkout.types';

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation<AppointmentDetails, Error, CreateAppointmentPayload>({
    mutationFn: (payload) => checkoutService.createAppointment(payload),
    onSuccess: (data) => {
      // Invalida vagas e dados da vitrine para refletir a nova ocupação
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      queryClient.setQueryData(['checkout', 'appointment', data.id], data);
    },
  });
}
