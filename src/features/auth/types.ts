export type UserRole =
  | 'CLIENT'
  | 'PROVIDER'
  | 'COMPANY_OWNER'
  | 'EMPLOYEE'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  cpfCnpj?: string | null;
  mustChangePassword?: boolean;
  createdAt?: string;
  isActive?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
