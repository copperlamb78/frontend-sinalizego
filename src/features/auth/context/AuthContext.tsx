import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';
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

const TOKEN_KEY = '@sinalizego:token';
const USER_KEY = '@sinalizego:user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validação e restauração de sessão no backend
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
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
        // Se o token for inválido ou expirado, limpa o estado com segurança
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
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

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const data = await authService.login(credentials);
    localStorage.setItem(TOKEN_KEY, data.access_token);
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
        localStorage.setItem(TOKEN_KEY, loginResponse.access_token);
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
      localStorage.setItem(TOKEN_KEY, response.access_token);
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
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
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
