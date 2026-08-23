export interface WorkingHour {
  id?: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  startTime: string; // "09:00"
  endTime: string; // "19:00"
  lunchStartTime?: string | null;
  lunchEndTime?: string | null;
  isClosed: boolean;
}

export interface CompanyService {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  totalPrice: number;
  downPaymentPercent: number; // 25, 50 or 100
  serviceGroupId?: string;
}

export interface ServiceGroup {
  id: string;
  name: string;
  capacity: number;
  services: CompanyService[];
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
  workingHours: WorkingHour[];
  serviceGroups: ServiceGroup[];
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
  clientName: string;
  clientPhone: string;
  serviceName: string;
  durationMinutes: number;
  downPaymentAmount: number;
  servicePrice: number;
  amountToPayInSalon: number;
  status?: string;
}

export interface CompanyDashboardMetrics {
  revenue: {
    totalRevenue: number;
    totalDownPaymentCollected: number;
    totalPlatformFees: number;
    netIncome: number;
    availableBalance: number;
    escrowLockedBalance: number;
    totalWithdrawn: number;
  };
  volume: {
    total: number;
    completed: number;
    canceled: number;
    occupancyRate: number;
  };
  todayAppointments: TodayAppointmentMetric[];
}
