import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button, Card, Skeleton } from '@/design-system';
import {
  useAppointmentStatus,
  usePixCharge,
  PixPaymentCard,
  PaymentSuccessCard,
  PaymentExpiredCard,
} from '@/features/checkout';

export const PaymentPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [localExpired, setLocalExpired] = useState<boolean>(false);

  const {
    data: appointment,
    isLoading: isLoadingAppt,
    isError: isErrorAppt,
    refetch: refetchAppt,
  } = useAppointmentStatus(appointmentId);

  const {
    data: pixData,
    isLoading: isLoadingPix,
    isError: isErrorPix,
    refetch: refetchPix,
  } = usePixCharge(appointmentId, Boolean(appointment && appointment.status === 'PENDING_PAYMENT'));

  const isLoading = isLoadingAppt || (appointment?.status === 'PENDING_PAYMENT' && isLoadingPix);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Card className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-48 w-48 mx-auto rounded-lg" />
            <Skeleton className="h-10 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (isErrorAppt || !appointment) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-text-primary">Agendamento não encontrado</h3>
          <p className="text-xs text-text-secondary">
            Não foi possível carregar os dados desta reserva. Verifique se o link está correto.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={() => refetchAppt()}
            >
              Tentar novamente
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
              onClick={() => navigate('/')}
            >
              Voltar ao Início
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 1. Status CONFIRMED: Exibe card de sucesso e agendamento garantido
  if (appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-background py-8 px-4 flex items-center justify-center">
        <PaymentSuccessCard
          appointment={appointment}
          onGoHome={() => navigate('/')}
        />
      </div>
    );
  }

  // 2. Status CANCELED ou tempo expirado localmente: Exibe card de reserva expirada
  if (appointment.status === 'CANCELED' || localExpired) {
    const returnSlug = appointment.company?.slug || 'barbers-club';
    return (
      <div className="min-h-screen bg-background py-8 px-4 flex items-center justify-center">
        <PaymentExpiredCard
          onChooseNewSlot={() => navigate(`/empresa/${returnSlug}`)}
        />
      </div>
    );
  }

  // Se houver erro ao carregar cobrança Pix
  if (isErrorPix || !pixData) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-text-primary">Erro ao gerar cobrança Pix</h3>
          <p className="text-xs text-text-secondary">
            Ocorreu uma instabilidade momentânea na geração do QR Code. Sua vaga continua guardada durante os 15 minutos de prazo para pagamento.
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => refetchPix()}
            className="w-full text-xs font-bold"
          >
            Tentar Gerar Pix Novamente
          </Button>
        </Card>
      </div>
    );
  }

  // 3. Status PENDING_PAYMENT: Exibe QR Code e instruções de pagamento
  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:px-6 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto mb-4">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
          onClick={() => {
            const slug = appointment.company?.slug || '';
            navigate(slug ? `/empresa/${slug}` : '/');
          }}
          className="text-xs text-text-muted hover:text-text-primary"
        >
          Voltar para a vitrine
        </Button>
      </div>

      <PixPaymentCard
        appointment={appointment}
        pixData={pixData}
        onExpired={() => setLocalExpired(true)}
      />
    </div>
  );
};

export default PaymentPage;
