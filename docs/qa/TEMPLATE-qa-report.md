# Relatório de QA: [Nome da Feature]
- **Status:** APPROVED | REJECTED
- **Módulo:** `src/features/[modulo]`
- **Data:** [YYYY-MM-DD]
- **QA Engineer:** QA Agent
- **Iteração Atual:** [1/3 | 2/3 | 3/3]

---

## 1. Validação de Critérios de Aceite
- [ ] Critério 1: [Descrição do critério] ➔ **PASS / FAIL**
- [ ] Critério 2: [Descrição do critério] ➔ **PASS / FAIL**

---

## 2. Testes de Responsividade & Viewports Mobile
- [ ] 360x740 (Small Mobile) ➔ **OK**
- [ ] 390x844 (iPhone standard) ➔ **OK**
- [ ] 412x915 (Android standard) ➔ **OK**
- [ ] 1280x720+ (Desktop) ➔ **OK**
- [ ] Touch targets >= 44x44px em botões e seletores táteis ➔ **OK**

---

## 3. Auditoria Anti-Jargão & Zero Console Errors
- [ ] Console do navegador 100% limpo (zero erros de runtime ou warnings de render).
- [ ] Textos da interface livres de jargões técnicos (Split, Escrow, Hold, etc.).

---

## 4. Testes E2E (Playwright)
- Comando executado: `npx playwright test tests/e2e/[feature].spec.ts`
- Total de testes: [X] passaram, [Y] falharam.

---

## 5. Registro de Defeitos e Bloqueios (se REJECTED)
### Defeito #1: [Título curto do problema]
- **Severidade:** Alta / Média / Baixa
- **Passos para Reproduzir:**
  1. Acessar a tela X
  2. Clicar no botão Y
  3. Observar o comportamento Z
- **Comportamento Esperado:** ...
- **Comportamento Observado:** ...

---

## 6. Veredito Final
STATUS: [APPROVED | REJECTED]
