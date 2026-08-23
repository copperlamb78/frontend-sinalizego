# ✂️ SinalizeGO — Frontend Web & PWA

> **Plataforma SaaS de Agendamento Online com Sinal Pix e Split Bancário Automatizado para Barbearias e Estúdios.**

---

## 🛠️ Stack Tecnológica

- **Framework & Runtime**: React 19, TypeScript 5.7+, Vite 6
- **Estilização**: Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React, `clsx`, `tailwind-merge`
- **PWA**: `vite-plugin-pwa` (Service Worker com autoUpdate e manifesto para instalação mobile/desktop)
- **Data Fetching & Cache**: TanStack Query (React Query v5)
- **Cliente HTTP**: Axios com interceptor de renovação de JWT no erro 401 (`POST /auth/refresh`)
- **Roteamento**: React Router DOM v7
- **Formulários & Schemas**: React Hook Form + Zod
- **Notificações & Toasts**: Sonner (Dark Mode)

---

## 🎨 Design System Institucional (Dark Mode Estrito)

| Token Visual | Código HEX | Finalidade na Interface |
|---|:---:|---|
| **Background Principal** | `#0B1120` | Fundo principal da aplicação (Dark Canvas) |
| **Cards & Containers** | `#0F172A` | Containers mestres, cards de conteúdo e layouts |
| **Cards Internos & Inputs** | `#1E293B` | Inputs de formulários, modais e sub-cards |
| **Destaque / Ação Primária** | `#14B8A6` | Botões de ação (Teal 500) — Hover: `#0D9488` |
| **Alertas & Cancelamentos** | `#EF4444` | Status cancelados, alertas e botões destrutivos |
| **Texto Principal** | `#F8FAFC` | Títulos e valores em destaque |
| **Texto Secundário** | `#94A3B8` | Labels, legendas e textos auxiliares |
| **Bordas & Divisores** | `#334155` | Separadores de seção e bordas sutis |

---

## 🗺️ Matriz de Rotas & Telas

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
| `/meus-agendamentos` | `ClientLayout` | `ClientAppointmentsPage` | `CLIENT`, `COMPANY_OWNER`, `EMPLOYEE`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído |
| `/meus-agendamentos/:id` | `ClientLayout` | `ClientAppointmentsPage` | `CLIENT`, `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído |
| `/minha-conta` | `ClientLayout` | `ClientProfilePage` | Todos autenticados | ✅ Concluído |
| `/painel` | `OwnerLayout` | `OwnerDashboardPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 3) |
| `/painel/agenda` | `OwnerLayout` | `OwnerCalendarPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído (Task 3) |
| `/painel/servicos` | `OwnerLayout` | `OwnerServicesPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído |
| `/painel/expediente` | `OwnerLayout` | `OwnerWorkingHoursPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído |
| `/painel/financeiro` | `OwnerLayout` | `OwnerFinancialPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído |
| `/painel/configuracoes` | `OwnerLayout` | `OwnerSettingsPage` | `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | ✅ Concluído |
| `/admin` | `AdminLayout` | `AdminDashboardPage` | `ADMIN`, `SUPER_ADMIN` | ✅ Concluído |
| `/admin/empresas` | `AdminLayout` | `AdminCompaniesPage` | `ADMIN`, `SUPER_ADMIN` | ✅ Concluído |
| `/admin/usuarios` | `AdminLayout` | `AdminUsersPage` | `ADMIN`, `SUPER_ADMIN` | ✅ Concluído |
| `*` | `RootLayout` | `NotFoundPage` | Público | ✅ Concluído |

---

## 🌳 Estrutura de Arquivos (`src/`)

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
│   └── utils.ts                        # Utilitário cn() e formatadores
├── mocks/
│   ├── owner.mock.ts                   # Mocks de métricas, saldo em custódia e histórico de saques
│   └── storefront.mock.ts              # Mock completo da vitrine Barbearia Vintage Club
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
│   ├── appointments.service.ts         # Slots livres, criação de reserva, consulta e conclusão de atendimento
│   ├── cep.service.ts                  # Consulta de CEP via BrasilAPI v2 com autopreenchimento
│   ├── company.service.ts              # Vitrine, métricas do painel, saldo, saques e histórico
│   └── transactions.service.ts         # Geração de Pix e transações financeiras Asaas
├── types/
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

## ⚡ Como Rodar o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Executar o servidor de desenvolvimento
npm run dev

# 3. Validar compilação TypeScript e build de produção
npm run build
```

---

## 📊 Status do Roadmap

- [x] **Task 0**: Fundação, Design System e Setup de Rede — **FEITO**
- [x] **Task 1**: Autenticação, Recuperação de Senha e Onboarding da Empresa — **FEITO**
- [x] **Task 2**: Vitrine Pública, Motor de Agendamento & Checkout Pix com Polling — **FEITO**
- [x] **Task 3**: Painel do Dono — Dashboard Analítico, Agenda e Conclusão — **FEITO**
- [ ] **Task 4**: Painel do Dono — Catálogo, Expediente e Subconta Financeira
- [ ] **Task 5**: Portal do Cliente — Meus Agendamentos, Cancelamento e Perfil
- [ ] **Task 6**: Super Admin — Platform Intelligence e Moderação Global
- [ ] **Task 7**: Experiência PWA, Otimizações de Performance e Micro-Interações
