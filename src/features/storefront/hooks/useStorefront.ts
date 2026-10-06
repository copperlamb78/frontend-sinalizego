import { useQuery } from '@tanstack/react-query';
import { storefrontService } from '../services/storefrontService';
import { mockStorefrontCompany } from '../data/mockStorefront';
import type { StorefrontCompany } from '../types/storefront.types';

/**
 * Hook para carregar dados públicos da vitrine do estabelecimento
 */
export function useStorefront(slug?: string) {
  const query = useQuery<StorefrontCompany, Error>({
    queryKey: ['storefront', slug],
    queryFn: async () => {
      if (!slug) {
        throw new Error('Identificador do estabelecimento não informado.');
      }
      try {
        return await storefrontService.getCompanyBySlug(slug);
      } catch (err: any) {
        // Se a API backend não estiver ativa no momento em desenvolvimento local,
        // utilizamos o mock oficial correspondente para não travar a visualização do usuário
        if (
          import.meta.env.DEV &&
          (!err.response ||
            err.response.status === 500 ||
            err.code === 'ERR_NETWORK' ||
            err.message?.includes('Network Error'))
        ) {
          console.warn('[Storefront] API offline. Carregando dados de demonstração da API NestJS.');
          return mockStorefrontCompany;
        }
        throw err;
      }
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache inteligente
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 1;
    },
  });

  return {
    company: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isNotFound: (query.error as any)?.response?.status === 404,
  };
}
