import { api } from '@/config/api.config';
import type {
  CreateFinancialProfileDto,
  FinancialProfile,
  PixKeyItem,
  CreatePixKeyPayload
} from '@/types/financial.types';

export const financialService = {
  /**
   * Creates an Asaas subaccount and links to the company
   * POST /api/v1/financial-profile/create
   */
  createFinancialProfile: async (data: CreateFinancialProfileDto): Promise<FinancialProfile> => {
    try {
      const response = await api.post<FinancialProfile>('/financial-profile/create', data);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallbackRes = await api.post<FinancialProfile>('/financial-profile', data);
        return fallbackRes.data;
      }
      throw err;
    }
  },

  /**
   * Fetches the current financial profile of the company
   * GET /api/v1/financial-profile/list
   */
  getFinancialProfile: async (): Promise<FinancialProfile | null> => {
    try {
      const response = await api.get<FinancialProfile | FinancialProfile[]>('/financial-profile/list');
      if (Array.isArray(response.data)) {
        return response.data[0] || null;
      }
      return response.data;
    } catch {
      try {
        const fallbackRes = await api.get<FinancialProfile>('/financial-profile');
        return fallbackRes.data;
      } catch {
        return null;
      }
    }
  },

  /**
   * Fetches all registered Pix keys for payouts
   * GET /api/v1/financial-profile/pix-keys
   */
  getPixKeys: async (): Promise<PixKeyItem[]> => {
    const response = await api.get<PixKeyItem[]>('/financial-profile/pix-keys');
    return response.data;
  },

  /**
   * Adds a new Pix key
   * POST /api/v1/financial-profile/pix-keys
   */
  addPixKey: async (data: CreatePixKeyPayload): Promise<PixKeyItem> => {
    const response = await api.post<PixKeyItem>('/financial-profile/pix-keys', data);
    return response.data;
  },

  /**
   * Deletes a Pix key
   * DELETE /api/v1/financial-profile/pix-keys/:id
   */
  deletePixKey: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/financial-profile/pix-keys/${id}`);
    return response.data;
  },

  /**
   * Sets a Pix key as default
   * PATCH /api/v1/financial-profile/pix-keys/:id/default
   */
  setDefaultPixKey: async (id: string): Promise<PixKeyItem> => {
    const response = await api.patch<PixKeyItem>(`/financial-profile/pix-keys/${id}/default`);
    return response.data;
  }
};