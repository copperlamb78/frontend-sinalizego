/**
 * Armazenamento centralizado dos tokens de sessão.
 * Única fonte das chaves do localStorage para evitar divergência entre
 * o AuthContext e o interceptor HTTP.
 */
export const TOKEN_KEY = '@sinalizego:token';
export const REFRESH_TOKEN_KEY = '@sinalizego:refresh_token';
export const USER_KEY = '@sinalizego:user';

/** Evento global disparado quando a sessão não pode ser renovada. */
export const SESSION_EXPIRED_EVENT = 'sinalizego:session-expired';

/**
 * Contador monotônico de geração de sessão em memória.
 * Incrementado a cada login, registro ou logout para invalidar respostas
 * assíncronas atrasadas (/auth/me ou /auth/refresh) que estavam em voo.
 */
let sessionEpoch = 0;

export const tokenStorage = {
  getSessionEpoch(): number {
    return sessionEpoch;
  },
  bumpSessionEpoch(): number {
    sessionEpoch += 1;
    return sessionEpoch;
  },
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken?: string | null): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clear(): void {
    sessionEpoch += 1;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    try {
      sessionStorage.clear();
    } catch {
      // Ignora em ambientes restritos
    }
  },
};
