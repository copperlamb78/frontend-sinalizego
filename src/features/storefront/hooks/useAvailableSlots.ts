import { useQuery } from '@tanstack/react-query';
import { storefrontService } from '../services/storefrontService';
import type { AvailableSlotsParams, AvailableSlotsResponse } from '../types/storefront.types';

/**
 * Hook para consulta de horários disponíveis em uma data selecionada
 */
export function useAvailableSlots(params: Partial<AvailableSlotsParams>, enabled: boolean = true) {
  const isReady = Boolean(params.companyId && params.serviceId && params.date);

  const query = useQuery<AvailableSlotsResponse, Error>({
    queryKey: ['available-slots', params.companyId, params.serviceId, params.date],
    queryFn: () => {
      return storefrontService.getAvailableSlots(params as AvailableSlotsParams);
    },
    enabled: enabled && isReady,
    staleTime: 1000 * 30, // 30 segundos para manter vagas atualizadas
  });

  return {
    slots: query.data?.slots || [],
    totalAvailable: query.data?.totalAvailable || 0,
    date: query.data?.date,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
