export type ClientApptStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELED'
  | 'NO_SHOW';

export type CancellationPolicy = 'REFUND' | 'CREDIT' | 'RETAINED';

export interface ClientAppointmentCompany {
  id: string;
  businessName: string;
  slug: string;
  district?: string;
  city?: string;
  logoPhoto?: string | null;
}

export interface ClientAppointmentService {
  id: string;
  name: string;
  durationMinutes: number;
}

export interface ClientAppointment {
  id: string;
  appointmentDate: string;
  appointmentEndDate: string;
  servicePrice: string | number;
  downPaymentAmount: string | number;
  status: ClientApptStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  serviceId: string;
  expiresAt?: string | null;
  cancellationReason?: string | null;
  cancellationDetails?: string | null;
  company: ClientAppointmentCompany;
  service: ClientAppointmentService;
}

export interface CancelAppointmentResponse {
  message: string;
  policy: CancellationPolicy;
  isRefunded?: boolean;
  refundAmount?: number;
  retainedDeposit?: number;
  canceledAppointment: ClientAppointment;
}

export type CreditItemStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

export interface CreditItemCompany {
  id: string;
  businessName: string;
  slug: string;
  logoPhoto?: string | null;
  district?: string;
  city?: string;
}

export interface ClientCreditItem {
  id: string;
  amount: number;
  status: CreditItemStatus;
  expiresAt: string;
  createdAt: string;
  company: CreditItemCompany;
}

export interface CompanyCreditGroup {
  companyId: string;
  businessName: string;
  slug: string;
  logoPhoto: string | null;
  totalAmount: number;
  items: ClientCreditItem[];
}

export interface ClientCreditsResponse {
  totalAvailable: number;
  availableByCompany: CompanyCreditGroup[];
  allCredits: ClientCreditItem[];
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

export interface UpdateCpfPayload {
  cpfCnpj: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ExploreCompanyService {
  id: string;
  name: string;
  totalPrice: number | string;
  durationMinutes: number;
}

export interface ExploreWorkingHour {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isClosed: boolean;
}

export interface ExploreCompanyItem {
  id: string;
  businessName: string;
  slug: string;
  providerType: string;
  district: string;
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  whatsapp?: string;
  logoPhoto?: string | null;
  bannerPhoto?: string | null;
  createdAt: string;
  services: ExploreCompanyService[];
  workingHours: ExploreWorkingHour[];
  minPrice: number | null;
  servicesCount: number;
}

export interface ExploreCompaniesResponse {
  items: ExploreCompanyItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExploreCompanyFilters {
  search?: string;
  city?: string;
  district?: string;
  page?: number;
  limit?: number;
}
