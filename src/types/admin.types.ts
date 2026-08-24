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
  platformGrossRevenue?: number;
  totalAsaasPixCosts?: number;
  platformNetProfit?: number;
  gmv?: number;
  financial?: {
    platformGrossRevenue?: number;
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
      pendingPayment?: number;
    };
    appointmentsByStatus?: {
      COMPLETED?: number;
      CONFIRMED?: number;
      CANCELED?: number;
      PENDING_PAYMENT?: number;
    };
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
  createdAt: string;
}
