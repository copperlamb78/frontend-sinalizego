import { test, expect } from '@playwright/test';

test.describe('Checkout Pix & Agendamento E2E', () => {
  const mockCompany = {
    id: 'comp-1234',
    businessName: 'Barbearia Vintage',
    slug: 'barbearia-vintage',
    timezone: 'America/Sao_Paulo',
    serviceGroups: [
      {
        id: 'group-1',
        name: 'Cortes',
        services: [
          {
            id: 'serv-1',
            name: 'Corte Degradê Navalhado',
            totalPrice: '60.00',
            durationMinutes: 45,
            downPaymentPercent: 50,
          },
        ],
      },
    ],
    workingHours: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '19:00', isClosed: false },
      { dayOfWeek: 2, startTime: '09:00', endTime: '19:00', isClosed: false },
      { dayOfWeek: 3, startTime: '09:00', endTime: '19:00', isClosed: false },
      { dayOfWeek: 4, startTime: '09:00', endTime: '19:00', isClosed: false },
      { dayOfWeek: 5, startTime: '09:00', endTime: '19:00', isClosed: false },
      { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isClosed: false },
      { dayOfWeek: 0, startTime: '09:00', endTime: '13:00', isClosed: true },
    ],
  };

  test('Deve exigir login se visitante tentar agendar e redirecionar com preservação', async ({ page }) => {
    // Mock da vitrine
    await page.route('**/api/v1/company/slug/barbearia-vintage', async (route) => {
      await route.fulfill({ status: 200, json: mockCompany });
    });

    // Mock de horários disponíveis
    await page.route('**/api/v1/appointments/available-slots*', async (route) => {
      await route.fulfill({
        status: 200,
        json: { date: '2026-10-25', totalAvailable: 3, slots: ['10:00', '14:30', '16:00'] },
      });
    });

    await page.goto('/empresa/barbearia-vintage');

    // 1. Clica no botão de escolher horário do serviço
    await page.getByRole('button', { name: /escolher horário/i }).first().click();

    // 2. Escolhe um slot de horário
    await expect(page.getByTestId('booking-step-two-view')).toBeVisible();
    await page.getByRole('button', { name: '14:30' }).click();

    // 3. Clica para avançar ao checkout
    await page.getByTestId('advance-to-checkout-btn').click();

    // Deve redirecionar para a tela de login com o parâmetro de redirect
    await expect(page).toHaveURL(/login\?redirect=%2Fempresa%2Fbarbearia-vintage/);
  });

  test('Deve abrir modal de confirmação para usuário autenticado e avançar ao pagamento Pix', async ({ page }) => {
    // Simula usuário logado no localStorage sem CPF ainda
    await page.addInitScript(() => {
      localStorage.setItem('@sinalizego:token', 'fake-jwt-token');
      localStorage.setItem(
        '@sinalizego:user',
        JSON.stringify({
          id: 'user-789',
          name: 'Lucas Silva',
          email: 'lucas@teste.com',
          role: 'CLIENT',
          cpfCnpj: null,
        })
      );
    });

    // Mock auth me
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 'user-789',
          name: 'Lucas Silva',
          email: 'lucas@teste.com',
          role: 'CLIENT',
          cpfCnpj: null,
        },
      });
    });

    // Mock da vitrine
    await page.route('**/api/v1/company/slug/barbearia-vintage', async (route) => {
      await route.fulfill({ status: 200, json: mockCompany });
    });

    // Mock de horários disponíveis
    await page.route('**/api/v1/appointments/available-slots*', async (route) => {
      await route.fulfill({
        status: 200,
        json: { date: '2026-10-25', totalAvailable: 3, slots: ['14:30'] },
      });
    });

    // Mock de criação de agendamento
    await page.route('**/api/v1/appointments', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          json: {
            id: 'appt-uuid-999',
            companyId: 'comp-1234',
            serviceId: 'serv-1',
            clientId: 'user-789',
            appointmentDate: '2026-10-25T17:30:00.000Z',
            appointmentEndDate: '2026-10-25T18:15:00.000Z',
            servicePrice: 60.0,
            downPaymentAmount: 30.0,
            platformFeeAmount: 2.0,
            status: 'PENDING_PAYMENT',
            expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
            isActive: true,
          },
        });
      } else {
        await route.continue();
      }
    });

    // Mock de get agendamento por ID
    await page.route('**/api/v1/appointments/appt-uuid-999', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 'appt-uuid-999',
          status: 'PENDING_PAYMENT',
          appointmentDate: '2026-10-25T17:30:00.000Z',
          servicePrice: 60.0,
          downPaymentAmount: 30.0,
          expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
          company: {
            id: 'comp-1234',
            businessName: 'Barbearia Vintage',
            slug: 'barbearia-vintage',
          },
          service: {
            id: 'serv-1',
            name: 'Corte Degradê Navalhado',
            durationMinutes: 45,
          },
        },
      });
    });

    // Mock de criação do Pix
    await page.route('**/api/v1/transactions/pix/appt-uuid-999', async (route) => {
      await route.fulfill({
        status: 201,
        json: {
          paymentId: 'pay_123456',
          totalValue: 30.0,
          qrCodePayload: '00020126580014BR.GOV.BCB.PIX0136fake-pix-code-sinalizego',
          qrCodeImage: 'data:image/png;base64,fake',
          expirationDate: new Date(Date.now() + 15 * 60000).toISOString(),
        },
      });
    });

    await page.goto('/empresa/barbearia-vintage');
    await page.getByRole('button', { name: /escolher horário/i }).first().click();
    await page.getByRole('button', { name: '14:30' }).click();
    await page.getByTestId('advance-to-checkout-btn').click();

    // Modal de confirmação aberto
    await expect(page.getByRole('heading', { name: 'Confirmar Agendamento' })).toBeVisible();

    // Como o cliente não tem CPF no cadastro, o campo de CPF é obrigatório
    const cpfInput = page.getByTestId('checkout-cpf-input');
    await expect(cpfInput).toBeVisible();

    // Preenche CPF válido (algoritmo real)
    await cpfInput.fill('52998224725');

    // Submete a reserva
    await page.getByTestId('confirm-booking-btn').click();

    // Deve navegar para a página de pagamento Pix
    await expect(page).toHaveURL('/pagamento/appt-uuid-999');
    await expect(page.getByTestId('pix-payment-card')).toBeVisible();
    await expect(page.getByText('Pague com Pix para Garantir sua Vaga')).toBeVisible();
    await expect(page.getByTestId('copy-pix-btn')).toBeVisible();
  });

  test('Deve exibir tela de Agendamento Confirmado quando o Pix for liquidado', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@sinalizego:token', 'fake-jwt-token');
      localStorage.setItem(
        '@sinalizego:user',
        JSON.stringify({
          id: 'user-789',
          name: 'Lucas Silva',
          email: 'lucas@teste.com',
          role: 'CLIENT',
        })
      );
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 'user-789',
          name: 'Lucas Silva',
          email: 'lucas@teste.com',
          role: 'CLIENT',
        },
      });
    });

    // Mock de agendamento já CONFIRMADO
    await page.route('**/api/v1/appointments/appt-confirmed-123', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 'appt-confirmed-123',
          status: 'CONFIRMED',
          appointmentDate: '2026-10-25T17:30:00.000Z',
          servicePrice: 60.0,
          downPaymentAmount: 30.0,
          company: {
            id: 'comp-1234',
            businessName: 'Barbearia Vintage',
            slug: 'barbearia-vintage',
            street: 'Rua das Flores',
            number: '123',
            district: 'Centro',
            city: 'São Paulo',
            state: 'SP',
          },
          service: {
            id: 'serv-1',
            name: 'Corte Degradê Navalhado',
            durationMinutes: 45,
          },
        },
      });
    });

    await page.goto('/pagamento/appt-confirmed-123');

    // Deve renderizar o PaymentSuccessCard
    await expect(page.getByTestId('payment-success-card')).toBeVisible();
    await expect(page.getByText('Cadeira Garantida com Sucesso!')).toBeVisible();
    await expect(page.getByTestId('download-ics-btn')).toBeVisible();
  });

  test('Deve exibir tela de Reserva Expirada se o agendamento foi cancelado', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('@sinalizego:token', 'fake-jwt-token');
      localStorage.setItem(
        '@sinalizego:user',
        JSON.stringify({
          id: 'user-789',
          name: 'Lucas Silva',
          email: 'lucas@teste.com',
          role: 'CLIENT',
        })
      );
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 'user-789',
          name: 'Lucas Silva',
          email: 'lucas@teste.com',
          role: 'CLIENT',
        },
      });
    });

    // Mock de agendamento cancelado por expiração
    await page.route('**/api/v1/appointments/appt-expired-123', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 'appt-expired-123',
          status: 'CANCELED',
          appointmentDate: '2026-10-25T17:30:00.000Z',
          servicePrice: 60.0,
          downPaymentAmount: 30.0,
          company: {
            businessName: 'Barbearia Vintage',
            slug: 'barbearia-vintage',
          },
          service: {
            name: 'Corte Degradê',
          },
        },
      });
    });

    await page.goto('/pagamento/appt-expired-123');

    // Deve renderizar o PaymentExpiredCard
    await expect(page.getByTestId('payment-expired-card')).toBeVisible();
    await expect(page.getByText('Tempo de Reserva Esgotado')).toBeVisible();
    await expect(page.getByTestId('choose-new-slot-btn')).toBeVisible();
  });
});
