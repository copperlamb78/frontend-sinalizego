import { apiClient } from '@/core/api/client';
import type {
  StorefrontCompany,
  StorefrontEmployee,
  AvailableSlotsParams,
  AvailableSlotsResponse,
} from '../types/storefront.types';

/**
 * Serviço de comunicação com os endpoints da vitrine na API NestJS
 */
export const storefrontService = {
  /**
   * Busca os dados completos e públicos da vitrine do estabelecimento por slug
   * Endpoint: GET /company/slug/:slug
   */
  async getCompanyBySlug(slug: string): Promise<StorefrontCompany> {
    const response = await apiClient.get<StorefrontCompany>(`/company/slug/${encodeURIComponent(slug)}`);
    return response.data;
  },

  /**
   * Busca os profissionais habilitados para o serviço selecionado
   * Endpoint: GET /employees/public/company/:companyId/service/:serviceId
   */
  async getEligibleEmployees(companyId: string, serviceId: string): Promise<StorefrontEmployee[]> {
    const response = await apiClient.get<StorefrontEmployee[]>(
      `/employees/public/company/${encodeURIComponent(companyId)}/service/${encodeURIComponent(serviceId)}`
    );
    return response.data;
  },

  /**
   * Consulta os horários livres para um determinado serviço e data
   * Endpoint: GET /appointments/available-slots
   */
  async getAvailableSlots(params: AvailableSlotsParams): Promise<AvailableSlotsResponse> {
    const response = await apiClient.get<AvailableSlotsResponse>('/appointments/available-slots', {
      params,
    });
    return response.data;
  },
};

