import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, AlertCircle, Compass } from 'lucide-react';
import { Skeleton, Button } from '@/design-system';
import {
  ClientPortalLayout,
  AppointmentCard,
  CancelAppointmentModal,
  clientService,
  type ClientAppointment,
} from '@/features/client';

export const MyAppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELED'>('UPCOMING');
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] =
    useState<ClientAppointment | null>(null);

  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['client-appointments'],
    queryFn: () => clientService.getMyAppointments(),
    staleTime: 60_000,
  });

  // Filtra por estado da reserva
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING_PAYMENT'
  );
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
  const canceledAppointments = appointments.filter(
    (a) => a.status === 'CANCELED' || a.status === 'NO_SHOW'
  );

  const filteredAppointments =
    activeTab === 'UPCOMING'
      ? upcomingAppointments
      : activeTab === 'COMPLETED'
        ? completedAppointments
        : canceledAppointments;

  const handleCanceledSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['client-appointments'] });
    queryClient.invalidateQueries({ queryKey: ['client-credits'] });
  };

  return (
    <ClientPortalLayout
      title="Meus Agendamentos"
      subtitle="Acompanhe seus horários marcados, realize pagamentos de sinal pendentes e gerencie suas reservas."
      badgeCount={upcomingAppointments.length}
    >
      <div className="space-y-6">
        {/* ABAS DE STATUS (PILLS LIMPAS) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === 'UPCOMING'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-raised'
            }`}
            data-testid="tab-upcoming"
          >
            Próximos ({upcomingAppointments.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === 'COMPLETED'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-raised'
            }`}
            data-testid="tab-completed"
          >
            Concluídos ({completedAppointments.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CANCELED')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === 'CANCELED'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-raised'
            }`}
            data-testid="tab-canceled"
          >
            Cancelados ({canceledAppointments.length})
          </button>
        </div>

        {/* LISTAGEM DE CARDS */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="border border-border rounded-xl p-5 bg-surface space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-28 rounded-md" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-surface border border-border rounded-xl space-y-3">
            <AlertCircle className="h-8 w-8 text-danger mx-auto" />
            <h3 className="text-base font-bold text-text-primary">
              Erro ao carregar agendamentos
            </h3>
            <p className="text-xs text-text-muted">
              Não foi possível sincronizar suas reservas com o servidor.
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()} className="text-xs">
              Tentar Novamente
            </Button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div
            className="p-12 text-center bg-surface border border-border rounded-xl space-y-3"
            data-testid="empty-appointments"
          >
            <Calendar className="h-10 w-10 text-text-muted mx-auto" />
            <h3 className="text-base font-bold text-text-primary">
              Nenhum agendamento nesta aba
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              {activeTab === 'UPCOMING'
                ? 'Você não possui nenhum agendamento próximo marcado.'
                : activeTab === 'COMPLETED'
                  ? 'Você ainda não possui atendimentos concluídos no histórico.'
                  : 'Nenhum agendamento foi cancelado.'}
            </p>
            {activeTab === 'UPCOMING' && (
              <div className="pt-2">
                <Link to="/barbearias">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Compass className="h-4 w-4 shrink-0" />}
                    className="font-bold text-xs"
                    data-testid="btn-explorar-barbearias-empty"
                  >
                    Explorar Barbearias Próximas
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4" data-testid="appointments-list">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancelRequest={(appt) => setSelectedAppointmentForCancel(appt)}
              />
            ))}
          </div>
        )}

        {/* MODAL CANÔNICO DE CANCELAMENTO CDC (REGRA N6) */}
        <CancelAppointmentModal
          isOpen={Boolean(selectedAppointmentForCancel)}
          onClose={() => setSelectedAppointmentForCancel(null)}
          appointment={selectedAppointmentForCancel}
          onCanceledSuccess={handleCanceledSuccess}
        />
      </div>
    </ClientPortalLayout>
  );
};
