/**
 * Tipos e Contratos da Vitrine Pública do Estabelecimento
 * Sincronizados com a API NestJS (modules/company e modules/appointments)
 */

export interface StorefrontWorkingHour {
  id: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  startTime: string; // "09:00"
  endTime: string; // "19:00"
  lunchStartTime?: string | null;
  lunchEndTime?: string | null;
  isClosed: boolean;
}

export interface StorefrontService {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  totalPrice: string | number; // Decimal string retornado pelo Prisma/NestJS (ex: "60.00")
  downPaymentPercent?: number | null; // ex: 50
}

export interface StorefrontServiceGroup {
  id: string;
  name: string;
  capacity?: number;
  services: StorefrontService[];
}

export interface StorefrontCompany {
  id: string;
  businessName: string;
  slug: string;
  providerType?: string | null;
  whatsapp: string;
  chairsCount: number;
  district?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  number?: string | null;
  logoPhoto?: string | null;
  bannerPhoto?: string | null;
  timezone: string;
  themePalette?: string | null;
  createdAt: string;
  workingHours: StorefrontWorkingHour[];
  serviceGroups: StorefrontServiceGroup[];
}

export interface AvailableSlotsResponse {
  date: string;
  totalAvailable: number;
  slots: string[]; // ex: ["09:00", "09:45", "10:30"]
}

export interface AvailableSlotsParams {
  companyId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
}
