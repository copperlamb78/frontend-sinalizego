import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthTokens } from '../types/auth.types';

const getApiBaseUrl = () => {
  // Se estiver executando no navegador:
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isDirectLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    // Se estiver em túnel ngrok, rede externa ou HTTPS, utilizar obrigatoriamente rota relativa
    // para aproveitar o proxy do Vite e evitar bloqueio de Mixed Content (HTTPS -> HTTP) ou localhost inválido no celular
    if (!isDirectLocalhost || window.location.protocol === 'https:') {
      return '/api/v1';
    }
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Em ambiente de desenvolvimento ou produção com proxy Vite/Vercel, rota relativa é a mais confiável
  return '/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export const ACCESS_TOKEN_KEY = '@sinalizego:access_token';
export const REFRESH_TOKEN_KEY = '@sinalizego:refresh_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Helper functions for token management
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setAuthTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  window.dispatchEvent(new Event('auth-tokens-updated'));
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event('auth-tokens-cleared'));
};

// Queue handling for concurrent 401 requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and Auto-Refresh with Resilience
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't retry if the request was to refresh token itself or login/register
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/logout');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // If already refreshing, push into queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            const token = getAccessToken();
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuthTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Endpoint: POST /auth/refresh with Bearer <refresh_token>
        const { data } = await axios.post<AuthTokens>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          }
        );

        setAuthTokens(data);
        processQueue(null);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        clearAuthTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
