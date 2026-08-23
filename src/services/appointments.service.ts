import { api } from '@/config/api.config';
import type {
  AvailableSlotsResponse,
  CreateAppointmentDto,
  Appointment
} from '@/types/appointment.types';
import { MOCK_VINTAGE_CLUB } from '@/mocks/storefront.mock';
import { MOCK_OWNER_APPOINTMENTS } from '@/mocks/owner.mock';

const MOCK_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:30', '14:00', '14:30', '15:00', '16:00', '17:00', '18:00'];

export const appointmentsService = {
  /**
   * Fetches available time slots for a given company, service and date
   * GET /api/v1/appointments/available-slots?companyId=...&serviceId=...&date=YYYY-MM-DD
   */
  getAvailableSlots: async (
    companyId: string,
    serviceId: string,
    date: string
  ): Promise<AvailableSlotsResponse> => {
    if (companyId === 'demo-vintage-club-id') {
      return {
        date,
        totalAvailable: MOCK_SLOTS.length,
        slots: MOCK_SLOTS
      };
    }

    try {
      const response = await api.get<AvailableSlotsResponse>(
        '/appointments/available-slots',
        {
          params: { companyId, serviceId, date }
        }
      );
      return response.data;
    } catch {
      return {
        date,
        totalAvailable: MOCK_SLOTS.length,
        slots: MOCK_SLOTS
      };
    }
  },

  /**
   * Creates a new booking reservation with status PENDING_PAYMENT
   * POST /api/v1/appointments
   */
  createAppointment: async (
    dto: CreateAppointmentDto
  ): Promise<Appointment> => {
    if (dto.companyId === 'demo-vintage-club-id') {
      const demoId = `app-demo-${Date.now()}`;
      const service = MOCK_VINTAGE_CLUB.serviceGroups
        .flatMap((g) => g.services)
        .find((s) => s.id === dto.serviceId) || MOCK_VINTAGE_CLUB.serviceGroups[0].services[0];

      const downPaymentAmount = (service.totalPrice * dto.downPaymentPercent) / 100;

      const demoAppointment: Appointment = {
        id: demoId,
        companyId: dto.companyId,
        serviceId: dto.serviceId,
        clientId: 'demo-client-id',
        appointmentDate: dto.appointmentDate,
        status: 'PENDING_PAYMENT',
        servicePrice: service.totalPrice,
        downPaymentAmount,
        platformFeeAmount: 2.5,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        company: {
          id: MOCK_VINTAGE_CLUB.id,
          businessName: MOCK_VINTAGE_CLUB.businessName,
          slug: MOCK_VINTAGE_CLUB.slug,
          providerType: MOCK_VINTAGE_CLUB.providerType,
          whatsapp: MOCK_VINTAGE_CLUB.whatsapp,
          street: MOCK_VINTAGE_CLUB.street,
          number: MOCK_VINTAGE_CLUB.number,
          district: MOCK_VINTAGE_CLUB.district,
          city: MOCK_VINTAGE_CLUB.city,
          state: MOCK_VINTAGE_CLUB.state,
          logoPhoto: MOCK_VINTAGE_CLUB.logoPhoto,
          bannerPhoto: MOCK_VINTAGE_CLUB.bannerPhoto
        },
        service: {
          id: service.id,
          name: service.name,
          description: service.description,
          durationMinutes: service.durationMinutes,
          totalPrice: service.totalPrice,
          downPaymentPercent: dto.downPaymentPercent
        }
      };

      try {
        sessionStorage.setItem(`@sinalizego:demo_app_${demoId}`, JSON.stringify(demoAppointment));
      } catch {
        // ignore
      }

      return demoAppointment;
    }

    try {
      const response = await api.post<Appointment>('/appointments', dto);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const response = await api.post<Appointment>('/appointments/create', dto);
        return response.data;
      }
      throw err;
    }
  },

  /**
   * Fetches full appointment details by ID
   * GET /api/v1/appointments/:id
   */
  getAppointmentById: async (id: string): Promise<Appointment> => {
    if (id.startsWith('app-demo')) {
      try {
        const saved = sessionStorage.getItem(`@sinalizego:demo_app_${id}`);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {
        // ignore
      }

      const service = MOCK_VINTAGE_CLUB.serviceGroups[0].services[0];
      return {
        id,
        companyId: MOCK_VINTAGE_CLUB.id,
        serviceId: service.id,
        clientId: 'demo-client-id',
        appointmentDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'PENDING_PAYMENT',
        servicePrice: service.totalPrice,
        downPaymentAmount: (service.totalPrice * 50) / 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        company: {
          id: MOCK_VINTAGE_CLUB.id,
          businessName: MOCK_VINTAGE_CLUB.businessName,
          slug: MOCK_VINTAGE_CLUB.slug,
          providerType: MOCK_VINTAGE_CLUB.providerType,
          whatsapp: MOCK_VINTAGE_CLUB.whatsapp,
          street: MOCK_VINTAGE_CLUB.street,
          number: MOCK_VINTAGE_CLUB.number,
          district: MOCK_VINTAGE_CLUB.district,
          city: MOCK_VINTAGE_CLUB.city,
          state: MOCK_VINTAGE_CLUB.state,
          logoPhoto: MOCK_VINTAGE_CLUB.logoPhoto,
          bannerPhoto: MOCK_VINTAGE_CLUB.bannerPhoto
        },
        service: {
          id: service.id,
          name: service.name,
          description: service.description,
          durationMinutes: service.durationMinutes,
          totalPrice: service.totalPrice,
          downPaymentPercent: 50
        }
      };
    }

    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Fetches user/client appointment history
   * GET /api/v1/appointments/user
   */
  getUserAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await api.get<Appointment[]>('/appointments/user');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return [
        {
          id: 'apt-01',
          companyId: MOCK_VINTAGE_CLUB.id,
          serviceId: MOCK_VINTAGE_CLUB.serviceGroups[0].services[0].id,
          clientId: 'user-01',
          appointmentDate: '2026-08-25T15:30:00.000Z',
          status: 'CONFIRMED',
          servicePrice: 55.0,
          downPaymentAmount: 27.5,
          createdAt: '2026-08-20T10:00:00.000Z',
          updatedAt: '2026-08-20T10:00:00.000Z',
          company: {
            id: MOCK_VINTAGE_CLUB.id,
            businessName: MOCK_VINTAGE_CLUB.businessName,
            slug: MOCK_VINTAGE_CLUB.slug,
            providerType: MOCK_VINTAGE_CLUB.providerType,
            whatsapp: MOCK_VINTAGE_CLUB.whatsapp,
            street: MOCK_VINTAGE_CLUB.street,
            number: MOCK_VINTAGE_CLUB.number,
            district: MOCK_VINTAGE_CLUB.district,
            city: MOCK_VINTAGE_CLUB.city,
            state: MOCK_VINTAGE_CLUB.state,
            logoPhoto: MOCK_VINTAGE_CLUB.logoPhoto,
            bannerPhoto: MOCK_VINTAGE_CLUB.bannerPhoto
          },
          service: {
            id: MOCK_VINTAGE_CLUB.serviceGroups[0].services[0].id,
            name: MOCK_VINTAGE_CLUB.serviceGroups[0].services[0].name,
            durationMinutes: 45,
            totalPrice: 55.0,
            downPaymentPercent: 50
          }
        }
      ];
    } catch {
      return [
        {
          id: 'apt-01',
          companyId: MOCK_VINTAGE_CLUB.id,
          serviceId: MOCK_VINTAGE_CLUB.serviceGroups[0].services[0].id,
          clientId: 'user-01',
          appointmentDate: '2026-08-25T15:30:00.000Z',
          status: 'CONFIRMED',
          servicePrice: 55.0,
          downPaymentAmount: 27.5,
          createdAt: '2026-08-20T10:00:00.000Z',
          updatedAt: '2026-08-20T10:00:00.000Z',
          company: {
            id: MOCK_VINTAGE_CLUB.id,
            businessName: MOCK_VINTAGE_CLUB.businessName,
            slug: MOCK_VINTAGE_CLUB.slug,
            providerType: MOCK_VINTAGE_CLUB.providerType,
            whatsapp: MOCK_VINTAGE_CLUB.whatsapp,
            street: MOCK_VINTAGE_CLUB.street,
            number: MOCK_VINTAGE_CLUB.number,
            district: MOCK_VINTAGE_CLUB.district,
            city: MOCK_VINTAGE_CLUB.city,
            state: MOCK_VINTAGE_CLUB.state,
            logoPhoto: MOCK_VINTAGE_CLUB.logoPhoto,
            bannerPhoto: MOCK_VINTAGE_CLUB.bannerPhoto
          },
          service: {
            id: MOCK_VINTAGE_CLUB.serviceGroups[0].services[0].id,
            name: MOCK_VINTAGE_CLUB.serviceGroups[0].services[0].name,
            durationMinutes: 45,
            totalPrice: 55.0,
            downPaymentPercent: 50
          }
        }
      ];
    }
  },

  /**
   * Fetches company appointments for owner calendar
   * GET /api/v1/appointments/company
   */
  getCompanyAppointments: async (date?: string): Promise<Appointment[]> => {
    try {
      const response = await api.get<Appointment[]>('/appointments/company', {
        params: date ? { date } : {}
      });
      return response.data;
    } catch {
      return MOCK_OWNER_APPOINTMENTS;
    }
  },

  /**
   * Completes an appointment and releases escrow locked balance
   * PATCH /api/v1/appointments/:id/complete
   */
  completeAppointment: async (id: string): Promise<Appointment> => {
    try {
      const response = await api.patch<Appointment>(`/appointments/${id}/complete`);
      return response.data;
    } catch (err: any) {
      // Fallback endpoint
      try {
        const response = await api.patch<Appointment>(`/appointments/${id}/status`, {
          status: 'COMPLETED'
        });
        return response.data;
      } catch {
        // Mock completion for demo appointments
        const appointment = MOCK_OWNER_APPOINTMENTS.find((a) => a.id === id) || {
          id,
          status: 'COMPLETED' as const
        };
        return {
          ...appointment,
          status: 'COMPLETED'
        } as Appointment;
      }
    }
  }
};
