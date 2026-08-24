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
   * GET /api/v1/company-service
   */
  getCompanyServices: async (): Promise<CompanyService[]> => {
    const response = await api.get<CompanyService[]>('/company-service');
    return response.data;
  },

  /**
   * Fetches services of a specific company
   * GET /api/v1/company-service/company/:companyId
   */
  getCompanyServicesByCompanyId: async (companyId: string): Promise<CompanyService[]> => {
    const response = await api.get<CompanyService[]>(`/company-service/company/${companyId}`);
    return response.data;
  },

  /**
   * Creates a new service inside a category
   * POST /api/v1/company-service
   */
  createService: async (data: CreateServiceDto): Promise<CompanyService> => {
    const response = await api.post<CompanyService>('/company-service', data);
    return response.data;
  },

  /**
   * Updates a service
   * PUT /api/v1/company-service/:id
   */
  updateService: async (id: string, data: Partial<CreateServiceDto>): Promise<CompanyService> => {
    const response = await api.put<CompanyService>(`/company-service/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a service
   * DELETE /api/v1/company-service/:id
   */
  deleteService: async (id: string): Promise<void> => {
    await api.delete(`/company-service/${id}`);
  }
};
