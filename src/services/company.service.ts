import { api } from '@/config/api.config';
import type {
  CompanyStorefront,
  CompanyBalance,
  CompanyWithdrawal,
  CompanyDashboardMetrics,
  UpdateCompanyDto
} from '@/types/company.types';

export interface CreateCompanyPayload {
  businessName: string;
  providerType: string;
  phone: string;
  state: string;
  city: string;
  district?: string;
  street?: string;
  zipCode?: string;
  number?: string;
  chairsCount?: number;
}

export interface CreateCompanyResponse {
  message: string;
  company: CompanyStorefront;
  access_token: string;
  refresh_token: string;
}

/**
 * Service for company, dashboard and balance endpoints
 */
export const companyService = {
  /**
   * Fetches full public storefront details by company slug
   * GET /api/v1/company/slug/:slug
   */
  getCompanyBySlug: async (slug: string): Promise<CompanyStorefront> => {
    const response = await api.get<CompanyStorefront>(`/company/slug/${slug}`);
    return response.data;
  },

  /**
   * Fetches company by ID
   * GET /api/v1/company/:id
   */
  getCompanyById: async (id: string): Promise<CompanyStorefront> => {
    const response = await api.get<CompanyStorefront>(`/company/${id}`);
    return response.data;
  },

  /**
   * Fetches company of the logged in user
   * GET /api/v1/company/get-by-user-id
   */
  getCompanyByUserId: async (): Promise<CompanyStorefront> => {
    const response = await api.get<CompanyStorefront>('/company/get-by-user-id');
    return response.data;
  },

  /**
   * Creates a new company, generating slug automatically and elevating role to COMPANY_OWNER
   * POST /api/v1/company/create
   */
  createCompany: async (data: CreateCompanyPayload): Promise<CreateCompanyResponse> => {
    const response = await api.post<CreateCompanyResponse>('/company/create', data);
    return response.data;
  },

  /**
   * Updates company info (name, address, whatsapp, banner, logo, etc.)
   * PATCH /api/v1/company/update/:companyId
   */
  updateCompany: async (companyId: string, data: UpdateCompanyDto): Promise<CompanyStorefront> => {
    const response = await api.patch<CompanyStorefront>(`/company/update/${companyId}`, data);
    return response.data;
  },

  /**
   * Uploads image (logo / banner)
   * POST /api/v1/upload/image
   */
  uploadPhoto: async (file: File, companyId?: string): Promise<{ url: string; public_id?: string; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (companyId) {
      formData.append('companyId', companyId);
    }
    const response = await api.post<{ url: string; public_id?: string; message?: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Fetches dashboard analytical metrics for company owner
   * GET /api/v1/company/dashboard/metrics
   */
  getDashboardMetrics: async (params?: { startDate?: string; endDate?: string }): Promise<CompanyDashboardMetrics> => {
    const response = await api.get<CompanyDashboardMetrics>('/company/dashboard/metrics', { params });
    return response.data;
  },

  /**
   * Fetches real-time wallet balance and escrow locked balance
   * GET /api/v1/company/balance
   */
  getBalance: async (): Promise<CompanyBalance> => {
    const response = await api.get<CompanyBalance>('/company/balance');
    return response.data;
  },

  /**
   * Requests instant on-demand withdrawal with Asaas transfer fee
   * POST /api/v1/company/withdraw
   */
  requestWithdrawal: async (amount?: number): Promise<{ message: string; withdrawal: CompanyWithdrawal }> => {
    const response = await api.post<{ message: string; withdrawal: CompanyWithdrawal }>(
      '/company/withdraw',
      amount ? { amount } : {}
    );
    return response.data;
  },

  /**
   * Fetches audited history of withdrawals
   * GET /api/v1/company/withdrawals
   */
  getWithdrawalsHistory: async (): Promise<CompanyWithdrawal[]> => {
    const response = await api.get<CompanyWithdrawal[]>('/company/withdrawals');
    return response.data;
  },

  /**
   * Fetches public list of establishments
   * GET /api/v1/company/list
   */
  listCompanies: async (): Promise<CompanyStorefront[]> => {
    try {
      const response = await api.get<CompanyStorefront[]>('/company/list');
      return response.data;
    } catch {
      return [];
    }
  },

  /**
   * Deactivates company (Soft delete)
   * DELETE /api/v1/company/deactivate/:companyId
   */
  deactivateCompany: async (companyId: string): Promise<{ id: string; isActive: boolean }> => {
    const response = await api.delete<{ id: string; isActive: boolean }>(`/company/deactivate/${companyId}`);
    return response.data;
  },

  /**
   * Activates company
   * PATCH /api/v1/company/activate/:companyId
   */
  activateCompany: async (companyId: string): Promise<{ id: string; isActive: boolean }> => {
    const response = await api.patch<{ id: string; isActive: boolean }>(`/company/activate/${companyId}`);
    return response.data;
  }
};
