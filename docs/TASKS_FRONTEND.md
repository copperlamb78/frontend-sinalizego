# 📋 Planejamento de Tarefas Frontend — SinalizeGO (P0, P1, P2)

**Versão**: 1.2.0  
**Data**: 23 de Agosto de 2026  
**Status**: Em Execução (Fase P0 Concluída)  
**Classificação**: P0 (Crítico/Core), P1 (Operacional/Gestão), P2 (Governança/Polimento)

---

## 📊 Visão Geral das Fases

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROADMAP DE DESENVOLVIMENTO                       │
├───────────────────┬────────────────────────────────┬───────────────────┤
│    FASE P0 (Core) │       FASE P1 (Operação)       │ FASE P2 (Escala)  │
├───────────────────┼────────────────────────────────┼───────────────────┤
│ • [X] Task 0: Setup│ • [ ] Task 3: Dashboard & Agenda│ • [ ] Task 6: Admin │
│ • [X] Task 1: Auth │ • [ ] Task 4: Serviços/Expediente│ • [ ] Task 7: PWA │
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
| `/painel` | `OwnerLayout` | `OwnerDashboardPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 0/3) |
| `/painel/agenda` | `OwnerLayout` | `OwnerCalendarPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 0/3) |
| `/painel/servicos` | `OwnerLayout` | `OwnerServicesPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 0/4) |
| `/painel/expediente` | `OwnerLayout` | `OwnerWorkingHoursPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 0/4) |
| `/painel/financeiro` | `OwnerLayout` | `OwnerFinancialPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 0/4) |
| `/painel/configuracoes` | `OwnerLayout` | `OwnerSettingsPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 0/4) |
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
│   └── common/
│       ├── Badge.tsx                   # Primitivo de status com variações e pulsos
│       ├── Button.tsx                  # Botão institucional com loading e ícones
│       ├── Card.tsx                    # Containers com estilo dark #0F172A
│       ├── Input.tsx                   # Input estilizado com validação e ícones
│       ├── Logo.tsx                    # Logotipo oficial Cloudinary + fallback Calendar
│       ├── Modal.tsx                   # Dialog com backdrop blur e acessibilidade
│       ├── Skeleton.tsx                # Placeholders animados de carregamento
│       └── Toaster.tsx                 # Toaster Sonner dark mode
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
│   │   └── ClientProfilePage.tsx       # Gestão de perfil e CPF para split Pix
│   ├── owner/
│   │   ├── OwnerCalendarPage.tsx       # Grade operacional e conclusão atômica
│   │   ├── OwnerDashboardPage.tsx      # Métricas de faturamento, sinais e fila do dia
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
│   ├── appointments.service.ts         # Slots livres, criação de reserva e consulta por ID
│   ├── cep.service.ts                  # Consulta de CEP via BrasilAPI v2 com autopreenchimento
│   ├── company.service.ts              # Vitrine pública por slug e listagem de empresas
│   └── transactions.service.ts         # Geração de Pix e transações financeiras Asaas
├── types/
│   ├── api.types.ts                    # Tipagens de resposta e paginação da API
│   ├── appointment.types.ts            # DTOs de agendamento, status e available slots
│   ├── auth.types.ts                   # Role enum, User, AuthTokens e DTOs
│   ├── company.types.ts                # Storefront, WorkingHours, ServiceGroup e Services
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
  - `POST /auth/login` (Rate limit: 15 req/60s)
  - `POST /users/create` (Rate limit: 15 req/60s)
  - `POST /auth/forgot-password` (Rate limit: 5 req/60s)
  - `POST /auth/reset-password`
  - `POST /company/create`

---

### 💳 Task 2: Vitrine Pública, Motor de Agendamento & Checkout Pix com Polling
- **Prioridade**: P0
- **Status**: [X] Concluído
- **Complexidade**: Alta
- **Rotas**: `/empresa/:slug`, `/reserva/:companyId/:serviceId`, `/pagamento/pix/:appointmentId`, `/reserva/confirmada/:appointmentId`
- **Endpoints Integrados**:
  - `GET /company/slug/:slug` (Vitrine pública consolidada)
  - `GET /appointments/available-slots` (Consulta reativa de vagas por data)
  - `POST /appointments` (Criação de reserva com status PENDING_PAYMENT)
  - `POST /transactions/pix/:appointmentId` (Geração de QR Code e Copia e Cola Pix)
  - `GET /appointments/:id` (Polling a cada 3s com transição automática para CONFIRMED)

#### Entregáveis Técnicos:
1. **`StorefrontPage` (`/empresa/:slug`)**:
   - [x] Hero com banner, logo, endereço formatado, link para Google Maps e botão para WhatsApp.
   - [x] Gaveta expansível com grade semanal de horários de funcionamento e indicador "Aberto Hoje".
   - [x] Catálogo categorizado por `ServiceGroup` com busca rápida, duração e botão de agendamento.
2. **`CheckoutPage` (`/reserva/:companyId/:serviceId`)**:
   - [x] Seletor horizontal de datas com cálculo dinâmico de dias fechados/abertos.
   - [x] Grade de horários livres alimentada por `appointmentsService.getAvailableSlots`.
   - [x] Micro-Transaction Safety Gate de R$ 15,00: Força 100% para valores < R$ 15,00 e descarta frações que resultem em valor menor que R$ 15,00.
   - [x] Resumo financeiro transparente com sinal Pix e saldo a pagar no balcão.
3. **`PixPaymentPage` (`/pagamento/pix/:appointmentId`)**:
   - [x] Geração automática de QR Code Pix e chave Copia e Cola via `transactionsService.generatePix`.
   - [x] Cronômetro regressivo visual de 15 minutos (`expirationDate`).
   - [x] Polling reativo a cada 3 segundos (`GET /appointments/:id`) com redirecionamento automático ao confirmar.
4. **`BookingSuccessPage` (`/reserva/confirmada/:appointmentId`)**:
   - [x] Voucher digital elegante com dados do serviço, horário e endereço.
   - [x] Download instantâneo de arquivo de calendário `.ics` (`src/lib/calendar.ts`).
   - [x] Botões de rota Google Maps e contato via WhatsApp.

---

## 🟡 FASE P1 — Gestão do Estabelecimento & Portal do Cliente

### 💈 Task 3: Painel do Dono — Dashboard Analítico, Agenda e Conclusão de Atendimento
- **Prioridade**: P1
- **Status**: [ ] Pendente
- **Complexidade**: Média-Alta
- **Rotas**: `/painel`, `/painel/agenda`

---

### ⚙️ Task 4: Painel do Dono — Catálogo de Serviços, Expediente e Subconta Financeira
- **Prioridade**: P1
- **Status**: [ ] Pendente
- **Complexidade**: Média
- **Rotas**: `/painel/servicos`, `/painel/expediente`, `/painel/financeiro`, `/painel/configuracoes`

---

### 👤 Task 5: Portal do Cliente — Meus Agendamentos, Cancelamento Transparente & Perfil
- **Prioridade**: P1
- **Status**: [ ] Pendente
- **Complexidade**: Média
- **Rotas**: `/meus-agendamentos`, `/meus-agendamentos/:id`, `/minha-conta`

---

## 🟢 FASE P2 — Inteligência Global Super Admin & Polimento PWA

### 🛡️ Task 6: Módulo Super Admin — Platform Intelligence, Moderação e Auditoria Global
- **Prioridade**: P2
- **Status**: [ ] Pendente
- **Complexidade**: Média-Alta
- **Rotas**: `/admin`, `/admin/empresas`, `/admin/empresas/:id`, `/admin/usuarios`

---

### ✨ Task 7: Experiência PWA, Otimizações de Performance & Feedback Tátil
- **Prioridade**: P2
- **Status**: [ ] Pendente
- **Complexidade**: Média
- **Objetivo**: Polimento de usabilidade e transformação da aplicação em um PWA instalável de alta fidelidade.

---

## 📋 Matriz de Resumo das Tarefas

| Task | Título | Fase | Telas / Escopo | Status |
|:---:|---|:---:|---|:---:|
| **0** | Fundação, Design System Dark Mode e Camada HTTP/Auth | **P0** | Infraestrutura, Axios, TanStack Query, AuthContext, Layouts e PWA Base | ✅ **FEITO** |
| **1** | Autenticação, Recuperação de Senha e Onboarding da Empresa | **P0** | `/login`, `/cadastro`, `/esqueci-minha-senha`, `/redefinir-senha`, `/onboarding/empresa` | ✅ **FEITO** |
| **2** | Vitrine Pública, Motor de Agendamento & Checkout Pix com Polling | **P0** | `/`, `/empresa/:slug`, `/reserva/...`, `/pagamento/pix/...`, `/reserva/confirmada/...` | ✅ **FEITO** |
| **3** | Painel do Dono — Dashboard Analítico, Agenda e Conclusão | **P1** | `/painel`, `/painel/agenda` (Métricas, Conclusão de atendimentos) | 🟡 Pendente |
| **4** | Painel do Dono — Catálogo, Expediente e Subconta Financeira | **P1** | `/painel/servicos`, `/painel/expediente`, `/painel/financeiro`, `/painel/configuracoes` | 🟡 Pendente |
| **5** | Portal do Cliente — Meus Agendamentos, Cancelamento e Perfil | **P1** | `/meus-agendamentos`, `/meus-agendamentos/:id`, `/minha-conta` (Estorno >24h) | 🟡 Pendente |
| **6** | Super Admin — Platform Intelligence e Moderação Global | **P2** | `/admin`, `/admin/empresas`, `/admin/empresas/:id`, `/admin/usuarios` | 🟡 Pendente |
| **7** | Experiência PWA, Otimizações de Performance e Micro-Interações | **P2** | Add to Home Screen, Lazy Loading, Feedback Háptico e Confetti | 🟡 Pendente |
