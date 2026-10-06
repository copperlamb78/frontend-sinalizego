import type { StorefrontCompany } from '../types/storefront.types';

/**
 * Dados de demonstração fiéis aos retornos do Prisma/NestJS
 * (modules/company/company.service.ts)
 */
export const mockStorefrontCompany: StorefrontCompany = {
  id: 'clsw0s98x000013z81z8z8z8z',
  businessName: "Barber's Club",
  slug: 'barbers-club',
  providerType: 'Barbearia & Estética Masculina',
  whatsapp: '75999998888',
  chairsCount: 3,
  district: 'SIM',
  street: 'Avenida Artêmia Pires Freitas',
  city: 'Feira de Santana',
  state: 'Bahia',
  zipCode: '44085370',
  number: '123',
  logoPhoto: null,
  bannerPhoto: null,
  timezone: 'America/Sao_Paulo',
  createdAt: '2026-07-18T10:33:00.000Z',
  workingHours: [
    {
      id: 'wh-1',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '19:00',
      isClosed: false,
    },
    {
      id: 'wh-2',
      dayOfWeek: 2,
      startTime: '09:00',
      endTime: '19:00',
      isClosed: false,
    },
    {
      id: 'wh-3',
      dayOfWeek: 3,
      startTime: '09:00',
      endTime: '19:00',
      isClosed: false,
    },
    {
      id: 'wh-4',
      dayOfWeek: 4,
      startTime: '09:00',
      endTime: '19:00',
      isClosed: false,
    },
    {
      id: 'wh-5',
      dayOfWeek: 5,
      startTime: '09:00',
      endTime: '19:00',
      isClosed: false,
    },
    {
      id: 'wh-6',
      dayOfWeek: 6,
      startTime: '08:30',
      endTime: '18:00',
      isClosed: false,
    },
    {
      id: 'wh-7',
      dayOfWeek: 0,
      startTime: '00:00',
      endTime: '00:00',
      isClosed: true,
    },
  ],
  serviceGroups: [
    {
      id: 'sg-1',
      name: 'Cabelo e Barba',
      capacity: 3,
      services: [
        {
          id: 'srv-1',
          name: 'Corte Degradê & Barboterapia',
          description: 'Corte moderno com tesoura/máquina e toalha quente relaxante',
          durationMinutes: 45,
          totalPrice: '60.00',
          downPaymentPercent: 50,
        },
        {
          id: 'srv-2',
          name: 'Corte Social Tesoura',
          description: 'Alinhamento clássico tradicional, acabamento fino e lavagem',
          durationMinutes: 30,
          totalPrice: '40.00',
          downPaymentPercent: 50,
        },
        {
          id: 'srv-3',
          name: 'Barboterapia Tradicional',
          description: 'Design de barba, toalha quente, hidratação e pós-barba premium',
          durationMinutes: 25,
          totalPrice: '30.00',
          downPaymentPercent: 50,
        },
      ],
    },
    {
      id: 'sg-2',
      name: 'Tratamentos',
      capacity: 2,
      services: [
        {
          id: 'srv-4',
          name: 'Hidratação Profunda & Escova',
          description: 'Nutrição capilar com máscara reconstrutora e finalização',
          durationMinutes: 40,
          totalPrice: '50.00',
          downPaymentPercent: 50,
        },
        {
          id: 'srv-5',
          name: 'Camuflagem de Fios Brancos',
          description: 'Pigmentação natural e discreta para cabelo e barba',
          durationMinutes: 35,
          totalPrice: '45.00',
          downPaymentPercent: 50,
        },
      ],
    },
    {
      id: 'sg-3',
      name: 'Combos Especiais',
      capacity: 2,
      services: [
        {
          id: 'srv-6',
          name: 'Combo Completo (Corte + Barba + Sobrancelha)',
          description: 'Experiência completa com bebida de cortesia e toalha quente',
          durationMinutes: 60,
          totalPrice: '85.00',
          downPaymentPercent: 50,
        },
        {
          id: 'srv-7',
          name: 'Dia do Noivo Premium',
          description: 'Tratamento VIP completo exclusivo com horário reservado',
          durationMinutes: 120,
          totalPrice: '450.00',
          downPaymentPercent: 30, // 30% Flexível para alto ticket
        },
      ],
    },
  ],
};
