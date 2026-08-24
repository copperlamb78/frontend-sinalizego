# 📋 Planejamento de Tarefas Frontend — SinalizeGO (P0, P1, P2)

**Versão**: 1.4.0  
**Data**: 23 de Agosto de 2026  
**Status**: Em Execução (Fase P1 em Andamento)  
**Classificação**: P0 (Crítico/Core), P1 (Operacional/Gestão), P2 (Governança/Polimento)

---

## 📊 Visão Geral das Fases

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROADMAP DE DESENVOLVIMENTO                       │
├───────────────────┬────────────────────────────────┬───────────────────┤
│    FASE P0 (Core) │       FASE P1 (Operação)       │ FASE P2 (Escala)  │
├───────────────────┼────────────────────────────────┼───────────────────┤
│ • [X] Task 0: Setup│ • [X] Task 3: Dashboard & Agenda│ • [ ] Task 6: Admin │
│ • [X] Task 1: Auth │ • [X] Task 4: Serviços/Expediente│ • [ ] Task 7: PWA │
│ • [X] Task 2: Book │ • [ ] Task 5: Portal Cliente   │                   │
└───────────────────┴────────────────────────────────┴───────────────────┘
```

---

## 🗺️ Matriz de Rotas & Telas da Aplicação

| Rota | Layout Mestre | Componente Principal | Controle de Acesso (RBAC) | Status |
|---|---|---|---|:---:|
| `/` | `PublicLayout` | `HomePage` | Público | ✅ Concluído (Task 0/1) |
| `/empresa/:slug` | `PublicLayout` | `StorefrontPage` (Vitrine) | Público | ✅ Concluído (Task 2) |
| `/reserva/:companyId/:serviceId` | `PublicLayout` | `CheckoutPage` | Público / Autenticado | ✅ Concluído (Task 2) |
| `/pagamento/pix/:appointmentId` | `PublicLayout` | `PixPaymentPage` | Público / Autenticado | ✅ Concluído (Task 2) |
| `/reserva/confirmada/:appointmentId` | `PublicLayout` | `BookingSuccessPage` | Público / Autenticado | ✅ Concluído (Task 2) |
| `/login` | `AuthLayout` | `LoginPage` | Público / Guest | ✅ Concluído (Task 1) |
| `/cadastro` | `AuthLayout` | `RegisterPage` | Público / Guest | ✅ Concluído (Task 1) |
| `/esqueci-minha-senha` | `AuthLayout` | `ForgotPasswordPage` | Público / Guest | ✅ Concluído (Task 1) |
| `/redefinir-senha` | `AuthLayout` | `ResetPasswordPage` | Público / Guest | ✅ Concluído (Task 1) |
| `/onboarding/empresa` | `AuthLayout` | `CompanyOnboardingPage` | Público / Autenticado | ✅ Concluído (Task 1) |
| `/meus-agendamentos` | `ClientLayout` | `ClientAppointmentsPage` | `CLIENT`, `COMPANY_OWNER`, `EMPLOYEE`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 0/5) |
| `/meus-agendamentos/:id` | `ClientLayout` | `ClientAppointmentsPage` | `CLIENT`, `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 0/5) |
| `/minha-conta` | `ClientLayout` | `ClientProfilePage` | Todos autenticados | ✅ Concluído (Task 0/5) |
| `/painel` | `OwnerLayout` | `OwnerDashboardPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 3) |
| `/painel/agenda` | `OwnerLayout` | `OwnerCalendarPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 3) |
| `/painel/servicos` | `OwnerLayout` | `OwnerServicesPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 4) |
| `/painel/expediente` | `OwnerLayout` | `OwnerWorkingHoursPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 4) |
| `/painel/financeiro` | `OwnerLayout` | `OwnerFinancialPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 3/4) |
| `/painel/configuracoes` | `OwnerLayout` | `OwnerSettingsPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 4) |
| `/admin` | `AdminLayout` | `AdminDashboardPage` | `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 0/6) |
| `/admin/empresas` | `AdminLayout` | `AdminCompaniesPage` | `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 0/6) |
| `/admin/usuarios` | `AdminLayout` | `AdminUsersPage` | `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 0/6) |
| `*` | `RootLayout` | `NotFoundPage` | Público | ✅ Concluído (Task 0) |

---

## 🌳 Árvore de Arquivos do Projeto (`src/`)

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx          # Guarda RBAC de rotas com validação de Role
│   ├── common/
│   │   ├── Badge.tsx                   # Primitivo de status com variações e pulsos
│   │   ├── Button.tsx                  # Botão institucional com loading e ícones
│   │   ├── Card.tsx                    # Containers com estilo dark #0F172A
│   │   ├── Input.tsx                   # Input estilizado com validação e ícones
│   │   ├── Logo.tsx                    # Logotipo oficial Cloudinary + fallback Calendar
│   │   ├── Modal.tsx                   # Dialog com backdrop blur e acessibilidade
│   │   ├── Skeleton.tsx                # Placeholders animados de carregamento
│   │   └── Toaster.tsx                 # Toaster Sonner dark mode
│   └── dashboard/
│       └── WithdrawalModal.tsx         # Modal de solicitação de saque com dedução Asaas e histórico
├── config/
│   ├── api.config.ts                   # Axios com Bearer token e auto-refresh 401
│   └── query-client.ts                 # TanStack QueryClient e cache global
├── contexts/
│   └── auth.context.tsx                # AuthProvider, useAuth() e sincronização de tokens
├── layouts/
│   ├── AdminLayout.tsx                 # Layout executivo Super Admin
│   ├── AuthLayout.tsx                  # Layout centralizado Dark Mode
│   ├── ClientLayout.tsx                # Portal do cliente com BottomNav PWA
│   ├── OwnerLayout.tsx                 # Portal do proprietário com Sidebar retrátil
│   ├── PublicLayout.tsx                # Layout público institucional com footer limpo
│   └── RootLayout.tsx                  # Provedores globais, Toaster e Outlet
├── lib/
│   ├── calendar.ts                     # Gerador e downloader de arquivo .ics para calendários
│   ├── haptics.ts                      # Utilitário de feedback háptico tátil
│   └── utils.ts                        # Utilitário cn() e formatadores
├── pages/
│   ├── admin/
│   │   ├── AdminCompaniesPage.tsx      # Gestão e auditoria de estabelecimentos
│   │   ├── AdminDashboardPage.tsx      # Platform intelligence e saúde de microsserviços
│   │   └── AdminUsersPage.tsx          # Moderação centralizada de usuários
│   ├── auth/
│   │   ├── CompanyOnboardingPage.tsx   # Wizard atômico de criação de dono + empresa (POST /company/create)
│   │   ├── ForgotPasswordPage.tsx      # Solicitação de redefinição de senha
│   │   ├── LoginPage.tsx               # Formulário de login com Zod e auto-redirect
│   │   ├── RegisterPage.tsx            # Cadastro com seletor de perfil e termos
│   │   └── ResetPasswordPage.tsx       # Redefinição stateless de senha por token
│   ├── booking/
│   │   ├── BookingSuccessPage.tsx      # Voucher digital de confirmação com .ics e mapas
│   │   ├── CheckoutPage.tsx            # Seletor de data, slots livres e Safety Gate R$ 15,00
│   │   └── PixPaymentPage.tsx          # QR Code Pix, Copia e Cola, timer 15m e polling reativo 3s
│   ├── client/
│   │   ├── ClientAppointmentsPage.tsx  # Gestão de agendamentos e cancelamento >24h
│   │   ├── ClientExplorePage.tsx       # Catálogo de estabelecimentos frequentados
│   │   └── ClientProfilePage.tsx       # Gestão de perfil e CPF para split Pix
│   ├── owner/
│   │   ├── OwnerCalendarPage.tsx       # Grade operacional e conclusão atômica com liberação de saldo
│   │   ├── OwnerDashboardPage.tsx      # Métricas financeiras, saldo disponível, custódia e fila de hoje
│   │   ├── OwnerFinancialPage.tsx      # Subconta Asaas e extrato de repasses
│   │   ├── OwnerServicesPage.tsx       # CRUD de serviços e grupos com piso de sinal
│   │   ├── OwnerSettingsPage.tsx       # Dados cadastrais e upload de fotos
│   │   └── OwnerWorkingHoursPage.tsx   # Grade semanal e exceções de feriados
│   └── public/
│       ├── HomePage.tsx                # Landing page com busca rápida e sem jargões
│       ├── NotFoundPage.tsx            # Página 404 customizada
│       └── StorefrontPage.tsx          # Vitrine pública completa com catálogo agrupado e horários
├── routes/
│   └── index.tsx                       # Definição das 22 rotas da aplicação
├── services/
│   ├── admin.service.ts                # Métricas do Super Admin, auditoria de empresas e moderação de usuários
│   ├── appointments.service.ts         # Slots livres, criação de reserva, consulta e conclusão de atendimento
│   ├── auth.service.ts                 # Autenticação JWT, renovação de token, perfil e gestão de conta
│   ├── cep.service.ts                  # Consulta de CEP via BrasilAPI v2 com autopreenchimento
│   ├── company.service.ts              # Vitrine, métricas do painel, saldo, saques e histórico
│   ├── services.service.ts             # CRUD de categorias (ServiceGroup) e serviços (CompanyService)
│   ├── transactions.service.ts         # Geração de Pix e transações financeiras Asaas
│   └── working-hours.service.ts        # Grade semanal e exceções de feriados
├── types/
│   ├── admin.types.ts                  # DTOs e métricas de inteligência da plataforma
│   ├── api.types.ts                    # Tipagens de resposta e paginação da API
│   ├── appointment.types.ts            # DTOs de agendamento, status e available slots
│   ├── auth.types.ts                   # Role enum, User, AuthTokens e DTOs
│   ├── company.types.ts                # Storefront, WorkingHours, Balance, Withdrawals e Metrics
│   └── transaction.types.ts            # PixTransactionResponse e payloads Pix
├── vite-env.d.ts                       # Tipagem de ambiente e PWA
├── index.css                           # Design System Dark Mode Tailwind v4
├── App.tsx                             # Ponto de entrada com RouterProvider
└── main.tsx                            # Root React 19
```

---

## 🔴 FASE P0 — Fundação, Acesso & Core Booking Engine

### 📦 Task 0 (Principal): Fundação do Frontend, Design System Dark Mode e Camada HTTP/Auth
- **Prioridade**: P0 (Bloqueante)
- **Status**: [X] Concluído
- **Complexidade**: Alta
- **Objetivo**: Criar a espinha dorsal do projeto com ferramentas de build, Design System, controle de sessão e layouts mestres.

---

### 🔐 Task 1: Módulo de Autenticação, Recuperação de Senha e Onboarding da Empresa
- **Prioridade**: P0
- **Status**: [X] Concluído
- **Complexidade**: Média
- **Rotas**: `/login`, `/cadastro`, `/esqueci-minha-senha`, `/redefinir-senha`, `/onboarding/empresa`
- **Endpoints Integrados**:
  - `POST /auth/login`
  - `POST /users/create`
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
  - `POST /company/create`

---

### 💳 Task 2: Vitrine Pública, Motor de Agendamento & Checkout Pix com Polling
- **Prioridade**: P0
- **Status**: [X] Concluído
- **Complexidade**: Alta
- **Rotas**: `/empresa/:slug`, `/reserva/:companyId/:serviceId`, `/pagamento/pix/:appointmentId`, `/reserva/confirmada/:appointmentId`
- **Endpoints Integrados**:
  - `GET /company/slug/:slug`
  - `GET /appointments/available-slots`
  - `POST /appointments`
  - `POST /transactions/pix/:appointmentId`
  - `GET /appointments/:id`
- **Gatilhos Psicológicos de Conversão (Autoridade & Clareza)**:
  - **Gatilho de Garantia de Horário & Cadeira Reservada**: Substituição de termos burocráticos ("Taxa do App/Conveniência") por "Reserva de Horário Garantida" e "Taxa de Confirmação de Reserva", ativando a percepção de pontualidade, cadeira garantida e compromisso sem sobrecarga de jargões.
  - **Mecanismo de Escassez & Urgência Natural**: Badges de dias disputados (Sextas, Sábados e picos), indicadores contextuais nos slots mais concorridos ("Pico", "Último") e banner dinâmico de escassez quando restam poucas vagas no dia.

---

## 🟡 FASE P1 — Gestão do Estabelecimento & Portal do Cliente

### 💈 Task 3: Painel do Dono — Dashboard Analítico, Agenda e Conclusão de Atendimento
- **Prioridade**: P1
- **Status**: [X] Concluído
- **Complexidade**: Média-Alta
- **Rotas**: `/painel`, `/painel/agenda`
- **Endpoints Integrados**:
  - `GET /company/dashboard/metrics` (Faturamento, volume de atendimentos e fila de hoje)
  - `GET /company/balance` (Saldo disponível, custódia e próximo saque gratuito)
  - `POST /company/withdraw` (Saque avulso sob demanda com dedução Asaas de R$ 5,00)
  - `GET /company/withdrawals` (Histórico auditado de transferências)
  - `GET /appointments/company` (Agenda operacional por data)
  - `PATCH /appointments/:id/complete` (Conclusão atômica com liberação de saldo em custódia)

---

### ⚙️ Task 4: Painel do Dono — Catálogo de Serviços, Expediente e Subconta Financeira
- **Prioridade**: P1
- **Status**: [X] Concluído
- **Complexidade**: Média-Alta
- **Rotas**: `/painel/servicos`, `/painel/expediente`, `/painel/financeiro`, `/painel/configuracoes`
- **Endpoints Integrados**:
  - `GET /service-group` & `POST /service-group` & `PATCH /service-group/:id` & `DELETE /service-group/:id`
  - `POST /company-service` & `PATCH /company-service/:id` & `DELETE /company-service/:id`
  - `GET /working-hours` & `PUT /working-hours`
  - `GET /working-hours/exceptions` & `POST /working-hours/exceptions` & `DELETE /working-hours/exceptions/:id`
  - `PATCH /company/update/:id` & `POST /upload/photo`

#### Entregáveis Técnicos:
1. **`OwnerServicesPage` (`/painel/servicos`)**:
   - [x] Listagem hierárquica por categorias (`ServiceGroup`) com contadores de serviços e capacidade simultânea.
   - [x] Modal de Serviço com cálculo dinâmico de sinal e Micro-Transaction Safety Gate de R$ 15,00.
   - [x] Modal de Categoria/Grupo e modal de confirmação de exclusão.
2. **`OwnerWorkingHoursPage` (`/painel/expediente`)**:
   - [x] Grade semanal completa (Segunda a Domingo) com horário de início, término e intervalo de almoço/pausa.
   - [x] Gestão de exceções/feriados (`working-hours/exceptions`) com criação e exclusão.
3. **`OwnerSettingsPage` (`/painel/configuracoes`)**:
   - [x] Banner panorâmico e logo com upload e preview em tempo real.
   - [x] Autopreenchimento de endereço via BrasilAPI v2 no evento de CEP `onBlur`.
   - [x] Barra de link público da vitrine com botão de 1-clique para cópia.

---

### 👤 Task 5: Portal do Cliente — Meus Agendamentos, Cancelamento Transparente & Perfil
- **Prioridade**: P1
- **Status**: [X] Concluído
- **Complexidade**: Média
- **Rotas**: `/explorar`, `/meus-agendamentos`, `/meus-agendamentos/:id`, `/minha-conta`
- **Endpoints Integrados**:
  - `GET /appointments/user` (ou `/appointments/client` - Histórico de agendamentos futuros e passados)
  - `DELETE /appointments/:id/client` (Cancelamento com regras de estorno automático Pix Asaas)

#### Entregáveis Técnicos:
1. **`ClientAppointmentsPage` (`/meus-agendamentos`)**:
   - [x] Abas "Próximos Agendamentos" e "Histórico / Concluídos" com contadores dinâmicos.
   - [x] Cards ricos com endereço, horário, tempo de atendimento e detalhamento financeiro `[Sinal Pago via Pix]` vs `[Pagar no Balcão]`.
   - [x] Atalho rápido para abertura do `VoucherModal` com mapa, download de arquivo `.ics` e WhatsApp.
   - [x] Botão de cancelamento abrindo o modal educativo e transparente.
2. **`CancelAppointmentModal`**:
   - [x] Cálculo dinâmico do tempo restante até o atendimento.
   - [x] Cenário > 24 horas: Estorno integral garantido (100% Pix) de volta para a conta de origem.
   - [x] Cenário <= 24 horas: Explicação jurídica (Arts. 417 a 420 do Código Civil) sobre a retenção do piso de R$ 15,00 e devolução do valor excedente caso o sinal pago seja superior a R$ 15,00.
3. **`ClientProfilePage` (`/minha-conta`)**:
   - [x] Formulário de dados cadastrais com React Hook Form e validação via Zod.
   - [x] Campo de CPF para segurança de estornos bancários e aviso de criptografia de ponta a ponta.

---

## 🟢 FASE P2 — Inteligência Global Super Admin & Polimento PWA

### 🛡️ Task 6: Error Boundaries, Telas 404/500, Toasts Globais & Polimento Final
- **Prioridade**: P2
- **Status**: [X] Concluído
- **Complexidade**: Média
- **Rotas**: `/404`, `/500`, `*`

#### Entregáveis Técnicos:
1. **`NotFoundPage` (`/404` e catch-all `*`)**:
   - [x] Layout dark com ilustração `<SearchX />`, badge de erro e busca rápida por link de barbearia.
   - [x] Botões rápidos para "Voltar para o Início" e "Explorar Barbearias".
2. **`ServerErrorPage` (`/500` e Fallback do Error Boundary)**:
   - [x] Layout dark com alerta de instabilidade temporária e aviso de segurança dos dados.
   - [x] Botão para "Tentar Novamente" com reload do estado.
3. **`GlobalErrorBoundary`**:
   - [x] Error Boundary React envolvendo o `RootLayout.tsx` para prevenção de tela branca em tempo de execução.
4. **Refinamento de Perfil e Toasts Globais**:
   - [x] `Toaster.tsx` com `richColors`, `theme="dark"` e `closeButton`.
   - [x] `ClientProfilePage.tsx` com alteração de senha, zona de perigo e texto de apoio do CPF refinado.

---

### ✨ Task 7: Experiência PWA, Otimizações de Performance & Feedback Tátil
- **Prioridade**: P2
- **Status**: [X] Concluído
- **Complexidade**: Média
- **Objetivo**: Polimento de usabilidade, A2HS PWA instalável, feedback háptico, micro-interações elegantes e code splitting com `React.lazy`.

#### Entregáveis Técnicos:
1. **Instalação PWA (A2HS)**:
   - [x] Componente `PwaInstallPrompt` capturando evento `beforeinstallprompt` para instalação em 1 clique.
   - [x] Manifesto e Service Worker com tema dark `#0B1120`, display standalone e cache offline de assets.
2. **Micro-interações & Feedback Háptico**:
   - [x] Utilitário `triggerHaptic` com vibração tátil sutil em ações móveis de sucesso.
   - [x] Efeito comemorativo de confetti suave (`canvas-confetti`) nas cores Teal & Gold em `BookingSuccessPage`.
   - [x] Feedback de cópia do código Pix em `PixPaymentPage` com transição de ícone.
3. **Otimizações de Performance & Code Splitting**:
   - [x] Rotas migradas para `React.lazy` com `Suspense` e `PageSkeleton`.
   - [x] Configuração de `manualChunks` em `vite.config.ts` para isolamento de pacotes (`vendor-react`, `vendor-tanstack`, `vendor-icons`, `vendor-utils`).

---

## 📋 Matriz de Resumo das Tarefas

| Task | Título | Fase | Telas / Escopo | Status |
|:---:|---|:---:|---|:---:|
| **0** | Fundação, Design System Dark Mode e Camada HTTP/Auth | **P0** | Infraestrutura, Axios, TanStack Query, AuthContext, Layouts e PWA Base | ✅ **FEITO** |
| **1** | Autenticação, Recuperação de Senha e Onboarding da Empresa | **P0** | `/login`, `/cadastro`, `/esqueci-minha-senha`, `/redefinir-senha`, `/onboarding/empresa` | ✅ **FEITO** |
| **2** | Vitrine Pública, Motor de Agendamento & Checkout Pix com Polling | **P0** | `/`, `/empresa/:slug`, `/reserva/...`, `/pagamento/pix/...`, `/reserva/confirmada/...` | ✅ **FEITO** |
| **3** | Painel do Dono — Dashboard Analítico, Agenda e Conclusão | **P1** | `/painel`, `/painel/agenda` (Métricas, Escrow Hold, Saques e Conclusão) | ✅ **FEITO** |
| **4** | Painel do Dono — Catálogo, Expediente e Subconta Financeira | **P1** | `/painel/servicos`, `/painel/expediente`, `/painel/financeiro`, `/painel/configuracoes` | ✅ **FEITO** |
| **5** | Portal do Cliente — Meus Agendamentos, Cancelamento e Perfil | **P1** | `/explorar`, `/meus-agendamentos`, `/meus-agendamentos/:id`, `/minha-conta` (Estorno >24h / <=24h) | ✅ **FEITO** |
| **6** | Error Boundaries, Telas 404/500, Toasts Globais e Polimento | **P2** | `/404`, `/500`, `GlobalErrorBoundary`, `Toaster` e `ClientProfilePage` | ✅ **FEITO** |
| **7** | Experiência PWA, Otimizações de Performance e Micro-Interações | **P2** | Add to Home Screen, Lazy Loading, Feedback Háptico e Confetti | ✅ **FEITO** |
