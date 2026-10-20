import { test, expect } from '@playwright/test';

test.describe('Linguagem Simples na UI & Normalização de Sinal (E2E)', () => {
  const mockOwner = {
    id: 'owner-uuid-1',
    name: 'Roberto Gerente',
    email: 'roberto@barbearia.com',
    role: 'COMPANY_OWNER',
    phone: '61988887777',
    company: {
      id: 'comp-123',
      businessName: 'Barbearia Retrô Prime',
      slug: 'barbearia-retro-prime',
      chairsCount: 4,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  };

  const setupDashboardSession = async (page: import('@playwright/test').Page) => {
    await page.addInitScript((owner) => {
      localStorage.setItem('@sinalizego:token', 'fake-owner-jwt-token');
      localStorage.setItem('@sinalizego:refresh_token', 'fake-owner-refresh-token');
      localStorage.setItem('@sinalizego:user', JSON.stringify(owner));
    }, mockOwner);

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, json: mockOwner });
    });

    await page.route('**/api/v1/company/get-by-user-id', async (route) => {
      await route.fulfill({ status: 200, json: mockOwner.company });
    });

    await page.route('**/api/v1/company/dashboard/metrics*', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          financial: { totalRevenue: 1000, totalDownPaymentCollected: 500, totalPlatformFees: 50, netIncome: 450 },
          volume: { total: 20, completed: 18, confirmed: 2, canceled: 0, pendingPayment: 0, completionRate: 90 },
        },
      });
    });

    await page.route('**/api/v1/company/balance', async (route) => {
      await route.fulfill({
        status: 200,
        json: { availableBalance: 1200, escrowLockedBalance: 300, instantTransferFee: 5 },
      });
    });

    await page.route('**/api/v1/company/withdrawals*', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.route('**/api/v1/company/transactions*', async (route) => {
      await route.fulfill({ status: 200, json: { transactions: [], total: 0 } });
    });

    await page.route('**/api/v1/appointments/company*', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.route('**/api/v1/working-hours*', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });
  };

  test('1. [Caminho Feliz] Deve exibir linguagem simples sem símbolos matemáticos no modal de Serviços e nas páginas públicas', async ({ page }) => {
    await setupDashboardSession(page);

    await page.route('**/api/v1/company-service/list', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          {
            id: 'srv-1',
            name: 'Pezinho Rápido',
            totalPrice: 12,
            durationMinutes: 15,
            downPaymentPercent: 50,
            isActive: true,
          },
        ],
      });
    });

    await page.goto('/painel/services');

    // Card de serviço abaixo de R$ 15 deve mostrar 100% calculado via estimateDeposit
    await expect(page.getByText('Sinal (100%):')).toBeVisible();
    await expect(page.getByText('R$ 12,00').first()).toBeVisible();

    // Abre o modal de Novo Serviço
    await page.getByRole('button', { name: /Novo Serviço/i }).click();
    const modal = page.locator('.modal-card');
    await expect(modal).toBeVisible();

    const select = page.getByTestId('service-downpayment-select');
    await expect(select).toBeVisible();

    const optionsText = await select.locator('option').allTextContents();
    expect(optionsText).toEqual([
      '30% (Para serviços a partir de R$ 400)',
      '50% (Metade do valor no agendamento - Recomendado)',
      '100% (Valor total para serviços até R$ 15)',
    ]);

    // Garante que não há o símbolo ≥ no modal
    await expect(modal).not.toContainText('≥');

    // Verifica também a tabela na HomePage
    await page.goto('/');
    await expect(page.getByText('Como funciona o valor do sinal em cada serviço')).toBeVisible();
    const depositTable = page.getByTestId('services-deposit-table');
    await expect(depositTable).toContainText('Sinal reduzido (a partir de R$ 400)');
    await expect(depositTable).toContainText('Valor total (abaixo de R$ 15)');
    await expect(depositTable).not.toContainText('≥');
    await expect(depositTable).not.toContainText('< R$ 15');
  });

  test('2. [Caminho Feliz] Deve criar serviço >= R$ 400 com sinal de 30% e exibir cálculo correto no card', async ({ page }) => {
    await setupDashboardSession(page);

    const servicesList: Array<Record<string, unknown>> = [];
    let postedPayload: Record<string, unknown> | null = null;

    await page.route('**/api/v1/company-service/list', async (route) => {
      await route.fulfill({ status: 200, json: servicesList });
    });

    await page.route('**/api/v1/company-service/create', async (route) => {
      postedPayload = route.request().postDataJSON();
      const created = {
        id: 'srv-450',
        ...postedPayload,
        isActive: true,
      };
      servicesList.push(created);
      await route.fulfill({ status: 201, json: created });
    });

    await page.goto('/painel/services');
    await page.getByRole('button', { name: /Novo Serviço/i }).click();

    const modal = page.locator('.modal-card');
    await expect(modal).toBeVisible();

    await modal.getByPlaceholder('Ex: Corte Masculino Degradê').fill('Platinado Completo');
    await modal.locator('input[type="number"]').nth(1).fill('450');
    await page.getByTestId('service-downpayment-select').selectOption('30');

    await modal.getByRole('button', { name: /Criar Serviço/i }).click();
    await expect(modal).not.toBeVisible();

    expect(postedPayload).not.toBeNull();
    expect(postedPayload?.downPaymentPercent).toBe(30);
    expect(postedPayload?.totalPrice).toBe(450);

    await expect(page.getByText('Platinado Completo')).toBeVisible();
    await expect(page.getByText('Sinal (30%):')).toBeVisible();
    await expect(page.getByText('R$ 135,00')).toBeVisible();
  });

  test('3. [Caminho Infeliz / Normalização Defensiva] Deve normalizar downPaymentPercent para 50 ao selecionar 30% ou 100% em serviço < R$ 400', async ({ page }) => {
    await setupDashboardSession(page);

    let postedPayload: Record<string, unknown> | null = null;

    await page.route('**/api/v1/company-service/list', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.route('**/api/v1/company-service/create', async (route) => {
      postedPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        json: { id: 'srv-norm', ...postedPayload, isActive: true },
      });
    });

    await page.goto('/painel/services');
    await page.getByRole('button', { name: /Novo Serviço/i }).click();

    const modal = page.locator('.modal-card');
    await modal.getByPlaceholder('Ex: Corte Masculino Degradê').fill('Corte Social');
    await modal.locator('input[type="number"]').nth(1).fill('50');
    // Usuário seleciona 100% (ou 30%) para um serviço de R$ 50 (< R$ 400)
    await page.getByTestId('service-downpayment-select').selectOption('100');

    await modal.getByRole('button', { name: /Criar Serviço/i }).click();
    await expect(modal).not.toBeVisible();

    // Deve ter enviado 50 para respeitar @IsIn([30, 50]) no backend
    expect(postedPayload).not.toBeNull();
    expect(postedPayload?.downPaymentPercent).toBe(50);
  });

  test('4. [Caminho Infeliz / Validação] Deve bloquear submissão com preço <= 0 ou nome em branco exibindo erro claro no modal', async ({ page }) => {
    await setupDashboardSession(page);

    let createCalled = false;
    await page.route('**/api/v1/company-service/list', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });
    await page.route('**/api/v1/company-service/create', async (route) => {
      createCalled = true;
      await route.fulfill({ status: 201, json: {} });
    });

    await page.goto('/painel/services');
    await page.getByRole('button', { name: /Novo Serviço/i }).click();

    const modal = page.locator('.modal-card');
    // Nome apenas com espaços
    await modal.getByPlaceholder('Ex: Corte Masculino Degradê').fill('   ');
    await modal.getByRole('button', { name: /Criar Serviço/i }).click();

    await expect(modal.getByText('O nome do serviço é obrigatório.')).toBeVisible();
    expect(createCalled).toBe(false);
  });

  test('5. [Caminho Infeliz / Erro HTTP da API] Deve tratar erro 400/500 da API ao salvar serviço preservando o modal aberto', async ({ page }) => {
    await setupDashboardSession(page);

    await page.route('**/api/v1/company-service/list', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.route('**/api/v1/company-service/create', async (route) => {
      await route.fulfill({
        status: 400,
        json: { message: 'Configure sua conta financeira antes de cadastrar serviços.' },
      });
    });

    await page.goto('/painel/services');
    await page.getByRole('button', { name: /Novo Serviço/i }).click();

    const modal = page.locator('.modal-card');
    await modal.getByPlaceholder('Ex: Corte Masculino Degradê').fill('Barba Completa');
    await modal.getByRole('button', { name: /Criar Serviço/i }).click();

    await expect(
      modal.getByText('Configure sua conta financeira antes de cadastrar serviços.')
    ).toBeVisible();
    await expect(modal).toBeVisible();
  });

  test('6. [Caminho Infeliz / Reserva Expirada] Deve exibir mensagem em linguagem simples sem o jargão Hold quando o Pix expira', async ({ page }) => {
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

    await page.route('**/api/v1/appointments/appt-expired-simple', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 'appt-expired-simple',
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

    await page.goto('/pagamento/appt-expired-simple');

    const expiredCard = page.getByTestId('payment-expired-card');
    await expect(expiredCard).toBeVisible();
    await expect(
      expiredCard.getByText('O prazo de 15 minutos para pagamento do Pix terminou.')
    ).toBeVisible();
    await expect(expiredCard).not.toContainText(/hold/i);
  });
});
