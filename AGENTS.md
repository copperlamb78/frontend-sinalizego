# SinalizeGO — Frontend AI Agent Rules & Architecture Guidelines

> Diretrizes estritas e autossuficientes para qualquer agente de IA trabalhando no repositório frontend do SinalizeGO.
>
> Stack Principal: React 19 · TypeScript 5.x · Vite · Tailwind CSS · Lucide React · React Hook Form + Zod · Playwright.

---

## 1. Protocolo de Escalonamento — Pergunte Primeiro, Nunca Assuma

- **Doubt Gate (Portão da Dúvida):** Qualquer incerteza sobre regras de negócio de agendamento, fluxo de checkout, comportamento visual ou valores monetários: **pare e pergunte no chat.** Nunca adote premissas silenciosas ou "defaults razoáveis".
- **Possible-Error Gate (Portão de Possíveis Erros):** Ao identificar qualquer discrepância — quebra de layout, erro de tipagem, falha de segurança (vazamento de tokens/stack trace), seletores frágeis ou contradição com o backend: reporte no formato padrão com o local, o fato observável e opções numeradas com trade-offs. Nunca aplique o fix sem aprovação explícita.
- **Divergence Gate (Portão de Divergência):** Quando uma instrução solicitar substituição ou remoção de código que já funciona e está correto, mostre o que existe hoje, aponte a diferença concreta e pergunte se a mudança é intencional antes de executar.
- **API Source of Truth Gate (Portão de Verificação Mandatória na API):** Antes de implementar qualquer tela, serviço, hook, tipo (TypeScript) ou schema (Zod), o agente **DEVE obrigatoriamente inspecionar o código-fonte real da API NestJS em `C:\Users\Antonio Gabriel\Desktop\api-sinalizego\src\modules`** (controllers, DTOs, entities e enums). É estritamente proibido supor rotas, inventar campos ou adotar tipos hipotéticos. O backend é a única e soberana fonte da verdade (*Source of Truth*).
- **Visual Mockup Gate (Portão de Aprovação Visual por SVG):** Antes de construir, reconstruir ou codar qualquer tela, página ou componente de fluxo visual, o agente **DEVE obrigatoriamente criar um mockup detalhado em formato SVG** ilustrando como a página/tela ficará (disposição espacial, hierarquia, seções, contrastes e tema). O agente deve apresentar o SVG no chat e **aguardar aprovação explícita do usuário** antes de escrever qualquer código React/Tailwind. É estritamente proibido codar telas sem essa aprovação prévia.
- **Um Commit por Arquivo:** Realize **um commit individual por arquivo** (`git add <arquivo> && git commit -m '...'`), com mensagem semântica em Conventional Commits em português (`feat(ui): ...`, `fix(checkout): ...`, `style(theme): ...`, `test(e2e): ...`). Nunca commitar diretamente na branch `main` sem autorização expressa.

---

## 2. Arquitetura & Estrutura de Pastas — Modular Feature-Driven (Vertical Slice)

A aplicação adota estritamente a **Arquitetura Modular Orientada a Funcionalidades (Vertical Slice)** com núcleo compartilhado (*Shared Core*) e Design System atômico. Toda funcionalidade de negócio vive isolada em seu próprio módulo, com barreira pública de exportação (`index.ts`) e páginas finas (*thin pages*):

```text
src/
├── assets/                 # Imagens, logotipos em SVG, ícones estáticos e manifest
│
├── core/                   # Núcleo da aplicação (Shared / Infrastructure)
│   ├── api/                # Instância configurada do Axios (interceptors de auth, base URL, timeout)
│   ├── config/             # Variáveis de ambiente tipadas e constantes globais
│   ├── formatters/         # Formatadores puros (moeda BRL, datas Intl, máscaras de WhatsApp/CPF)
│   ├── hooks/              # Custom hooks genéricos reutilizáveis (useDebounce, useCountdown, useMediaQuery)
│   └── utils/              # Funções utilitárias (cn para Tailwind, manipulação de strings)
│
├── design-system/          # Design System Atômico (Consumo estrito de tokens do index.css)
│   ├── ui/                 # Componentes atômicos puros e reutilizáveis (com data-testid)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── skeleton.tsx
│   │   └── toast.tsx
│   └── layout/             # Componentes estruturais de casca da aplicação
│       ├── navbar.tsx
│       ├── sidebar.tsx
│       ├── page-header.tsx
│       └── container.tsx
│
├── features/               # Módulos Verticais de Negócio (Auto-contidos com Barreira Pública)
│   ├── auth/               # Autenticação (Login, Cadastro, Recuperação de Senha)
│   │   ├── components/     # Formulários específicos de login/registro
│   │   ├── hooks/          # useAuth, useLoginMutation
│   │   ├── schemas/        # loginSchema, registerSchema (Zod)
│   │   ├── services/       # authService.ts (POST /api/v1/auth/*)
│   │   ├── types/          # AuthUser, LoginDTO, TokenResponse
│   │   └── index.ts        # Ponto de exportação pública da feature
│   │
│   ├── storefront/         # Vitrine Pública (/b/:slug - catálogo, profissionais, horários)
│   │   ├── components/     # ServiceCardList, BarberSelector, SlotPickerGrid
│   │   ├── hooks/          # useStorefront, useAvailableSlots
│   │   ├── services/       # storefrontService.ts
│   │   ├── types/          # StorefrontCompany, ServiceItem, AvailableSlot
│   │   └── index.ts
│   │
│   ├── checkout/           # Checkout Pix com Garantia de Reserva e Contagem Regressiva
│   │   ├── components/     # PixQrCodeCard, PixCountdownTimer, PaymentStatusBadge
│   │   ├── hooks/          # usePixPolling, useCreateAppointment
│   │   ├── services/       # checkoutService.ts
│   │   ├── types/          # PixPaymentDetails, AppointmentStatus
│   │   └── index.ts
│   │
│   └── dashboard/          # Painel do Dono do Estabelecimento
│       ├── appointments/   # Gestão de agendamentos e calendário
│       ├── services/       # Cadastro/edição de serviços (regras de 100%, 50% e 30% Flexível)
│       ├── schedule/       # Configuração de expediente e bloqueios
│       ├── financial/      # Saldo Liberado para Saque, Saldo em Garantia e Saques
│       └── index.ts
│
├── routes/                 # Roteamento e Páginas Finas (React Router v7)
│   ├── components/         # ProtectedRoute, PublicOnlyRoute, RouteErrorBoundary
│   ├── pages/              # Páginas finas que apenas compõem blocos das features
│   │   ├── auth/
│   │   ├── storefront/
│   │   ├── checkout/
│   │   └── dashboard/
│   └── index.tsx           # RouterProvider e mapeamento declarativo das 22 rotas
│
├── App.tsx                 # Provedores Globais (QueryClientProvider, Toaster, RouterProvider)
├── index.css               # Design Tokens do Tailwind CSS 4, CSS variables e keyframes
└── main.tsx                # Ponto de entrada da aplicação
```

### Regras Mandatórias da Arquitetura
1. **Barreira Pública de Exportação (`index.ts`):** Qualquer arquivo fora de uma `feature` só pode importar o que estiver explicitamente exportado no `features/<modulo>/index.ts`. É estritamente proibido fazer deep import (ex: `import { ... } from '@/features/checkout/components/internal-card'`).
2. **Páginas Finas (*Thin Pages*):** Arquivos dentro de `routes/pages/` não contêm lógica de negócio, requisições diretas ou formulários longos; sua função exclusiva é receber parâmetros de rota, compor os blocos do módulo correspondente e aplicar a casca de layout.
3. **Isolamento do Design System:** Componentes em `design-system/ui/` são estritamente agnósticos ao negócio — nunca usam termos como "appointment", "barber" ou "pix". Recebem dados por props primitivas (`variant`, `size`, `isLoading`, etc.).
4. **Uso Mandatório e Exclusivo dos Componentes do Design System:** É estritamente proibido criar botões, inputs, cards, badges, modais, skeletons ou toasts ad-hoc com tags HTML nativas ou classes Tailwind soltas dentro das features ou páginas (`<button className="...">`, `<input ...>`, etc.). Toda a interface DEVE obrigatoriamente consumir e compor os componentes oficiais de `src/design-system/ui/` (`Button`, `Input`, `Badge`, `Card`, `Modal`, `Skeleton`, `Toast`). Botões de ação principal/CTA devem utilizar obrigatoriamente `variant="primary"` (fundo Teal oficial e texto branco puro `text-white`), garantindo uniformidade visual e eliminando botões apagados ou descaracterizados.

---

## 3. Diretrizes de UX Writing & Linguagem Humanizada (Anti-Jargão)

A plataforma atende dois públicos: o **cliente final** (que agenda pelo celular em poucos toques) e o **prestador de serviços** (barbeiro/dono do negócio). A comunicação deve ser empática, clara e livre de tecnicismos:

### Termos Proibidos vs. Termos Obrigatórios

| Jargão Proibido | Termo Obrigatório na Interface |
|---|---|
| *Split de Pagamento / Taxa da Plataforma* | **Taxa de Conveniência** ou **Garantia de Reserva** |
| *Hold de 15 minutos / Expiração de Sessão* | **"Seu horário fica reservado por 15 minutos enquanto você conclui o Pix"** |
| *Escrow / Custódia de Saldo* | **"Seu pagamento fica protegido até a conclusão do atendimento"** |
| *No-Show* | **Não comparecimento** |
| *Down Payment Amount* | **Sinal de Reserva** |
| *Webhook / Polling* | **"Atualizando status do pagamento..."** |
| *Payload / DTO / Token* | Proibido exibir qualquer menção técnica |

### Mensagens de Erro Humanizadas (Tratamento de Exceções HTTP da API)

Nunca exiba mensagens brutas da API ou códigos de status HTTP para o usuário final:
- **HTTP 409 (Conflito de Vaga):** *"Esse horário acabou de ser reservado por outro cliente. Por favor, escolha outro horário disponível na lista."*
- **HTTP 429 (Muitas Requisições):** *"Você realizou muitas tentativas recentemente. Por segurança, aguarde alguns instantes antes de tentar novamente."*
- **HTTP 401 (Sessão Expirada):** *"Sua sessão expirou por segurança. Por favor, acesse sua conta novamente."*
- **HTTP 400 (Dado Inválido):** Exibir mensagem de validação contextual no campo afetado (ex: *"Informe um número de WhatsApp válido"*).
- **HTTP 500 (Erro Interno):** *"Não conseguimos concluir sua solicitação agora. Seus dados estão preservados, tente novamente em alguns instantes."*

---

## 4. Regras de Negócio de Preços e Sinal (Sincronização com API)

O frontend adota o princípio de **Zero Trust Financeiro**:
1. **Valores Derivados do Servidor:** O frontend **nunca** calcula nem envia `servicePrice`, `downPaymentAmount` ou `platformFeeAmount` no corpo de criação do agendamento (`POST /api/v1/appointments`). Esses valores são calculados exclusivamente no backend.
2. **Checkout do Cliente:**
   - Não existe seleção manual de percentual (eliminados botões de 25%, 50%, 100%).
   - Exibição transparente: `Sinal via Pix` + `Taxa de Conveniência` = `Total a pagar agora`.
   - Exibição de suporte: *"Valor restante a pagar diretamente na cadeira: R$ XX,XX"*.
   - Botão de Ação: *"Garantir Cadeira às HH:MM (R$ XX,XX via Pix)"*.
3. **Cadastro e Edição de Serviços (Painel do Dono):**
   - Preço < R$ 15,00: Sinal de 100% automático.
   - Preço de R$ 15,00 a R$ 399,99: Sinal de 50% automático.
   - Preço >= R$ 400,00: Exibir card com badge "FLEXÍVEL" permitindo escolher entre 50% (Padrão) e 30% (Flexível).
4. **Contador Regressivo do Pix (15 minutos):**
   - Contagem regressiva em tempo real com indicador visual de urgência (`MM:SS`).
   - Botão "Copiar código Pix" com cópia automática para a área de transferência e feedback visual imediato.
   - Polling a cada 4 segundos consultando a confirmação do agendamento até a mudança para `CONFIRMED`.

---

## 5. Design System & Padrões Visuais (Estética Robusta & Chapada)

- **Diretriz de Design — Anti-IA & Estética Sólida/Chapada:**
  - **Identidade:** Visual robusto, tátil e de corte mecânico/analógico. Eliminação de gradientes genéricos de IA, cantos circulares gelatinosos (`rounded-2xl`, `rounded-3xl`) e desfoques artificiais (`blur`/`glow`).
  - **Geometria:** Cantos secos e micro-arredondados (`rounded-sm` / 2px-3px para botões/inputs; `rounded-md` / 4px-6px para cards e painéis).
  - **Bordas:** Bordas sólidas e bem definidas de 1.5px a 2px com alto contraste estrutural.
  - **Sombras Táteis (Hard Shadows):** Efeito mecânico de clique e profundidade seca sem blur difuso (`shadow-[2px_2px_0px_0px_...]` em repouso e transição para o estado afundado/active ao clique).
  - **Fonte Única:** **Plus Jakarta Sans** para 100% da aplicação (títulos, botões, formulários e números tabulares), garantindo coesão visual máxima e alta legibilidade em smartphones.
- **Tema Dark Mode Institucional (Paleta Original Teal & Slate):**
  - Background Base: `#0B1120` (`bg-slate-950`).
  - Cards e Superfícies: `#0F172A` (`bg-slate-900`) com bordas nítidas `#1E293B` / `#334155`.
  - Cor de Destaque / CTA Primário: `teal-500` (`#14B8A6`) e hover `teal-400` / `#0D9488`.
  - Contrastes de Texto: `text-white` / `#F8FAFC` (títulos e ações), `text-slate-300` (corpo), `text-slate-400` (legendas).
- **Tema Light Mode Institucional:**
  - Background: `#E8E8E8`, Superfície: `#FFFFFF`, Bordas: `#CBD5E1` / `#0F172B`.
  - CTA Primário: `teal-700` (`#0F766E`).
- **Ícones e Emojis:**
  - Uso mandatório de `lucide-react`.
  - Proibido hardcode de emojis em tags JSX de produção (utilizar ícones Lucide).
- **Links Externos:** Todo link externo com `target="_blank"` deve conter obrigatoriamente `rel="noopener noreferrer"`.
- **Prevenção de Vazamentos:** Nunca imprimir `error.stack`, stack traces ou schemas internos em páginas de erro de produção (`import.meta.env.PROD`).

---

## 6. Testes E2E com Playwright

- Toda página e fluxo crítico deve ser coberto por testes com Playwright.
- Uso mandatório de `data-testid` em botões, formulários, cards e elementos interativos.
- Estruturação baseada em **Page Object Model (POM)**.
- Consulta detalhada em `.agents/skills/playwright-e2e-testing/SKILL.md`.
