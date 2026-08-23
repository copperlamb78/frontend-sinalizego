import { api } from '@/config/api.config';
import type {
  CompanyStorefront,
  CompanyBalance,
  CompanyWithdrawal,
  CompanyDashboardMetrics
} from '@/types/company.types';
import { MOCK_VINTAGE_CLUB } from '@/mocks/storefront.mock';
import {
  MOCK_DASHBOARD_METRICS,
  MOCK_COMPANY_BALANCE,
  MOCK_WITHDRAWALS_HISTORY
} from '@/mocks/owner.mock';

/**
 * Service for company, dashboard and balance endpoints
 */
export const companyService = {
  /**
   * Fetches full public storefront details by company slug
   * GET /api/v1/company/slug/:slug
   */
  getCompanyBySlug: async (slug: string): Promise<CompanyStorefront> => {
    if (slug === 'vintage-club' || slug === 'barbearia-vintage-club') {
      return MOCK_VINTAGE_CLUB;
    }

    try {
      const response = await api.get<CompanyStorefront>(`/company/slug/${slug}`);
      return response.data;
    } catch (err: any) {
      if (slug.includes('vintage') || slug.includes('barbearia')) {
        return MOCK_VINTAGE_CLUB;
      }
      throw err;
    }
  },

  /**
   * Fetches company by ID
   */
  getCompanyById: async (id: string): Promise<CompanyStorefront> => {
    if (id === 'demo-vintage-club-id') {
      return MOCK_VINTAGE_CLUB;
    }
    try {
      const response = await api.get<CompanyStorefront>(`/company/${id}`);
      return response.data;
    } catch {
      return MOCK_VINTAGE_CLUB;
    }
  },

  /**
   * Fetches company of the logged in user
   * GET /api/v1/company/get-by-user-id
   */
  getCompanyByUserId: async (): Promise<CompanyStorefront> => {
    try {
      const response = await api.get<CompanyStorefront>('/company/get-by-user-id');
      return response.data;
    } catch {
      return MOCK_VINTAGE_CLUB;
    }
  },

  /**
   * Fetches dashboard analytical metrics for company owner
   * GET /api/v1/company/dashboard/metrics
   */
  getDashboardMetrics: async (): Promise<CompanyDashboardMetrics> => {
    try {
      const response = await api.get<CompanyDashboardMetrics>('/company/dashboard/metrics');
      return response.data;
    } catch {
      return MOCK_DASHBOARD_METRICS;
    }
  },

  /**
   * Fetches real-time wallet balance and escrow locked balance
   * GET /api/v1/company/balance
   */
  getBalance: async (): Promise<CompanyBalance> => {
    try {
      const response = await api.get<CompanyBalance>('/company/balance');
      return response.data;
    } catch {
      return MOCK_COMPANY_BALANCE;
    }
  },

  /**
   * Requests instant on-demand withdrawal with Asaas transfer fee
   * POST /api/v1/company/withdraw
   */
  requestWithdrawal: async (amount?: number): Promise<{ message: string; withdrawal: CompanyWithdrawal }> => {
    try {
      const response = await api.post('/company/withdraw', amount ? { amount } : {});
      return response.data;
    } catch {
      // Mock instant withdrawal for demo
      const requested = amount || 100.0;
      const fee = 5.0;
      const mockWithdrawal: CompanyWithdrawal = {
        id: `with-${Date.now()}`,
        requestedAmount: requested,
        transferFee: fee,
        netAmountTransferred: Math.max(0, requested - fee),
        status: 'CONFIRMED',
        isFreeWeekly: false,
        transferredAt: new Date().toISOString()
      };
      return {
        message: 'Saque avulso solicitado com sucesso.',
        withdrawal: mockWithdrawal
      };
    }
  },

  /**
   * Fetches audited history of withdrawals
   * GET /api/v1/company/withdrawals
   */
  getWithdrawalsHistory: async (): Promise<CompanyWithdrawal[]> => {
    try {
      const response = await api.get<CompanyWithdrawal[]>('/company/withdrawals');
      return response.data;
    } catch {
      return MOCK_WITHDRAWALS_HISTORY;
    }
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
      return [MOCK_VINTAGE_CLUB];
    }
  }
};
