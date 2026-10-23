import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Cancela queries em voo e limpa integralmente o cache em memória do TanStack Query.
 * Deve ser invocado em todo logout, expiração de sessão ou troca de usuário.
 */
export function clearQueryCache(): void {
  queryClient.cancelQueries();
  queryClient.clear();
}
