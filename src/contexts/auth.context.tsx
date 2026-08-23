import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  api,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens
} from '@/config/api.config';
import type { User, AuthTokens, AuthResponse, LoginDto } from '@/types/auth.types';
import { Role } from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<AuthResponse>;
  loginAsDemoOwner: () => void;
  loginAsDemoClient: () => void;
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
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    // If it's a demo token, keep the mock user
    if (token.startsWith('demo-token-')) {
      setIsLoading(false);
      return user;
    }

    try {
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
      localStorage.setItem('@sinalizego:user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.warn('Failed to hydrate user profile:', error);
      clearAuthTokens();
      localStorage.removeItem('@sinalizego:user');
      setUser(null);
      setTokensState(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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
      const response = await api.post<AuthResponse>('/auth/login', dto);
      const { access_token, refresh_token, user: userData } = response.data;
      updateTokens({ access_token, refresh_token });
      setUser(userData);
      localStorage.setItem('@sinalizego:user', JSON.stringify(userData));
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Login Helper for Testing
  const loginAsDemoOwner = () => {
    const demoOwner: User = {
      id: 'demo-owner-id',
      name: 'Carlos Alberto (Barbeiro)',
      email: 'carlos@vintageclub.com',
      phone: '11999998888',
      role: Role.COMPANY_OWNER,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const demoTokens = {
      access_token: `demo-token-${Date.now()}`,
      refresh_token: `demo-refresh-${Date.now()}`
    };
    updateTokens(demoTokens);
    setUser(demoOwner);
    localStorage.setItem('@sinalizego:user', JSON.stringify(demoOwner));
  };

  const loginAsDemoClient = () => {
    const demoClient: User = {
      id: 'demo-client-id',
      name: 'Rafael Oliveira',
      email: 'rafael@exemplo.com',
      phone: '11988887777',
      role: Role.CLIENT,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const demoTokens = {
      access_token: `demo-token-client-${Date.now()}`,
      refresh_token: `demo-refresh-client-${Date.now()}`
    };
    updateTokens(demoTokens);
    setUser(demoClient);
    localStorage.setItem('@sinalizego:user', JSON.stringify(demoClient));
  };

  // Logout handler
  const logout = async (): Promise<void> => {
    try {
      if (getAccessToken() && !getAccessToken()?.startsWith('demo-')) {
        await api.post('/auth/logout').catch(() => null);
      }
    } finally {
      clearAuthTokens();
      localStorage.removeItem('@sinalizego:user');
      setUser(null);
      setTokensState(null);
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    login,
    loginAsDemoOwner,
    loginAsDemoClient,
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
