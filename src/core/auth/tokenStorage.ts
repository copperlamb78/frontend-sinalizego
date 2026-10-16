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

export const tokenStorage = {
  getAccessToken(): string | null {
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
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
