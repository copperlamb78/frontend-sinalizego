import { api } from '@/config/api.config';
import type { WorkingHour, WorkingHourException } from '@/types/company.types';

export const workingHoursService = {
  /**
   * Fetches weekly operating hours
   * GET /api/v1/working-hours
   */
  getWorkingHours: async (): Promise<WorkingHour[]> => {
    const response = await api.get<WorkingHour[]>('/working-hours');
    return response.data;
  },

  /**
   * Fetches weekly operating hours of a specific company
   * GET /api/v1/working-hours/company/:companyId
   */
  getWorkingHoursByCompany: async (companyId: string): Promise<WorkingHour[]> => {
    const response = await api.get<WorkingHour[]>(`/working-hours/company/${companyId}`);
    return response.data;
  },

  /**
   * Updates weekly operating hours in batch
   * PUT /api/v1/working-hours
   */
  updateWorkingHours: async (workingHours: WorkingHour[]): Promise<WorkingHour[]> => {
    const response = await api.put<WorkingHour[]>('/working-hours', { workingHours });
    return response.data;
  },

  /**
   * Fetches holiday and special date exceptions
   * GET /api/v1/working-hours/exceptions
   */
  getExceptions: async (): Promise<WorkingHourException[]> => {
    const response = await api.get<WorkingHourException[]>('/working-hours/exceptions');
    return response.data;
  },

  /**
   * Creates a new holiday/date exception
   * POST /api/v1/working-hours/exceptions
   */
  createException: async (data: {
    date: string;
    isClosed: boolean;
    description?: string;
  }): Promise<WorkingHourException> => {
    const response = await api.post<WorkingHourException>('/working-hours/exceptions', data);
    return response.data;
  },

  /**
   * Deletes a date exception
   * DELETE /api/v1/working-hours/exceptions/:id
   */
  deleteException: async (id: string): Promise<void> => {
    await api.delete(`/working-hours/exceptions/${id}`);
  }
};
