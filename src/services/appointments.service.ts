import { api } from '@/config/api.config';
import type {
  AvailableSlotsResponse,
  CreateAppointmentDto,
  Appointment
} from '@/types/appointment.types';

export const appointmentsService = {
  /**
   * Fetches available time slots for a given company, service and date
   * GET /api/v1/appointments/available-slots?companyId=...&serviceId=...&date=YYYY-MM-DD
   */
  getAvailableSlots: async (
    companyId: string,
    serviceId: string,
    date: string
  ): Promise<AvailableSlotsResponse> => {
    const response = await api.get<AvailableSlotsResponse>(
      '/appointments/available-slots',
      {
        params: { companyId, serviceId, date }
      }
    );
    return response.data;
  },

  /**
   * Creates a new booking reservation with status PENDING_PAYMENT
   * POST /api/v1/appointments
   */
  createAppointment: async (
    dto: CreateAppointmentDto
  ): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', dto);
    return response.data;
  },

  /**
   * Fetches full appointment details by ID
   * GET /api/v1/appointments/:id
   */
  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Fetches user/client appointment history
   * GET /api/v1/appointments/user
   */
  getUserAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments/user');
    return response.data;
  },

  /**
   * Fetches company appointments for owner calendar/dashboard
   * GET /api/v1/appointments/company
   */
  getCompanyAppointments: async (params?: {
    date?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments/company', {
      params
    });
    return response.data;
  },

  /**
   * Completes an appointment and releases escrow locked balance
   * PATCH /api/v1/appointments/:id/complete
   */
  completeAppointment: async (id: string): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/appointments/${id}/complete`);
    return response.data;
  },

  /**
   * Cancels an appointment from the client side and triggers Pix refund rules
   * DELETE /api/v1/appointments/:id/client
   */
  cancelAppointmentByClient: async (id: string): Promise<Appointment> => {
    const response = await api.delete<Appointment>(`/appointments/${id}/client`);
    return response.data;
  },

  /**
   * Deactivates/archives an appointment administratively
   * DELETE /api/v1/appointments/:id/deactivate
   */
  deactivateAppointment: async (id: string): Promise<{ id: string; status: string }> => {
    const response = await api.delete<{ id: string; status: string }>(`/appointments/${id}/deactivate`);
    return response.data;
  }
};
