# 🤖 SinalizeGO API — LLM Integration Context & Guidelines

> **Documento de Contexto Técnico para o Agente de Desenvolvimento Frontend**  
> Este documento resume todas as convenções, endpoints, contratos de payload, regras financeiras estritas e diretrizes de segurança da API NestJS do **SinalizeGO**.

---

## 1. 🌐 Configuração Base da API & Versionamento

- **Base URL**: `http://localhost:3000/api/v1` (ou variável `VITE_API_URL`)
- **Swagger / OpenAPI**: `http://localhost:3000/api` e `http://localhost:3000/api/docs`
- **Rotas sem prefixo `/api/v1`**:
  - Webhook Asaas: `/webhooks/asaas`
  - Health check: `/`

---

## 2. 🔐 Autenticação & Gerenciamento de Sessão (JWT)

A API utiliza tokens JWT com estratégia de renovação stateless:

### 2.1. Cabeçalho Obrigatório
Todas as rotas protegidas exigem o cabeçalho:
```http
Authorization: Bearer <access_token>
```

### 2.2. Fluxo de Refresh Token
Quando uma requisição retornar **HTTP 401 Unauthorized**:
1. O interceptor do Axios deve interceptar o erro.
2. Enviar requisição para renovar a sessão:
   ```http
   POST /api/v1/auth/refresh
   Authorization: Bearer <refresh_token>
   ```
3. Atualizar os tokens em memória/storage e retentar a requisição original falha.

### 2.3. Endpoints de Autenticação (`/api/v1/auth`)
| Método | Endpoint | Payload / Header | Resposta de Sucesso (200/201) |
|---|---|---|---|
| `POST` | `/auth/login` | `{ email, password }` | `{ access_token, refresh_token, user }` |
| `POST` | `/auth/refresh` | `Bearer <refresh_token>` | `{ access_token, refresh_token }` |
| `GET` | `/auth/me` | `Bearer <access_token>` | `{ id, name, email, role, phone, cpfCnpj, ... }` |
| `POST` | `/auth/logout` | `Bearer <access_token>` | `{ message: "Logout realizado com sucesso" }` |
| `POST` | `/auth/forgot-password` | `{ email }` | `{ message: "Se o e-mail informado estiver cadastrado..." }` |
| `POST` | `/auth/reset-password` | `{ token, newPassword }` | `{ message: "Senha redefinida com sucesso." }` |

---

## 3. 👥 Roles & Controle de Acesso (RBAC)

O sistema possui 5 papéis de acesso:
- `CLIENT`: Cliente final que agenda e paga serviços.
- `COMPANY_OWNER`: Proprietário da barbearia/estúdio.
- `EMPLOYEE`: Funcionário do estabelecimento.
- `ADMIN`: Administrador da plataforma.
- `SUPER_ADMIN`: Administrador executivo com acesso irrestrito.

> 💡 **Promoção Automática de Role**: Quando um usuário `CLIENT` cria sua primeira barbearia em `POST /api/v1/company/create`, a API promove a conta para `COMPANY_OWNER` e retorna imediatamente um **novo par de tokens (`access_token`, `refresh_token`)**. O frontend deve atualizar o estado de autenticação imediatamente sem exigir novo login.

---

## 4. 💰 Regras de Negócio Financeiras & Pagamento Pix (ZERO TRUST)

> ⚠️ **Princípio Zero Trust**: O frontend **NUNCA** calcula nem envia valores monetários ou taxas diretamente para cobrança. Todos os valores reais são derivados pelo backend. O frontend apenas reflete os cálculos para exibição.

### 4.1. Micro-Transaction Safety Gate (R$ 15,00) & Blocos de Sinal
1. **Piso do Estabelecimento**: Ao cadastrar/editar um serviço, o dono define `downPaymentPercent` **exclusivamente como 25% ou 50%**.
2. **Safety Gate de R$ 15,00**:
   - Se `totalPrice < 15.00`: Exibir apenas a opção de **100% de pagamento antecipado**.
   - Se `totalPrice >= 15.00`: Gerar blocos progressivos a partir do piso `[piso, ..., 75%, 100%]`. Qualquer percentual cujo valor `totalPrice * (percent / 100)` for **menor que R$ 15,00** deve ser descartado.

### 4.2. Fórmula de Taxa da Plataforma (Espelho Visual)
A taxa retida pelo SinalizeGO segue faixas progressivas sobre o valor do sinal pago:
- Até R$ 50,00 ➔ 15%
- De R$ 50,01 a R$ 100,00 ➔ 10%
- Acima de R$ 100,00 ➔ 5%
- **Regras Estritas**: Piso mínimo de **R$ 2,00** e **arredondamento para cima em múltiplos de R$ 0,25** (`Math.ceil(taxa * 4) / 4`).

### 4.3. Ciclo de Vida do Pix & Anti-DoS
- A rota `POST /api/v1/transactions/pix/:appointmentId` retorna o QR Code e o campo `expirationDate` (**15 minutos** de validade).
- O frontend deve exibir um contador regressivo de 15 minutos.
- O cliente é limitado a no máximo **3 agendamentos com status `PENDING_PAYMENT` simultâneos**.
- Polling reativo no frontend: Consultar `GET /api/v1/appointments/:id` a cada 3 segundos (`refetchInterval: 3000`). Quando o status mudar para `CONFIRMED`, redirecionar para a tela de voucher.

### 4.4. Regras de Cancelamento & Estorno
- O cliente pode solicitar cancelamento via `DELETE /api/v1/appointments/:id/client`.
- **> 24 horas antes do horário**: O backend cancela e dispara estorno automático integral do Pix via Asaas.
- **<= 24 horas antes do horário**: O backend cancela o horário para liberar a agenda, mas **bloqueia o estorno**, repassando o sinal ao estabelecimento como compensação de vacância.

---

## 5. 🛡️ Segurança, Rate Limiting & Uploads

### 5.1. Limites de Rate Limiting (Throttler)
A API responde com **HTTP 429 Too Many Requests** se os seguintes limites forem ultrapassados:
| Rota | Limite | Justificativa |
|---|:---:|---|
| **Global Padrão** | **120 req/60s** | Proteção geral e suporte a NAT compartilhado |
| `GET /appointments/available-slots` | **120 req/60s** | Navegação rápida de datas no calendário |
| `POST /auth/login` | **15 req/60s** | Mitigação de força bruta / credential stuffing |
| `POST /users/create` | **15 req/60s** | Prevenção de criação automatizada de contas |
| `POST /auth/forgot-password` | **5 req/60s** | Prevenção de spam de e-mails |
| `POST /transactions/pix/:appointmentId` | **10 req/60s** | Prevenção de spam de cobranças na subconta |

### 5.2. Upload Seguro de Imagens
- **Endpoint**: `POST /api/v1/upload/image` (Multipart Form: `file` + `companyId`).
- **Tamanho Máximo**: 5MB.
- **Formatos Aceitos**: JPEG, PNG, WEBP.
- O backend valida a assinatura binária real (**Magic Bytes**) do arquivo.

---

## 6. 📚 Tabela Completa de Endpoints da API

### 🏢 6.1. Empresas & Vitrine Pública (`/api/v1/company`)
| Método | Endpoint | Auth / Role | Descrição |
|---|---|---|---|
| `GET` | `/company/slug/:slug` | Público | **Vitrine pública consolidada** (dados, fotos, expediente e catálogo de serviços) |
| `GET` | `/company/list` | Público | Listagem de estabelecimentos cadastrados |
| `POST` | `/company/create` | `CLIENT`, `COMPANY_OWNER` | Cadastro da empresa e promoção automática de role |
| `PATCH` | `/company/:id` | `COMPANY_OWNER`, `ADMIN` | Atualização cadastral da barbearia |
| `GET` | `/company/dashboard/metrics` | `COMPANY_OWNER`, `ADMIN` | **Dashboard do Dono** (receita bruta, sinais, taxas retidas, lucro líquido, fila do dia e top serviços) |

### 💈 6.2. Catálogo & Grupos de Serviços (`/api/v1/company-service` e `/api/v1/service-group`)
| Método | Endpoint | Auth / Role | Descrição |
|---|---|---|---|
| `POST` | `/service-group/create` | `COMPANY_OWNER` | Cria grupo com controle de capacidade (`capacity`) |
| `GET` | `/service-group` | `COMPANY_OWNER` | Lista grupos da empresa do usuário logado |
| `PATCH` | `/service-group/:id` | `COMPANY_OWNER` | Atualiza nome/capacidade do grupo |
| `DELETE` | `/service-group/:id` | `COMPANY_OWNER` | Desativa grupo de serviços |
| `POST` | `/company-service/create` | `COMPANY_OWNER` | Cria serviço (`totalPrice`, `durationMinutes`, `downPaymentPercent: 25 ou 50`) |
| `GET` | `/company-service` | `COMPANY_OWNER` | Lista serviços da empresa do usuário logado |
| `PATCH` | `/company-service/:id` | `COMPANY_OWNER` | Edita dados do serviço |
| `DELETE` | `/company-service/:id` | `COMPANY_OWNER` | Desativa serviço |

### 🕒 6.3. Expediente & Exceções (`/api/v1/working-hours`)
| Método | Endpoint | Auth / Role | Descrição |
|---|---|---|---|
| `GET` | `/working-hours` | `COMPANY_OWNER` | Obtém grade semanal da própria empresa |
| `PUT` | `/working-hours` | `COMPANY_OWNER` | Atualiza grade semanal completa (0 a 6 com almoço) |
| `GET` | `/working-hours/company/:companyId` | Público | Consulta pública de horários da empresa |
| `POST` | `/working-hours/exceptions` | `COMPANY_OWNER` | Cadastra feriado ou exceção de data específica |
| `GET` | `/working-hours/exceptions` | `COMPANY_OWNER` | Lista exceções ativas |
| `DELETE` | `/working-hours/exceptions/:id` | `COMPANY_OWNER` | Remove exceção de calendário |

### 📅 6.4. Agendamentos & Disponibilidade (`/api/v1/appointments`)
| Método | Endpoint | Auth / Role | Descrição |
|---|---|---|---|
| `GET` | `/appointments/available-slots` | Público | **Motor de slots livres** (`?companyId=&serviceId=&date=YYYY-MM-DD`) |
| `POST` | `/appointments/create` | `CLIENT`, `COMPANY_OWNER` | Cria agendamento com status `PENDING_PAYMENT` |
| `GET` | `/appointments/client` | `CLIENT` | Lista agendamentos do cliente logado |
| `GET` | `/appointments/admin` | `COMPANY_OWNER` | Lista agendamentos da barbearia do dono |
| `GET` | `/appointments/:id` | Autenticado | Detalhes completos do agendamento |
| `PATCH` | `/appointments/:id/complete` | `COMPANY_OWNER`, `ADMIN` | **Conclui atendimento** atômica e irreversivelmente |
| `DELETE` | `/appointments/:id/client` | `CLIENT` | Solicita cancelamento do cliente (estorno se > 24h) |

### 💳 6.5. Transações Pix & Subcontas (`/api/v1/transactions` e `/api/v1/financial-profile`)
| Método | Endpoint | Auth / Role | Descrição |
|---|---|---|---|
| `POST` | `/transactions/pix/:appointmentId` | Autenticado | Gera QR Code e chave copia-e-cola Pix via Asaas |
| `POST` | `/financial-profile` | `COMPANY_OWNER` | Cadastra subconta Asaas Sandbox do proprietário |
| `GET` | `/financial-profile` | `COMPANY_OWNER` | Consulta subconta e saldo (`walletId`) |

### 🛡️ 6.6. Super Admin & Platform Intelligence (`/api/v1/admin`)
| Método | Endpoint | Auth / Role | Descrição |
|---|---|---|---|
| `GET` | `/admin/dashboard/metrics` | `SUPER_ADMIN`, `ADMIN` | **Métricas Globais SaaS** (Receita Bruta, Custos Pix, Lucro Líquido, GMV e Growth) |
| `GET` | `/admin/companies` | `SUPER_ADMIN`, `ADMIN` | Listagem paginada de todas as empresas com filtros |
| `PATCH` | `/admin/companies/:id/toggle-status` | `SUPER_ADMIN`, `ADMIN` | Ativa ou suspende administrativamente um estabelecimento |

---

## 7. 🎨 Identidade Visual Institucional (Dark Mode)

- **Fundo Exterior**: `#0B1120`
- **Containers / Cards**: `#0F172A`
- **Cards Internos / Modais**: `#1E293B`
- **Destaque / Ação (Teal)**: `#14B8A6` (Hover: `#0D9488`)
- **Alertas / Cancelamentos**: `#EF4444`
- **Textos**: `#F8FAFC` (Principal) e `#94A3B8` (Secundário)
- **Tipografia**: `Inter, system-ui, sans-serif`
