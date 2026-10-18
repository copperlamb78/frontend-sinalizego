import { test, expect } from '@playwright/test';

test.describe('Módulo de Funcionários — Painel do Estabelecimento & Agendamento E2E', () => {
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

  const mockEmployees = [
    {
      id: 'emp-1',
      name: 'Carlos Barbeiro',
      roleTitle: 'Barbeiro Master',
      phone: '61999991111',
      email: 'carlos@barbearia.com',
      avatarUrl: null,
      isActive: true,
      createdAt: '2026-10-01T10:00:00.000Z',
      services: [
        { service: { id: 'srv-1', name: 'Corte Degradê' } },
        { service: { id: 'srv-2', name: 'Barba Terapia' } },
      ],
      groups: [
        {
          serviceGroup: { id: 'grp-1', name: 'Cabelo' },
          group: { id: 'grp-1', name: 'Cabelo' },
        },
      ],
    },
    {
      id: 'emp-2',
      name: 'Juliana Esteticista',
      roleTitle: 'Especialista Facial',
      phone: '61999992222',
      email: 'juliana@barbearia.com',
      avatarUrl: null,
      isActive: true,
      createdAt: '2026-10-02T10:00:00.000Z',
      services: [
        { service: { id: 'srv-2', name: 'Barba Terapia' } },
      ],
      groups: [
        {
          serviceGroup: { id: 'grp-2', name: 'Estética' },
          group: { id: 'grp-2', name: 'Estética' },
        },
      ],
    },
  ];

  const mockEmployeeStats = {
    employeeId: 'emp-1',
    name: 'Carlos Barbeiro',
    completedToday: 4,
    todayCount: 4,
    completedMonth: 42,
    monthCount: 42,
    completedTotal: 156,
    totalCount: 156,
    averageRating: 4.9,
    ratingsCount: 38,
    reviewsCount: 38,
    recentReviews: [
      {
        id: 'rev-1',
        employeeRating: 5,
        comment: 'Melhor corte da cidade, super pontual e atencioso!',
        createdAt: '2026-10-15T14:30:00.000Z',
        appointment: {
          client: { name: 'Lucas Ferreira' },
          service: { name: 'Corte Degradê' },
        },
      },
    ],
  };

  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log(`[BROWSER]: ${msg.type()} - ${msg.text()}`));
    page.on('requestfailed', (req) => console.log(`[REQ FAILED]: ${req.method()} ${req.url()} - ${req.failure()?.errorText}`));
    page.on('response', (res) => {
      if (res.status() >= 400) {
        console.log(`[HTTP ERROR]: ${res.status()} ${res.url()}`);
      }
    });
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 201,
        json: {
          access_token: 'fake-owner-jwt-token',
          refresh_token: 'fake-owner-refresh-token',
          user: mockOwner,
        },
      });
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        json: mockOwner,
      });
    });

    await page.route('**/api/v1/company/get-by-user-id', async (route) => {
      await route.fulfill({
        status: 200,
        json: mockOwner.company,
      });
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
        json: { availableBalance: 1200, escrowBalance: 300, totalBalance: 1500 },
      });
    });

    await page.route('**/api/v1/company/withdrawals*', async (route) => {
      await route.fulfill({
        status: 200,
        json: [],
      });
    });

    await page.route('**/api/v1/company/transactions*', async (route) => {
      await route.fulfill({
        status: 200,
        json: { transactions: [], total: 0 },
      });
    });

    await page.route('**/api/v1/appointments/company*', async (route) => {
      await route.fulfill({
        status: 200,
        json: [],
      });
    });

    await page.route('**/api/v1/appointments*', async (route) => {
      await route.fulfill({
        status: 200,
        json: [],
      });
    });

    await page.route('**/api/v1/auth/refresh*', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          access_token: 'fake-refreshed-token',
          refresh_token: 'fake-refresh-token',
        },
      });
    });

    await page.route('**/api/v1/service-group*', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          { id: 'grp-1', name: 'Cabelo', capacity: 2 },
          { id: 'grp-2', name: 'Estética', capacity: 1 },
        ],
      });
    });

    await page.route(/.*\/api\/v1\/company-service.*/, async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          { id: 'srv-1', name: 'Corte Degradê', totalPrice: 50, durationMinutes: 30, isActive: true },
          { id: 'srv-2', name: 'Barba Terapia', totalPrice: 40, durationMinutes: 30, isActive: true },
        ],
      });
    });

    await page.route(/.*\/api\/v1\/company\/services.*/, async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          { id: 'srv-1', name: 'Corte Degradê', totalPrice: 50, durationMinutes: 30, isActive: true },
          { id: 'srv-2', name: 'Barba Terapia', totalPrice: 40, durationMinutes: 30, isActive: true },
        ],
      });
    });

    await page.route(/.*\/api\/v1\/working-hours.*/, async (route) => {
      await route.fulfill({
        status: 200,
        json: [],
      });
    });

    await page.route(/.*\/api\/v1\/schedule-exceptions.*/, async (route) => {
      await route.fulfill({
        status: 200,
        json: [],
      });
    });

    // Realiza o login real pelo formulário
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill('roberto@barbearia.com');
    await page.getByTestId('login-password-input').fill('senhaCorreta123');
    await page.getByTestId('login-submit-button').click();

    // Aguarda o redirecionamento ao painel
    await expect(page).toHaveURL(/\/painel/);
  });

  test('1. Deve renderizar a aba Funcionários & Equipe com a listagem e filtros', async ({ page }) => {
    await page.route('**/api/v1/employees*', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          items: mockEmployees,
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    await page.getByRole('button', { name: /Funcionários & Equipe/i }).click();

    // Cabeçalho da listagem
    await expect(page.getByRole('heading', { name: 'Funcionários & Equipe', level: 2 })).toBeVisible();
    await expect(page.getByText('Carlos Barbeiro')).toBeVisible();
    await expect(page.getByText('Juliana Esteticista')).toBeVisible();

    // Filtros de status
    await expect(page.getByRole('button', { name: 'Todos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ativos', exact: true })).toBeVisible();

    // Botão de novo funcionário
    await expect(page.getByRole('button', { name: /Novo Funcionário/i })).toBeVisible();
  });

  test('2. Deve abrir o modal canônico (.modal-card) e cadastrar um novo funcionário', async ({ page }) => {
    await page.route('**/api/v1/employees*', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        expect(body.name).toBe('Marcos Barba');
        expect(body.roleTitle).toBe('Mestre Navalheiro');

        return route.fulfill({
          status: 201,
          json: {
            id: 'emp-3',
            ...body,
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        });
      }

      return route.fulfill({
        status: 200,
        json: {
          items: mockEmployees,
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    await page.getByRole('button', { name: /Funcionários & Equipe/i }).click();
    await page.getByRole('button', { name: /Novo Funcionário/i }).click();

    // Modal canônico visível
    const modal = page.locator('.modal-card');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: /(Cadastrar Novo Funcionário|Novo Membro)/i })).toBeVisible();

    // Preenche formulário via testids
    await page.getByTestId('employee-name-input').fill('Marcos Barba');
    await page.getByTestId('employee-role-input').fill('Mestre Navalheiro');
    await page.getByTestId('employee-phone-input').fill('61999993333');

    // Submete formulário
    await page.getByTestId('submit-employee-button').click();

    // Modal fecha após submissão bem-sucedida
    await expect(modal).not.toBeVisible();
  });

  test('3. Deve abrir drawer/modal de estatísticas reais e avaliações do funcionário', async ({ page }) => {
    await page.route('**/api/v1/employees/emp-1/stats', async (route) => {
      return route.fulfill({
        status: 200,
        json: mockEmployeeStats,
      });
    });

    await page.route('**/api/v1/employees*', async (route) => {
      return route.fulfill({
        status: 200,
        json: {
          items: mockEmployees,
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    await page.getByRole('button', { name: /Funcionários & Equipe/i }).click();

    // Clica no card ou botão de detalhes do Carlos
    await page.getByRole('button', { name: /Indicadores/i }).first().click();

    const statsModal = page.locator('.modal-card');
    await expect(statsModal).toBeVisible();
    await expect(statsModal.getByRole('heading', { name: /Desempenho: Carlos Barbeiro/i })).toBeVisible();

    // Verifica indicadores calculados diretamente no PostgreSQL
    await expect(statsModal.getByText('42')).toBeVisible(); // Mês atual
    await expect(statsModal.getByText('156')).toBeVisible(); // Total
    await expect(statsModal.getByText('4.9')).toBeVisible(); // Média de avaliação
    await expect(statsModal.getByText(/Melhor corte da cidade/i)).toBeVisible(); // Comentário de avaliação

    // Fecha o modal via botão "Fechar" e valida que NENHUM erro de createdAt é disparado
    const closeBtn = page.getByTestId('close-employee-stats-button');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(statsModal).not.toBeVisible();

    // A listagem de funcionários continua intacta e funcional
    await expect(page.getByText('Carlos Barbeiro')).toBeVisible();
    await expect(page.getByText('Juliana Esteticista')).toBeVisible();

    // Reabre os indicadores sem falhas de estado
    await page.getByRole('button', { name: /Indicadores/i }).first().click();
    await expect(statsModal).toBeVisible();
    await closeBtn.click();
    await expect(statsModal).not.toBeVisible();
  });

  test('4. Deve realizar upload de foto do funcionário via Cloudinary e associar photoUrl ao cadastro', async ({ page }) => {
    let uploadedPhotoUrl = '';

    // Mock do endpoint de upload para Cloudinary
    await page.route('**/api/v1/upload/image/*/employee', async (route) => {
      uploadedPhotoUrl = 'https://res.cloudinary.com/sinalizego/image/upload/v1700000000/sinalizego/comp-123/employee/avatar.jpg';
      return route.fulfill({
        status: 201,
        json: {
          url: uploadedPhotoUrl,
          publicId: 'sinalizego/comp-123/employee/avatar',
        },
      });
    });

    let receivedPayload: any = null;
    await page.route('**/api/v1/employees*', async (route) => {
      if (route.request().method() === 'POST') {
        receivedPayload = route.request().postDataJSON();
        return route.fulfill({
          status: 201,
          json: {
            id: 'emp-photo-1',
            ...receivedPayload,
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        });
      }

      return route.fulfill({
        status: 200,
        json: {
          items: mockEmployees,
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    await page.getByRole('button', { name: /Funcionários & Equipe/i }).click();
    await page.getByRole('button', { name: /Novo Funcionário/i }).click();

    const modal = page.locator('.modal-card');
    await expect(modal).toBeVisible();

    // Preenche dados básicos
    await page.getByTestId('employee-name-input').fill('Thiago Barbeiro');
    await page.getByTestId('employee-role-input').fill('Colorista');

    // Simula seleção de arquivo de imagem no componente ImageUpload
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles({
      name: 'avatar.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]),
    });

    // Aguarda mensagem de sucesso do upload
    await expect(page.getByText(/Foto enviada com sucesso!/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Alterar Imagem/i })).toBeVisible();

    // Submete o cadastro
    await page.getByTestId('submit-employee-button').click();
    await expect(modal).not.toBeVisible();

    // Valida que o payload enviado à API continha a photoUrl retornada pelo Cloudinary
    expect(receivedPayload).not.toBeNull();
    expect(receivedPayload.name).toBe('Thiago Barbeiro');
    expect(receivedPayload.photoUrl).toBe(uploadedPhotoUrl);
  });
});
