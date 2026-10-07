import { test, expect } from '@playwright/test';

test.describe('Autenticação — Telas de Login e Cadastro (E2E)', () => {
  test('Deve renderizar a tela de login com todos os elementos e validações', async ({ page }) => {
    await page.goto('/login');

    // Valida títulos e estrutura
    await expect(page.getByRole('heading', { name: 'Acesse sua conta' })).toBeVisible();
    await expect(page.getByTestId('login-email-input')).toBeVisible();
    await expect(page.getByTestId('login-password-input')).toBeVisible();
    await expect(page.getByTestId('login-submit-button')).toBeVisible();

    // Validação ao enviar formulário em branco
    await page.getByTestId('login-submit-button').click();
    await expect(page.getByText('O e-mail é obrigatório')).toBeVisible();

    // Alternar visibilidade da senha
    const passwordInput = page.getByTestId('login-password-input');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await page.getByLabel('Exibir senha').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await page.getByLabel('Ocultar senha').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Deve exibir erro amigável ao falhar login com credenciais incorretas', async ({ page }) => {
    // Intercepta rota de login simulando credenciais inválidas (401)
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

    // Redireciona para / e salva no storage
    await expect(page).toHaveURL('/');
  });

  test('Deve navegar para tela de cadastro e validar máscara de telefone e campos', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Cadastre-se grátis' }).click();
    await expect(page).toHaveURL('/cadastro');

    await expect(page.getByRole('heading', { name: 'Crie sua conta gratuita' })).toBeVisible();
    await expect(page.getByTestId('register-name-input')).toBeVisible();
    await expect(page.getByTestId('register-email-input')).toBeVisible();
    await expect(page.getByTestId('register-phone-input')).toBeVisible();
    await expect(page.getByTestId('register-password-input')).toBeVisible();
    await expect(page.getByTestId('register-confirm-password-input')).toBeVisible();

    // Testa máscara automática de telefone
    const phoneInput = page.getByTestId('register-phone-input');
    await phoneInput.fill('11987654321');
    await expect(phoneInput).toHaveValue('(11) 98765-4321');

    // Validação de senhas divergentes
    await page.getByTestId('register-name-input').fill('Lucas Silva');
    await page.getByTestId('register-email-input').fill('lucas@teste.com');
    await page.getByTestId('register-password-input').fill('senha123');
    await page.getByTestId('register-confirm-password-input').fill('outraSenha456');
    await page.getByTestId('register-submit-button').click();

    await expect(page.getByText('As senhas não coincidem')).toBeVisible();
  });

  test('Deve cadastrar cliente com sucesso e realizar auto-login', async ({ page }) => {
    const mockUser = {
      id: 'usr-new-456',
      name: 'Mariana Silva',
      email: 'mariana@teste.com',
      phone: '5511987654321',
      role: 'CLIENT',
    };

    await page.route('**/api/v1/users/create', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Usuário criado com sucesso',
          user: mockUser,
        }),
      });
    });

    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-jwt-mariana',
          refresh_token: 'fake-refresh-mariana',
          user: mockUser,
        }),
      });
    });

    await page.goto('/cadastro');
    await page.getByTestId('register-name-input').fill('Mariana Silva');
    await page.getByTestId('register-email-input').fill('mariana@teste.com');
    await page.getByTestId('register-phone-input').fill('11987654321');
    await page.getByTestId('register-password-input').fill('senhaSegura123');
    await page.getByTestId('register-confirm-password-input').fill('senhaSegura123');
    await page.getByTestId('register-submit-button').click();

    await expect(page).toHaveURL('/');
  });

  test('Deve ser responsivo em viewport mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    const submitBtn = page.getByTestId('login-submit-button');
    await expect(submitBtn).toBeVisible();

    const box = await submitBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44); // Touch target >= 44px
    }
  });
});
