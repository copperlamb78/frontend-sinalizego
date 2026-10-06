# SinalizeGO — Plano de Implementação Modular das Features

> **Base do Backend:** `C:\Users\Antonio Gabriel\Desktop\api-sinalizego\src\modules`  
> **Arquitetura:** Modular Feature-Driven (Vertical Slice) com Shared Core e Design System Atômico.  
> **Status:** Ativo e Versionado.

---

## 🔒 Diretriz Mandatória: API Source of Truth Gate

> **REGRA INEGOCIÁVEL PARA O AGENTE DE IA:**  
> **Sempre que for implementar qualquer tela, serviço, hook, tipo (TypeScript) ou schema (Zod), o agente DEVE OBRIGATORIAMENTE inspecionar o código-fonte real da API NestJS em `C:\Users\Antonio Gabriel\Desktop\api-sinalizego\src\modules` antes de escrever qualquer linha de código no frontend.**  
>
> É estritamente proibido inventar nomes de campos, rotas hipotéticas, tipos imaginários ou suposições de regras de negócio. O backend é a única e soberana fonte da verdade (*Source of Truth*).

---

## Mapeamento de Rotas da API NestJS x Features Frontend

| Feature Frontend | Módulo Backend Correspondente | Endpoints Reais da API |
|---|---|---|
| **Opção 1: Vitrine Pública** (`features/storefront/`) | `company`, `company-service`, `appointments` | `GET /company/slug/:slug`<br>`GET /company-service/list/:slug`<br>`GET /appointments/available-slots?companyId=...&serviceId=...&date=YYYY-MM-DD` |
| **Opção 2: Checkout Pix** (`features/checkout/`) | `appointments`, `asaas` | `POST /appointments` (Cria agendamento + gera cobrança Pix via Asaas)<br>`GET /appointments/:id` (Polling do status `PENDING` -> `CONFIRMED`)<br>`DELETE /appointments/:id/client` (Cancelamento) |
| **Opção 3: Casca de Layout & Rotas** (`src/routes/` + `design-system/layout/`) | Infraestrutura / Router | Gerenciamento de rotas com React Router v7, layout público (`/b/:slug`, `/checkout/:id`), Navbar com alternador de tema e casca de dashboard |
| **Opção 4: Autenticação** (`features/auth/`) | `auth`, `users` | `POST /auth/login`<br>`POST /auth/refresh`<br>`GET /auth/me` |

---

## Opção 1 🌟 (Recomendada) — Vitrine Pública do Estabelecimento (`features/storefront/`)

O coração da plataforma para o cliente final agendar pelo smartphone em poucos segundos sem necessidade de criar conta prévia.

### Tarefa 1.1 — Visual Gate: Mockup SVG da Vitrine Pública (Apresentação & Serviços)
- Criar e submeter mockup detalhado em SVG no chat demonstrando a tela mobile (390px):
  - Banner generoso com foto do local/espaço do estabelecimento.
  - Avatar/Logo institucional em destaque com corte sólido.
  - Nome, segmento, status de funcionamento (*Aberto hoje*), endereço e WhatsApp.
  - Categorias de serviços (*serviceGroups* da API) em chips táteis.
  - Catálogo de serviços com cards atômicos: título, descrição, duração, preço total, badge de sinal Pix e botão de ação direto: *"Escolher Horário para este Serviço →"*.
  - Fluxo desacoplado: a seleção de data e horário passa para uma tela/etapa seguinte dedicada.
- **Aguardar aprovação explícita do usuário antes de codar.**

### Tarefa 1.2 — Tipagem e Contratos com a API (`features/storefront/types/`)
- Mapear interfaces TypeScript fiéis aos DTOs e entidades do backend:
  - `StorefrontCompany`: id, name, slug, logoUrl, bannerUrl, address, phone, businessHours.
  - `StorefrontService`: id, name, description, durationMinutes, price, downPaymentPercentage, isActive.
  - `AvailableSlot`: time (ex: "09:00", "09:30"), available (boolean).
- Arquivo: `src/features/storefront/types/storefront.types.ts`.

### Tarefa 1.3 — Serviço de Comunicação com a API (`features/storefront/services/`)
- Implementar `storefrontService`:
  - `getCompanyBySlug(slug: string)`: busca dados públicos da empresa.
  - `getServicesByCompanySlug(slug: string)`: lista os serviços ativos da barbearia.
  - `getAvailableSlots(companyId: string, serviceId: string, date: string)`: consulta horários livres no dia selecionado.
- Arquivo: `src/features/storefront/services/storefrontService.ts`.

### Tarefa 1.4 — Hooks com TanStack React Query (`features/storefront/hooks/`)
- Criar `useStorefront(slug)` para gerenciar cache, estados de loading com Skeletons e tratamento humanizado de erros (ex: estabelecimento não encontrado - 404).
- Criar `useAvailableSlots(companyId, serviceId, date)` com refetch automático ao alternar dia ou serviço.
- Arquivos: `src/features/storefront/hooks/useStorefront.ts` e `useAvailableSlots.ts`.

### Tarefa 1.5 — Componentes Atômicos da Vitrine (`features/storefront/components/`)
- `StorefrontHeader`: Exibição limpa da marca do estabelecimento, badge de status (Aberto/Fechado) e endereço.
- `ServiceCard`: Card interativo de serviço com título, duração, preço formatado em BRL e badge discreto de sinal.
- `DateSelector`: Barra de seleção de dias da semana (Hoje, Amanhã, próximos 7 dias).
- `SlotPicker`: Grade de botões táteis para seleção de horários disponíveis com estados vago, ocupado e selecionado.
- `BookingFloatingBar`: Barra fixa inferior que surge ao selecionar um serviço e horário com o botão *"Continuar para Pagamento do Sinal"*.

### Tarefa 1.6 — Barreira Pública de Exportação (`features/storefront/index.ts`)
- Exportar exclusivamente componentes e hooks públicos para as páginas finas em `src/routes/pages/storefront/StorefrontPage.tsx`.

---

## Opção 2 — Fluxo de Checkout Pix (`features/checkout/`)

Garante a cadeira do cliente através da cobrança Pix com contagem regressiva de 15 minutos e confirmação em tempo real.

### Tarefa 2.1 — Visual Gate: Mockup SVG do Checkout Pix
- Gerar mockup detalhado em SVG da tela de pagamento Pix:
  - Card de resumo do agendamento (serviço, dia, horário e nome do estabelecimento).
  - Tabela transparente de valores: `Sinal de Reserva (via Pix)` + `Taxa de Conveniência` = `Total a pagar agora`.
  - Informativo discreto: *"Restante a pagar na cadeira: R$ XX,XX"*.
  - QR Code Pix estilizado em fundo neutro e botão de alta usabilidade "Copiar código Pix".
  - Cronômetro regressivo com urgência visual sutil (`14:59`, `14:58`...).
- **Aguardar aprovação explícita do usuário antes de codar.**

### Tarefa 2.2 — Tipagem e Schema de Validação (`features/checkout/schemas/` e `types/`)
- Validação Zod com React Hook Form:
  - `clientName`: Mínimo 3 caracteres, obrigatório.
  - `clientPhone`: Máscara e validação estrita de celular brasileiro `(DD) 9XXXX-XXXX`.
  - `notes`: Campo opcional para observações.
- Tipos de retorno do backend:
  - `AppointmentResponse`: id, status (`PENDING`, `CONFIRMED`, `CANCELLED`), scheduledAt, expiresAt, pixQrCode, pixCopyPaste.
- Zero Trust: Frontend não envia preços nem taxas no payload de agendamento.

### Tarefa 2.3 — Serviço de Checkout (`features/checkout/services/`)
- `createAppointment(dto: CreateAppointmentDTO)`: envia dados do cliente para `POST /appointments`.
- `getAppointmentById(id: string)`: busca detalhes e status atualizado do agendamento para `GET /appointments/:id`.
- `cancelAppointment(id: string)`: cancela caso o cliente desista antes do pagamento expirado.
- Arquivo: `src/features/checkout/services/checkoutService.ts`.

### Tarefa 2.4 — Hook de Polling Resiliente (`features/checkout/hooks/usePixPolling.ts`)
- Polling a cada 4 segundos consultando `getAppointmentById(id)`.
- Parada automática imediata quando o status virar `CONFIRMED` ou `CANCELLED`/expirado.
- Redirecionamento automático e disparo de feedback visual imediato (Toast + Som sutil de confirmação).

### Tarefa 2.5 — Componentes do Checkout (`features/checkout/components/`)
- `PixCountdownTimer`: Contador regressivo sincronizado com o `expiresAt` do backend.
- `PixQrCodeCard`: Exibição nítida do QR Code Pix e botão com cópia automática + feedback visual de copiado.
- `AppointmentBreakdown`: Tabela transparente sem termos técnicos como "split" ou "escrow".
- `ConfirmationVoucher`: Card de comprovante com dados da reserva e link direto para adicionar ao Google Agenda / WhatsApp.

### Tarefa 2.6 — Barreira Pública de Exportação (`features/checkout/index.ts`)
- Exportar componentes para uso na rota `src/routes/pages/checkout/CheckoutPage.tsx`.

---

## Opção 3 — Casca de Layout & Roteamento (`src/routes/` + `design-system/layout/`)

Infraestrutura de navegação declarativa da aplicação utilizando React Router v7 e cascas de layout padronizadas.

### Tarefa 3.1 — Visual Gate: Mockup SVG da Barra de Navegação e Cascas
- Mockup SVG ilustrando:
  - Navbar desktop e mobile: logotipo SinalizeGO, link para catálogo, status de autenticação e botão alternador de tema Claro/Escuro.
  - Estrutura de casca pública (*PublicShell*) e casca do painel administrativo (*DashboardShell*).
- **Aguardar aprovação explícita do usuário antes de codar.**

### Tarefa 3.2 — Componentes Estruturais (`design-system/layout/`)
- `Navbar`: Barra fixa com suporte a modo claro e escuro, corte limpo e responsivo.
- `Container`: Contêiner centralizado com limites de largura padronizados (`max-w-7xl` para desktop e fluido no mobile).
- `PageHeader`: Cabeçalho padrão de página com título, subtítulo e ações.
- `PublicLayout` e `DashboardLayout`: Cascas de aplicação injetando `<Outlet />`.

### Tarefa 3.3 — Configuração Declarativa do React Router v7 (`src/routes/index.tsx`)
- Configuração do roteador com suporte a:
  - Rotas públicas: `/b/:slug` (Vitrine), `/checkout/:appointmentId` (Checkout Pix), `/confirmacao/:appointmentId` (Voucher).
  - Rotas de autenticação: `/login`, `/cadastro`, `/recuperar-senha`.
  - Rotas do painel: `/dashboard/agendamentos`, `/dashboard/servicos`, `/dashboard/horarios`, `/dashboard/financeiro`.

### Tarefa 3.4 — Guards de Proteção de Rotas (`src/routes/components/`)
- `ProtectedRoute`: Verifica existência de token e redireciona para `/login` caso não autenticado.
- `PublicOnlyRoute`: Redireciona usuários já autenticados para `/dashboard`.
- `RouteErrorBoundary`: Tratamento amigável de erros 404 e 500 sem exibir stack traces em produção.

---

## Opção 4 — Autenticação do Estabelecimento (`features/auth/`)

Acesso seguro dos proprietários e profissionais ao painel de controle.

### Tarefa 4.1 — Visual Gate: Mockup SVG das Telas de Login e Cadastro
- Mockup SVG da tela de login e cadastro com formulário tátil, campo de senha com toggle de visibilidade e botão de ação primário.
- **Aguardar aprovação explícita do usuário antes de codar.**

### Tarefa 4.2 — Tipos e Schemas Zod (`features/auth/schemas/` e `types/`)
- `loginSchema`: validação de e-mail institucional e senha (mínimo 6 caracteres).
- `registerSchema`: nome da empresa, slug desejado, e-mail, telefone WhatsApp e senha.
- Interfaces TypeScript sincronizadas com os DTOs de `auth.controller.ts` da API.

### Tarefa 4.3 — Serviço de Autenticação (`features/auth/services/authService.ts`)
- `login(credentials)`: conecta a `POST /auth/login`, salvando access token e refresh token.
- `register(data)`: conecta a `POST /auth/register` (ou rota de onboarding de empresa).
- `getProfile()`: conecta a `GET /auth/me` para carregar dados do usuário autenticado.

### Tarefa 4.4 — Hook e Contexto de Autenticação (`features/auth/hooks/useAuth.ts`)
- Gerenciamento de sessão reativa, suporte a logout com expurgo seguro de tokens e injeção automática no interceptor do `client.ts`.

### Tarefa 4.5 — Componentes de Formulário (`features/auth/components/`)
- `LoginForm`: Formulário limpo com validação em tempo real e prevenção de double submit.
- `RegisterForm`: Formulário passo a passo para onboarding de novos estabelecimentos.

---

## Checklist de Qualidade Obrigatório Antes de Concluir Qualquer Tarefa
- [ ] Inspecionou o módulo correspondente da API NestJS em `C:\Users\Antonio Gabriel\Desktop\api-sinalizego\src\modules`?
- [ ] Criou o Mockup SVG e obteve aprovação explícita do usuário antes de codar?
- [ ] Seguiu a estética "Menos é Mais", bordas limpas de 1px, sem neon e fonte Plus Jakarta Sans?
- [ ] Zero Trust financeiro respeitado (nenhum valor monetário calculado/manipulado no cliente)?
- [ ] Zero jargão técnico visível na interface para o usuário final?
- [ ] Executou `npm run build` para certificar zero erros de TypeScript e compilação?
- [ ] Fez um commit semântico individual por arquivo modificado em português?
