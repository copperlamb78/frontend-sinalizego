import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  StorefrontView,
  BookingStepTwoView,
  type StorefrontService,
  type StorefrontCompany,
  type BookingSelectionData,
} from '@/features/storefront';
import {
  CheckoutConfirmModal,
  useCreateAppointment,
  buildAppointmentIsoString,
} from '@/features/checkout';
import { useAuth } from '@/features/auth';
import { toast } from '@/design-system';

const PENDING_BOOKING_KEY = '@sinalizego:pending-booking';

/**
 * Página fina (Thin Page) da Vitrine Pública do Estabelecimento
 * Rota: /empresa/:slug ou /b/:slug
 */
export const StorefrontPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const createAppointmentMutation = useCreateAppointment();

  // Slug padrão de demonstração caso nenhum parâmetro seja informado
  const effectiveSlug = slug || 'barbers-club';

  // Estado do serviço selecionado para avanço ao Passo 2
  const [selectedBooking, setSelectedBooking] = useState<{
    service: StorefrontService;
    company: StorefrontCompany;
  } | null>(null);

  // Estado da seleção completa de agendamento (Passo 2 concluído)
  const [activeSelection, setActiveSelection] = useState<BookingSelectionData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Restaura agendamento pendente do sessionStorage caso o usuário tenha ido ao login
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PENDING_BOOKING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as BookingSelectionData;
        if (parsed.company?.slug === effectiveSlug) {
          setSelectedBooking({
            service: parsed.service,
            company: parsed.company,
          });
          setActiveSelection(parsed);
          sessionStorage.removeItem(PENDING_BOOKING_KEY);

          if (isAuthenticated) {
            setIsConfirmModalOpen(true);
          }
        }
      }
    } catch {
      sessionStorage.removeItem(PENDING_BOOKING_KEY);
    }
  }, [effectiveSlug, isAuthenticated]);

  const handleSelectService = (service: StorefrontService, company: StorefrontCompany) => {
    setSelectedBooking({ service, company });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStorefront = () => {
    setSelectedBooking(null);
    setActiveSelection(null);
    setIsConfirmModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCheckout = (data: BookingSelectionData) => {
    setActiveSelection(data);

    if (!isAuthenticated) {
      // Salva o estado para retomar após o login
      try {
        sessionStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(data));
      } catch {
        // Ignora se quota storage excedida
      }
      toast.info('Para garantir seu horário, acesse ou crie sua conta.');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setModalError(null);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmBooking = async (cpfCnpj?: string) => {
    if (!activeSelection || !user) return;
    setModalError(null);

    try {
      // Converte data + slot para instante UTC preciso no fuso da barbearia
      const appointmentDateIso = buildAppointmentIsoString(
        activeSelection.date,
        activeSelection.time,
        activeSelection.company.timezone || 'America/Sao_Paulo'
      );

      const created = await createAppointmentMutation.mutateAsync({
        companyId: activeSelection.company.id,
        serviceId: activeSelection.service.id,
        appointmentDate: appointmentDateIso,
        cpfCnpj,
        employeeId: activeSelection.employeeId,
      });

      setIsConfirmModalOpen(false);
      toast.success('Horário reservado! Você tem 15 minutos para concluir o pagamento via Pix.');
      navigate(`/pagamento/${created.id}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 409) {
          setModalError('Não há mais vagas para este horário. Por favor, escolha outro slot na grade.');
        } else if (status === 429) {
          setModalError('Muitas reservas recentes. Aguarde alguns instantes antes de tentar novamente.');
        } else if (typeof message === 'string') {
          setModalError(message);
        } else {
          setModalError('Erro ao confirmar a reserva. Verifique os dados e tente novamente.');
        }
      } else {
        setModalError('Ocorreu um erro inesperado ao processar sua reserva.');
      }
    }
  };

  return (
    <>
      {selectedBooking ? (
        <BookingStepTwoView
          company={selectedBooking.company}
          service={selectedBooking.service}
          onBack={handleBackToStorefront}
          onProceedToCheckout={handleProceedToCheckout}
        />
      ) : (
        <StorefrontView
          slug={effectiveSlug}
          onSelectService={handleSelectService}
        />
      )}

      {/* Modal Canônico de Confirmação e Hold de 15 min */}
      {isConfirmModalOpen && activeSelection && user && (
        <CheckoutConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          company={activeSelection.company}
          service={activeSelection.service}
          date={activeSelection.date}
          dateLabel={activeSelection.date}
          timeSlot={activeSelection.time}
          downPaymentAmount={activeSelection.downPaymentAmount}
          user={user}
          employeeName={activeSelection.employeeName}
          onConfirm={handleConfirmBooking}
          isLoading={createAppointmentMutation.isPending}
          errorMessage={modalError}
        />
      )}
    </>
  );
};

export default StorefrontPage;
