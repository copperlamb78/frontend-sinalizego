/**
 * Tipagens estritas do Módulo Dashboard (Painel do Estabelecimento)
 * 100% alinhado com o Prisma Schema e Controllers da api-sinalizego.
 */

export interface DashboardCompany {
  id: string;
  businessName: string;
  slug: string;
  providerType?: string;
  chairsCount?: number;
  district?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  number?: string;
  whatsapp?: string | null;
  logoPhoto?: string | null;
  bannerPhoto?: string | null;
  timezone?: string;
  themePalette?: string;
  isActive: boolean;
  createdAt: string;
}

export interface MetricFinancial {
  totalRevenue: number;
  totalDownPaymentCollected: number;
  totalPlatformFees: number;
  netIncome: number;
}

export interface MetricVolume {
  total: number;
  completed: number;
  confirmed: number;
  canceled: number;
  pendingPayment: number;
  completionRate: number;
}

export interface MetricTopService {
  serviceId: string;
  serviceName: string;
  appointmentsCount: number;
  totalRevenue: number;
}

export interface MetricUpcomingToday {
  id: string;
  appointmentDate: string;
  appointmentEndDate: string;
  clientName: string;
  clientPhone?: string;
  serviceName: string;
  durationMinutes: number;
  downPaymentAmount: number;
  servicePrice: number;
}

export interface DashboardMetrics {
  company: {
    id: string;
    businessName: string;
    slug: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  financial: MetricFinancial;
  volume: MetricVolume;
  topServices: MetricTopService[];
  upcomingToday: MetricUpcomingToday[];
}

export interface CompanyBalance {
  companyId: string;
  businessName: string;
  walletId?: string;
  walletMask?: string;
  availableBalance: number;
  escrowLockedBalance: number;
  completedNetRevenue: number;
  totalWithdrawn: number;
  nextFreeWithdrawalDate: string;
  instantTransferFee: number;
  minFreeWeeklyPayoutThreshold: number;
  eligibleForFreeWeeklyPayout: boolean;
}

export interface WithdrawalTransaction {
  id: string;
  requestedAmount: number;
  transferFee: number;
  netAmountTransferred: number;
  status: string;
  isFreeWeekly?: boolean;
  asaasTransferId?: string;
  transferredAt: string;
}

export interface CompanyTransaction {
  id: string;
  amount: number;
  netAmount: number;
  feeAmount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

export interface CompanyTransactionsResponse {
  transactions: CompanyTransaction[];
  total: number;
  page: number;
  limit: number;
}

export type AppointmentStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELED'
  | 'NO_SHOW'
  | 'EXPIRED';

export interface CompanyAppointment {
  id: string;
  appointmentDate: string;
  appointmentEndDate: string;
  status: AppointmentStatus;
  servicePrice: number;
  downPaymentAmount: number;
  platformFeeAmount: number;
  expiresAt?: string | null;
  cancellationReason?: string | null;
  cancellationDetails?: string | null;
  createdAt: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  service?: {
    id: string;
    name: string;
    durationMinutes: number;
    totalPrice: number;
  };
}

export interface CompanyServiceItem {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  totalPrice: number | string;
  downPaymentPercent: number;
  availableEmployers?: number;
  serviceGroupId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  durationMinutes: number;
  totalPrice: number;
  downPaymentPercent?: number;
  availableEmployers?: number;
}

export interface UpdateServicePayload {
  name?: string;
  description?: string;
  durationMinutes?: number;
  totalPrice?: number;
  downPaymentPercent?: number;
  availableEmployers?: number;
}

export interface WorkingHourItem {
  id?: string;
  dayOfWeek: number; // 0=Domingo, 1=Segunda, etc.
  startTime: string; // "09:00"
  endTime: string; // "19:00"
  lunchStartTime?: string | null;
  lunchEndTime?: string | null;
  isClosed: boolean;
}

export interface ScheduleExceptionItem {
  id: string;
  date: string; // "AAAA-MM-DD"
  startTime?: string | null;
  endTime?: string | null;
  isOff: boolean;
  reason?: string | null;
}

export interface UpdateCompanyPayload {
  businessName?: string;
  providerType?: string;
  whatsapp?: string;
  chairsCount?: number;
  district?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  number?: string;
  logoPhoto?: string;
  bannerPhoto?: string;
}

export interface DashboardEmployee {
  id: string;
  companyId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  roleTitle?: string | null;
  isActive: boolean;
  disabledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  groups?: Array<{
    serviceGroup: {
      id: string;
      name: string;
      capacity: number;
    };
  }>;
  services?: Array<{
    service: {
      id: string;
      name: string;
      durationMinutes: number;
      totalPrice: number | string;
    };
  }>;
}

export interface EmployeeStats {
  employeeId: string;
  completedToday: number;
  completedMonth: number;
  completedTotal: number;
  averageRating: number | null;
  ratingsCount: number;
  recentReviews?: Array<{
    id: string;
    employeeRating: number;
    comment?: string | null;
    createdAt: string;
    appointment?: {
      client?: { name?: string };
      service?: { name?: string };
    };
  }>;
}

export interface CreateEmployeePayload {
  name: string;
  roleTitle?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  groupIds?: string[];
  serviceIds?: string[];
}

export interface UpdateEmployeePayload {
  name?: string;
  roleTitle?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  isActive?: boolean;
  groupIds?: string[];
  serviceIds?: string[];
}

export type DashboardTab =
  | 'overview'
  | 'appointments'
  | 'services'
  | 'employees'
  | 'schedule'
  | 'financial'
  | 'settings';

