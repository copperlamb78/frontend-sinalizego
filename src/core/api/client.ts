import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { SESSION_EXPIRED_EVENT, tokenStorage } from '../auth/tokenStorage';
import { clearQueryCache } from '../query/queryClient';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Rotas que nunca devem disparar a renovação automática de sessão
 * (evita loop infinito e não mascara erro de credencial no login/cadastro).
 */
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/users/create',
  '/company/create',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
];

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Single-flight: várias requisições com 401 simultâneo compartilham
 * uma única chamada a /auth/refresh (o backend rotaciona o refresh token).
 */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const epochAtStart = tokenStorage.getSessionEpoch();
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error('Sem refresh token');
  }

  // Cliente "cru" para não passar pelos interceptors desta instância
  const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
    `${baseURL}/auth/refresh`,
    null,
    { headers: { Authorization: `Bearer ${refreshToken}` }, timeout: 15000 }
  );

  // Proteção anti-race: se o usuário deslogou ou trocou de sessão enquanto o refresh estava em voo,
  // descarta os novos tokens e não ressuscita a sessão encerrada.
  if (tokenStorage.getSessionEpoch() !== epochAtStart) {
    throw new Error('Sessão encerrada durante refresh');
  }

  tokenStorage.setTokens(data.access_token, data.refresh_token);
  return data.access_token;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';

    const isAuthExcludedPath = NO_REFRESH_PATHS.some((path) => url.includes(path));

    const canRefresh =
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthExcludedPath &&
      Boolean(tokenStorage.getRefreshToken());

    if (!canRefresh) {
      // Se foi um 401 em rota autenticada e não há refresh token disponível (ou já tentou _retry),
      // limpa a sessão local e notifica o AuthContext.
      if (status === 401 && !isAuthExcludedPath && tokenStorage.getAccessToken()) {
        tokenStorage.clear();
        clearQueryCache();
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch {
      // Fail-closed: sessão irrecuperável → limpa storage, cache e avisa o AuthContext
      tokenStorage.clear();
      clearQueryCache();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      return Promise.reject(error);
    }
  }
);

export default apiClient;
