---
name: playwright-e2e-testing
description: Diretrizes, arquitetura e padrão de testes End-to-End (E2E) com Playwright para a aplicação frontend do SinalizeGO. Use sempre que for criar ou atualizar testes de fluxos de agendamento, checkout Pix, onboarding de prestador e validação de regras de negócio de interface.
---

# Playwright E2E Testing — SinalizeGO Frontend

Este guia estabelece o padrão de testes End-to-End (E2E) para o frontend do **SinalizeGO** (React 19 + TypeScript + Vite + Tailwind CSS) utilizando **Playwright**.

---

## 1. Princípios Fundamentais

1. **Mobile-First por Padrão:** O cliente final acessa a plataforma predominantemente em smartphones. Testes de fluxo de agendamento e checkout devem rodar prioritariamente em viewports móveis (ex: `iPhone 13 / 390x844` ou `Pixel 5`).
2. **Seletores Resilientes:** Priorize seletores semânticos acessíveis (`getByRole`, `getByLabel`) ou atributos estáveis de teste (`getByTestId`). **Evite** seletores baseados em classes CSS do Tailwind (ex: `button.bg-teal-500`), pois classes mudam durante refatorações de layout.
3. **Isolamento de Testes com Mocks de Rede:** Para testes E2E rápidos e determinísticos da interface, intercepte as requisições à API (`page.route('**/api/v1/**', ...)`) para simular os estados de sucesso (Pix gerado, confirmação), erros de conflito (409) e expiração (410).
4. **Verificação de Copy & Anti-Jargão:** Assegure que os testes validem a ausência de jargões técnicos (`Split`, `Escrow`, `Timeout`, `Idempotência`) e a presença do vocabulário humanizado do SinalizeGO.

---

## 2. Estrutura de Arquivos e Padrão Page Object Model (POM)

Mantenha os testes e Page Objects organizados sob a pasta `e2e/`:

```
e2e/
├── fixtures/
│   ├── auth.fixture.ts         # Fixtures de autenticação persistida
│   └── mock-data.ts            # Payloads mockados de empresas, serviços e agendamentos
├── pages/
│   ├── booking.page.ts         # Page Object do fluxo de agendamento público
│   ├── checkout.page.ts        # Page Object da tela de pagamento Pix
│   └── services-admin.page.ts  # Page Object do cadastro de serviços do parceiro
└── specs/
    ├── booking-flow.spec.ts    # Testes do agendamento ponta a ponta
    ├── checkout-pix.spec.ts    # Testes de exibição do Pix e polling de confirmação
    └── service-pricing.spec.ts # Validação das regras de sinal (100%, 50%, 30%)
```

---

## 3. Exemplo Prático de Teste com Mock de Rede

```typescript
import { test, expect } from '@playwright/test';

test.describe('Fluxo de Agendamento e Pagamento do Sinal via Pix', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // Viewport móvel

  test('deve calcular o sinal de 50% e exibir copy humanizada sem jargões', async ({ page }) => {
    // 1. Interceptar catálogo do estabelecimento
    await page.route('**/api/v1/companies/barbearia-premium', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'comp-123',
          businessName: 'Barbearia Premium',
          services: [
            {
              id: 'srv-1',
              name: 'Corte Degradê',
              price: 60.00,
              durationMinutes: 45,
            },
          ],
        }),
      });
    });

    // 2. Interceptar criação do agendamento (Reserva Pix)
    await page.route('**/api/v1/appointments', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          appointmentId: 'apt-789',
          downPaymentAmount: 30.00,
          platformFeeAmount: 2.00,
          pixTotalAmount: 32.00,
          remainingAtEstablishment: 30.00,
          pixQrCode: 'data:image/png;base64,...',
          pixCopiaECola: '00020126580014br.gov.bcb.pix...',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        }),
      });
    });

    // 3. Acessar a página de agendamento
    await page.goto('/barbearia-premium');

    // 4. Selecionar o serviço
    await expect(page.getByText('Corte Degradê')).toBeVisible();
    await page.getByTestId('service-card-srv-1').click();

    // 5. Selecionar data e horário
    await page.getByRole('button', { name: '15:30' }).click();

    // 6. Preencher dados do cliente
    await page.getByTestId('input-client-name').fill('Carlos Souza');
    await page.getByTestId('input-client-phone').fill('(11) 98765-4321');

    // 7. Avançar para o resumo e pagamento
    await page.getByRole('button', { name: /Garantir Cadeira/i }).click();

    // 8. Asserções de Copy e Transparência de Valores
    await expect(page.getByText('Sinal de Reserva')).toBeVisible();
    await expect(page.getByText('Taxa de Conveniência')).toBeVisible();
    await expect(page.getByText('R$ 32,00 via Pix')).toBeVisible();
    await expect(page.getByText('Restante a acertar na barbearia: R$ 30,00')).toBeVisible();
    await expect(page.getByText(/Seu horário fica reservado por 15 minutos/i)).toBeVisible();

    // 9. Garantir que NENHUM jargão técnico vazou na tela
    const pageContent = await page.content();
    expect(pageContent).not.toContain('Split');
    expect(pageContent).not.toContain('Escrow');
    expect(pageContent).not.toContain('Webhook');
    expect(pageContent).not.toContain('Gateway');
    expect(pageContent).not.toContain('Idempotência');
  });

  test('deve tratar erro 409 (conflito de horário) com orientação amigável', async ({ page }) => {
    await page.route('**/api/v1/appointments', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 409,
          message: 'O horário selecionado não está mais disponível.',
        }),
      });
    });

    await page.goto('/barbearia-premium/checkout');
    await page.getByTestId('button-confirm-booking').click();

    // Asserção da mensagem humanizada
    await expect(
      page.getByText('Esse horário acabou de ser reservado por outro cliente. Por favor, escolha outro horário disponível.')
    ).toBeVisible();
  });
});
```

---

## 4. Checklist para Testes E2E do SinalizeGO

- [ ] Os botões críticos possuem atributo `data-testid` (`button-confirm-booking`, `button-copy-pix`, etc.).
- [ ] O fluxo valida o botão de *"Copiar Código Pix"* e a notificação visual de sucesso.
- [ ] O teste cobre o cenário de sucesso com polling ou SSE confirmando o Pix e redirecionando para a tela de confirmação.
- [ ] A tela de cadastro de serviço valida as regras de sinal:
  - Serviço `< R$ 15,00`: Sinal travado em 100%.
  - Serviço `R$ 15,00` a `R$ 399,99`: Sinal travado em 50%.
  - Serviço `>= R$ 400,00`: Opção de escolha entre 50% e 30% com badge "FLEXÍVEL".
- [ ] Nenhum erro de console não tratado (`console.error`) durante a execução do teste.
- [ ] Zero dependência de URLs de homologação ou backend real durante os testes unitários/E2E em CI.

---

## 5. Comandos de Execução

```bash
# Executar todos os testes E2E
npx playwright test

# Executar apenas os testes móveis de checkout
npx playwright test e2e/specs/checkout-pix.spec.ts --project="Mobile Chrome"

# Abrir UI interativa do Playwright para depuração
npx playwright test --ui

# Visualizar o relatório gerado após a execução
npx playwright show-report
```
