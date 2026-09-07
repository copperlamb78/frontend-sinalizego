import { Role } from './auth.types';

export interface AdminTopTenant {
  id?: string;
  companyId?: string;
  businessName: string;
  slug: string;
  completedAppointments?: number;
  appointmentsCount?: number;
  totalRevenue: number;
  platformFeesGenerated?: number;
  platformFeeGenerated?: number;
}

export interface AdminDashboardMetrics {
  period?: {
    startDate: string;
    endDate: string;
  };
  platformGrossRevenue?: number;
  totalAsaasPixCosts?: number;
  platformNetProfit?: number;
  gmv?: number;
  financial?: {
    platformGrossRevenue?: number;
    platformFeeInEscrow?: number;
    totalAsaasPixCosts?: number;
    platformNetProfit?: number;
    gmv?: number;
  };
  growth?: {
    totalCompanies?: number;
    activeCompanies?: number;
    inactiveCompanies?: number;
    totalUsers?: number;
    clients?: number;
    companyOwners?: number;
    users?: {
      total?: number;
      clients?: number;
      owners?: number;
    };
    companies?: {
      total?: number;
      active?: number;
      inactive?: number;
    };
    appointments?: {
      total?: number;
      completed?: number;
      confirmed?: number;
      canceled?: number;
      noShow?: number;
      pendingPayment?: number;
      byStatus?: Record<string, number>;
    };
    appointmentsByStatus?: Record<string, number>;
  };
  lossPrevented?: {
    totalLossPrevented: number;
    retainedAppointmentsCount: number;
    estimatedLossWithoutApp: number;
    protectionEfficiencyRate: number;
  };
  topTenants?: AdminTopTenant[];
}

export interface AdminCompanyItem {
  id: string;
  businessName: string;
  slug: string;
  city: string;
  state: string;
  isActive: boolean;
  createdAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  _count?: {
    appointments: number;
    services: number;
    serviceGroups: number;
  };
}

export interface AdminCompaniesResponse {
  data: AdminCompanyItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  cpfCnpj?: string;
  isActive: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  disabledAt?: string | null;
}

export interface CreateUserByAdminData {
  name: string;
  email: string;
  phone: string;
  role: Role;
  password?: string;
  sendEmail?: boolean;
}

export interface UpdateUserByAdminData {
  name?: string;
  email?: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
}

export interface AdminUserAudit {
  user: AdminUserItem & {
    disabledAt?: string | null;
    updatedAt?: string;
    cpfCnpjMasked?: string | null;
    asaasCustomerId?: string | null;
    companies: Array<{
      id: string;
      businessName: string;
      slug: string;
      providerType: string;
      city: string;
      state: string;
      isActive: boolean;
      createdAt: string;
      financialProfile?: {
        id: string;
        walletId: string;
        isApproved: boolean;
        approvalStatus?: string;
        cpfCnpj?: string;
      } | null;
    }>;
  };
  audit: {
    totalAppointments: number;
    appointmentCounts: Record<string, number>;
    totalSpent: number;
    totalDepositsPaid: number;
    transactionsCount: number;
    transactionsTotalValue: number;
    companiesCount: number;
    recentAppointments: Array<{
      id: string;
      status: string;
      appointmentDate: string;
      serviceName: string;
      companyName: string;
      companySlug: string;
      servicePrice: number;
      downPaymentAmount: number;
    }>;
  };
}
