import { apiClient } from '@/core/api/client';
import type {
  ClientAppointment,
  CancelAppointmentResponse,
  ClientCreditsResponse,
  UpdateProfilePayload,
  UpdateCpfPayload,
  ChangePasswordPayload,
  ExploreCompaniesResponse,
  ExploreCompanyFilters,
} from '../types';

export const clientService = {
  /**
   * Lista pública de barbearias e estabelecimentos ativos para exploração por clientes
   */
  async exploreCompanies(filters?: ExploreCompanyFilters): Promise<ExploreCompaniesResponse> {
    const response = await apiClient.get<ExploreCompaniesResponse>('/company/explore', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Lista os agendamentos do cliente logado
   */
  async getMyAppointments(params?: {
    startDate?: string;
    serviceId?: string;
    orderBy?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ClientAppointment[]> {
    const response = await apiClient.get<ClientAppointment[]>('/appointments/user', {
      params,
    });
    return response.data;
  },

  /**
   * Obtém detalhes de um agendamento específico por ID
   */
  async getAppointmentById(appointmentId: string): Promise<ClientAppointment> {
    const response = await apiClient.get<ClientAppointment>(`/appointments/${appointmentId}`);
    return response.data;
  },

  /**
   * Cancela um agendamento solicitado pelo cliente aplicando as regras CDC/N6
   */
  async cancelAppointmentByClient(
    appointmentId: string,
    payload?: { reason: string; details?: string }
  ): Promise<CancelAppointmentResponse> {
    const response = await apiClient.delete<CancelAppointmentResponse>(
      `/appointments/${appointmentId}/client`,
      { data: payload }
    );
    return response.data;
  },

  /**
   * Faz o download do arquivo .ics do agendamento para Apple/Google/Outlook Calendar
   */
  async downloadAppointmentIcs(appointmentId: string): Promise<void> {
    const response = await apiClient.get(`/appointments/${appointmentId}/ics`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'text/calendar;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `agendamento-${appointmentId.slice(0, 8)}.ics`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Retorna os créditos disponíveis e histórico do cliente autenticado
   */
  async getMyCredits(): Promise<ClientCreditsResponse> {
    const response = await apiClient.get<ClientCreditsResponse>('/client-credits/me');
    return response.data;
  },

  /**
   * Atualiza dados de contato (nome e telefone) do usuário
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<any> {
    const response = await apiClient.patch('/users/update', payload);
    return response.data;
  },

  /**
   * Atualiza CPF do usuário e sincroniza cliente no Asaas
   */
  async updateCpf(payload: UpdateCpfPayload): Promise<any> {
    const response = await apiClient.patch('/users/update-cpf', payload);
    return response.data;
  },

  /**
   * Altera a senha do usuário logado confirmando a senha atual
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>('/users/change-password', payload);
    return response.data;
  },

  /**
   * Solicita exclusão/desativação definitiva da própria conta (LGPD)
   */
  async deleteMyAccount(): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>('/users/me');
    return response.data;
  },
};
