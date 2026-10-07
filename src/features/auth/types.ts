export type UserRole =
  | 'CLIENT'
  | 'PROVIDER'
  | 'COMPANY_OWNER'
  | 'EMPLOYEE'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export interface Company {
  id: string;
  businessName: string;
  slug: string;
  providerType?: string;
  district?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  number?: string;
  whatsapp?: string;
}

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
  companies?: Company[];
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

export interface RegisterCompanyData {
  name: string;
  email: string;
  password: string;
  phone: string;
  providerType: string;
  businessName: string;
  state: string;
  city: string;
  district: string;
  street: string;
  zipCode: string;
  number: string;
  referralCode?: string;
}

export interface RegisterCompanyResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
