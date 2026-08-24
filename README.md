# SinalizeGO — Frontend Web & PWA

> **Plataforma SaaS de Agendamento Inteligente, Custódia Financeira e Liquidação Pix com Split para Barbearias e Estúdios.**

---

## 📌 Sobre o Projeto

O **SinalizeGO** é uma plataforma moderna desenvolvida para eliminar o problema crônico de faltas (*no-shows*) e otimizar a gestão financeira em estabelecimentos do setor de beleza e estética. 

Por meio de um fluxo de agendamento online integrado com o gateway de pagamentos **Asaas**, os clientes realizam o pagamento de um sinal de reserva via **Pix com confirmação em tempo real**. O valor do sinal fica retido em custódia segura (*Escrow Hold*) e é automaticamente liquidado com split de comissões no momento da conclusão do atendimento.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia / Biblioteca | Finalidade |
|---|---|---|
| **Core** | `React 19` + `TypeScript` + `Vite` | Aplicação web SPA de altíssima performance e tipagem estrita |
| **Estilização** | `Tailwind CSS v4` | Design System Dark Mode estrito e responsivo |
| **Progressive Web App** | `vite-plugin-pwa` + `Workbox` | Instalação A2HS nativa, Service Worker e cache offline |
| **Data Fetching & Cache** | `TanStack Query (React Query v5)` | Polling reativo (Pix 3s), cache de estado de servidor e mutações otimistas |
| **Cliente HTTP** | `Axios` | Interceptors para renovação transparente de tokens JWT e tratamento de erros |
| **Formulários & Validação** | `React Hook Form` + `Zod` | Validação de esquemas e tratamento de formulários tipados |
| **Iconografia & Feedback** | `Lucide React` + `Sonner` | Ícones SVG consistentes e Toasts com feedback semântico |
| **Efeitos & Háptica** | `canvas-confetti` + `Navigator.vibrate` | Comemoração de agendamento e resposta tátil em dispositivos móveis |

---

## 🚀 Principais Módulos & Recursos

### 1. Vitrine Pública & Motor de Agendamento
- **Vitrine Digital**: Apresentação visual da barbearia com galeria de fotos, catálogo de serviços agrupados, tempo estimado de duração e preços.
- **Motor de Disponibilidade**: Cálculo dinâmico de horários livres com prevenção inteligente de overbooking (respeita o número de cadeiras simultâneas cadastradas).
- **Safety Gate de R$ 15,00**: Aplicação estrita das regras financeiras: serviços com valor inferior a R$ 15,00 exigem pagamento integral; serviços acima de R$ 15,00 permitem seleção de sinal progressivo (25%, 50% ou 100%).
- **Checkout Pix em Tempo Real**: Geração instantânea de QR Code e Pix Copia e Cola, com *polling* a cada 3 segundos monitorando a confirmação via webhook do Asaas.
- **Voucher Digital & Calendário**: Emissão de comprovante com atalhos diretos para Google Maps, WhatsApp do salão e download de arquivo de calendário sincronizável (`.ics`).

### 2. Painel de Controle do Estabelecimento (`/painel`)
- **Dashboard Analítico**: Faturamento bruto, faturamento líquido, quantidade de atendimentos e saldo retido em custódia (*Escrow Hold*).
- **Agenda Operacional**: Visão consolidada da grade diária com filtros de status (*Agendado*, *Concluído*, *Cancelado*), dados do cliente e ação de conclusão com liquidação financeira.
- **Catálogo de Serviços**: Cadastro de serviços com controle de duração, valor total, percentual mínimo de sinal e capacidade de atendimento simultâneo por grupo.
- **Expediente & Feriados**: Definição de horários de abertura e fechamento por dia da semana, pausas de intervalo (almoço) e bloqueios de feriados.
- **Financeiro & Subconta Asaas**: Consulta de saldo disponível para saque, histórico de transferências Pix para conta bancária do dono e visualização de taxas.

### 3. Portal do Cliente (`/meus-agendamentos` e `/explorar`)
- **Barbearias Visitadas**: Aba de exploração com histórico de estabelecimentos já frequentados e botão de *Agendar Novamente* com 1 clique.
- **Histórico & Próximos Atendimentos**: Abas organizadas separando compromissos futuros de atendimentos passados, com detalhamento claro do sinal pago e valor restante no balcão.
- **Cancelamento Transparente**:
  - *Com mais de 24 horas de antecedência*: Estorno integral automático (100% via Pix).
  - *Com menos de 24 horas de antecedência*: Retenção legal do piso de R$ 15,00 para compensação da cadeira vaga (Arts. 417 a 420 do Código Civil) e devolução automática do valor excedente.
- **Minha Conta & Privacidade**: Edição de dados cadastrais, validação de CPF, alteração de senha e exclusão definitiva de dados pessoais conforme a LGPD.

### 4. Experiência PWA & Otimização de Performance
- **Instalação em 1 Clique (A2HS)**: Banner e modal de instalação compatível com Android, iOS e Desktop.
- **Code Splitting com `React.lazy`**: Todas as 22 rotas são carregadas sob demanda com fallbacks de skeleton temáticos, reduzindo o bundle inicial em mais de 60%.
- **Resiliência a Erros**: `GlobalErrorBoundary` protegendo toda a árvore de renderização para evitar telas brancas, acompanhado de telas temáticas para erros 404 e 500.

---

## 🎨 Design System (Dark Mode Estrito)

A interface segue uma paleta de cores escura e sofisticada, garantindo alto contraste e legibilidade:

```
• Background Principal:     #0B1120 (Dark Canvas)
• Cards e Containers:       #0F172A (Slate 900)
• Modais, Inputs e Menus:   #1E293B (Slate 800)
• Bordas e Linhas de Guia:  #334155 (Slate 700)
• Ação Primária / Destaque: #14B8A6 (Teal 500) | Hover: #0D9488 (Teal 600)
• Alertas e Cancelamentos:  #EF4444 (Red 500)
• Tipografia Principal:     #F8FAFC (Slate 50)
• Tipografia Secundária:    #94A3B8 (Slate 400)
```

---

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── auth/           # ProtectedRoute e guardas de autenticação
│   ├── booking/        # Componentes do fluxo de reserva e checkout Pix
│   ├── client/         # CancelAppointmentModal, VoucherModal
│   ├── common/         # Button, Input, Card, Modal, Badge, Skeleton, Toaster, ErrorBoundary
│   └── dashboard/      # Gráficos, métricas financeiras e cards analíticos
├── contexts/
│   └── auth.context.tsx# Gerenciamento de sessão JWT e papéis de usuário
├── layouts/
│   ├── RootLayout.tsx  # Shell mestre com Error Boundary, Toaster e PWA Prompt
│   ├── PublicLayout.tsx# Layout com cabeçalho e rodapé institucionais
│   ├── AuthLayout.tsx  # Layout centralizado para login, cadastro e onboarding
│   ├── ClientLayout.tsx# Layout do portal do cliente com barra de navegação móvel PWA
│   ├── OwnerLayout.tsx # Layout do painel com sidebar retrátil
│   └── AdminLayout.tsx # Layout de governança da plataforma
├── lib/
│   ├── calendar.ts     # Gerador de arquivos de evento .ics
│   ├── confetti.ts     # Disparo de confetes comemorativos
│   ├── haptics.ts      # Utilitário de vibração tátil para dispositivos móveis
│   └── utils.ts        # Formatadores monetários (BRL), máscaras e classes Tailwind
├── pages/
│   ├── auth/           # Login, Cadastro, Recuperação de Senha, Onboarding
│   ├── booking/        # Checkout, Pix Payment, Booking Success
│   ├── client/         # Explorar, Meus Agendamentos, Minha Conta
│   ├── owner/          # Dashboard, Agenda, Serviços, Expediente, Financeiro, Configurações
│   └── public/         # Homepage, Vitrine Pública da Barbearia, 404, 500
├── routes/
│   └── index.tsx       # Roteador centralizado com code splitting dinâmico
├── services/
│   ├── admin.service.ts
│   ├── appointments.service.ts
│   ├── auth.service.ts
│   ├── cep.service.ts
│   ├── company.service.ts
│   ├── services.service.ts
│   ├── transactions.service.ts
│   └── working-hours.service.ts
└── types/
    ├── admin.types.ts
    ├── api.types.ts
    ├── appointment.types.ts
    ├── auth.types.ts
    ├── company.types.ts
    └── transaction.types.ts
```

---

## ⚙️ Como Executar Localmente

### Pré-requisitos
- **Node.js**: versão 18 ou superior
- **npm** ou **yarn**

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/frontend-sinalizego.git
cd frontend-sinalizego
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

### 5. Compilar para produção
```bash
npm run build
```

---

## 🛡️ Regras de Negócio & Segurança Financeira

- **Zero Trust nos Valores Financeiros**: O frontend nunca calcula splits ou taxas arbitrárias por conta própria; todos os valores são validados contra a API oficial do backend NestJS.
- **Custódia Garantida**: O sinal pago pelo cliente permanece em estado de retenção até que o atendimento seja marcado como concluído pelo estabelecimento ou cancelado dentro das regras legais.
- **Proteção contra Overbooking**: O catálogo de serviços impede agendamentos simultâneos que excedam o número de cadeiras físicas configuradas.

---

## 📄 Licença

Este projeto é proprietário e faz parte do ecossistema comercial **SinalizeGO**. Todos os direitos reservados.
