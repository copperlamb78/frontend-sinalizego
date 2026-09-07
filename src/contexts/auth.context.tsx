import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens
} from '@/config/api.config';
import { authService } from '@/services/auth.service';
import { queryClient } from '@/config/query-client';
import type { User, AuthTokens, AuthResponse, LoginDto } from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateTokens: (tokens: AuthTokens) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('@sinalizego:user');
      if (savedUser) return JSON.parse(savedUser);
    } catch {
      // ignore
    }
    return null;
  });

  const [tokens, setTokensState] = useState<AuthTokens | null>(() => {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    if (access && refresh) {
      return { access_token: access, refresh_token: refresh };
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch current authenticated user profile
  const refreshProfile = useCallback(async (): Promise<User | null> => {
    const token = getAccessToken();
    const refreshToken = getRefreshToken();

    // Se não houver nenhum token armazenado, o usuário definitivamente não está autenticado
    if (!token && !refreshToken) {
      setUser(null);
      setTokensState(null);
      setIsLoading(false);
      return null;
    }

    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('@sinalizego:user', JSON.stringify(userData));
      return userData;
    } catch (error: any) {
      console.warn('Falha ao hidratar perfil do usuário:', error?.message || error);

      // CRÍTICO: Só remove a sessão se o servidor explicitamente rejeitar a autenticação
      // e o refresh token já não existir ou falhar na renovação.
      // Erros de rede/timeout transitórios (ex: Ctrl+Shift+R que corta requisição) NUNCA encerram a sessão!
      const status = error?.response?.status;
      const currentRefresh = getRefreshToken();

      if ((status === 401 || status === 403) && !currentRefresh) {
        clearAuthTokens();
        localStorage.removeItem('@sinalizego:user');
        setUser(null);
        setTokensState(null);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync token changes to context state and localStorage
  const updateTokens = useCallback((newTokens: AuthTokens) => {
    setAuthTokens(newTokens);
    setTokensState(newTokens);
  }, []);

  // Initial load
  useEffect(() => {
    refreshProfile();

    const handleTokensCleared = () => {
      setUser(null);
      setTokensState(null);
      localStorage.removeItem('@sinalizego:user');
      queryClient.clear();
    };

    const handleTokensUpdated = () => {
      const access = getAccessToken();
      const refresh = getRefreshToken();
      if (access && refresh) {
        setTokensState({ access_token: access, refresh_token: refresh });
      }
    };

    window.addEventListener('auth-tokens-cleared', handleTokensCleared);
    window.addEventListener('auth-tokens-updated', handleTokensUpdated);

    return () => {
      window.removeEventListener('auth-tokens-cleared', handleTokensCleared);
      window.removeEventListener('auth-tokens-updated', handleTokensUpdated);
    };
  }, [refreshProfile]);

  // Login handler
  const login = async (dto: LoginDto): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(dto);
      const { access_token, refresh_token, user: userData } = response;
      updateTokens({ access_token, refresh_token });
      setUser(userData);
      localStorage.setItem('@sinalizego:user', JSON.stringify(userData));
      queryClient.clear();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async (): Promise<void> => {
    try {
      if (getAccessToken()) {
        await authService.logout().catch(() => null);
      }
    } finally {
      clearAuthTokens();
      localStorage.removeItem('@sinalizego:user');
      setUser(null);
      setTokensState(null);
      queryClient.clear();
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user || (!!tokens?.access_token || !!tokens?.refresh_token),
    isLoading,
    login,
    logout,
    updateTokens,
    setUser,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
