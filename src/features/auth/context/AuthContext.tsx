import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import {
  tokenStorage,
  TOKEN_KEY,
  USER_KEY,
  SESSION_EXPIRED_EVENT,
  clearQueryCache,
} from '@/core';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  RegisterCompanyData,
  RegisterCompanyResponse,
  User,
} from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (data: RegisterData) => Promise<{ registerResponse: RegisterResponse; loginResponse?: LoginResponse }>;
  registerCompany: (data: RegisterCompanyData) => Promise<RegisterCompanyResponse>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return tokenStorage.getAccessToken();
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedToken = tokenStorage.getAccessToken();
    const savedUser = localStorage.getItem(USER_KEY);
    if (!savedToken || !savedUser) return null;
    try {
      const parsed = JSON.parse(savedUser) as User;
      if (!parsed || !parsed.id || parsed.isActive === false) {
        tokenStorage.clear();
        return null;
      }
      return parsed;
    } catch {
      tokenStorage.clear();
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clearLocalSession = useCallback(() => {
    tokenStorage.clear();
    clearQueryCache();
    setToken(null);
    setUser(null);
  }, []);

  // Validação e restauração de sessão no backend + sincronização multi-aba
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const savedToken = tokenStorage.getAccessToken();
      if (!savedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      const epoch = tokenStorage.getSessionEpoch();

      try {
        const freshUser = await authService.getMe();
        if (!isMounted || tokenStorage.getSessionEpoch() !== epoch) {
          return;
        }

        if (!freshUser || !freshUser.id || freshUser.isActive === false) {
          clearLocalSession();
          return;
        }

        setToken(tokenStorage.getAccessToken());
        setUser(freshUser);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      } catch (err: unknown) {
        if (!isMounted || tokenStorage.getSessionEpoch() !== epoch) {
          return;
        }
        // Fail-closed se o token foi rejeitado (401/403) ou se o interceptor limpou o token
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403 || !tokenStorage.getAccessToken()) {
          clearLocalSession();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    const handleSessionExpired = () => {
      clearLocalSession();
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === null ||
        ((event.key === TOKEN_KEY || event.key === USER_KEY) && !event.newValue)
      ) {
        clearLocalSession();
      }
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [clearLocalSession]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const data = await authService.login(credentials);
    clearQueryCache();
    tokenStorage.bumpSessionEpoch();
    tokenStorage.setTokens(data.access_token, data.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(
    async (
      registerData: RegisterData
    ): Promise<{ registerResponse: RegisterResponse; loginResponse?: LoginResponse }> => {
      const registerResponse = await authService.register(registerData);

      // Autenticação automática logo após o cadastro
      try {
        const loginResponse = await authService.login({
          email: registerData.email,
          password: registerData.password,
        });
        clearQueryCache();
        tokenStorage.bumpSessionEpoch();
        tokenStorage.setTokens(loginResponse.access_token, loginResponse.refresh_token);
        localStorage.setItem(USER_KEY, JSON.stringify(loginResponse.user));
        setToken(loginResponse.access_token);
        setUser(loginResponse.user);
        return { registerResponse, loginResponse };
      } catch {
        return { registerResponse };
      }
    },
    []
  );

  const registerCompany = useCallback(
    async (companyData: RegisterCompanyData): Promise<RegisterCompanyResponse> => {
      const response = await authService.registerCompany(companyData);
      clearQueryCache();
      tokenStorage.bumpSessionEpoch();
      tokenStorage.setTokens(response.access_token, response.refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setToken(response.access_token);
      setUser(response.user);
      return response;
    },
    []
  );

  const logout = useCallback(async () => {
    const currentToken = tokenStorage.getAccessToken();
    // 1. Limpeza local síncrona imediata (Zero-Latency UX, invalida epoch, storage e cache)
    clearLocalSession();
    // 2. Notificação assíncrona fire-and-forget ao backend para revogar refreshToken no banco
    void authService.logout(currentToken);
  }, [clearLocalSession]);

  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        register,
        registerCompany,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um <AuthProvider>');
  }
  return context;
};
