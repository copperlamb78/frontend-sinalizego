---
trigger: always_on
---

# SinalizeGO — Frontend Agent Rules (Router)

Você é o Agente de IA para a aplicação cliente do SinalizeGO (React 19, Vite, TypeScript 5, Tailwind CSS, Lucide React, React Hook Form + Zod).

## §0 — REGRA DE ROTEAMENTO DE CONTEXTO
Antes de iniciar ou editar qualquer componente, tela, hook ou teste, consulte:
- `docs/PLANO_IMPLEMENTACAO_FEATURES.md`: Plano de execução dividido em tarefas atômicas das 4 opções de features.
- `docs/FRONTEND_GUIDELINES.md`: Guia de UX Writing, copywriting amigável, acessibilidade e Design System.
- `docs/api-contract.md`: Contrato de endpoints, DTOs e retornos da API NestJS.
- `.agents/skills/playwright-e2e-testing/SKILL.md`: Criação e execução de testes E2E com Playwright.
- `AGENTS.md`: Protocolo de escalonamento, stack e governança de commits.

## §1 — ESCALATION PROTOCOL (PERGUNTE PRIMEIRO, NUNCA ASSUMA)
- **API Source of Truth Gate (Portão de Verificação Mandatória na API):** Antes de implementar qualquer tela, serviço, hook, tipo (TypeScript) ou schema (Zod), o agente **DEVE OBRIGATORIAMENTE verificar o código real da API NestJS em `C:\Users\Antonio Gabriel\Desktop\api-sinalizego\src\modules`** (controllers, DTOs, entities e enums). É estritamente proibido inventar rotas, presumir campos ou criar tipos hipotéticos sem inspecionar a API primeiro.
- **Dúvidas de Regra/Escopo:** Qualquer dúvida sobre fluxo, layout, cálculo ou comportamento: pare e pergunte no chat. Nunca adote defaults arbitrários.
- **Possível Erro:** Se encontrar bug, inconsistência visual, falha de segurança ou contradição, reporte com título, onde está, impacto e opções numeradas com trade-offs. Nunca aplique sem aprovação.
- **Divergência:** Se o pedido substituir código funcional e tecnicamente correto, aponte a existência antes de alterar.
- **Mockup SVG Obrigatório & Aprovação Prévia (Visual Gate):** Antes de construir ou reestruturar qualquer tela, página ou componente de fluxo visual, o agente **DEVE OBRIGATORIAMENTE gerar um mockup detalhado em SVG** ilustrando como a página ficará visualmente (layout, hierarquia de blocos, espaçamentos, contrastes e tema). O agente deve apresentar o SVG no chat e **aguardar aprovação explícita do usuário** antes de criar ou codar qualquer arquivo de componente/página. É estritamente proibido pular para o código sem essa aprovação.
- **Commits:** Um commit semântico por arquivo (`git add <arquivo> && git commit -m '...'`) em português (Conventional Commits: `feat:`, `fix:`, `style:`, `test:`). Nunca commitar na `main` sem consentimento.

## §1.1 — ARQUITETURA MODULAR FEATURE-DRIVEN (VERTICAL SLICE)
A estrutura de pastas e código segue estritamente a **Arquitetura Modular Feature-Driven (Vertical Slice)**:
- **`src/core/`**: Infraestrutura compartilhada e agnóstica (`api/client.ts`, `config/`, `formatters/`, `hooks/`, `utils/`).
- **`src/design-system/`**: Componentes de UI atômicos (`ui/`) e cascas de layout (`layout/`), consumindo exclusivamente os tokens do `index.css`. Agnósticos às regras de negócio. **REGRA MANDATÓRIA:** É estritamente proibido criar botões, inputs, cards, badges, modais ou skeletons ad-hoc com classes soltas nas features/telas; toda interface DEVE OBRIGATORIAMENTE importar e utilizar os componentes oficiais de `src/design-system/ui/` (`Button`, `Input`, `Badge`, `Card`, etc.), usando sempre `variant="primary"` (fundo Teal oficial e texto branco puro) para ações primárias.
- **`src/features/`**: Módulos de negócio verticais autocontidos (`auth/`, `storefront/`, `checkout/`, `dashboard/`). Cada módulo encapsula seus `components/`, `hooks/`, `schemas/`, `services/`, `types/` e expõe apenas sua API pública via `index.ts`. Proibido deep import entre features.
- **`src/routes/`**: Páginas finas (*thin pages*) que apenas orquestram as features e injetam o layout de rota. Sem lógica de negócio pesada inline.

## §2 — UX WRITING & LINGUAGEM HUMANIZADA (ANTI-JARGÃO)
A interface é voltada para clientes finais (celular) e barbeiros. O usuário NUNCA deve ver termos técnicos ou de engenharia de software:
- **Termos Estritamente Proibidos na UI:** `Split`, `Webhook`, `Escrow`, `Timeout`, `Idempotência`, `Token JWT`, `Safety Gate`, `Gateway`, `Payload`, `Null/Undefined`, `Internal Server Error`, `HTTP 500`.
- **Dicionário de Substituições Obrigatórias:**
  - *Taxa da Plataforma / Split* ➔ **Taxa de Conveniência** ou **Garantia de Serviço**.
  - *Hold de 15 minutos / Expiração de Sessão* ➔ **"Seu horário fica reservado por 15 minutos enquanto você conclui o Pix"**.
  - *Escrow / Custódia de Saldo* ➔ **"Seu pagamento fica 100% protegido até a conclusão do atendimento"**.
  - *No-Show* ➔ **Não comparecimento**.
  - *Down Payment Amount* ➔ **Sinal de Reserva**.
  - *Available Balance* ➔ **Saldo Liberado para Saque**.
  - *Escrow Locked Balance* ➔ **Saldo em Custódia (Aguardando Atendimento)**.
- **Mensagens de Erro Humanizadas (Tratamento de Exceções da API):**
  - **409 Conflict:** *"Esse horário acabou de ser reservado por outro cliente. Por favor, escolha outro horário disponível."*
  - **429 Too Many Requests:** *"Você realizou muitas tentativas recentemente. Por segurança, aguarde alguns instantes antes de tentar novamente."*
  - **401 Unauthorized:** *"Sua sessão expirou. Por favor, acesse novamente sua conta."*
  - **403 Forbidden / IDOR:** *"Você não possui autorização para visualizar ou alterar estas informações."*
  - **404 Not Found:** *"O estabelecimento ou serviço solicitado não foi encontrado."*
  - **500 Generic:** *"Não conseguimos concluir seu agendamento agora. Seus dados estão salvos, tente novamente em alguns minutos."*

## §3 — REGRAS DE NEGÓCIO DE PREÇO E SINAL (ZERO TRUST)
O frontend NUNCA calcula nem envia valores monetários no corpo da requisição para salvar no banco. Valores vêm exclusivamente do servidor.
- **Checkout do Cliente:**
  - Sem seleção manual de percentual (não existem botões de 25%, 50%, 100%).
  - Exibição clara: Sinal Pago via Pix + Taxa de Conveniência = Total Pix.
  - Exibição informativa: *"Restante a pagar na cadeira: R$ XX,XX"*.
  - Botão com CTA dinâmico e direto: *"Garantir Cadeira às HH:MM (R$ XX,XX via Pix)"*.
- **Cadastro e Edição de Serviços (Painel do Dono):**
  - **Preço < R$ 15,00:** Sinal automático de 100% (Microtransações). Informar com badge informativo: *"Serviços abaixo de R$ 15,00 cobram sinal integral para cobrir custos de operação"*.
  - **Preço de R$ 15,00 a R$ 399,99:** Sinal fixado automaticamente em 50%.
  - **Preço >= R$ 400,00 (Alto Ticket):** Exibir seletor com badge visual **"FLEXÍVEL"**, permitindo alternar entre 50% (Padrão) e 30% (Recomendado para converter serviços de maior valor).
- **Contador Regressivo do Pix:**
  - 15 minutos de reserva (`expiresAt`). Exibir countdown animado `MM:SS`.
  - Botão "Copiar código Pix" com feedback tátil/visual imediato (toast e ícone de check).
  - Polling resiliente consultando o agendamento até a confirmação (`CONFIRMED`).

## §4 — DESIGN SYSTEM, UI & TAILWIND CSS (ESTÉTICA ROBUSTA & CHAPADA)
- **Diretriz de Design — Anti-IA & Estética Sólida/Chapada:**
  - Visual robusto, tátil e de corte mecânico/analógico. Eliminação de gradientes genéricos de IA, cantos circulares excessivos (`rounded-2xl`, `rounded-3xl`) e desfoques artificiais (`blur`/`glow`).
  - Cantos secos e micro-arredondados (`rounded-sm` / 2px-3px para botões e inputs; `rounded-md` / 4px-6px para cards e painéis).
  - Bordas sólidas e bem definidas de 1.5px a 2px com alto contraste estrutural.
  - Sombras táteis (hard shadows): efeito mecânico de clique sem blur difuso (`shadow-[2px_2px_0px_0px_...]`).
- **Tipografia Única:**
  - **Plus Jakarta Sans** para 100% da aplicação (títulos, botões, formulários e relógios), garantindo coesão e alta legibilidade em smartphones.
- **Paleta Institucional (Dark Mode por Padrão):**
  - Fundo principal: `#0B1120` (`bg-slate-950` / slate profundo).
  - Cards e superfícies: `#0F172A` (`bg-slate-900`) e bordas nítidas `#1E293B` / `#334155`.
  - Destaque e Ação Primária: `teal-500` (`#14B8A6`) e hover `teal-400` / `#0D9488`.
  - Contrastes de Texto: `text-white` / `#F8FAFC` para títulos e ações, `text-slate-300` para corpo, `text-slate-400` para legendas.
  - Alerta/Erro: `rose-500` / `rose-400`. Sucesso: `emerald-500`.
- **Micro-Interações Táteis:**
  - Feedback visual ativo em hover, focus (`focus:ring-2 focus:ring-teal-500/50`) e active mecânico (afundamento tátil ao clique).
  - Skeletons animados durante carregamento de dados (proibido tela em branco).
- **Ícones e Emojis:**
  - Uso **estrito** de ícones SVG da biblioteca `lucide-react`.
  - Proibido hardcode de emojis em tags JSX de produção (substituir por Badges com ícones do Lucide).

## §5 — SEGURANÇA NO CLIENTE
- **Links Externos:** Todo link `<a target="_blank">` deve conter obrigatoriamente `rel="noopener noreferrer"`.
- **Sensibilidade de Dados:** Proibido armazenar senhas, tokens de refresh desprotegidos ou documentos em storage semântico sem expurgo.
- **Tratamento de Erros:** Páginas de erro (`ErrorBoundary` ou `ServerErrorPage`) jamais devem renderizar `error.stack`, stack traces ou schemas de banco em produção (`import.meta.env.PROD`).
- **Sanitização de Inputs:** Utilizar `react-hook-form` integrado com schemas `zod` para validação em tempo real antes de qualquer submissão de formulário.

## §6 — ACESSIBILIDADE & RESPONSIVIDADE
- **Mobile First:** A experiência do cliente final deve ser impecável em viewports mobile (360px a 430px de largura).
- **Touch Targets:** Botões e áreas de toque com no mínimo `44x44px`.
- **Semântica:** Uso correto de tags HTML5 (`<main>`, `<nav>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<button>` para ações e `<a>` para links).
- **Atributos ARIA:** `aria-label` em botões de ação que contenham apenas ícones (ex: botão de fechar modal, botão de copiar Pix).

## §7 — TESTES E2E COM PLAYWRIGHT
- Todo fluxo crítico de usuário deve possuir teste automatizado em Playwright.
- Uso mandatório de `data-testid` nos elementos interativos (ex: `data-testid="service-card-item"`, `data-testid="pix-copy-button"`).
- Proibido uso de seletores frágeis por hierarquia de classes CSS dinâmicas (`div > div.flex > span.text-sm`).
