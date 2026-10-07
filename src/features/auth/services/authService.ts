import { apiClient } from '@/core/api/client';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  RegisterCompanyData,
  RegisterCompanyResponse,
  User,
} from '../types';

export const authService = {
  /**
   * Realiza login do usuário com e-mail e senha
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Realiza o cadastro de um novo cliente/usuário na plataforma
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/users/create', data);
    return response.data;
  },

  /**
   * Realiza o cadastro de um novo estabelecimento/empresa com conta de proprietário
   */
  async registerCompany(data: RegisterCompanyData): Promise<RegisterCompanyResponse> {
    const response = await apiClient.post<RegisterCompanyResponse>('/company/create', data);
    return response.data;
  },

  /**
   * Obtém os dados do perfil autenticado
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Encerra a sessão ativa do usuário no backend
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Falha silenciosa em caso de token já expirado
    }
  },
};
