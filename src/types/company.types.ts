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
