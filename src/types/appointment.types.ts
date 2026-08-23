export type AppointmentStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELED';

export interface AvailableSlotsResponse {
  date: string;
  totalAvailable: number;
  slots: string[]; // ["09:00", "09:30", "10:00", ...]
}

export interface CreateAppointmentDto {
  companyId: string;
  serviceId: string;
  appointmentDate: string; // ISO String (e.g. "2026-08-25T14:00:00.000Z")
  downPaymentPercent: number; // 25, 50, or 100
}

export interface Appointment {
  id: string;
  companyId: string;
  serviceId: string;
  clientId: string;
  appointmentDate: string;
  appointmentEndDate?: string;
  status: AppointmentStatus;
  servicePrice: number;
  downPaymentAmount: number;
  platformFeeAmount?: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    businessName: string;
    slug: string;
    providerType: string;
    whatsapp?: string;
    street?: string;
    number?: string;
    district?: string;
    city: string;
    state: string;
    logoPhoto?: string | null;
    bannerPhoto?: string | null;
  };
  service?: {
    id: string;
    name: string;
    description?: string;
    durationMinutes: number;
    totalPrice: number;
    downPaymentPercent: number;
  };
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}
