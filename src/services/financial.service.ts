import { api } from '@/config/api.config';
import type {
  CreateFinancialProfileDto,
  FinancialProfile
} from '@/types/financial.types';

export const financialService = {
  /**
   * Creates an Asaas subaccount and links to the company
   * POST /api/v1/financial-profile
   */
  createFinancialProfile: async (data: CreateFinancialProfileDto): Promise<FinancialProfile> => {
    const response = await api.post<FinancialProfile>('/financial-profile', data);
    return response.data;
  },

  /**
   * Fetches the current financial profile of the company
   * GET /api/v1/financial-profile
   */
  getFinancialProfile: async (): Promise<FinancialProfile | null> => {
    try {
      const response = await api.get<FinancialProfile>('/financial-profile');
      return response.data;
    } catch {
      return null;
    }
  }
};
