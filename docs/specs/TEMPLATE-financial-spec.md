# Especificação Financeira: [Nome da Feature]
- **Status:** APPROVED_DOR
- **Módulo:** `src/features/[modulo]`
- **Data:** [YYYY-MM-DD]
- **Auditor:** FinOps Agent

---

## 1. Regra de Negócio de Preço e Sinal
- **Preço do Serviço:** R$ [XX,XX]
- **Enquadramento de Faixa:**
  - [ ] Microtransação (< R$ 15,00) ➔ 100% de sinal compulsório
  - [ ] Faixa Padrão (R$ 15,00 a R$ 399,99) ➔ 50% de sinal fixo
  - [ ] Alto Ticket (>= R$ 400,00) ➔ 50% (Padrão) ou 30% (Flexível)
- **Cálculo do Checkout:**
  - Sinal via Pix: R$ [XX,XX] *(calculado pelo backend)*
  - Taxa de Conveniência: R$ [XX,XX] *(calculado pelo backend)*
  - Total Pix a Pagar Agora: R$ [XX,XX] *(calculado pelo backend)*
  - Restante a Pagar na Cadeira: R$ [XX,XX] *(calculado pelo backend)*

---

## 2. Auditoria Zero Trust
- [x] O frontend não calcula valores no payload de requisição.
- [x] O frontend apenas exibe valores retornados pela API NestJS.

---

## 3. Fluxo de Custódia & Hold (Pix)
- **Tempo de Reserva Temporária:** 15 minutos (`expiresAt`).
- **Comportamento em Expiração:** Liberação automática de vaga sem cobrança.

---

## 4. Dicionário Anti-Jargão Validado
- [x] "Taxa de Conveniência" adotada (proibido "Split").
- [x] "Sinal de Reserva" adotado (proibido "Down Payment").
- [x] "Saldo em Custódia" adotado (proibido "Escrow").
