import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { tokenStorage, USER_KEY, SESSION_EXPIRED_EVENT } from '@/core';
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
    const savedUser = localStorage.getItem(USER_KEY);
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser) as User;
    } catch {
      tokenStorage.clear();
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validação e restauração de sessão no backend
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const savedToken = tokenStorage.getAccessToken();
      if (!savedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const freshUser = await authService.getMe();
        if (isMounted) {
          setUser(freshUser);
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        }
      } catch {
        // Se o token for inválido e não puder ser renovado, limpa o estado
        if (isMounted) {
          tokenStorage.clear();
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      isMounted = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const data = await authService.login(credentials);
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
      tokenStorage.setTokens(response.access_token, response.refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setToken(response.access_token);
      setUser(response.user);
      return response;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      tokenStorage.clear();
      setToken(null);
      setUser(null);
    }
  }, []);

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
