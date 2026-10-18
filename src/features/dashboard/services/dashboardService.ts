import { apiClient } from '@/core/api/client';
import type {
  DashboardCompany,
  DashboardMetrics,
  CompanyBalance,
  WithdrawalTransaction,
  CompanyTransactionsResponse,
  CompanyAppointment,
  CompanyServiceItem,
  CreateServicePayload,
  UpdateServicePayload,
  WorkingHourItem,
  ScheduleExceptionItem,
  UpdateCompanyPayload,
} from '../types';

export const dashboardService = {
  /**
   * Obtém a empresa vinculada ao usuário autenticado (JWT sub claim)
   */
  async getMyCompany(): Promise<DashboardCompany> {
    const response = await apiClient.get<DashboardCompany>('/company/get-by-user-id');
    return response.data;
  },

  /**
   * Obtém as métricas analíticas e operacionais do dashboard
   */
  async getDashboardMetrics(params?: { startDate?: string; endDate?: string }): Promise<DashboardMetrics> {
    const response = await apiClient.get<DashboardMetrics>('/company/dashboard/metrics', {
      params,
    });
    return response.data;
  },

  /**
   * Consulta os saldos (Disponível, Escrow Locked) e datas de payout
   */
  async getCompanyBalance(): Promise<CompanyBalance> {
    const response = await apiClient.get<CompanyBalance>('/company/balance');
    return response.data;
  },

  /**
   * Solicita saque instantâneo via Pix (tarifa fixa Asaas de R$ 5,00)
   */
  async requestWithdrawal(amount?: number): Promise<{ message: string; withdrawal: WithdrawalTransaction }> {
    const response = await apiClient.post<{ message: string; withdrawal: WithdrawalTransaction }>(
      '/company/withdraw',
      amount ? { amount } : {}
    );
    return response.data;
  },

  /**
   * Histórico de saques e transferências
   */
  async getWithdrawalHistory(): Promise<WithdrawalTransaction[]> {
    const response = await apiClient.get<WithdrawalTransaction[]>('/company/withdrawals');
    return response.data;
  },

  /**
   * Extrato financeiro da empresa
   */
  async getTransactions(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<CompanyTransactionsResponse> {
    const response = await apiClient.get<CompanyTransactionsResponse>('/company/transactions', {
      params,
    });
    return response.data;
  },

  /**
   * Lista agendamentos da empresa com paginação e filtros de status
   */
  async getAppointments(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<CompanyAppointment[]> {
    const response = await apiClient.get<CompanyAppointment[]>('/appointments/company', {
      params,
    });
    return response.data;
  },

  /**
   * Conclui um agendamento atendido (libera saldo de escrow)
   */
  async completeAppointment(appointmentId: string): Promise<CompanyAppointment> {
    const response = await apiClient.patch<CompanyAppointment>(`/appointments/${appointmentId}/complete`);
    return response.data;
  },

  /**
   * Registra a ausência do cliente (No-Show) com retenção legal do sinal
   */
  async markNoShow(appointmentId: string): Promise<CompanyAppointment> {
    const response = await apiClient.patch<CompanyAppointment>(`/appointments/${appointmentId}/no-show`);
    return response.data;
  },

  /**
   * Libera horário por imprevisto do estabelecimento (gera crédito de 90 dias pro cliente)
   */
  async rescheduleOwnerUnavailability(appointmentId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/appointments/${appointmentId}/owner-unavailability`
    );
    return response.data;
  },

  /**
   * Baixa arquivo iCalendar .ics para sincronização com agenda nativa
   */
  async downloadAppointmentIcs(appointmentId: string): Promise<void> {
    const response = await apiClient.get(`/appointments/${appointmentId}/ics`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `agendamento-${appointmentId.slice(0, 8)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Lista todos os serviços cadastrados na empresa
   */
  async getServices(): Promise<CompanyServiceItem[]> {
    const response = await apiClient.get<CompanyServiceItem[]>('/company-service/list');
    return response.data;
  },

  /**
   * Cadastra novo serviço
   */
  async createService(data: CreateServicePayload): Promise<CompanyServiceItem> {
    const response = await apiClient.post<CompanyServiceItem>('/company-service/create', data);
    return response.data;
  },

  /**
   * Atualiza dados de um serviço existente
   */
  async updateService(serviceId: string, data: UpdateServicePayload): Promise<CompanyServiceItem> {
    const response = await apiClient.patch<CompanyServiceItem>(`/company-service/update/${serviceId}`, data);
    return response.data;
  },

  /**
   * Desativa temporariamente um serviço
   */
  async deactivateService(serviceId: string): Promise<CompanyServiceItem> {
    const response = await apiClient.delete<CompanyServiceItem>(`/company-service/deactivate/${serviceId}`);
    return response.data;
  },

  /**
   * Reativa um serviço previamente desativado
   */
  async activateService(serviceId: string): Promise<CompanyServiceItem> {
    const response = await apiClient.patch<CompanyServiceItem>(`/company-service/activate/${serviceId}`);
    return response.data;
  },

  /**
   * Retorna a grade semanal de funcionamento da empresa
   */
  async getWorkingHours(): Promise<WorkingHourItem[]> {
    const response = await apiClient.get<WorkingHourItem[]>('/working-hours');
    return response.data;
  },

  /**
   * Atualiza a grade semanal de funcionamento
   */
  async updateWorkingHours(workingHours: WorkingHourItem[]): Promise<WorkingHourItem[]> {
    const response = await apiClient.put<WorkingHourItem[]>('/working-hours', {
      workingHours,
    });
    return response.data;
  },

  /**
   * Lista exceções futuras de expediente (folgas, feriados)
   */
  async getScheduleExceptions(): Promise<ScheduleExceptionItem[]> {
    const response = await apiClient.get<ScheduleExceptionItem[]>('/working-hours/exceptions');
    return response.data;
  },

  /**
   * Cadastra uma nova exceção na agenda (folga/feriado)
   */
  async createScheduleException(data: {
    date: string;
    startTime?: string;
    endTime?: string;
    isOff: boolean;
    reason?: string;
  }): Promise<ScheduleExceptionItem> {
    const response = await apiClient.post<ScheduleExceptionItem>('/working-hours/exceptions', data);
    return response.data;
  },

  /**
   * Remove uma exceção da agenda
   */
  async deleteScheduleException(id: string): Promise<void> {
    await apiClient.delete(`/working-hours/exceptions/${id}`);
  },

  /**
   * Atualiza dados da empresa
   */
  async updateCompany(companyId: string, data: UpdateCompanyPayload): Promise<DashboardCompany> {
    const response = await apiClient.patch<DashboardCompany>(`/company/update/${companyId}`, data);
    return response.data;
  },

  /**
   * Lista os funcionários da empresa com filtros e paginação
   */
  async getEmployees(params?: {
    search?: string;
    status?: string;
    groupId?: string;
    serviceId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: import('../types').DashboardEmployee[]; total: number; page: number; limit: number; totalPages: number }> {
    const response = await apiClient.get('/employees', { params });
    return response.data;
  },

  /**
   * Obtém detalhes de um funcionário específico
   */
  async getEmployeeById(id: string): Promise<import('../types').DashboardEmployee> {
    const response = await apiClient.get<import('../types').DashboardEmployee>(`/employees/${id}`);
    return response.data;
  },

  /**
   * Obtém indicadores e estatísticas reais de um funcionário
   */
  async getEmployeeStats(id: string): Promise<import('../types').EmployeeStats> {
    const response = await apiClient.get<import('../types').EmployeeStats>(`/employees/${id}/stats`);
    return response.data;
  },

  /**
   * Cadastra um novo funcionário
   */
  async createEmployee(data: import('../types').CreateEmployeePayload): Promise<import('../types').DashboardEmployee> {
    const response = await apiClient.post<import('../types').DashboardEmployee>('/employees', data);
    return response.data;
  },

  /**
   * Atualiza dados e vínculos de um funcionário
   */
  async updateEmployee(
    id: string,
    data: import('../types').UpdateEmployeePayload
  ): Promise<import('../types').DashboardEmployee> {
    const response = await apiClient.patch<import('../types').DashboardEmployee>(`/employees/${id}`, data);
    return response.data;
  },

  /**
   * Ativa ou desativa um funcionário
   */
  async toggleEmployeeStatus(id: string): Promise<{ id: string; name: string; isActive: boolean; disabledAt?: string | null }> {
    const response = await apiClient.patch(`/employees/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Lista grupos de serviço da empresa
   */
  async getServiceGroups(): Promise<Array<{ id: string; name: string; capacity: number }>> {
    const response = await apiClient.get('/service-group');
    return response.data;
  },
};
