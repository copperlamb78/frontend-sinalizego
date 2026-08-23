import type {
  CompanyBalance,
  CompanyWithdrawal,
  CompanyDashboardMetrics
} from '@/types/company.types';
import type { Appointment } from '@/types/appointment.types';

export const MOCK_DASHBOARD_METRICS: CompanyDashboardMetrics = {
  revenue: {
    totalRevenue: 2450.0,
    totalDownPaymentCollected: 820.0,
    totalPlatformFees: 112.5,
    netIncome: 2337.5,
    availableBalance: 720.0,
    escrowLockedBalance: 100.0,
    totalWithdrawn: 500.0
  },
  volume: {
    total: 56,
    completed: 48,
    canceled: 4,
    occupancyRate: 92.5
  },
  todayAppointments: [
    {
      id: 'app-today-1',
      appointmentDate: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
      clientName: 'Carlos Eduardo',
      clientPhone: '11988887777',
      serviceName: 'Corte Degradê / Fade Master',
      durationMinutes: 30,
      downPaymentAmount: 15.0,
      servicePrice: 45.0,
      amountToPayInSalon: 30.0,
      status: 'CONFIRMED'
    },
    {
      id: 'app-today-2',
      appointmentDate: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
      clientName: 'Rafael Silva',
      clientPhone: '11977776666',
      serviceName: 'Barba Terapia Completa',
      durationMinutes: 30,
      downPaymentAmount: 15.0,
      servicePrice: 35.0,
      amountToPayInSalon: 20.0,
      status: 'CONFIRMED'
    },
    {
      id: 'app-today-3',
      appointmentDate: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
      clientName: 'Marcos Vinicius',
      clientPhone: '11966665555',
      serviceName: 'Combo Completo (Corte + Barba)',
      durationMinutes: 60,
      downPaymentAmount: 25.0,
      servicePrice: 75.0,
      amountToPayInSalon: 50.0,
      status: 'CONFIRMED'
    },
    {
      id: 'app-today-4',
      appointmentDate: new Date(new Date().setHours(16, 30, 0, 0)).toISOString(),
      clientName: 'Lucas Ferreira',
      clientPhone: '11955554444',
      serviceName: 'Corte Degradê / Fade Master',
      durationMinutes: 30,
      downPaymentAmount: 15.0,
      servicePrice: 45.0,
      amountToPayInSalon: 30.0,
      status: 'CONFIRMED'
    }
  ]
};

export const MOCK_COMPANY_BALANCE: CompanyBalance = {
  companyId: 'demo-vintage-club-id',
  businessName: 'Barbearia Vintage Club',
  walletId: 'wal_demo_123456',
  availableBalance: 720.0,
  escrowLockedBalance: 100.0,
  completedNetRevenue: 1220.0,
  totalWithdrawn: 500.0,
  nextFreeWithdrawalDate: new Date(Date.now() + 5 * 86400000).toISOString(),
  instantTransferFee: 5.0
};

export const MOCK_WITHDRAWALS_HISTORY: CompanyWithdrawal[] = [
  {
    id: 'with-001',
    requestedAmount: 300.0,
    transferFee: 0.0,
    netAmountTransferred: 300.0,
    status: 'CONFIRMED',
    isFreeWeekly: true,
    asaasTransferId: 'tra_998811',
    transferredAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'with-002',
    requestedAmount: 205.0,
    transferFee: 5.0,
    netAmountTransferred: 200.0,
    status: 'CONFIRMED',
    isFreeWeekly: false,
    asaasTransferId: 'tra_776622',
    transferredAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

export const MOCK_OWNER_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-today-1',
    companyId: 'demo-vintage-club-id',
    serviceId: 'srv-corte-degrade',
    clientId: 'cli-001',
    appointmentDate: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    status: 'CONFIRMED',
    servicePrice: 45.0,
    downPaymentAmount: 15.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      id: 'cli-001',
      name: 'Carlos Eduardo',
      email: 'carlos@exemplo.com',
      phone: '11988887777'
    },
    service: {
      id: 'srv-corte-degrade',
      name: 'Corte Degradê / Fade Master',
      durationMinutes: 30,
      totalPrice: 45.0,
      downPaymentPercent: 50
    }
  },
  {
    id: 'app-today-2',
    companyId: 'demo-vintage-club-id',
    serviceId: 'srv-barba-terapia',
    clientId: 'cli-002',
    appointmentDate: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    status: 'CONFIRMED',
    servicePrice: 35.0,
    downPaymentAmount: 15.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      id: 'cli-002',
      name: 'Rafael Silva',
      email: 'rafael@exemplo.com',
      phone: '11977776666'
    },
    service: {
      id: 'srv-barba-terapia',
      name: 'Barba Terapia Completa',
      durationMinutes: 30,
      totalPrice: 35.0,
      downPaymentPercent: 50
    }
  },
  {
    id: 'app-today-3',
    companyId: 'demo-vintage-club-id',
    serviceId: 'srv-combo-completo',
    clientId: 'cli-003',
    appointmentDate: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    status: 'CONFIRMED',
    servicePrice: 75.0,
    downPaymentAmount: 25.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      id: 'cli-003',
      name: 'Marcos Vinicius',
      email: 'marcos@exemplo.com',
      phone: '11966665555'
    },
    service: {
      id: 'srv-combo-completo',
      name: 'Combo Completo (Corte + Barba)',
      durationMinutes: 60,
      totalPrice: 75.0,
      downPaymentPercent: 25
    }
  },
  {
    id: 'app-today-4',
    companyId: 'demo-vintage-club-id',
    serviceId: 'srv-corte-degrade',
    clientId: 'cli-004',
    appointmentDate: new Date(new Date().setHours(16, 30, 0, 0)).toISOString(),
    status: 'CONFIRMED',
    servicePrice: 45.0,
    downPaymentAmount: 15.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      id: 'cli-004',
      name: 'Lucas Ferreira',
      email: 'lucas@exemplo.com',
      phone: '11955554444'
    },
    service: {
      id: 'srv-corte-degrade',
      name: 'Corte Degradê / Fade Master',
      durationMinutes: 30,
      totalPrice: 45.0,
      downPaymentPercent: 50
    }
  }
];
