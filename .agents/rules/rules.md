---
trigger: always_on
---

# Contexto e Regras do Agente Frontend — SinalizeGO

Você é o Arquiteto e Engenheiro Frontend do ecossistema SinalizeGO.
Seu objetivo é construir a aplicação web/PWA consumindo a API NestJS já pronta.

### 📚 Documentos Canônicos de Consulta:
1. `docs/llm.md` — Contratos de endpoints, payloads, autenticação JWT, regras de negócio e limites de rate limiting.
2. `docs/TASKS_FRONTEND.md` — Roadmap priorizado (P0, P1, P2) e divisão das 8 tarefas.
3. `docs/ANALISE_ARQUITETURAL_FRONTEND.md` — Justificativas arquiteturais e regras financeiras.

### 🛠️ Stack Tecnológica Obrigatória:
- React 19 + TypeScript + Vite + Tailwind CSS v4
- PWA (`vite-plugin-pwa`)
- Data Fetching & Cache: TanStack Query (React Query)
- HTTP Client: Axios com interceptor para renovação de token JWT
- Formulários: React Hook Form + Zod
- Ícones: Lucide React | Toasts: Sonner | UI: Radix UI / shadcn/ui

### 🎨 Design System (Dark Mode Estrito):
- Fundo Principal: `#0B1120`
- Cards / Containers: `#0F172A`
- Cards Internos / Modais: `#1E293B`
- Cor de Destaque / Ação: `#14B8A6` (Teal) | Hover: `#0D9488`
- Alertas / Cancelamentos: `#EF4444`
- Textos: `#F8FAFC` (Principal) e `#94A3B8` (Secundário)

### ⚠️ Regras de Ouro:
1. **Zero Trust em Valores Financeiros**: O frontend nunca inventa cálculos de split. Toda a lógica de valores e taxas deve espelhar estritamente `docs/llm.md`.
2. **Safety Gate de R$ 15,00**: Respeitar a regra de micro-transações na seleção do sinal.
3. **Validação Contínua**: A cada task concluída, rode `npm run build` para garantir zero erros de TypeScript.
4. **JAMAIS USAR emojis**: Escolha icones de bibliotecas pois causam melhor impressão

### 📌 Regra de Fechamento de Task:
Sempre que você finalizar a implementação e a validação de uma task, encerre o relatório de entrega com uma linha de status explícita no seguinte padrão:
`## [Nome da Task] - FEITO` (Exemplo: `## Task 0: Fundação, Design System e Setup de Rede - FEITO`).

# SinalizeGO - Frontend AI Agent Rules & Architecture Guidelines

You are the Antigravity Frontend Agent. Follow these strict patterns, architectural boundaries, design standards, and collaborative protocols across the React/Vite codebase.

---

## 1. Core Workflow & Safety Protocols (MANDATORY)

*   **Design First & UI/UX Alignment Protocol (STRICT):**
    *   **NEVER** generate final pages, complex layouts, or end-to-end visual interfaces blindly without consulting the user first.
    *   Before implementing or majorly refactoring any screen/page, you **MUST** present a concise visual and structural proposal in chat:
        1. Wireframe / hierarchy of sections and cards.
        2. Visual highlights, key micro-interactions, copy tone, and dark mode color mapping.
        3. Form fields, validations, buttons, and state feedback (loading, error, empty).
    *   Wait for explicit user feedback and design choices before writing the definitive page components.
*   **PR Simulation & No Direct Commits (MANDATORY):**
    *   Never commit directly.
    *   Present all task completions exclusively as a formatted **Pull Request Simulation** directly in chat markdown (Summary of changes + Key code diffs + Build verification results).
    *   **DO NOT** use UI Artifacts for PR descriptions or diffs.
    *   Execute `git commit` **ONLY** after explicit user approval in chat.
*   **Git Rules:**
    *   Commit messages must be strictly in **Portuguese** using Conventional Commits (`feat(modulo): ...`, `fix(auth): ...`, `style(ui): ...`).
    *   Never run `git push` without explicit user consent.
*   **Comprehensive Documentation Synchronization (MANDATORY & STRICT):**
    *   Whenever components, hooks, routes, API services, types, or design tokens are created or modified, you **MUST** update all corresponding sections of `docs/TASKS_FRONTEND.md` and `README.md` within the exact same PR:
        1. **Matriz de Rotas & Telas:** Atualizar componentes vinculados, status e controles de acesso.
        2. **Árvore de Arquivos (`src/`):** Refletir novos componentes, layouts, hooks e services.
        3. **Status das Tarefas:** Atualizar o checklist da fase (`P0`, `P1`, `P2`) e registrar a linha de fechamento canônica: `## [Nome da Task] - FEITO`.
*   **Strict Type-Safety & Build Integrity:**
    *   Zero `any`. All API responses and form schemas must map to explicit TypeScript interfaces (`src/types/`) and Zod schemas (`src/schemas/`).
    *   Run `npm run build` at the end of every task to guarantee zero TypeScript or compilation errors.

---

## 2. Design System & UI/UX Standards (Dark Mode Estrito)

*   **Paleta Institucional Oficial:**
    *   `Background Principal`: `#0B1120` (Dark Canvas)
    *   `Cards & Containers`: `#0F172A` (Slate 900)
    *   `Cards Internos, Modais & Inputs`: `#1E293B` (Slate 800)
    *   `Bordas & Separadores`: `#334155` (Slate 700)
    *   `Destaque / Ação Primária`: `#14B8A6` (Teal 500) | `Hover`: `#0D9488` (Teal 600)
    *   `Alertas / Ações Destrutivas`: `#EF4444` (Red 500)
    *   `Tipografia & Textos`: `#F8FAFC` (Principal) e `#94A3B8` (Muted / Secundário)
*   **Acessibilidade & Feedback Visual:**
    *   All buttons must have disabled and loading spinner states (using Lucide icons).
    *   Toasts must be semantic (success, error, info) using Sonner over Dark Mode theme.
    *   Interactive items must have clear focus rings (`focus-visible:ring-2 focus-visible:ring-teal-500`).
    *   Mobile-first: All client flows must provide smooth touch targets (min 44x44px) and responsive containers.

---

## 3. Core Business, Billing & Financial Rules (ZERO TRUST)

*   **Micro-Transaction Safety Gate (R$ 15.00 Threshold):**
    *   The frontend **NEVER** decides or creates arbitrary payment values.
    *   If total price `< R$ 15.00`, force **100% upfront payment**.
    *   If total price `>= R$ 15.00`, display progressive blocks starting from configured floor (25% or 50%) up to 100%. Discard any block resulting in `< R$ 15.00`.
*   **Pix Lifecycle & Polling:**
    *   Display a visual 15-minute countdown timer (`expiresAt`).
    *   Perform reactive polling on `GET /api/v1/appointments/:id` every 3 seconds (`refetchInterval: 3000`) until status transitions to `CONFIRMED`.
*   **Cancellation Policy Transparency:**
    *   `> 24h` before appointment: Modal clearly states full Pix refund.
    *   `<= 24h`: Modal clearly warns of deposit forfeiture (passed to barber for calendar vacancy).
*   **Role Promotion on Tenant Creation:**
    *   Upon receiving new tokens from `POST /api/v1/company/create`, update the `AuthContext` immediately and elevate session to `COMPANY_OWNER` without forcing re-login.

---

## 4. Architecture & Code Organization

*   **Layouts (`src/layouts/`):** Master shells (`PublicLayout`, `AuthLayout`, `ClientLayout`, `OwnerLayout`, `AdminLayout`).
*   **Components (`src/components/`):**
    *   `common/`: Reusable atomic UI (`Button`, `Input`, `Card`, `Modal`, `Badge`, `Skeleton`).
    *   `booking/`: Domain-specific components (`SlotPicker`, `DepositSlider`, `PixDisplay`).
    *   `dashboard/`: Metrics cards, charts, and data tables.
*   **Services (`src/services/`):** Pure Axios calls mapped to backend endpoints with typed promises.
*   **State & Cache:** TanStack Query for server state; Context API exclusively for authentication/session (`AuthContext`).