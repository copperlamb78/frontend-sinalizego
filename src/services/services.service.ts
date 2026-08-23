import { api } from '@/config/api.config';
import type {
  ServiceGroup,
  CompanyService,
  CreateServiceDto,
  CreateServiceGroupDto
} from '@/types/company.types';
import { MOCK_VINTAGE_CLUB } from '@/mocks/storefront.mock';

export const servicesService = {
  /**
   * Fetches service groups with their services
   * GET /api/v1/service-group
   */
  getServiceGroups: async (): Promise<ServiceGroup[]> => {
    try {
      const response = await api.get<ServiceGroup[]>('/service-group');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return MOCK_VINTAGE_CLUB.serviceGroups;
    } catch {
      return MOCK_VINTAGE_CLUB.serviceGroups;
    }
  },

  /**
   * Creates a new service category/group
   * POST /api/v1/service-group
   */
  createServiceGroup: async (data: CreateServiceGroupDto): Promise<ServiceGroup> => {
    try {
      const response = await api.post<ServiceGroup>('/service-group', data);
      return response.data;
    } catch {
      return {
        id: `grp-${Date.now()}`,
        name: data.name,
        capacity: data.capacity || 3,
        services: []
      };
    }
  },

  /**
   * Updates an existing service group
   * PATCH /api/v1/service-group/:id
   */
  updateServiceGroup: async (id: string, data: Partial<CreateServiceGroupDto>): Promise<ServiceGroup> => {
    try {
      const response = await api.patch<ServiceGroup>(`/service-group/${id}`, data);
      return response.data;
    } catch {
      return {
        id,
        name: data.name || 'Categoria Atualizada',
        capacity: data.capacity || 3,
        services: []
      };
    }
  },

  /**
   * Deletes a service group
   * DELETE /api/v1/service-group/:id
   */
  deleteServiceGroup: async (id: string): Promise<void> => {
    try {
      await api.delete(`/service-group/${id}`);
    } catch {
      // ignore in mock
    }
  },

  /**
   * Creates a new service inside a category
   * POST /api/v1/company-service
   */
  createService: async (data: CreateServiceDto): Promise<CompanyService> => {
    try {
      const response = await api.post<CompanyService>('/company-service', data);
      return response.data;
    } catch {
      return {
        id: `srv-${Date.now()}`,
        name: data.name,
        description: data.description,
        durationMinutes: data.durationMinutes,
        totalPrice: data.totalPrice,
        downPaymentPercent: data.downPaymentPercent,
        serviceGroupId: data.serviceGroupId,
        isActive: true
      };
    }
  },

  /**
   * Updates a service
   * PATCH /api/v1/company-service/:id
   */
  updateService: async (id: string, data: Partial<CreateServiceDto>): Promise<CompanyService> => {
    try {
      const response = await api.patch<CompanyService>(`/company-service/${id}`, data);
      return response.data;
    } catch {
      return {
        id,
        name: data.name || 'Serviço',
        description: data.description,
        durationMinutes: data.durationMinutes || 30,
        totalPrice: data.totalPrice || 40,
        downPaymentPercent: data.downPaymentPercent || 50,
        serviceGroupId: data.serviceGroupId,
        isActive: true
      };
    }
  },

  /**
   * Deletes a service
   * DELETE /api/v1/company-service/:id
   */
  deleteService: async (id: string): Promise<void> => {
    try {
      await api.delete(`/company-service/${id}`);
    } catch {
      // ignore in mock
    }
  }
};
