import { api } from '@/config/api.config';

export interface ClientCreditItem {
  id: string;
  amount: number;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  usedAt?: string | null;
  company?: {
    id: string;
    businessName: string;
    slug: string;
    logoPhoto?: string | null;
    district?: string;
    city?: string;
  };
}

export interface AvailableByCompany {
  companyId: string;
  businessName: string;
  slug: string;
  logoPhoto?: string | null;
  totalAmount: number;
  items: ClientCreditItem[];
}

export interface MyCreditsResponse {
  totalAvailable: number;
  availableByCompany: AvailableByCompany[];
  allCredits: ClientCreditItem[];
}

export interface CompanyCreditBalanceResponse {
  companyId: string;
  availableAmount: number;
  creditsCount: number;
  credits: Array<{
    id: string;
    amount: number;
    expiresAt: string;
  }>;
}

export const clientCreditsService = {
  /**
   * Retorna os créditos do cliente autenticado
   * GET /api/v1/client-credits/me
   */
  getMyCredits: async (): Promise<MyCreditsResponse> => {
    const response = await api.get<MyCreditsResponse>('/client-credits/me');
    return response.data;
  },

  /**
   * Retorna o saldo disponível de créditos do cliente em uma empresa específica
   * GET /api/v1/client-credits/company/:companyId
   */
  getCompanyCreditBalance: async (companyId: string): Promise<CompanyCreditBalanceResponse> => {
    const response = await api.get<CompanyCreditBalanceResponse>(`/client-credits/company/${companyId}`);
    return response.data;
  },

  /**
   * Retorna os créditos emitidos pela empresa (para o dono)
   * GET /api/v1/client-credits/company/:companyId/owner
   */
  getCompanyCreditsForOwner: async (companyId: string) => {
    const response = await api.get(`/client-credits/company/${companyId}/owner`);
    return response.data;
  },
};
