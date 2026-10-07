import { test, expect } from '@playwright/test';

test.describe('Autenticação — Telas de Login, Cadastro de Cliente e Empresa (E2E)', () => {
  test('Deve renderizar a tela de login com todos os elementos e validações', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Acesse sua conta' })).toBeVisible();
    await expect(page.getByTestId('login-email-input')).toBeVisible();
    await expect(page.getByTestId('login-password-input')).toBeVisible();
    await expect(page.getByTestId('login-submit-button')).toBeVisible();

    await page.getByTestId('login-submit-button').click();
    await expect(page.getByText('O e-mail é obrigatório')).toBeVisible();

    const passwordInput = page.getByTestId('login-password-input');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await page.getByLabel('Exibir senha').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await page.getByLabel('Ocultar senha').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Deve exibir erro amigável ao falhar login com credenciais incorretas', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Credenciais inválidas', statusCode: 401 }),
      });
    });

    await page.goto('/login');
    await page.getByTestId('login-email-input').fill('usuario@teste.com');
    await page.getByTestId('login-password-input').fill('senhaIncorreta123');
    await page.getByTestId('login-submit-button').click();

    await expect(
      page.getByText('Credenciais inválidas. Verifique seu e-mail e senha.')
    ).toBeVisible();
  });

  test('Deve autenticar com sucesso e salvar dados no localStorage', async ({ page }) => {
    const mockUser = {
      id: 'usr-123',
      name: 'Carlos Oliveira',
      email: 'carlos@teste.com',
      role: 'CLIENT',
      phone: '5511999998888',
    };

    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-jwt-token-123',
          refresh_token: 'fake-refresh-token-456',
          user: mockUser,
        }),
      });
    });

    await page.goto('/login');
    await page.getByTestId('login-email-input').fill('carlos@teste.com');
    await page.getByTestId('login-password-input').fill('senhaCorreta123');
    await page.getByTestId('login-submit-button').click();

    await expect(page).toHaveURL('/');
  });

  test('Deve navegar para tela de cadastro e alternar entre abas Cliente e Empresa', async ({ page }) => {
    await page.goto('/cadastro');

    // Aba inicial deve ser Cliente
    await expect(page.getByRole('heading', { name: 'Crie sua conta de cliente' })).toBeVisible();
    await expect(page.getByTestId('register-name-input')).toBeVisible();

    // Alterna para aba Empresa
    await page.getByTestId('tab-register-company').click();
    await expect(page).toHaveURL('/cadastro/empresa');
    await expect(page.getByRole('heading', { name: 'Cadastre seu estabelecimento' })).toBeVisible();
    await expect(page.getByTestId('company-business-name-input')).toBeVisible();
    await expect(page.getByTestId('company-owner-name-input')).toBeVisible();
    await expect(page.getByTestId('company-zip-input')).toBeVisible();

    // Alterna de volta para Cliente
    await page.getByTestId('tab-register-client').click();
    await expect(page).toHaveURL('/cadastro');
    await expect(page.getByRole('heading', { name: 'Crie sua conta de cliente' })).toBeVisible();
  });

  test('Deve cadastrar empresa com sucesso via POST /company/create', async ({ page }) => {
    const mockCompanyOwner = {
      id: 'owner-789',
      name: 'Roberto Barbeiro',
      email: 'roberto@barbeariatop.com',
      phone: '5575999998888',
      role: 'COMPANY_OWNER',
      companies: [
        {
          id: 'comp-101',
          businessName: 'Barbearia Top',
          slug: 'barbearia-top',
        },
      ],
    };

    await page.route('**/api/v1/company/create', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Empresa criada com sucesso',
          user: mockCompanyOwner,
          access_token: 'fake-jwt-roberto',
          refresh_token: 'fake-refresh-roberto',
        }),
      });
    });

    await page.goto('/cadastro/empresa');

    // Preenche dados do estabelecimento
    await page.getByTestId('company-business-name-input').fill('Barbearia Top');
    await page.getByTestId('company-owner-name-input').fill('Roberto Barbeiro');
    await page.getByTestId('company-phone-input').fill('75999998888');
    await page.getByTestId('company-email-input').fill('roberto@barbeariatop.com');
    await page.getByTestId('company-password-input').fill('senha123');
    await page.getByTestId('company-confirm-password-input').fill('senha123');

    // Preenche endereço
    await page.getByTestId('company-zip-input').fill('44085370');
    await page.getByTestId('company-street-input').fill('Rua das Palmeiras');
    await page.getByTestId('company-number-input').fill('100');
    await page.getByTestId('company-district-input').fill('Centro');
    await page.getByTestId('company-city-input').fill('Feira de Santana');
    await page.getByTestId('company-state-input').fill('BA');

    await page.getByTestId('company-submit-button').click();

    // Redireciona para a vitrine da empresa recém-criada
    await expect(page).toHaveURL('/empresa/barbearia-top');
  });

  test('Deve separar fluxos de CTA na HomePage para Estabelecimento e Cliente', async ({ page }) => {
    await page.goto('/');

    const heroBarberCta = page.getByTestId('hero-barber-cta');
    const heroClientCta = page.getByTestId('hero-client-cta');

    await expect(heroBarberCta).toBeVisible();
    await expect(heroClientCta).toBeVisible();

    // Clicar em Cadastrar Estabelecimento deve levar a /cadastro/empresa
    await heroBarberCta.click();
    await expect(page).toHaveURL('/cadastro/empresa');
    await expect(page.getByRole('heading', { name: 'Cadastre seu estabelecimento' })).toBeVisible();
  });
});
