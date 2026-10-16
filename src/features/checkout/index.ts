/**
 * Barreira Pública do módulo de Checkout Pix
 */

// Componentes
export { CheckoutConfirmModal } from './components/CheckoutConfirmModal';
export { PixPaymentCard } from './components/PixPaymentCard';
export { PaymentSuccessCard } from './components/PaymentSuccessCard';
export { PaymentExpiredCard } from './components/PaymentExpiredCard';

// Hooks
export { useCreateAppointment } from './hooks/useCreateAppointment';
export { usePixCharge } from './hooks/usePixCharge';
export { useAppointmentStatus } from './hooks/useAppointmentStatus';
export { useCountdown } from './hooks/useCountdown';

// Serviços
export { checkoutService } from './services/checkoutService';

// Utilitários
export { estimateDeposit, MIN_MICROTRANSACTION_DEPOSIT } from './utils/depositCalculator';
export { buildAppointmentIsoString } from './utils/zonedTime';
export { cleanCpf, formatCpf, isValidCpf } from './utils/cpf';

// Tipos
export type {
  AppointmentStatus,
  AppointmentDetails,
  CreateAppointmentPayload,
  PixChargeResponse,
} from './types/checkout.types';
