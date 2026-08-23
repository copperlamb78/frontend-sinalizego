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

export const MOCK_BELLA_DONNA: CompanyStorefront = {
  id: 'demo-bella-donna-id',
  businessName: 'Studio Bella Donna',
  slug: 'bella-donna',
  providerType: 'Salão de Beleza',
  whatsapp: '41998887766',
  district: 'Batel',
  street: 'Avenida do Batel',
  number: '1250',
  city: 'Curitiba',
  state: 'PR',
  zipCode: '80420-090',
  logoPhoto: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80',
  bannerPhoto: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
  timezone: 'America/Sao_Paulo',
  workingHours: [
    { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isClosed: true }, // Domingo
    { dayOfWeek: 1, startTime: '09:00', endTime: '19:00', isClosed: true }, // Segunda
    { dayOfWeek: 2, startTime: '09:00', endTime: '19:30', isClosed: false }, // Terça
    { dayOfWeek: 3, startTime: '09:00', endTime: '19:30', isClosed: false }, // Quarta
    { dayOfWeek: 4, startTime: '09:00', endTime: '20:00', isClosed: false }, // Quinta
    { dayOfWeek: 5, startTime: '09:00', endTime: '20:00', isClosed: false }, // Sexta
    { dayOfWeek: 6, startTime: '08:30', endTime: '19:00', isClosed: false }  // Sábado
  ],
  serviceGroups: [
    {
      id: 'grp-cabelo-mechas',
      name: 'Cabelo & Mechas',
      capacity: 3,
      services: [
        {
          id: 'srv-corte-escova-glam',
          name: 'Corte Estilizado & Escova Modelada',
          description: 'Diagnóstico capilar personalizado, corte moderno com visagismo, lavagem relaxante com massagem capilar e escova com finalização glow.',
          durationMinutes: 45,
          totalPrice: 90.0,
          downPaymentPercent: 50
        },
        {
          id: 'srv-hidratacao-ozonio',
          name: 'Hidratação Profunda com Ozonioterapia',
          description: 'Tratamento intensivo de reposição hídrica e lipídica com vapor de ozônio para brilho espelhado e maciez profunda.',
          durationMinutes: 40,
          totalPrice: 120.0,
          downPaymentPercent: 25
        },
        {
          id: 'srv-morena-iluminada',
          name: 'Mechas Morena Iluminada / Balayage',
          description: 'Técnica exclusiva sem marcações, com proteção Plex para preservar a integridade dos fios, tonalização e reconstrução pós-química.',
          durationMinutes: 120,
          totalPrice: 280.0,
          downPaymentPercent: 25
        }
      ]
    },
    {
      id: 'grp-estetica-unhas',
      name: 'Estética, Olhar & Unhas Spa',
      capacity: 2,
      services: [
        {
          id: 'srv-lash-lifting',
          name: 'Lash Lifting & Brow Lamination',
          description: 'Curvatura e hidratação profunda dos cílios naturais combinada com alinhamento e design estratégico das sobrancelhas.',
          durationMinutes: 50,
          totalPrice: 85.0,
          downPaymentPercent: 50
        },
        {
          id: 'srv-manicure-pedicure-spa',
          name: 'Spa dos Pés & Esmaltação em Gel',
          description: 'Esfoliação com sais marinhos, hidratação profunda em parafina morna, cutilagem russa e esmaltação em gel de alta durabilidade.',
          durationMinutes: 45,
          totalPrice: 65.0,
          downPaymentPercent: 50
        },
        {
          id: 'srv-limpeza-pele-glow',
          name: 'Limpeza de Pele Profunda com Peeling de Diamante',
          description: 'Higienização, emoliência, extração minuciosa por sucção, alta frequência cicatrizante e máscara calmante de camomila.',
          durationMinutes: 60,
          totalPrice: 110.0,
          downPaymentPercent: 25
        }
      ]
    }
  ]
};

export const MOCK_NAVALHA_DE_OURO: CompanyStorefront = {
  id: 'demo-navalha-de-ouro-id',
  businessName: 'Navalha de Ouro',
  slug: 'navalha-de-ouro',
  providerType: 'Barbearia',
  whatsapp: '31987654321',
  district: 'Savassi',
  street: 'Rua Pernambuco',
  number: '890',
  city: 'Belo Horizonte',
  state: 'MG',
  zipCode: '30130-151',
  logoPhoto: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80',
  bannerPhoto: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1200&q=80',
  timezone: 'America/Sao_Paulo',
  workingHours: [
    { dayOfWeek: 0, startTime: '09:00', endTime: '14:00', isClosed: false }, // Domingo
    { dayOfWeek: 1, startTime: '09:00', endTime: '20:00', isClosed: false }, // Segunda
    { dayOfWeek: 2, startTime: '09:00', endTime: '20:00', isClosed: false }, // Terça
    { dayOfWeek: 3, startTime: '09:00', endTime: '20:00', isClosed: false }, // Quarta
    { dayOfWeek: 4, startTime: '09:00', endTime: '21:00', isClosed: false }, // Quinta
    { dayOfWeek: 5, startTime: '09:00', endTime: '21:00', isClosed: false }, // Sexta
    { dayOfWeek: 6, startTime: '08:00', endTime: '20:00', isClosed: false }  // Sábado
  ],
  serviceGroups: [
    {
      id: 'grp-cortes-ouro',
      name: 'Cortes Tradicionais & Degradê',
      capacity: 5,
      services: [
        {
          id: 'srv-corte-navalha-ouro',
          name: 'Corte Navalha de Ouro Especial',
          description: 'Corte personalizado na tesoura e máquina, raspagem com navalhete descartável, acabamento premium e pomada modeladora.',
          durationMinutes: 30,
          totalPrice: 40.0,
          downPaymentPercent: 50
        },
        {
          id: 'srv-barba-completa-toalha',
          name: 'Barboterapia & Desenho de Barba',
          description: 'Toalha quente com essência de menta e eucalipto, barbear suave com navalhete, óleo hidratante e loção pós-barba refrescante.',
          durationMinutes: 30,
          totalPrice: 35.0,
          downPaymentPercent: 50
        },
        {
          id: 'srv-combo-corte-barba-ouro',
          name: 'Combo Ouro: Corte + Barba + Sobrancelha',
          description: 'Alinhamento completo do visual com lavagem refrescante, toalha quente e finalização com tônico capilar fortalecedor.',
          durationMinutes: 55,
          totalPrice: 70.0,
          downPaymentPercent: 25
        }
      ]
    },
    {
      id: 'grp-tratamentos-capilares',
      name: 'Química & Relaxamento Masculino',
      capacity: 2,
      services: [
        {
          id: 'srv-selagem-organica',
          name: 'Selagem Orgânica Antifrizz',
          description: 'Alinhamento e redução de volume natural sem formol, devolvendo maciez e brilho intenso aos cabelos.',
          durationMinutes: 45,
          totalPrice: 80.0,
          downPaymentPercent: 50
        },
        {
          id: 'srv-platinado-global',
          name: 'Platinado Global / Nevou',
          description: 'Descoloração segura com proteção de couro cabeludo e matização perolada impecável.',
          durationMinutes: 90,
          totalPrice: 130.0,
          downPaymentPercent: 25
        }
      ]
    }
  ]
};

export const MOCK_COMPANIES: Record<string, CompanyStorefront> = {
  'vintage-club': MOCK_VINTAGE_CLUB,
  'barbearia-vintage-club': MOCK_VINTAGE_CLUB,
  'bella-donna': MOCK_BELLA_DONNA,
  'studio-bella-donna': MOCK_BELLA_DONNA,
  'navalha-de-ouro': MOCK_NAVALHA_DE_OURO
};
