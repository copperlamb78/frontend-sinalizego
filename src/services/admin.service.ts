import { api } from '@/config/api.config';
import type {
  AdminDashboardMetrics,
  AdminCompaniesResponse,
  AdminUserItem,
  CreateUserByAdminData,
  UpdateUserByAdminData,
  AdminUserAudit
} from '@/types/admin.types';

export interface GetCompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
}

export const adminService = {
  /**
   * Fetches global platform executive metrics
   * GET /api/v1/admin/dashboard/metrics
   */
  getDashboardMetrics: async (params?: { startDate?: string; endDate?: string }): Promise<AdminDashboardMetrics> => {
    const response = await api.get<AdminDashboardMetrics>('/admin/dashboard/metrics', { params });
    return response.data;
  },

  /**
   * Fetches paginated companies with search and status filter
   * GET /api/v1/admin/companies
   */
  getCompanies: async (params?: GetCompaniesParams): Promise<AdminCompaniesResponse> => {
    const response = await api.get<AdminCompaniesResponse>('/admin/companies', { params });
    return response.data;
  },

  /**
   * Toggles company active / suspended status
   * PATCH /api/v1/admin/companies/:id/toggle-status
   */
  toggleCompanyStatus: async (id: string): Promise<{ id: string; isActive: boolean }> => {
    const response = await api.patch<{ id: string; isActive: boolean }>(`/admin/companies/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Fetches all registered users for platform moderation
   * GET /api/v1/users/list
   */
  getUsers: async (): Promise<AdminUserItem[]> => {
    const response = await api.get<AdminUserItem[]>('/users/list');
    return response.data;
  },

  /**
   * Creates a new user with chosen role
   * POST /api/v1/admin/users
   */
  createUser: async (data: CreateUserByAdminData): Promise<{ message: string; user: AdminUserItem; temporaryPasswordGenerated?: boolean }> => {
    const response = await api.post<{ message: string; user: AdminUserItem; temporaryPasswordGenerated?: boolean }>('/admin/users', data);
    return response.data;
  },

  /**
   * Updates user details by admin
   * PATCH /api/v1/admin/users/:userId
   */
  updateUser: async (userId: string, data: UpdateUserByAdminData): Promise<{ message: string; user: AdminUserItem }> => {
    const response = await api.patch<{ message: string; user: AdminUserItem }>(`/admin/users/${userId}`, data);
    return response.data;
  },

  /**
   * Resets user password to random temporary password sent via email
   * POST /api/v1/admin/users/:userId/reset-password
   */
  resetUserPassword: async (userId: string): Promise<{ message: string; email: string }> => {
    const response = await api.post<{ message: string; email: string }>(`/admin/users/${userId}/reset-password`);
    return response.data;
  },

  /**
   * Fetches detailed audit intelligence of a user
   * GET /api/v1/admin/users/:userId/audit
   */
  getUserAudit: async (userId: string): Promise<AdminUserAudit> => {
    const response = await api.get<AdminUserAudit>(`/admin/users/${userId}/audit`);
    return response.data;
  },

  /**
   * Deactivates/suspends a user account
   * DELETE /api/v1/users/:userId
   */
  deactivateUser: async (userId: string): Promise<{ id: string; isActive: boolean }> => {
    const response = await api.delete<{ id: string; isActive: boolean }>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Reactivates a user account
   * PATCH /api/v1/users/:userId/activate
   */
  activateUser: async (userId: string): Promise<{ id: string; isActive: boolean }> => {
    const response = await api.patch<{ id: string; isActive: boolean }>(`/users/${userId}/activate`);
    return response.data;
  }
};
