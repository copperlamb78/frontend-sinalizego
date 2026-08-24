import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        // Never retry client errors (4xx) such as 400, 401, 403, 404, 409, 422, 429
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: false
    }
  }
});
