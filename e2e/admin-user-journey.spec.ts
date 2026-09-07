import { test, expect } from '@playwright/test';

test.describe('Validação de Responsividade, Qualidade e Tratamento de Erros - Painel Admin', () => {
  const consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });
  });

  test('1. Teste de Responsividade em Múltiplos Viewports (Mobile, Tablet, Desktop)', async ({ page }) => {
    const viewports = [
      { name: 'Mobile (iPhone 12)', width: 390, height: 844 },
      { name: 'Tablet (iPad)', width: 768, height: 1024 },
      { name: 'Desktop HD', width: 1280, height: 800 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });

      expect(hasHorizontalScroll).toBeFalsy();
    }
  });

  test('2. Tratamento de Erro ao Tentar Criar Usuário com E-mail Duplicado', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await emailInput.pressSequentially('admin@sinalizego.com', { delay: 25 });
    await passwordInput.pressSequentially('Admin@SinalizeGo2026', { delay: 25 });
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/admin/, { timeout: 15000 });

    // 2. Ir para /admin/usuarios
    await page.goto('/admin/usuarios', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Gestão de Usuários')).toBeVisible({ timeout: 10000 });

    // 3. Abrir modal Novo Usuário
    await page.getByRole('button', { name: /Novo Usuário/i }).click();
    await expect(page.getByText('Criar Novo Usuário no Sistema')).toBeVisible();

    // 4. Preencher com e-mail duplicado (admin@sinalizego.com)
    await page.getByPlaceholder('Ex: Carlos Silva').pressSequentially('Admin Duplicado', { delay: 20 });
    await page.getByPlaceholder('carlos@exemplo.com').pressSequentially('admin@sinalizego.com', { delay: 20 });
    await page.getByPlaceholder('5561999998888').pressSequentially('5561999998888', { delay: 20 });

    // 5. Clicar em Criar Usuário
    const submitBtn = page.getByRole('button', { name: /Criar Usuário/i });
    await submitBtn.click();

    // 6. Verificar que a modal NÃO fechou e o alerta de erro apareceu
    await expect(page.getByText('Não foi possível criar o usuário')).toBeVisible({ timeout: 5000 });
    console.log('Alerta de erro exibido com sucesso na modal!');

    // 7. Fechar a modal via Cancelar
    await page.getByRole('button', { name: /Cancelar/i }).click();
    await page.waitForTimeout(300);

    // 8. Validar ausência de erros fatais no console
    const fatalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('409'));
    expect(fatalErrors).toHaveLength(0);
  });
});
