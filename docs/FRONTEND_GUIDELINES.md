# SinalizeGO — Frontend UX, Copywriting & Design Guidelines

> Guia oficial e normativo de User Experience (UX), Design System, Acessibilidade e Copywriting (UX Writing) para a interface web e mobile do SinalizeGO.
> 
> **Público-Alvo:** 
> 1. O prestador de serviço (Barbeiro / Proprietário) — busca agilidade, gestão clara e zero atrito financeiro.
> 2. O cliente final — quer agendar um horário em menos de 1 minuto pelo celular sem atritos ou termos confusos.

---

## 1. Glossário de UX Writing & Anti-Jargão Técnico

O SinalizeGO é utilizado por pessoas comuns em seus smartphones. É expressamente vedado o uso de jargões técnicos de infraestrutura, arquitetura backend ou gateways de pagamento nas telas voltadas ao usuário final.

### 1.1 Tabela de Conversão Mandatória de Vocabulário

| Termo Técnico Proibido no Frontend | Substituto Obrigatório no Checkout / Cliente | Substituto no Painel do Estabelecimento |
|---|---|---|
| `Split` / `Split de Pagamento` | *Ocultar do cliente* | "Divisão Automática de Pagamento" |
| `Webhook` | *Ocultar do cliente* | "Notificação Automática do Sistema" |
| `Escrow` / `Custódia` | "Pagamento protegido até o atendimento" | "Saldo em Garantia / Reserva" |
| `Taxa da Plataforma` | "Taxa de Serviço" ou "Taxa de Conveniência" | "Taxa SinalizeGO" |
| `Hold de 15 minutos` / `Timeout` | "Seu horário fica reservado por 15 minutos enquanto você conclui o Pix" | "Tempo limite de reserva" |
| `No-show` | "Não comparecimento" | "Não comparecimento (Ausência)" |
| `Idempotência` | *Ocultar do cliente* | "Prevenção de duplicidade" |
| `Token JWT` / `Sessão Expirada` | "Sua conexão expirou. Por favor, acesse novamente." | "Sua sessão expirou. Faça login novamente." |
| `Payload` / `Gateway` | *Proibido em qualquer tela* | "Sistema de Pagamentos Pix" |
| `Down Payment` | "Sinal de Reserva" ou "Valor do Sinal" | "Valor do Sinal (Pix)" |
| `Balance Remaining` | "Restante a pagar no local" | "Saldo a receber no local" |

---

## 2. Mensagens de Erro Humanizadas (Error Handling)

Erros HTTP da API ou falhas de validação de formulários nunca devem expor códigos crus como `409 Conflict`, `P2002`, `AxiosError` ou termos em inglês ao usuário.

### 2.1 Mapeamento Padrão de Status HTTP para Copy Amigável

- **400 Bad Request (Dados Inválidos):**
  - *Mensagem:* "Verifique os dados informados e tente novamente. Alguns campos precisam de correção."
  - *Ação UX:* Destacar o campo com borda vermelha suave (`border-red-500/50`) e texto de auxílio abaixo do input.

- **401 Unauthorized (Não Autenticado):**
  - *Mensagem:* "Você precisa entrar na sua conta para continuar."
  - *Ação UX:* Redirecionar suavemente para `/login` mantendo `returnUrl` no estado da rota.

- **403 Forbidden (Acesso Não Permitido):**
  - *Mensagem:* "Você não tem permissão para acessar esta área ou alterar este recurso."
  - *Ação UX:* Redirecionar para o dashboard principal ou página anterior.

- **404 Not Found (Não Encontrado):**
  - *Mensagem:* "Não encontramos o que você procurava. Este serviço ou estabelecimento pode não estar mais disponível."
  - *Ação UX:* Botão de CTA: *"Voltar à página inicial"*.

- **409 Conflict (Conflito de Horário / Concorrência):**
  - *Mensagem:* "Esse horário acabou de ser reservado por outro cliente. Por favor, escolha outro horário disponível."
  - *Ação UX:* Recarregar automaticamente a grade de horários disponíveis (`invalidateQueries('available-slots')`).

- **410 Gone (Reserva Pix Expirada):**
  - *Mensagem:* "O tempo para pagamento deste Pix expirou (15 minutos). Por favor, selecione seu horário novamente para gerar um novo código."
  - *Ação UX:* Botão de CTA: *"Efetuar Nova Reserva"*.

- **429 Too Many Requests (Limite de Tentativas):**
  - *Mensagem:* "Você realizou muitas tentativas recentemente. Por segurança, aguarde alguns instantes antes de tentar novamente."

- **500 / 502 / 503 Generic (Instabilidade do Sistema):**
  - *Mensagem:* "Não conseguimos concluir sua solicitação agora. Nossos servidores estão temporariamente instáveis. Seus dados estão salvos, tente novamente em alguns minutos."
  - *Regra Estrita de Segurança:* Em ambiente de produção (`import.meta.env.PROD`), **NUNCA** exibir `error.stack`, consultas SQL/Prisma ou payloads técnicos na tela.

---

## 3. Regras de Negócio do Sinal no Frontend

### 3.1 Checkout do Cliente Final (Zero Dúvidas)
- **Eliminação de Percentuais Manuais:** O cliente final não escolhe se quer pagar 30%, 50% ou 100%. A API calcula o sinal ideal e o frontend apenas exibe com clareza.
- **Transparência de Valores:**
  ```
  Exemplo Visual no Card de Checkout:
  --------------------------------------------------
  Corte Degradê + Barba               R$ 60,00
  Sinal de Reserva (50%)              R$ 30,00
  Taxa de Conveniência (Serviço)       R$  2,00
  --------------------------------------------------
  Total a pagar via Pix agora:         R$ 32,00
  Restante a acertar na barbearia:     R$ 30,00
  --------------------------------------------------
  [Botão]: Garantir Cadeira às 15:30 (R$ 32,00 via Pix)
  ```
- **Temporizador do Pix:**
  - Contador regressivo em destaque: *"Seu horário fica reservado por MM:SS enquanto você conclui o Pix"*.
  - Botão de um clique: *"Copiar Código Pix"* com feedback tátil/visual imediato (*"Código copiado!"* com ícone `Check`).
  - Polling reativo no frontend verificando status `CONFIRMED` para redirecionar instantaneamente à tela de sucesso com instruções do agendamento.

### 3.2 Painel do Estabelecimento — Cadastro de Serviços
Ao cadastrar ou editar um serviço, o proprietário visualiza a regra automática de sinal de acordo com a política de negócio da plataforma:
- **Preço < R$ 15,00:**
  - Card informativo: *"Serviços abaixo de R$ 15,00 possuem sinal integral (100%) para cobrir custos operacionais."*
  - Campo de sinal travado em 100%.
- **Preço entre R$ 15,00 e R$ 399,99:**
  - Card informativo: *"Sinal padrão de 50% aplicado automaticamente para garantir o compromisso do cliente."*
  - Campo de sinal definido em 50%.
- **Preço >= R$ 400,00 (Alto Ticket / Tratamentos Longos):**
  - Exibição de card interativo com badge `FLEXÍVEL`:
  - Opção de selecionar entre **50% (Padrão Recomendado)** e **30% (Flexível - Reduz atrito em valores altos)**.
  - Texto explicativo: *"Permite facilitar o agendamento de pacotes premium sem sobrecarregar o cliente no Pix inicial."*

---

## 4. Design System & Diretrizes Visuais

### 4.1 Paleta de Cores (Tema Dark Exclusivo)
O SinalizeGO adota um visual moderno, elegante e de alto contraste, ideal para telas AMOLED e uso móvel:

- **Fundo Principal (Background Canvas):** `#0B1120` (`bg-slate-950` / personalizado)
- **Superfícies de Cards & Modais:** `#0F172A` (`bg-slate-900`)
- **Bordas e Divisores:** `#1E293B` (`border-slate-800`) ou `#334155` (`border-slate-700`)
- **Cor Primária de Destaque (Brand Accent):** Teal vibrante (`text-teal-400`, `bg-teal-500`, `hover:bg-teal-400`, `focus:ring-teal-500`)
- **Textos Primários:** `#FFFFFF` (`text-white`)
- **Textos Secundários / Muted:** `#94A3B8` (`text-slate-400`)
- **Feedback de Sucesso:** Emerald (`text-emerald-400`, `bg-emerald-500/10`)
- **Feedback de Alerta:** Amber (`text-amber-400`, `bg-amber-500/10`)
- **Feedback de Erro:** Rose/Red (`text-rose-400`, `bg-rose-500/10`)

### 4.2 Ícones e Elementos Visuais
- **Lucide React Exclusivo:** Todos os ícones devem vir de `lucide-react` (ex: `Calendar`, `Clock`, `Scissors`, `ShieldCheck`, `Copy`, `Check`, `AlertCircle`, `ArrowRight`).
- **Zero Emojis em JSX de Produção:** Nunca insira emojis brutos (ex: ✂️, 💈, 💰, ⚠️) diretamente em botões ou títulos. Utilize componentes de ícone SVG semânticos do Lucide com tamanho e cor consistentes (`size={18}` ou `className="w-5 h-5 text-teal-400"`).

### 4.3 Formulários, Botões e Touch Targets
- **Tamanho Mínimo de Toque (Mobile-First):** Botões e inputs interativos devem possuir altura mínima de `44px` (`h-11` ou `h-12`) para fácil acionamento pelo polegar.
- **Estados de Carregamento (Loading States):**
  - Qualquer botão que dispara requisições HTTP deve entrar em estado de `disabled` com um indicador de spinner (`Loader2` da `lucide-react` com animação `animate-spin`) e texto condicional (*"Gerando Pix..."*, *"Salvando..."*).
  - Nunca permitir múltiplos cliques acidentais (double-click lock).
- **Validação de Formulários:**
  - Sempre integrar `react-hook-form` com resolvers `@hookform/resolvers/zod`.
  - Exibir mensagens de validação claras em português logo abaixo do campo correspondente.

---

## 5. Acessibilidade (a11y) & Segurança

### 5.1 Acessibilidade Essencial
- **Rótulos em Botões com Apenas Ícone:** Botões que contêm apenas ícones (ex: botão de fechar modal ou copiar código) DEVEM ter `aria-label` descritivo (ex: `aria-label="Fechar janela"`, `aria-label="Copiar código Pix"`).
- **Foco Visível:** Elementos focáveis devem preservar anéis de foco acessíveis (`focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none`).
- **Contraste de Texto:** Manter contraste WCAG AA mínimo de 4.5:1 para texto normal contra o fundo escuro.

### 5.2 Segurança no Frontend
- **Links Externos:** Todo link com `target="_blank"` DEVE conter obrigatoriamente `rel="noopener noreferrer"` para impedir vulnerabilidades de `window.opener` e vazamento de referrers.
- **Armazenamento Local:** Nunca armazenar dados sensíveis do cliente (senhas, dados completos de cartão, CVV) no `localStorage` ou `sessionStorage`.
- **Testes Automatizados:** Manter atributos `data-testid` estáveis e descritivos nos fluxos principais (ex: `data-testid="input-phone"`, `data-testid="button-confirm-booking"`).
