import { test, expect } from '@playwright/test';

test.describe('Portal do Usuário Comum — Explorar Barbearias, Agendamentos, Créditos e Perfil (E2E)', () => {
  const mockClient = {
    id: 'client-uuid-1',
    name: 'Gabriel Silva',
    email: 'gabriel.silva@teste.com',
    role: 'CLIENT',
    phone: '61987654321',
    cpfCnpj: '12345678909',
  };

  const mockCompanies = {
    items: [
      {
        id: 'comp-1',
        businessName: 'VIP Barber Club',
        slug: 'vip-barber-club',
        providerType: 'Barbearia',
        district: 'Asa Sul',
        street: 'CLS 308 Bloco B',
        number: '12',
        city: 'Brasília',
        state: 'DF',
        zipCode: '70355520',
        logoPhoto: null,
        bannerPhoto: null,
        createdAt: '2026-09-01T00:00:00.000Z',
        services: [
          { id: 'srv-1', name: 'Degradê Navalhado', totalPrice: 45, durationMinutes: 40 },
          { id: 'srv-2', name: 'Barboterapia', totalPrice: 40, durationMinutes: 30 },
        ],
        workingHours: [
          { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isClosed: true },
          { dayOfWeek: 1, startTime: '09:00', endTime: '19:00', isClosed: false },
          { dayOfWeek: 2, startTime: '09:00', endTime: '19:00', isClosed: false },
          { dayOfWeek: 3, startTime: '09:00', endTime: '19:00', isClosed: false },
          { dayOfWeek: 4, startTime: '09:00', endTime: '19:00', isClosed: false },
          { dayOfWeek: 5, startTime: '09:00', endTime: '19:00', isClosed: false },
          { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isClosed: false },
        ],
        minPrice: 40,
        servicesCount: 2,
      },
      {
        id: 'comp-2',
        businessName: 'Fade Master Barbearia',
        slug: 'fade-master-barbearia',
        providerType: 'Barbearia',
        district: 'Águas Claras',
        street: 'Av. das Castanheiras',
        number: '1020',
        city: 'Brasília',
        state: 'DF',
        zipCode: '71900100',
        logoPhoto: null,
        bannerPhoto: null,
        createdAt: '2026-09-02T00:00:00.000Z',
        services: [
          { id: 'srv-3', name: 'Corte Clássico', totalPrice: 35, durationMinutes: 30 },
        ],
        workingHours: [
          { dayOfWeek: 0, startTime: '08:00', endTime: '20:00', isClosed: false },
          { dayOfWeek: 1, startTime: '08:00', endTime: '20:00', isClosed: false },
          { dayOfWeek: 2, startTime: '08:00', endTime: '20:00', isClosed: false },
          { dayOfWeek: 3, startTime: '08:00', endTime: '20:00', isClosed: false },
          { dayOfWeek: 4, startTime: '08:00', endTime: '20:00', isClosed: false },
          { dayOfWeek: 5, startTime: '08:00', endTime: '20:00', isClosed: false },
          { dayOfWeek: 6, startTime: '08:00', endTime: '20:00', isClosed: false },
        ],
        minPrice: 35,
        servicesCount: 1,
      },
    ],
    total: 2,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  test.beforeEach(async ({ page }) => {
    // Configura sessão autenticada do usuário comum via localStorage com as chaves oficiais do sistema
    await page.addInitScript((client) => {
      localStorage.setItem('@sinalizego:token', 'mock_client_access_token');
      localStorage.setItem('@sinalizego:refresh_token', 'mock_client_refresh_token');
      localStorage.setItem('@sinalizego:user', JSON.stringify(client));
    }, mockClient);

    // Mock das rotas essenciais de autenticação
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockClient),
      });
    });
  });

  test('1. Deve renderizar a página de Explorar Barbearias com cards limpos e sem neon', async ({ page }) => {
    await page.route('**/api/v1/company/explore*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCompanies),
      });
    });

    await page.goto('/barbearias');

    // Cabeçalho e barra de busca visíveis
    await expect(page.getByRole('heading', { name: 'Barbearias Próximas' })).toBeVisible();
    await expect(page.getByTestId('barbershop-search-bar')).toBeVisible();
    await expect(page.getByTestId('input-search-term')).toBeVisible();

    // Cards renderizados
    await expect(page.getByRole('heading', { name: 'VIP Barber Club' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fade Master Barbearia' })).toBeVisible();
    await expect(page.getByText('Cortes a partir de').first()).toBeVisible();
    await expect(page.getByTestId('btn-agendar-vip-barber-club')).toBeVisible();
  });

  test('2. Deve listar agendamentos do cliente e acionar modal canônico de cancelamento N6', async ({ page }) => {
    const mockAppointments = [
      {
        id: 'appt-1',
        appointmentDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // > 24h (Estorno 100% Pix)
        appointmentEndDate: new Date(Date.now() + 49 * 3600 * 1000).toISOString(),
        servicePrice: '70.00',
        downPaymentAmount: '35.00',
        status: 'CONFIRMED',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyId: 'comp-1',
        serviceId: 'srv-1',
        company: {
          id: 'comp-1',
          businessName: 'VIP Barber Club',
          slug: 'vip-barber-club',
          district: 'Asa Sul',
          city: 'Brasília',
        },
        service: {
          id: 'srv-1',
          name: 'Degradê Navalhado',
          durationMinutes: 40,
        },
      },
    ];

    await page.route('**/api/v1/appointments/user*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAppointments),
      });
    });

    await page.route('**/api/v1/appointments/appt-1/client', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Agendamento cancelado com sucesso.',
          policy: 'REFUND',
          isRefunded: true,
          refundAmount: 35,
        }),
      });
    });

    await page.goto('/meus-agendamentos');

    await expect(page.getByRole('heading', { name: 'Meus Agendamentos' })).toBeVisible();
    await expect(page.getByTestId('appointment-card-appt-1')).toBeVisible();
    await expect(page.getByText('Sinal Confirmado')).toBeVisible();
    await expect(page.getByTestId('btn-download-ics')).toBeVisible();

    // Clica no botão de cancelar agendamento
    await page.getByTestId('btn-cancelar-agendamento').click();

    // Modal canônico de cancelamento abre com transparência da regra CDC
    const modal = page.getByTestId('cancel-appointment-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByText('Você receberá 100% de estorno via Pix')).toBeVisible();

    // Confirma cancelamento
    await page.getByTestId('btn-confirmar-cancelamento-modal').click();
    await expect(modal).not.toBeVisible();
  });

  test('3. Deve consultar saldo de créditos, barbearias vinculadas e histórico de transações', async ({ page }) => {
    const mockCredits = {
      totalAvailable: 65,
      availableByCompany: [
        {
          companyId: 'comp-1',
          businessName: 'VIP Barber Club',
          slug: 'vip-barber-club',
          logoPhoto: null,
          totalAmount: 35,
          items: [
            {
              id: 'cred-1',
              amount: 35,
              status: 'AVAILABLE',
              expiresAt: new Date(Date.now() + 80 * 24 * 3600 * 1000).toISOString(),
              createdAt: new Date().toISOString(),
              company: {
                id: 'comp-1',
                businessName: 'VIP Barber Club',
                slug: 'vip-barber-club',
              },
            },
          ],
        },
      ],
      allCredits: [
        {
          id: 'cred-1',
          amount: 35,
          status: 'AVAILABLE',
          expiresAt: new Date(Date.now() + 80 * 24 * 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          company: {
            id: 'comp-1',
            businessName: 'VIP Barber Club',
            slug: 'vip-barber-club',
          },
        },
      ],
    };

    await page.route('**/api/v1/client-credits/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCredits),
      });
    });

    await page.goto('/meus-creditos');

    await expect(page.getByRole('heading', { name: 'Meus Créditos' })).toBeVisible();
    await expect(page.getByTestId('credit-summary-card')).toBeVisible();
    await expect(page.getByText('R$ 65,00')).toBeVisible();
    await expect(page.getByTestId('credit-card-comp-1')).toBeVisible();
    await expect(page.getByTestId('credit-row-cred-1')).toBeVisible();
  });

  test('4. Deve exibir e gerenciar perfil, CPF Asaas e modal de exclusão LGPD', async ({ page }) => {
    await page.goto('/perfil');

    await expect(page.getByRole('heading', { name: 'Meu Perfil & Segurança' })).toBeVisible();
    await expect(page.getByTestId('profile-personal-card')).toBeVisible();
    await expect(page.getByTestId('profile-cpf-card')).toBeVisible();
    await expect(page.getByText('Cliente Asaas Ativo')).toBeVisible();
    await expect(page.getByTestId('profile-password-card')).toBeVisible();

    // Clica para abrir modal de exclusão LGPD
    await page.getByTestId('btn-abrir-modal-excluir-conta').click();
    const deleteModal = page.getByTestId('delete-account-modal');
    await expect(deleteModal).toBeVisible();

    // Botão fica desabilitado até digitar "EXCLUIR"
    const confirmBtn = page.getByTestId('btn-confirm-delete-account');
    await expect(confirmBtn).toBeDisabled();

    await page.getByTestId('input-confirm-delete').fill('EXCLUIR');
    await expect(confirmBtn).toBeEnabled();
  });
});
