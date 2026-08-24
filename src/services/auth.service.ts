import { api } from '@/config/api.config';
import type {
  User,
  AuthResponse,
  AuthTokens,
  LoginDto,
  RegisterDto
} from '@/types/auth.types';

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword?: string;
  password?: string;
}

export interface ChangePasswordDto {
  oldPassword?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
}

export interface UpdateCpfDto {
  cpfCnpj: string;
}

export const authService = {
  /**
   * Authenticates user with email and password
   * POST /api/v1/auth/login
   */
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', dto);
    return response.data;
  },

  /**
   * Refreshes access token with refresh token
   * POST /api/v1/auth/refresh
   */
  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>(
      '/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      }
    );
    return response.data;
  },

  /**
   * Fetches current authenticated user profile
   * GET /api/v1/auth/me
   */
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Logs out user session
   * POST /api/v1/auth/logout
   */
  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  /**
   * Requests password reset link by email
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword: async (dto: ForgotPasswordDto): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', dto);
    return response.data;
  },

  /**
   * Resets password using reset token
   * POST /api/v1/auth/reset-password
   */
  resetPassword: async (dto: ResetPasswordDto): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', {
      token: dto.token,
      newPassword: dto.newPassword || dto.password
    });
    return response.data;
  },

  /**
   * Registers a new user account
   * POST /api/v1/users/create
   */
  register: async (dto: RegisterDto): Promise<{ message: string; user: User }> => {
    const response = await api.post<{ message: string; user: User }>('/users/create', dto);
    return response.data;
  },

  /**
   * Updates basic profile details
   * PATCH /api/v1/users/update
   */
  updateProfile: async (dto: UpdateProfileDto): Promise<User> => {
    const response = await api.patch<User>('/users/update', dto);
    return response.data;
  },

  /**
   * Updates user CPF/CNPJ and generates mirror customer in Asaas
   * PATCH /api/v1/users/update-cpf
   */
  updateCpf: async (dto: UpdateCpfDto): Promise<{ message: string; user: Partial<User> }> => {
    const response = await api.patch<{ message: string; user: Partial<User> }>('/users/update-cpf', dto);
    return response.data;
  },

  /**
   * Changes authenticated user password
   * PATCH /api/v1/users/change-password
   */
  changePassword: async (dto: ChangePasswordDto): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>('/users/change-password', {
      oldPassword: dto.oldPassword || dto.currentPassword,
      newPassword: dto.newPassword
    });
    return response.data;
  },

  /**
   * Deactivates the user's own account (Soft Delete)
   * DELETE /api/v1/users/me
   */
  deleteAccount: async (): Promise<{ id: string; isActive: boolean; disabledAt?: string }> => {
    const response = await api.delete<{ id: string; isActive: boolean; disabledAt?: string }>('/users/me');
    return response.data;
  }
};
