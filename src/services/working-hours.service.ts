import { api } from '@/config/api.config';
import type { WorkingHour, WorkingHourException } from '@/types/company.types';
import { MOCK_VINTAGE_CLUB } from '@/mocks/storefront.mock';

const MOCK_EXCEPTIONS: WorkingHourException[] = [
  {
    id: 'exc-1',
    date: '2026-12-25',
    isClosed: true,
    description: 'Feriado de Natal'
  },
  {
    id: 'exc-2',
    date: '2026-01-01',
    isClosed: true,
    description: 'Confraternização Universal (Ano Novo)'
  }
];

export const workingHoursService = {
  /**
   * Fetches weekly operating hours
   * GET /api/v1/working-hours
   */
  getWorkingHours: async (): Promise<WorkingHour[]> => {
    try {
      const response = await api.get<WorkingHour[]>('/working-hours');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return MOCK_VINTAGE_CLUB.workingHours;
    } catch {
      return MOCK_VINTAGE_CLUB.workingHours;
    }
  },

  /**
   * Updates weekly operating hours in batch
   * PUT /api/v1/working-hours
   */
  updateWorkingHours: async (workingHours: WorkingHour[]): Promise<WorkingHour[]> => {
    try {
      const response = await api.put<WorkingHour[]>('/working-hours', { workingHours });
      return response.data;
    } catch {
      return workingHours;
    }
  },

  /**
   * Fetches holiday and special date exceptions
   * GET /api/v1/working-hours/exceptions
   */
  getExceptions: async (): Promise<WorkingHourException[]> => {
    try {
      const response = await api.get<WorkingHourException[]>('/working-hours/exceptions');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return MOCK_EXCEPTIONS;
    } catch {
      return MOCK_EXCEPTIONS;
    }
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
    try {
      const response = await api.post<WorkingHourException>('/working-hours/exceptions', data);
      return response.data;
    } catch {
      return {
        id: `exc-${Date.now()}`,
        date: data.date,
        isClosed: data.isClosed,
        description: data.description
      };
    }
  },

  /**
   * Deletes a date exception
   * DELETE /api/v1/working-hours/exceptions/:id
   */
  deleteException: async (id: string): Promise<void> => {
    try {
      await api.delete(`/working-hours/exceptions/${id}`);
    } catch {
      // ignore in mock
    }
  }
};
