# SinalizeGO — Frontend AI Agent Rules & Architecture Guidelines

> Diretrizes estritas e autossuficientes para qualquer agente de IA trabalhando no repositório frontend do SinalizeGO.
>
> Stack Principal: React 19 · TypeScript 5.x · Vite · Tailwind CSS · Lucide React · React Hook Form + Zod · Playwright.

---

## 1. Protocolo de Escalonamento — Pergunte Primeiro, Nunca Assuma

- **Doubt Gate (Portão da Dúvida):** Qualquer incerteza sobre regras de negócio de agendamento, fluxo de checkout, comportamento visual ou valores monetários: **pare e pergunte no chat.** Nunca adote premissas silenciosas ou "defaults razoáveis".
- **Possible-Error Gate (Portão de Possíveis Erros):** Ao identificar qualquer discrepância — quebra de layout, erro de tipagem, falha de segurança (vazamento de tokens/stack trace), seletores frágeis ou contradição com o backend: reporte no formato padrão com o local, o fato observável e opções numeradas com trade-offs. Nunca aplique o fix sem aprovação explícita.
- **Divergence Gate (Portão de Divergência):** Quando uma instrução solicitar substituição ou remoção de código que já funciona e está correto, mostre o que existe hoje, aponte a diferença concreta e pergunte se a mudança é intencional antes de executar.
- **Um Commit por Arquivo:** Realize **um commit individual por arquivo** (`git add <arquivo> && git commit -m '...'`), com mensagem semântica em Conventional Commits em português (`feat(ui): ...`, `fix(checkout): ...`, `style(theme): ...`, `test(e2e): ...`). Nunca commitar diretamente na branch `main` sem autorização expressa.

---

## 2. Arquitetura & Estrutura de Pastas

```text
src/
├── assets/          # Imagens, vetores e fontes estáticas
├── components/      # Componentes reutilizáveis do Design System
│   ├── ui/          # Elementos atômicos (Button, Input, Badge, Modal, Card, Toast)
│   └── layout/      # Navbar, Sidebar, Footer, Container, PageHeader
├── hooks/           # Custom hooks encapsulando lógica de negócio e estados
├── lib/             # Instâncias configuradas (axios/fetch client, utils de classes cn, formatters)
├── pages/           # Páginas e rotas da aplicação
│   ├── auth/        # Login, Cadastro, Recuperação de Senha
│   ├── storefront/  # Vitrine pública da barbearia (/b/:slug), catálogo e seleção de horários
│   ├── checkout/    # Tela de pagamento Pix com QR Code e contagem regressiva
│   └── dashboard/   # Painel do Proprietário (Agendamentos, Serviços, Horários, Saques)
├── services/        # Integração com a API NestJS (/api/v1/*) tipada via DTOs
├── types/           # Definições de tipos TypeScript compartilhados
└── schemas/         # Validações de formulários com Zod (ex: loginSchema, serviceSchema)
```

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

## 5. Design System & Padrões Visuais (Tailwind CSS)

- **Tema Dark Mode Institucional:**
  - Background Base: `#0B1120` (`bg-slate-950`).
  - Cards e Superfícies: `#0F172A` (`bg-slate-900`) com bordas suaves `#1E293B` (`border-slate-800`).
  - Cor de Destaque: `teal-500` (`#14B8A6`) e hover `teal-400`.
  - Contrastes de Texto: `text-white` (títulos), `text-slate-300` (corpo de texto), `text-slate-400` (legendas e metadados).
- **Ícones e Emojis:**
  - Uso mandatório de `lucide-react`.
  - Proibido hardcode de emojis em tags JSX de produção (utilizar badges e ícones do Lucide).
- **Links Externos:** Todo link externo com `target="_blank"` deve conter obrigatoriamente `rel="noopener noreferrer"`.
- **Prevenção de Vazamentos:** Nunca imprimir `error.stack`, stack traces ou schemas internos em páginas de erro de produção (`import.meta.env.PROD`).

---

## 6. Testes E2E com Playwright

- Toda página e fluxo crítico deve ser coberto por testes com Playwright.
- Uso mandatório de `data-testid` em botões, formulários, cards e elementos interativos.
- Estruturação baseada em **Page Object Model (POM)**.
- Consulta detalhada em `.agents/skills/playwright-e2e-testing/SKILL.md`.
