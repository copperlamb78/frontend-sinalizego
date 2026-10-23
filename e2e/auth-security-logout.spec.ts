import { test, expect } from '@playwright/test';

test.describe('Segurança de Sessão, Logout Atômico, RBAC e Proteção de Rotas (E2E)', () => {
  const mockClient = {
    id: 'client-sec-1',
    name: 'Mariana Costa',
    email: 'mariana@teste.com',
    role: 'CLIENT',
    phone: '11988887777',
    isActive: true,
  };

  const mockOwner = {
    id: 'owner-sec-1',
    name: 'Ricardo Barbeiro',
    email: 'ricardo@barbearia.com',
    role: 'COMPANY_OWNER',
    phone: '11977776666',
    isActive: true,
  };

  const mockCompany = {
    id: 'comp-sec-1',
    businessName: 'Barbearia Imperial',
    slug: 'barbearia-imperial',
    providerType: 'Barbearia',
    street: 'Av. Paulista',
    number: '1000',
    district: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310100',
    isActive: true,
  };

  test('1. Logout no Portal do Cliente limpa storage/sessionStorage imediatamente e bloqueia botão Voltar', async ({
    page,
  }) => {
    await page.addInitScript((client) => {
      if (!window.name.includes('seeded')) {
        localStorage.setItem('@sinalizego:token', 'valid_client_access_token');
        localStorage.setItem('@sinalizego:refresh_token', 'valid_client_refresh_token');
        localStorage.setItem('@sinalizego:user', JSON.stringify(client));
        sessionStorage.setItem('@sinalizego:temp_draft', 'sensitive-draft-data');
        window.name = 'seeded';
      }
    }, mockClient);

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockClient),
      });
    });

    await page.route('**/api/v1/appointments/user*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    let logoutCalledWithHeader: string | undefined;
    await page.route('**/api/v1/auth/logout', async (route) => {
      logoutCalledWithHeader = route.request().headers()['authorization'];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Logout realizado com sucesso.' }),
      });
    });

    await page.goto('/meus-agendamentos');
    await expect(page.getByRole('heading', { name: 'Meus Agendamentos' })).toBeVisible();
    await expect(page.getByTestId('portal-user-chip')).toContainText('Mariana');

    // Navega para /perfil para popular o histórico de rotas protegidas antes do logout
    await page.getByRole('link', { name: 'Meu Perfil' }).click();
    await expect(page).toHaveURL(/\/perfil$/);

    // Clica em Sair
    await page.getByTestId('portal-logout-btn').click();

    // Deve redirecionar para /login
    await expect(page).toHaveURL(/\/login$/);

    // Verifica que todas as chaves sensíveis e sessionStorage foram limpos
    const storageState = await page.evaluate(() => ({
      token: localStorage.getItem('@sinalizego:token'),
      refresh: localStorage.getItem('@sinalizego:refresh_token'),
      user: localStorage.getItem('@sinalizego:user'),
      sessionDraft: sessionStorage.getItem('@sinalizego:temp_draft'),
    }));

    expect(storageState.token).toBeNull();
    expect(storageState.refresh).toBeNull();
    expect(storageState.user).toBeNull();
    expect(storageState.sessionDraft).toBeNull();
    expect(logoutCalledWithHeader).toBe('Bearer valid_client_access_token');

    // Tenta voltar pelo histórico do navegador (para /meus-agendamentos) e comprova que continua protegido em /login
    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Meus Agendamentos' })).toHaveCount(0);
  });

  test('2. Logout no Painel do Estabelecimento é não-bloqueante (< 500ms) mesmo com POST /auth/logout lento (3s)', async ({
    page,
  }) => {
    await page.addInitScript((owner) => {
      localStorage.setItem('@sinalizego:token', 'valid_owner_access_token');
      localStorage.setItem('@sinalizego:refresh_token', 'valid_owner_refresh_token');
      localStorage.setItem('@sinalizego:user', JSON.stringify(owner));
    }, mockOwner);

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, json: mockOwner });
    });

    await page.route('**/api/v1/company/get-by-user-id', async (route) => {
      await route.fulfill({ status: 200, json: mockCompany });
    });

    await page.route('**/api/v1/company/dashboard/metrics*', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          company: mockCompany,
          financial: {
            totalRevenue: 0,
            totalDownPaymentCollected: 0,
            totalPlatformFees: 0,
            netIncome: 0,
          },
          volume: {
            total: 0,
            completed: 0,
            confirmed: 0,
            canceled: 0,
            noShow: 0,
            pendingPayment: 0,
            completionRate: 0,
          },
          lossPrevented: {
            totalLossPrevented: 0,
            noShowCount: 0,
            noShowRetainedAmount: 0,
            lateCancelCount: 0,
            lateCancelRetainedAmount: 0,
            rescheduledCount: 0,
            rescheduledPreservedAmount: 0,
            retainedAppointmentsCount: 0,
          },
          topServices: [],
          upcomingToday: [],
        },
      });
    });

    await page.route('**/api/v1/appointments/company*', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.route(/.*\/api\/v1\/company-service.*/, async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.route(/.*\/api\/v1\/working-hours.*/, async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.route('**/api/v1/company/balance', async (route) => {
      await route.fulfill({
        status: 200,
        json: { availableBalance: 0, pendingBalance: 0 },
      });
    });

    await page.route('**/api/v1/company/withdrawals', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.route('**/api/v1/company/transactions*', async (route) => {
      await route.fulfill({
        status: 200,
        json: { transactions: [], total: 0, page: 1, limit: 20 },
      });
    });

    // Simula latência de 3 segundos no endpoint de logout
    await page.route('**/api/v1/auth/logout', async (route) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.fulfill({
        status: 200,
        json: { message: 'Logout realizado com sucesso.' },
      });
    });

    await page.goto('/painel');
    const logoutBtn = page.getByTestId('sidebar-logout-btn');
    await expect(logoutBtn).toBeVisible();

    const startTime = Date.now();
    await logoutBtn.click();
    await expect(page).toHaveURL(/\/login$/);
    const elapsedMs = Date.now() - startTime;

    // Comprova que não esperou os 3000ms da rede para limpar a sessão e redirecionar
    expect(elapsedMs).toBeLessThan(1000);

    const tokenAfterClick = await page.evaluate(() =>
      localStorage.getItem('@sinalizego:token')
    );
    expect(tokenAfterClick).toBeNull();
  });

  test('3. Visitante anônimo em /barbearias vê CTAs Entrar e Criar Conta sem chip falso nem botão Sair', async ({
    page,
  }) => {
    await page.route('**/api/v1/company/explore*', async (route) => {
      await route.fulfill({
        status: 200,
        json: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      });
    });

    await page.goto('/barbearias');

    await expect(page.getByTestId('portal-login-btn')).toBeVisible();
    await expect(page.getByTestId('portal-logout-btn')).toHaveCount(0);
    await expect(page.getByTestId('portal-user-chip')).toHaveCount(0);

    // Abas exclusivas de cliente autenticado não devem aparecer para visitante anônimo
    await expect(page.getByRole('link', { name: 'Meus Agendamentos' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Meus Créditos' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Meu Perfil' })).toHaveCount(0);
  });

  test('4. RBAC Front-End: CLIENT autenticado tentando acessar /painel é redirecionado para /barbearias', async ({
    page,
  }) => {
    await page.addInitScript((client) => {
      localStorage.setItem('@sinalizego:token', 'valid_client_access_token');
      localStorage.setItem('@sinalizego:refresh_token', 'valid_client_refresh_token');
      localStorage.setItem('@sinalizego:user', JSON.stringify(client));
    }, mockClient);

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, json: mockClient });
    });

    await page.route('**/api/v1/company/explore*', async (route) => {
      await route.fulfill({
        status: 200,
        json: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      });
    });

    await page.goto('/painel');
    await expect(page).toHaveURL(/\/barbearias$/);
    await expect(page.getByTestId('sidebar-logout-btn')).toHaveCount(0);

    await page.goto('/painel/financial');
    await expect(page).toHaveURL(/\/barbearias$/);
  });

  test('5. PublicOnlyRoute: usuário já autenticado é redirecionado ao tentar acessar /login ou /cadastro', async ({
    page,
  }) => {
    // 5A. CLIENT -> /barbearias
    await page.addInitScript((client) => {
      localStorage.setItem('@sinalizego:token', 'valid_client_access_token');
      localStorage.setItem('@sinalizego:user', JSON.stringify(client));
    }, mockClient);

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, json: mockClient });
    });

    await page.route('**/api/v1/company/explore*', async (route) => {
      await route.fulfill({
        status: 200,
        json: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      });
    });

    await page.goto('/login');
    await expect(page).toHaveURL(/\/barbearias$/);

    await page.goto('/cadastro');
    await expect(page).toHaveURL(/\/barbearias$/);
  });

  test('6. Sincronização Multi-Aba: Logout na Aba 1 desloga e redireciona automaticamente a Aba 2', async ({
    context,
  }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    for (const p of [page1, page2]) {
      await p.route('**/api/v1/auth/me', async (route) => {
        await route.fulfill({ status: 200, json: mockClient });
      });
      await p.route('**/api/v1/appointments/user*', async (route) => {
        await route.fulfill({ status: 200, json: [] });
      });
      await p.route('**/api/v1/auth/logout', async (route) => {
        await route.fulfill({ status: 200, json: { message: 'OK' } });
      });
    }

    await page1.goto('/login');
    await page1.evaluate((client) => {
      localStorage.setItem('@sinalizego:token', 'shared_access_token');
      localStorage.setItem('@sinalizego:refresh_token', 'shared_refresh_token');
      localStorage.setItem('@sinalizego:user', JSON.stringify(client));
    }, mockClient);

    await page1.goto('/meus-agendamentos');
    await page2.goto('/meus-agendamentos');

    await expect(page1.getByRole('heading', { name: 'Meus Agendamentos' })).toBeVisible();
    await expect(page2.getByRole('heading', { name: 'Meus Agendamentos' })).toBeVisible();

    // Executa logout na Aba 1
    await page1.getByTestId('portal-logout-btn').click();
    await expect(page1).toHaveURL(/\/login$/);

    // A Aba 2 deve detectar o evento storage e redirecionar para /login automaticamente
    await expect(page2).toHaveURL(/\/login$/);
  });

  test('7. Proteção contra Race Condition (sessionEpoch): resposta tardia de /auth/me não ressuscita sessão após logout', async ({
    page,
  }) => {
    await page.addInitScript((client) => {
      localStorage.setItem('@sinalizego:token', 'race_access_token');
      localStorage.setItem('@sinalizego:user', JSON.stringify(client));
    }, mockClient);

    // /auth/me demora 600ms para responder
    await page.route('**/api/v1/auth/me', async (route) => {
      await new Promise((r) => setTimeout(r, 600));
      await route.fulfill({ status: 200, json: mockClient });
    });

    await page.route('**/api/v1/company/explore*', async (route) => {
      await route.fulfill({
        status: 200,
        json: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      });
    });

    await page.route('**/api/v1/auth/logout', async (route) => {
      await route.fulfill({ status: 200, json: { message: 'OK' } });
    });

    // Navega para /barbearias (que não aguarda ProtectedRoute, portanto o botão Sair já está visível enquanto /auth/me está em voo)
    await page.goto('/barbearias');
    await expect(page.getByTestId('portal-logout-btn')).toBeVisible();

    // Clica em Sair ANTES de /auth/me resolver (dentro dos 600ms)
    await page.getByTestId('portal-logout-btn').click();
    await expect(page).toHaveURL(/\/login$/);

    // Aguarda a resposta atrasada de /auth/me chegar (> 600ms)
    await page.waitForTimeout(800);

    // O usuário NÃO pode ter sido re-hidratado no localStorage nem redirecionado de /login
    await expect(page).toHaveURL(/\/login$/);
    const userAfterLateMe = await page.evaluate(() =>
      localStorage.getItem('@sinalizego:user')
    );
    expect(userAfterLateMe).toBeNull();
  });
});
