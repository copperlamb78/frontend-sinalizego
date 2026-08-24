import { api } from '@/config/api.config';
import type {
  ServiceGroup,
  CompanyService,
  CreateServiceDto,
  CreateServiceGroupDto
} from '@/types/company.types';

export const servicesService = {
  /**
   * Fetches service groups with their services
   * GET /api/v1/service-group
   */
  getServiceGroups: async (): Promise<ServiceGroup[]> => {
    const response = await api.get<ServiceGroup[]>('/service-group');
    return response.data;
  },

  /**
   * Fetches service groups for a specific company
   * GET /api/v1/service-group/company/:companyId
   */
  getServiceGroupsByCompany: async (companyId: string): Promise<ServiceGroup[]> => {
    const response = await api.get<ServiceGroup[]>(`/service-group/company/${companyId}`);
    return response.data;
  },

  /**
   * Creates a new service category/group
   * POST /api/v1/service-group
   */
  createServiceGroup: async (data: CreateServiceGroupDto): Promise<ServiceGroup> => {
    const response = await api.post<ServiceGroup>('/service-group', data);
    return response.data;
  },

  /**
   * Updates an existing service group
   * PUT /api/v1/service-group/:id
   */
  updateServiceGroup: async (id: string, data: Partial<CreateServiceGroupDto>): Promise<ServiceGroup> => {
    const response = await api.put<ServiceGroup>(`/service-group/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a service group
   * DELETE /api/v1/service-group/:id
   */
  deleteServiceGroup: async (id: string): Promise<void> => {
    await api.delete(`/service-group/${id}`);
  },

  /**
   * Fetches all active services of the company
   * GET /api/v1/company-service/list
   */
  getCompanyServices: async (): Promise<CompanyService[]> => {
    try {
      const response = await api.get<CompanyService[]>('/company-service/list');
      return response.data;
    } catch {
      const fallbackRes = await api.get<CompanyService[]>('/company-service');
      return fallbackRes.data;
    }
  },

  /**
   * Fetches services of a specific company
   * GET /api/v1/company-service/list/:slug (or /company/:companyId)
   */
  getCompanyServicesByCompanyId: async (companyId: string): Promise<CompanyService[]> => {
    try {
      const response = await api.get<CompanyService[]>(`/company-service/company/${companyId}`);
      return response.data;
    } catch {
      const fallbackRes = await api.get<CompanyService[]>(`/company-service/list/${companyId}`);
      return fallbackRes.data;
    }
  },

  /**
   * Creates a new service inside a category
   * POST /api/v1/company-service/create
   */
  createService: async (data: CreateServiceDto): Promise<CompanyService> => {
    try {
      const response = await api.post<CompanyService>('/company-service/create', data);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallbackRes = await api.post<CompanyService>('/company-service', data);
        return fallbackRes.data;
      }
      throw err;
    }
  },

  /**
   * Updates a service
   * PATCH /api/v1/company-service/update/:serviceId
   */
  updateService: async (id: string, data: Partial<CreateServiceDto>): Promise<CompanyService> => {
    try {
      const response = await api.patch<CompanyService>(`/company-service/update/${id}`, data);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallbackRes = await api.put<CompanyService>(`/company-service/${id}`, data);
        return fallbackRes.data;
      }
      throw err;
    }
  },

  /**
   * Deactivates / Deletes a service
   * DELETE /api/v1/company-service/deactivate/:serviceId
   */
  deleteService: async (id: string): Promise<void> => {
    try {
      await api.delete(`/company-service/deactivate/${id}`);
    } catch (err: any) {
      if (err.response?.status === 404) {
        await api.delete(`/company-service/${id}`);
      } else {
        throw err;
      }
    }
  }
};
