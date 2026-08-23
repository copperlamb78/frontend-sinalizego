import type { CompanyStorefront } from '@/types/company.types';

export const MOCK_VINTAGE_CLUB: CompanyStorefront = {
  id: 'demo-vintage-club-id',
  businessName: 'Barbearia Vintage Club',
  slug: 'vintage-club',
  providerType: 'Barbearia',
  whatsapp: '11999998888',
  district: 'Pinheiros',
  street: 'Rua dos Pinheiros',
  number: '450',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '05422-000',
  logoPhoto: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=80',
  bannerPhoto: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
  timezone: 'America/Sao_Paulo',
  workingHours: [
    { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isClosed: true }, // Domingo
    { dayOfWeek: 1, startTime: '09:00', endTime: '19:00', isClosed: false }, // Segunda
    { dayOfWeek: 2, startTime: '09:00', endTime: '19:00', isClosed: false }, // Terça
    { dayOfWeek: 3, startTime: '09:00', endTime: '19:00', isClosed: false }, // Quarta
    { dayOfWeek: 4, startTime: '09:00', endTime: '20:00', isClosed: false }, // Quinta
    { dayOfWeek: 5, startTime: '09:00', endTime: '20:00', isClosed: false }, // Sexta
    { dayOfWeek: 6, startTime: '08:30', endTime: '19:00', isClosed: false }  // Sábado
  ],
  serviceGroups: [
    {
      id: 'grp-cortes-barba',
      name: 'Cortes & Barba Clássica',
      capacity: 4,
      services: [
        {
          id: 'srv-corte-degrade',
          name: 'Corte Degradê / Fade Master',
          description: 'Corte com acabamento refinado na navalha, degradê suave, alinhamento de pezinho e lavagem inclusa.',
          durationMinutes: 30,
          totalPrice: 45.0,
          downPaymentPercent: 50
        },
        {
          id: 'srv-barba-terapia',
          name: 'Barba Terapia com Toalha Quente',
          description: 'Modelagem completa com toalha quente, óleos essenciais, massagem facial revigorante e navalhete.',
          durationMinutes: 30,
          totalPrice: 35.0,
          downPaymentPercent: 50
        },
        {
          id: 'srv-combo-completo',
          name: 'Combo Completo (Corte + Barba + Lavagem)',
          description: 'Experiência VIP completa: corte moderno, desenho e terapia de barba, sobrancelha e finalização com pomada matte.',
          durationMinutes: 60,
          totalPrice: 75.0,
          downPaymentPercent: 25
        }
      ]
    },
    {
      id: 'grp-tratamentos-acabamento',
      name: 'Tratamentos & Estética Masculina',
      capacity: 2,
      services: [
        {
          id: 'srv-sobrancelha',
          name: 'Design de Sobrancelha na Navalha',
          description: 'Alinhamento e limpeza precisa do desenho da sobrancelha.',
          durationMinutes: 15,
          totalPrice: 15.0,
          downPaymentPercent: 100
        },
        {
          id: 'srv-camuflagem-brancos',
          name: 'Camuflagem de Cabelo / Barba',
          description: 'Pigmentação discreta e natural para disfarçar fios brancos com produtos antialérgicos.',
          durationMinutes: 25,
          totalPrice: 40.0,
          downPaymentPercent: 50
        },
        {
          id: 'srv-limpeza-pele',
          name: 'Limpeza de Pele Express com Argila Negra',
          description: 'Remoção de cravos e impurezas com vapor de ozônio e máscara de argila negra purificante.',
          durationMinutes: 40,
          totalPrice: 60.0,
          downPaymentPercent: 50
        }
      ]
    }
  ]
};
