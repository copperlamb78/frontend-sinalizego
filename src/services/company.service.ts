import { api } from '@/config/api.config';
import type { CompanyStorefront } from '@/types/company.types';
import { MOCK_VINTAGE_CLUB } from '@/mocks/storefront.mock';

/**
 * Service for public company vitrine/storefront endpoints
 */
export const companyService = {
  /**
   * Fetches full public storefront details by company slug
   * GET /api/v1/company/slug/:slug
   */
  getCompanyBySlug: async (slug: string): Promise<CompanyStorefront> => {
    // Immediate mock for demo slug
    if (slug === 'vintage-club' || slug === 'barbearia-vintage-club') {
      return MOCK_VINTAGE_CLUB;
    }

    try {
      const response = await api.get<CompanyStorefront>(`/company/slug/${slug}`);
      return response.data;
    } catch (err: any) {
      // Fallback for demo when backend is offline or company is not in database yet
      if (slug.includes('vintage') || slug.includes('barbearia')) {
        return MOCK_VINTAGE_CLUB;
      }
      throw err;
    }
  },

  /**
   * Fetches company by ID (or returns mock if demo ID)
   */
  getCompanyById: async (id: string): Promise<CompanyStorefront> => {
    if (id === 'demo-vintage-club-id') {
      return MOCK_VINTAGE_CLUB;
    }
    try {
      const response = await api.get<CompanyStorefront>(`/company/${id}`);
      return response.data;
    } catch (err: any) {
      return MOCK_VINTAGE_CLUB;
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
