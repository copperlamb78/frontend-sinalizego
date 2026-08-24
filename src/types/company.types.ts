import type { FinancialProfile } from './financial.types';

export interface WorkingHour {
  id?: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  startTime: string; // "09:00"
  endTime: string; // "19:00"
  lunchStartTime?: string | null;
  lunchEndTime?: string | null;
  isClosed: boolean;
}

export interface WorkingHourException {
  id: string;
  companyId?: string;
  date: string; // YYYY-MM-DD
  isClosed: boolean;
  description?: string;
  startTime?: string | null;
  endTime?: string | null;
}

export interface CompanyService {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  totalPrice: number;
  downPaymentPercent: number; // 30, 50 or 100
  depositPercentage?: number; // Alias
  serviceGroupId?: string;
  isActive?: boolean;
}

export interface ServiceGroup {
  id: string;
  name: string;
  capacity: number;
  services: CompanyService[];
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  durationMinutes: number;
  totalPrice: number;
  downPaymentPercent: number;
  depositPercentage?: number;
  serviceGroupId: string;
}

export interface CreateServiceGroupDto {
  name: string;
  capacity?: number;
}

export interface CompanyStorefront {
  id: string;
  businessName: string;
  slug: string;
  providerType: string;
  whatsapp?: string;
  district?: string;
  street?: string;
  city: string;
  state: string;
  zipCode?: string;
  number?: string;
  logoPhoto?: string | null;
  bannerPhoto?: string | null;
  timezone?: string;
  walletId?: string | null;
  financialProfile?: FinancialProfile | null;
  workingHours: WorkingHour[];
  serviceGroups: ServiceGroup[];
}

export interface UpdateCompanyDto {
  businessName?: string;
  providerType?: string;
  district?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  number?: string;
  whatsapp?: string;
  chairsCount?: number;
  logoPhoto?: string | null;
  bannerPhoto?: string | null;
}

export interface CompanyBalance {
  companyId: string;
  businessName: string;
  walletId?: string;
  availableBalance: number;
  escrowLockedBalance: number;
  completedNetRevenue: number;
  totalWithdrawn: number;
  nextFreeWithdrawalDate: string; // ISO String (ex: toda segunda 06:00)
  instantTransferFee: number; // R$ 5.00
  minFreeWeeklyPayoutThreshold?: number;
  eligibleForFreeWeeklyPayout?: boolean;
}

export interface CompanyWithdrawal {
  id: string;
  requestedAmount: number;
  transferFee: number;
  netAmountTransferred: number;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  isFreeWeekly: boolean;
  asaasTransferId?: string;
  transferredAt: string;
}

export interface TodayAppointmentMetric {
  id: string;
  appointmentDate: string;
  appointmentEndDate?: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  durationMinutes: number;
  downPaymentAmount: number;
  servicePrice: number;
  amountToPayInSalon: number;
  status?: string;
}

export interface CompanyFinancialMetric {
  totalRevenue: number;
  totalDownPaymentCollected: number;
  totalPlatformFees: number;
  netIncome: number;
  availableBalance: number;
  escrowLockedBalance: number;
  totalWithdrawn: number;
}

export interface CompanyDashboardMetrics {
  company?: {
    id: string;
    businessName: string;
    slug: string;
  };
  period?: {
    startDate: string;
    endDate: string;
  };
  financial?: CompanyFinancialMetric;
  revenue?: CompanyFinancialMetric;
  volume?: {
    total: number;
    completed: number;
    confirmed?: number;
    canceled: number;
    pendingPayment?: number;
    occupancyRate?: number;
    completionRate?: number;
  };
  todayAppointments?: TodayAppointmentMetric[];
  upcomingToday?: TodayAppointmentMetric[];
}

