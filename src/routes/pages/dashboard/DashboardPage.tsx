import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import {
  dashboardService,
  DashboardLayout,
  DashboardMetricsOverview,
  DashboardAppointmentsView,
  DashboardServicesView,
  DashboardEmployeesView,
  DashboardWorkingHoursView,
  DashboardFinancialView,
  DashboardSettingsView,
  DashboardEmptyState,
  type DashboardTab,
  type CreateServicePayload,
  type UpdateServicePayload,
  type WorkingHourItem,
  type UpdateCompanyPayload,
} from '@/features/dashboard';
import { Skeleton } from '@/design-system/ui/skeleton';

export const DashboardPage: React.FC = () => {
  const { tab: urlTab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();

  // Mapeamento do tab ativo a partir da rota
  const activeTab: DashboardTab = (
    urlTab && ['overview', 'appointments', 'services', 'employees', 'schedule', 'financial', 'settings'].includes(urlTab)
      ? urlTab
      : 'overview'
  ) as DashboardTab;

  const handleSelectTab = (tab: DashboardTab) => {
    navigate(tab === 'overview' ? '/painel' : `/painel/${tab}`);
  };

  // 1. Consulta da Empresa vinculada ao usuário
  const {
    data: company,
    isLoading: isLoadingCompany,
    isError: isCompanyError,
  } = useQuery({
    queryKey: ['my-company', user?.id],
    queryFn: () => dashboardService.getMyCompany(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // 2. Consulta de Métricas Operacionais e Financeiras
  const {
    data: metrics,
    isLoading: isLoadingMetrics,
  } = useQuery({
    queryKey: ['dashboard-metrics', company?.id],
    queryFn: () => dashboardService.getDashboardMetrics(),
    enabled: Boolean(company?.id),
    staleTime: 60 * 1000,
  });

  // 3. Consulta de Agendamentos da Empresa
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<string>('');
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState<string>('');

  const {
    data: appointments = [],
    isLoading: isLoadingAppointments,
    refetch: refetchAppointments,
  } = useQuery({
    queryKey: ['company-appointments', company?.id, appointmentStatusFilter],
    queryFn: () =>
      dashboardService.getAppointments({
        status: appointmentStatusFilter || undefined,
      }),
    enabled: Boolean(company?.id),
    staleTime: 30 * 1000,
  });

  // 4. Consulta de Serviços
  const {
    data: services = [],
    isLoading: isLoadingServices,
  } = useQuery({
    queryKey: ['company-services', company?.id],
    queryFn: () => dashboardService.getServices(),
    enabled: Boolean(company?.id),
    staleTime: 60 * 1000,
  });

  // 5. Consulta de Horários de Funcionamento e Exceções
  const {
    data: workingHours = [],
    isLoading: isLoadingWorkingHours,
  } = useQuery({
    queryKey: ['working-hours', company?.id],
    queryFn: () => dashboardService.getWorkingHours(),
    enabled: Boolean(company?.id),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: scheduleExceptions = [],
  } = useQuery({
    queryKey: ['schedule-exceptions', company?.id],
    queryFn: () => dashboardService.getScheduleExceptions(),
    enabled: Boolean(company?.id),
    staleTime: 60 * 1000,
  });

  // 6. Consulta de Saldo Financeiro, Histórico e Extrato
  const {
    data: balance = null,
    isLoading: isLoadingBalance,
  } = useQuery({
    queryKey: ['company-balance', company?.id],
    queryFn: () => dashboardService.getCompanyBalance(),
    enabled: Boolean(company?.id),
    staleTime: 30 * 1000,
  });

  const {
    data: withdrawals = [],
  } = useQuery({
    queryKey: ['company-withdrawals', company?.id],
    queryFn: () => dashboardService.getWithdrawalHistory(),
    enabled: Boolean(company?.id),
    staleTime: 60 * 1000,
  });

  const {
    data: transactionsData,
  } = useQuery({
    queryKey: ['company-transactions', company?.id],
    queryFn: () => dashboardService.getTransactions(),
    enabled: Boolean(company?.id),
    staleTime: 60 * 1000,
  });

  // Mutações de Ações no Agendamento
  const completeMutation = useMutation({
    mutationFn: (id: string) => dashboardService.completeAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
    },
  });

  const noShowMutation = useMutation({
    mutationFn: (id: string) => dashboardService.markNoShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: (id: string) => dashboardService.rescheduleOwnerUnavailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  // Mutações de Serviços
  const createServiceMutation = useMutation({
    mutationFn: (payload: CreateServicePayload) => dashboardService.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-services'] });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateServicePayload }) =>
      dashboardService.updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-services'] });
    },
  });

  const toggleServiceMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: boolean }) =>
      currentStatus
        ? dashboardService.deactivateService(id)
        : dashboardService.activateService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-services'] });
    },
  });

  // Mutações de Horários
  const saveWorkingHoursMutation = useMutation({
    mutationFn: (hours: WorkingHourItem[]) => dashboardService.updateWorkingHours(hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-hours'] });
    },
  });

  const createExceptionMutation = useMutation({
    mutationFn: (data: { date: string; isOff: boolean; reason?: string }) =>
      dashboardService.createScheduleException(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-exceptions'] });
    },
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: (id: string) => dashboardService.deleteScheduleException(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-exceptions'] });
    },
  });

  // Mutações Financeiras
  const withdrawMutation = useMutation({
    mutationFn: (amount?: number) => dashboardService.requestWithdrawal(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
      queryClient.invalidateQueries({ queryKey: ['company-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['company-transactions'] });
    },
  });

  // Mutações da Empresa
  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCompanyPayload }) =>
      dashboardService.updateCompany(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-company'] });
    },
  });

  // Tratamento de Loading da Empresa
  if (isLoadingCompany) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Se não encontrou empresa para o usuário (404), mostra o estado amigável
  if (isCompanyError || !company) {
    return <DashboardEmptyState />;
  }

  // Contagem de agendamentos pendentes de confirmação
  const pendingAppointmentsCount = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING_PAYMENT'
  ).length;

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      company={company}
      userName={user?.name}
      onLogout={logout}
      pendingCount={pendingAppointmentsCount}
    >
      {activeTab === 'overview' && (
        <DashboardMetricsOverview
          metrics={metrics || null}
          isLoading={isLoadingMetrics}
          onGoToAppointments={() => handleSelectTab('appointments')}
          onGoToFinancial={() => handleSelectTab('financial')}
        />
      )}

      {activeTab === 'appointments' && (
        <DashboardAppointmentsView
          appointments={appointments}
          isLoading={isLoadingAppointments}
          selectedStatus={appointmentStatusFilter}
          onSelectStatus={setAppointmentStatusFilter}
          searchTerm={appointmentSearchTerm}
          onSearchChange={setAppointmentSearchTerm}
          onComplete={async (id) => {
            await completeMutation.mutateAsync(id);
          }}
          onMarkNoShow={async (id) => {
            await noShowMutation.mutateAsync(id);
          }}
          onRescheduleOwner={async (id) => {
            await rescheduleMutation.mutateAsync(id);
          }}
          onDownloadIcs={async (id) => {
            await dashboardService.downloadAppointmentIcs(id);
          }}
          onRefresh={() => refetchAppointments()}
        />
      )}

      {activeTab === 'services' && (
        <DashboardServicesView
          services={services}
          isLoading={isLoadingServices}
          onCreateService={async (payload) => {
            await createServiceMutation.mutateAsync(payload);
          }}
          onUpdateService={async (id, payload) => {
            await updateServiceMutation.mutateAsync({ id, payload });
          }}
          onToggleActive={async (id, currentStatus) => {
            await toggleServiceMutation.mutateAsync({ id, currentStatus });
          }}
        />
      )}

      {activeTab === 'employees' && (
        <DashboardEmployeesView services={services} companyId={company?.id} />
      )}

      {activeTab === 'schedule' && (
        <DashboardWorkingHoursView
          workingHours={workingHours}
          exceptions={scheduleExceptions}
          isLoading={isLoadingWorkingHours}
          onSaveWorkingHours={async (hours) => {
            await saveWorkingHoursMutation.mutateAsync(hours);
          }}
          onCreateException={async (data) => {
            await createExceptionMutation.mutateAsync(data);
          }}
          onDeleteException={async (id) => {
            await deleteExceptionMutation.mutateAsync(id);
          }}
        />
      )}

      {activeTab === 'financial' && (
        <DashboardFinancialView
          balance={balance}
          withdrawals={withdrawals}
          transactions={transactionsData?.transactions || []}
          isLoading={isLoadingBalance}
          onRequestWithdrawal={async (amount) => {
            await withdrawMutation.mutateAsync(amount);
          }}
        />
      )}

      {activeTab === 'settings' && (
        <DashboardSettingsView
          company={company}
          onUpdateCompany={async (id, payload) => {
            await updateCompanyMutation.mutateAsync({ id, payload });
          }}
        />
      )}
    </DashboardLayout>
  );
};
