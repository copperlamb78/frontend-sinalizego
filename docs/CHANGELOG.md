# Registro de Alterações e Melhorias — Frontend SinalizeGO

Este documento registra detalhadamente todas as auditorias, correções de regras de negócio, eliminações de jargões técnicos, completude de formulários, otimizações de performance de rede e a solução da grade semanal de expediente aplicadas no `frontend-sinalizego`.

---

## 1. Grade Semanal & Expediente do Estabelecimento (Correção Crítica)

- **Diagnóstico do Problema:**
  - Em contas novas ou estabelecimentos sem expediente previamente configurado, a API retorna `[]` para `GET /working-hours/:companyId`.
  - A tela `OwnerWorkingHoursPage.tsx` dependia estritamente de `workingHoursData && workingHoursData.length > 0` para montar o estado local, resultando em uma grade completamente vazia sem nenhuma opção ou botão de adição de dias.
  - O serviço `working-hours.service.ts` enviava `{ workingHours }`, enquanto o NestJS backend (`UpdateWorkingHoursDto`) requer o formato estrito `{ hours: WorkingHourItemDto[] }`.
- **Melhorias Implementadas:**
  - **Inicialização Automática dos 7 Dias:** Criação da constante `DEFAULT_WEEKLY_SCHEDULE` (Segunda a Sábado das 09h às 19h com intervalo das 12h às 13h, Domingo fechado). Se o backend retornar vazio, a grade é automaticamente inicializada com os 7 dias completos.
  - **Ação Rápida no Cabeçalho:** Adicionado botão *"Padrão Comercial (Seg a Sáb)"* com ícone `Sparkles`, permitindo ao proprietário redefinir rapidamente a semana com horários usuais de comércio em um único clique.
  - **Estado Vazio com CTA:** Se por qualquer motivo a grade ficar sem nenhum dia, é exibido um card com botão de destaque *"Inicializar Grade Semanal (Seg a Sáb)"*.
  - **Correção no Contrato da API:** `working-hours.service.ts` agora higieniza os campos e despacha o envelope exato `{ hours: sanitized }`, compatível com a validação estrita do backend.
  - **UX e Feedback:** Adicionado aviso visual de alterações não salvas antes do salvamento e botão de reversão de mudanças.

---

## 2. Eliminação de Jargões Técnicos e Melhoria de Copywriting

Substituição de termos frios e técnicos de engenharia/banco de dados por uma linguagem acolhedora, clara e orientada ao dia a dia de barbearias e seus clientes:

| Localização | Termo Técnico Anterior | Novo Texto Amigável / Humanizado |
| :--- | :--- | :--- |
| **Modal de Cancelamento** (`CancellationModal.tsx`) | "Regra CDC / Art. 417-420 CC" | *"Regra de Cancelamento e Reembolso do Estabelecimento"* |
| **Modal de Cancelamento** | "compensação por vacância" | *"retenção para cobertura de custos do horário reservado"* |
| **Checkout** (`CheckoutPage.tsx`) | "Taxa da plataforma" / "Split" | *"Taxa de Conveniência e Agendamento"* |
| **Checkout** | "Processando split de pagamento..." | *"Confirmando sua reserva..."* |
| **Status / Geral** | "Status: PENDING_PAYMENT / EXPIRED" | *"Aguardando Pagamento"* / *"Prazo Expirado"* |
| **Página de Erro 500** (`ServerErrorPage.tsx`) | "Erro Interno no Servidor 500" | *"Tivemos um contratempo temporário"* |

---

## 3. Conformidade com Regras de Negócio e Financeiro

- **Regra N6 (Cancelamento $\le$ 24h):**
  - Atualizada a regra no modal de cancelamento do cliente: cancelamentos com **menos de 24 horas** retêm 100% do sinal pago para compensar o horário bloqueado do profissional (não há estorno ou geração de crédito quando o cancelamento é feito de última hora).
  - Cancelamentos com **mais de 24 horas** de antecedência garantem o reembolso integral do sinal diretamente via Pix.
- **Detalhamento do Sinal e Taxa no Checkout:**
  - O resumo financeiro do agendamento passou a discriminar explicitamente:
    - Valor total do serviço;
    - Valor do sinal do profissional (50% ou regra de depósito do estabelecimento);
    - Taxa de conveniência da plataforma (`CalculateTax`);
    - Valor restante a ser acertado presencialmente no balcão após o atendimento.

---

## 4. Completude de Formulários e Validação de DTOs

- **Configuração Financeira (`FinancialProfileModal.tsx`):**
  - Adicionados campos de Chave Pix (`pixAddressKey`) e Tipo de Chave (`pixAddressKeyType`: CPF, CNPJ, E-mail, Telefone ou Chave Aleatória) com validação Zod.
  - Adicionada seleção de enquadramento da empresa (`companyType`: MEI, ME, LTDA, EIRELI, INDIVIDUAL).
- **Onboarding de Estabelecimento (`CompanyOnboardingPage.tsx`):**
  - Adicionado campo opcional de Código de Indicação (`referralCode`) na etapa de identificação comercial, permitindo usufruir da promoção de indicação (N9).
  - Corrigidos links para Termos de Uso e Política de Privacidade adicionando `rel="noopener noreferrer"` e alvos seguros.

---

## 5. Otimização de Performance e Redução de Requisições

- **Unificação de Chaves de Cache (TanStack Query):**
  - Padronização das queries de agendamentos do cliente sob a chave `['user-appointments']`.
  - Padronização das queries de detalhe de agendamento para `['appointment', id]`, unificando a invalidação de cache após cancelamento ou confirmação de pagamento.
- **Eliminação de Polling Zumbi (`PixPaymentPage.tsx`):**
  - Corrigido o `refetchInterval` da página de pagamento Pix: o polling de 5 segundos agora é imediatamente desligado assim que o agendamento muda para `CONFIRMED` ou quando atinge `EXPIRED`/`CANCELLED`, evitando chamadas infinitas ao servidor.
- **Configuração de `staleTime` Estratégico:**
  - Telas como `OwnerSettingsPage.tsx` e catálogos agora utilizam cache de 1 a 5 minutos, evitando refetches automáticos a cada troca de aba ou refoco de janela.

---

## 6. Verificação e Qualidade

- O projeto foi testado e compilado com sucesso (`npm run build` via TypeScript 5 + Vite).
- Zero warnings ou erros impeditivos.
