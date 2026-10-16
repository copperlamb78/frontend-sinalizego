/**
 * Contratos tipados do módulo de Checkout Pix
 * Sincronizados com `api-sinalizego/src/modules/appointments` e `modules/transactions`
 */

export type AppointmentStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELED'
  | 'NO_SHOW';

export interface CreateAppointmentPayload {
  companyId: string;
  serviceId: string;
  appointmentDate: string; // ISO 8601 UTC
  cpfCnpj?: string;
  useCredit?: boolean;
}

export interface AppointmentDetails {
  id: string;
  appointmentDate: string;
  appointmentEndDate: string;
  servicePrice: string | number;
  downPaymentAmount: string | number;
  platformFeeAmount?: string | number;
  retainedDepositAmount?: string | number | null;
  status: AppointmentStatus;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  clientId: string;
  serviceId: string;
  company?: {
    id: string;
    businessName: string;
    slug: string;
    street?: string | null;
    number?: string | null;
    district?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    whatsapp?: string | null;
    themePalette?: string | null;
  };
  service?: {
    id: string;
    name: string;
    durationMinutes: number;
  };
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface PixChargeResponse {
  paymentId: string;
  totalValue: number;
  qrCodePayload: string;
  qrCodeImage: string;
  expirationDate: string;
}
