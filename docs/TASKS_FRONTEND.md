# 📋 Planejamento de Tarefas Frontend — SinalizeGO (P0, P1, P2)

**Versão**: 1.1.0  
**Data**: 23 de Agosto de 2026  
**Status**: Em Execução (Fase P0)  
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
│ • [ ] Task 2: Book │ • [ ] Task 5: Portal Cliente   │                   │
└───────────────────┴────────────────────────────────┴───────────────────┘
```

---

## 🗺️ Matriz de Rotas & Telas da Aplicação

| Rota | Layout Mestre | Componente Principal | Controle de Acesso (RBAC) | Status |
|---|---|---|---|:---:|
| `/` | `PublicLayout` | `HomePage` | Público | ✅ Concluído (Task 0/1) |
| `/empresa/:slug` | `PublicLayout` | `HomePage` (Vitrine) | Público | 🟡 Planejado (Task 2) |
| `/reserva/:companyId/:serviceId` | `PublicLayout` | `CheckoutPage` | Público | 🟡 Planejado (Task 2) |
| `/pagamento/pix/:appointmentId` | `PublicLayout` | `PixPaymentPage` | Público | 🟡 Planejado (Task 2) |
| `/reserva/confirmada/:appointmentId` | `PublicLayout` | `BookingSuccessPage` | Público | 🟡 Planejado (Task 2) |
| `/login` | `AuthLayout` | `LoginPage` | Público / Guest | ✅ Concluído (Task 1) |
| `/cadastro` | `AuthLayout` | `RegisterPage` | Público / Guest | ✅ Concluído (Task 1) |
| `/esqueci-minha-senha` | `AuthLayout` | `ForgotPasswordPage` | Público / Guest | ✅ Concluído (Task 1) |
| `/redefinir-senha` | `AuthLayout` | `ResetPasswordPage` | Público / Guest | ✅ Concluído (Task 1) |
| `/onboarding/empresa` | `AuthLayout` | `CompanyOnboardingPage` | Autenticado (`CLIENT`, `COMPANY_OWNER`) | ✅ Concluído (Task 1) |
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
│   └── utils.ts                        # Utilitário cn() e formatadores
├── pages/
│   ├── admin/
│   │   ├── AdminCompaniesPage.tsx      # Gestão e auditoria de estabelecimentos
│   │   ├── AdminDashboardPage.tsx      # Platform intelligence e saúde de microsserviços
│   │   └── AdminUsersPage.tsx          # Moderação centralizada de usuários
│   ├── auth/
│   │   ├── CompanyOnboardingPage.tsx   # Wizard 2 etapas de criação de empresa e promoção de role
│   │   ├── ForgotPasswordPage.tsx      # Solicitação de redefinição de senha
│   │   ├── LoginPage.tsx               # Formulário de login com Zod e auto-redirect
│   │   ├── RegisterPage.tsx            # Cadastro com seletor de perfil e termos
│   │   └── ResetPasswordPage.tsx       # Redefinição stateless de senha por token
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
│       └── NotFoundPage.tsx            # Página 404 customizada
├── routes/
│   └── index.tsx                       # Definição das 22 rotas da aplicação
├── types/
│   ├── api.types.ts                    # Tipagens de resposta e paginação da API
│   └── auth.types.ts                   # Role enum, User, AuthTokens e DTOs
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

#### Entregáveis Técnicos:
1. **Setup Inicial do Repositório**:
   - [x] Inicialização com Vite 6 + React 19 + TypeScript + Tailwind CSS v4.
   - [x] Configuração de `vite.config.ts`, `tsconfig.json` e `vite-plugin-pwa`.
2. **Design System & Primitivos UI**:
   - [x] Variáveis de cor Dark Mode em `src/index.css` (`#0B1120`, `#0F172A`, `#1E293B`, `#14B8A6`, `#EF4444`, `#F8FAFC`, `#94A3B8`, `#334155`).
   - [x] Primitivos UI atômicos: `Button`, `Input`, `Card`, `Badge`, `Modal/Dialog`, `Skeleton`, `Toaster` (Sonner), `Logo`.
3. **Camada HTTP, Cache & Autenticação**:
   - [x] Instância do Axios (`src/config/api.config.ts`) com injeção automática de `Bearer Token` e interceptor para renovação via `POST /auth/refresh` no erro 401 com fila de requisições.
   - [x] Configuração global do TanStack Query (`src/config/query-client.ts`).
   - [x] `AuthContext` com login, logout, recuperação de sessão e guarda de rotas (`ProtectedRoute`) com validação de RBAC (`Role.CLIENT`, `Role.COMPANY_OWNER`, `Role.ADMIN`, `Role.SUPER_ADMIN`).
4. **Layouts Estruturais**:
   - [x] `RootLayout`: Provedores globais, Toaster e update prompt do PWA.
   - [x] `PublicLayout`: Header institucional com logo SVG e footer.
   - [x] `AuthLayout`: Card centralizado em tela cheia Dark Mode.
   - [x] `ClientLayout`: Barra de navegação inferior mobile (BottomNav PWA).
   - [x] `OwnerLayout`: Sidebar retrátil para desktop + gaveta mobile.
   - [x] `AdminLayout`: Header administrativo com badge de ambiente executivo.

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

#### Entregáveis Técnicos:
1. **`LoginPage`**:
   - [x] Formulário com React Hook Form + Zod, alternância de visibilidade de senha e feedback semântico de erro (401, 404, 429).
2. **`RegisterPage`**:
   - [x] Seletor de perfil no topo ("Quero agendar horários" vs "Tenho uma barbearia/estúdio").
   - [x] Validação de formato de e-mail, máscara de telefone WhatsApp e senha forte.
   - [x] Checkbox obrigatório de aceitação dos Termos de Uso e Política de Privacidade.
3. **`ForgotPasswordPage` & `ResetPasswordPage`**:
   - [x] Solicitação de e-mail com resposta de segurança genérica.
   - [x] Formulário de redefinição consumindo token stateless da URL (`?token=...`).
4. **`CompanyOnboardingPage`**:
   - [x] Wizard guiado em 2 etapas com barra de progresso verde no topo (Etapa 1: Categoria + Nome com slug automático; Etapa 2: Endereço completo com UF e Cidade + botão Voltar).
   - [x] Ao concluir (`POST /company/create`), captura o novo par de tokens (`access_token`, `refresh_token`), atualiza o `AuthContext` para `COMPANY_OWNER` e redireciona direto para `/painel`.

---

### 💳 Task 2: Vitrine Pública, Motor de Agendamento & Checkout Pix com Polling
- **Prioridade**: P0
- **Status**: [ ] Pendente
- **Complexidade**: Alta
- **Rotas**: `/`, `/empresa/:slug`, `/reserva/:companyId/:serviceId`, `/pagamento/pix/:appointmentId`, `/reserva/confirmada/:appointmentId`
- **Endpoints Integrados**:
  - `GET /company/slug/:slug`
  - `GET /appointments/available-slots` (Rate limit: 120 req/60s)
  - `POST /appointments/create`
  - `POST /transactions/pix/:appointmentId` (Rate limit: 10 req/60s)
  - `GET /appointments/:id`

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
| **2** | Vitrine Pública, Motor de Agendamento & Checkout Pix com Polling | **P0** | `/`, `/empresa/:slug`, `/reserva/...`, `/pagamento/pix/...`, `/reserva/confirmada/...` | 🟡 Pendente |
| **3** | Painel do Dono — Dashboard Analítico, Agenda e Conclusão | **P1** | `/painel`, `/painel/agenda` (Métricas, Conclusão de atendimentos) | 🟡 Pendente |
| **4** | Painel do Dono — Catálogo, Expediente e Subconta Financeira | **P1** | `/painel/servicos`, `/painel/expediente`, `/painel/financeiro`, `/painel/configuracoes` | 🟡 Pendente |
| **5** | Portal do Cliente — Meus Agendamentos, Cancelamento e Perfil | **P1** | `/meus-agendamentos`, `/meus-agendamentos/:id`, `/minha-conta` (Estorno >24h) | 🟡 Pendente |
| **6** | Super Admin — Platform Intelligence e Moderação Global | **P2** | `/admin`, `/admin/empresas`, `/admin/empresas/:id`, `/admin/usuarios` | 🟡 Pendente |
| **7** | Experiência PWA, Otimizações de Performance e Micro-Interações | **P2** | Add to Home Screen, Lazy Loading, Feedback Háptico e Confetti | 🟡 Pendente |
