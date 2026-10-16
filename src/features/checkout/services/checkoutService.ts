import { apiClient } from '@/core/api/client';
import type {
  CreateAppointmentPayload,
  AppointmentDetails,
  PixChargeResponse,
} from '../types/checkout.types';

export const checkoutService = {
  /**
   * Cria uma reserva de agendamento no backend e inicia o hold de 15 minutos.
   */
  async createAppointment(payload: CreateAppointmentPayload): Promise<AppointmentDetails> {
    const { data } = await apiClient.post<AppointmentDetails>('/appointments', payload);
    return data;
  },

  /**
   * Cria ou recupera a cobrança PIX para o agendamento (idempotente).
   */
  async getPixCharge(appointmentId: string): Promise<PixChargeResponse> {
    const { data } = await apiClient.post<PixChargeResponse>(`/transactions/pix/${appointmentId}`);
    return data;
  },

  /**
   * Consulta os detalhes e o status atualizado do agendamento (usado no polling de pagamento).
   */
  async getAppointmentById(appointmentId: string): Promise<AppointmentDetails> {
    const { data } = await apiClient.get<AppointmentDetails>(`/appointments/${appointmentId}`);
    return data;
  },

  /**
   * Retorna a URL direta para download do evento iCalendar (.ics).
   */
  getIcsDownloadUrl(appointmentId: string): string {
    const baseURL = apiClient.defaults.baseURL || '/api/v1';
    return `${baseURL}/appointments/${appointmentId}/ics`;
  },
};
