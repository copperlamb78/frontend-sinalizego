# 🤖 SinalizeGO API — LLM Integration Context & Guidelines

> **Documento de Contexto Técnico para o Agente de Desenvolvimento Frontend**  
> Este documento resume todas as convenções, contratos de payload, respostas JSON reais, query params, regras financeiras estritas e diretrizes de segurança da API NestJS do **SinalizeGO**.

---

## 1. 🌐 Configuração Base da API & Versionamento

- **Base URL**: `http://localhost:3000/api/v1` (ou variável de ambiente `VITE_API_URL`)
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

---

## 3. 👥 Roles & Controle de Acesso (RBAC)

O sistema possui 5 papéis de acesso:
- `CLIENT`: Cliente final que agenda e paga serviços.
- `COMPANY_OWNER`: Proprietário da barbearia/estúdio.
- `EMPLOYEE`: Funcionário do estabelecimento.
- `ADMIN`: Administrador da plataforma.
- `SUPER_ADMIN`: Administrador executivo com acesso irrestrito.

> 💡 **Promoção Automática de Role**: Quando um usuário `CLIENT` cria sua primeira barbearia em `POST /api/v1/company/create`, a API promove a conta para `COMPANY_OWNER` e retorna imediatamente um **novo par de tokens (`access_token`, `refresh_token`)**. O frontend deve atualizar o estado de autenticação imediatamente sem exigir novo login.

### 3.1. Cadastro de Estabelecimento & Geração Automática de Slug
- **Geração 100% Automática pelo Backend**: O frontend **NÃO** deve enviar o campo `slug` no payload de criação da empresa. O backend gera o slug normalizado a partir do `businessName` (ex: `"Barbearia do Zé"` ➔ `barbearia-do-ze`).
- **Resolução de Colisão**: Se já existir uma empresa com o mesmo nome/slug, o backend adiciona automaticamente um sufixo numérico incremental (`barbearia-do-ze-1`, `barbearia-do-ze-2`).
- **Dica para o Frontend**: Pode-se exibir uma prévia dinâmica do link (ex: `sinalizego.com/empresa/barber-shop-vintage`) apenas para visualização do usuário durante a digitação.

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
- Polling reativo no frontend: Consultar `GET /api/v1/appointments/:id` a cada 3 segundos (`refetchInterval: 3000`). Quando o status mudar para `CONFIRMED`, redirecionar para a tela de voucher (`/reserva/confirmada/:appointmentId`).

### 4.4. Regras de Cancelamento, Estorno & Blindagem Jurídica (CDC Art. 51 / CC Arts. 417 a 420)
- O cliente pode solicitar o cancelamento de um agendamento via `DELETE /api/v1/appointments/:id/client`.
- **Cancelamento com Antecedência (> 24h)**: O backend cancela o horário e processa o **estorno integral (100%)** do valor pago online via Asaas.
- **Cancelamento Tardio (<= 24h)**:
  - O sistema calcula o sinal mínimo de garantia do serviço (`guaranteedDepositAmount` baseado no piso configurado de 25% ou 50% e no Safety Gate de R$ 15,00).
  - Se o cliente pagou apenas o sinal mínimo (`paidAmount <= guaranteedDepositAmount`), o valor é **100% retido** pelo estabelecimento como indenização por hora ociosa (arras confirmatórias).
  - Se o cliente adiantou valor superior no checkout (ex: 50%, 75% ou 100%), o backend **retem estritamente o sinal mínimo** e executa o **estorno parcial automático via Asaas** do montante excedente (`refundAmount = paidAmount - guaranteedDepositAmount`) para a conta do cliente via Pix.

### 4.5. Liquidação Financeira (Escrow Hold) e Política de Saques
1. **Trava de Custódia (Escrow Hold)**:
   - Todo sinal pago online via Pix entra na subconta como saldo em custódia (`escrowLockedBalance`) até o agendamento transicionar para `COMPLETED`.
   - A liberação do saldo para saque ocorre:
     - Manualmente pelo estabelecimento: `PATCH /api/v1/appointments/:id/complete`.
     - Automaticamente via Cron Job horário: Agendamentos confirmados cujo término ocorreu há mais de 24h sem contestação.
2. **Política de Saques do Estabelecimento**:
   - **Saque Automático Semanal Gratuito**: Toda segunda-feira às 06:00 (`@Cron('0 6 * * 1')`), o sistema transfere o saldo disponível (`availableBalance`) para a conta bancária/Pix cadastrada do estabelecimento com taxa de transferência 100% gratuita/subsidiada pela plataforma (`asaasFee = 0`).
   - **Saque Avulso Sob Demanda (`POST /api/v1/company/withdraw`)**: O estabelecimento pode solicitar resgate avulso do saldo liberado fora da segunda-feira, mediante desconto da tarifa de transferência bancária Asaas de **R$ 5,00** (`ASAAS_TRANSFER_FEE`).

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

## 6. 📚 Catálogo Completo de Endpoints da API SinalizeGO

---

### 🔐 6.1. Módulo de Autenticação (`/api/v1/auth`)

#### 1. `POST /api/v1/auth/login`
- **Acesso**: Público (Rate limit: 15 req/60s)
- **Body**:
  ```json
  {
    "email": "joao@email.com",
    "password": "MinhaSenhaForte123!"
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-user",
      "name": "João Silva",
      "email": "joao@email.com",
      "role": "CLIENT"
    }
  }
  ```

#### 2. `POST /api/v1/auth/refresh`
- **Acesso**: `Bearer <refresh_token>` no header
- **Resposta (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 3. `GET /api/v1/auth/me`
- **Acesso**: `Bearer <access_token>`
- **Resposta (200 OK)**:
  ```json
  {
    "id": "uuid-user",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "COMPANY_OWNER",
    "phone": "75999999999",
    "cpfCnpj": "12345678909",
    "isActive": true
  }
  ```

#### 4. `POST /api/v1/auth/logout`
- **Acesso**: `Bearer <access_token>`
- **Resposta (200 OK)**:
  ```json
  {
    "message": "Logout realizado com sucesso"
  }
  ```

#### 5. `POST /api/v1/auth/forgot-password`
- **Acesso**: Público (Rate limit: 5 req/60s)
- **Body**:
  ```json
  {
    "email": "joao@email.com"
  }
  ```
- **Resposta (200 OK)**:
  ```json
  {
    "message": "Se o e-mail informado estiver cadastrado, as instruções para redefinição de senha foram enviadas."
  }
  ```

#### 6. `POST /api/v1/auth/reset-password`
- **Acesso**: Público
- **Body**:
  ```json
  {
    "token": "token-recebido-no-link",
    "newPassword": "NovaSenhaSegura456!"
  }
  ```
- **Resposta (200 OK)**:
  ```json
  {
    "message": "Senha redefinida com sucesso."
  }
  ```

---

### 👤 6.2. Módulo de Usuários (`/api/v1/users`)

#### 7. `POST /api/v1/users/create`
- **Acesso**: Público (Rate limit: 15 req/60s)
- **Body**:
  ```json
  {
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "SenhaSegura123!",
    "phone": "75999999999",
    "role": "CLIENT"
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "message": "Usuário criado com sucesso",
    "user": {
      "id": "uuid-user",
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "75999999999",
      "role": "CLIENT",
      "createdAt": "2026-08-23T10:00:00.000Z",
      "isActive": true
    }
  }
  ```

#### 8. `PATCH /api/v1/users/update`
- **Acesso**: `Bearer <access_token>`
- **Body**:
  ```json
  {
    "name": "João Silva Atualizado",
    "phone": "75988888888"
  }
  ```
- **Resposta (200 OK)**: Dados do usuário atualizados.

#### 9. `PATCH /api/v1/users/update-cpf`
- **Acesso**: `Bearer <access_token>`
- **Finalidade**: Cadastra o CPF/CNPJ do cliente necessário para emitir Pix no Asaas.
- **Body**:
  ```json
  {
    "cpfCnpj": "12345678909"
  }
  ```
- **Resposta (200 OK)**:
  ```json
  {
    "message": "CPF atualizado e cliente financeiro gerado com sucesso!",
    "user": {
      "id": "uuid-user",
      "cpfCnpj": "12345678909",
      "asaasCustomerId": "cus_000006093120"
    }
  }
  ```

#### 10. `PATCH /api/v1/users/change-password`
- **Acesso**: `Bearer <access_token>`
- **Body**:
  ```json
  {
    "oldPassword": "SenhaAntiga123!",
    "newPassword": "NovaSenhaForte456!"
  }
  ```
- **Resposta (200 OK)**:
  ```json
  {
    "message": "Senha alterada com sucesso."
  }
  ```

#### 11. `DELETE /api/v1/users/me`
- **Acesso**: `Bearer <access_token>`
- **Finalidade**: Desativação voluntária da própria conta (Soft Delete).
- **Resposta (200 OK)**: `{ "id": "...", "isActive": false, "disabledAt": "..." }`.

#### 12. `GET /api/v1/users/list`
- **Acesso**: `SUPER_ADMIN`, `ADMIN`
- **Resposta (200 OK)**: Array com todos os usuários do sistema sanitizados.

#### 13. `DELETE /api/v1/users/:userId` & `PATCH /api/v1/users/:userId/activate`
- **Acesso**: `SUPER_ADMIN`, `ADMIN`
- **Finalidade**: Desativação ou reativação administrativa de contas.

---

### 🏢 6.3. Módulo de Empresas (`/api/v1/company`)

#### 14. `GET /api/v1/company/slug/:slug`
- **Acesso**: Público
- **Finalidade**: Vitrine pública consolidada (dados, fotos, expediente e catálogo de serviços).
- **Resposta (200 OK)**:
  ```json
  {
    "id": "uuid-company",
    "businessName": "Barbearia Vintage",
    "slug": "barbearia-vintage",
    "providerType": "Barbearia",
    "whatsapp": "75999999999",
    "district": "Centro",
    "street": "Av. Getúlio Vargas",
    "city": "Feira de Santana",
    "state": "BA",
    "zipCode": "44000000",
    "number": "100",
    "logoPhoto": "https://res.cloudinary.com/.../logo.png",
    "bannerPhoto": "https://res.cloudinary.com/.../banner.png",
    "timezone": "America/Sao_Paulo",
    "workingHours": [
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "19:00",
        "lunchStartTime": "12:00",
        "lunchEndTime": "13:00",
        "isClosed": false
      }
    ],
    "serviceGroups": [
      {
        "id": "uuid-group",
        "name": "Cabelo & Barba",
        "capacity": 2,
        "services": [
          {
            "id": "uuid-service",
            "name": "Corte Degradê",
            "description": "Corte na tesoura e máquina",
            "durationMinutes": 30,
            "totalPrice": 40.00,
            "downPaymentPercent": 25
          }
        ]
      }
    ]
  }
  ```

#### 15. `POST /api/v1/company/create`
- **Acesso**: `Bearer <access_token>` (`CLIENT`, `COMPANY_OWNER`)
- **Body**:
  ```json
  {
    "businessName": "Barber Shop Vintage",
    "providerType": "Barbearia",
    "phone": "75999999999",
    "state": "BA",
    "city": "Feira de Santana",
    "district": "Centro",
    "street": "Av. Getúlio Vargas",
    "zipCode": "44000000",
    "number": "123"
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "message": "Empresa criada com sucesso",
    "company": {
      "id": "uuid-company",
      "businessName": "Barber Shop Vintage",
      "slug": "barber-shop-vintage",
      "providerType": "Barbearia",
      "city": "Feira de Santana",
      "state": "BA"
    },
    "access_token": "token-atualizado-com-role-company-owner",
    "refresh_token": "refresh-token-atualizado"
  }
  ```

#### 16. `GET /api/v1/company/dashboard/metrics`
- **Acesso**: `COMPANY_OWNER`, `ADMIN`
- **Query Params**: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- **Resposta (200 OK)**:
  ```json
  {
    "company": { "id": "uuid", "businessName": "Barber Shop Vintage", "slug": "barber-shop-vintage" },
    "period": { "startDate": "2026-08-01T00:00:00.000Z", "endDate": "2026-08-23T23:59:59.999Z" },
    "financial": {
      "totalRevenue": 2450.00,
      "totalDownPaymentCollected": 820.00,
      "totalPlatformFees": 112.50,
      "netIncome": 2337.50,
      "availableBalance": 720.00,
      "escrowLockedBalance": 100.00,
      "totalWithdrawn": 500.00
    },
    "volume": {
      "total": 56,
      "completed": 45,
      "confirmed": 5,
      "canceled": 4,
      "pendingPayment": 2,
      "completionRate": 88.5
    },
    "topServices": [
      { "serviceId": "uuid-srv", "serviceName": "Corte Degradê", "appointmentsCount": 28, "totalRevenue": 1400.00 }
    ],
    "upcomingToday": [
      {
        "id": "uuid-appt",
        "appointmentDate": "2026-08-23T14:30:00.000Z",
        "appointmentEndDate": "2026-08-23T15:00:00.000Z",
        "clientName": "Carlos Silva",
        "clientPhone": "75999999999",
        "serviceName": "Corte Degradê",
        "durationMinutes": 30,
        "downPaymentAmount": 15.00,
        "servicePrice": 45.00,
        "amountToPayInSalon": 30.00
      }
    ]
  }
  ```

#### 17. `GET /api/v1/company/balance`
- **Acesso**: `COMPANY_OWNER`, `ADMIN`
- **Finalidade**: Consulta em tempo real o saldo disponível liberado para saque (`availableBalance`), saldo retido em custódia (`escrowLockedBalance`), total sacado e a data do próximo saque gratuito da plataforma.
- **Resposta (200 OK)**:
  ```json
  {
    "companyId": "uuid-company",
    "businessName": "Barber Shop Vintage",
    "walletId": "wal_1234567890",
    "availableBalance": 720.00,
    "escrowLockedBalance": 100.00,
    "completedNetRevenue": 1220.00,
    "totalWithdrawn": 500.00,
    "nextFreeWithdrawalDate": "2026-08-31T06:00:00.000Z",
    "instantTransferFee": 5.00
  }
  ```

#### 18. `POST /api/v1/company/withdraw`
- **Acesso**: `COMPANY_OWNER`, `ADMIN`
- **Finalidade**: Solicitação de saque avulso sob demanda fora do ciclo semanal gratuito (aplica taxa de transferência bancária Asaas de R$ 5,00).
- **Body** (opcional, se omitido transfere todo o saldo disponível liberado):
  ```json
  {
    "amount": 100.00
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "message": "Saque avulso solicitado com sucesso.",
    "withdrawal": {
      "id": "uuid-transaction",
      "requestedAmount": 100.00,
      "transferFee": 5.00,
      "netAmountTransferred": 95.00,
      "status": "CONFIRMED",
      "transferredAt": "2026-08-23T15:30:00.000Z",
      "remainingAvailableBalance": 620.00,
      "escrowLockedBalance": 100.00
    }
  }
  ```

#### 19. `GET /api/v1/company/withdrawals`
- **Acesso**: `COMPANY_OWNER`, `ADMIN`
- **Finalidade**: Consulta o histórico completo e auditado de saques e transferências da empresa (saques semanais gratuitos e saques avulsos).
- **Resposta (200 OK)**:
  ```json
  [
    {
      "id": "uuid-transaction",
      "requestedAmount": 100.00,
      "transferFee": 5.00,
      "netAmountTransferred": 95.00,
      "status": "CONFIRMED",
      "isFreeWeekly": false,
      "asaasTransferId": "tra_123456",
      "transferredAt": "2026-08-23T15:30:00.000Z"
    }
  ]
  ```

#### 20. `GET /api/v1/company/get-by-user-id`
- **Acesso**: `COMPANY_OWNER`
- **Resposta (200 OK)**: Retorna a empresa do usuário logado.

#### 21. `PATCH /api/v1/company/update/:companyId`
- **Acesso**: `COMPANY_OWNER`
- **Body**: `{ "businessName"?, "providerType"?, "district"?, "street"?, "city"?, "state"?, "zipCode"?, "number"?, "whatsapp"?, "chairsCount"?, "logoPhoto"?, "bannerPhoto"? }`

#### 22. `DELETE /api/v1/company/deactivate/:companyId` & `PATCH /api/v1/company/activate/:companyId`
- **Acesso**: `COMPANY_OWNER`
- **Finalidade**: Desativação/Reativação voluntária do estabelecimento.



---

### 💈 6.4. Catálogo & Grupos de Serviços (`/api/v1/service-group` e `/api/v1/company-service`)

#### 20. `POST /api/v1/service-group/create`
- **Acesso**: `COMPANY_OWNER`
- **Body**:
  ```json
  {
    "name": "Barba Terapia",
    "capacity": 2
  }
  ```
- **Resposta (201 Created)**: `{ "id": "uuid", "name": "Barba Terapia", "capacity": 2 }`

#### 21. `GET /api/v1/service-group`
- **Acesso**: `COMPANY_OWNER`
- **Resposta (200 OK)**: Array com grupos de serviços cadastrados pela barbearia.

#### 22. `PATCH /api/v1/service-group/:id` & `DELETE /api/v1/service-group/:id`
- **Acesso**: `COMPANY_OWNER`
- **Finalidade**: Edição ou desativação de um grupo de serviços.

#### 23. `POST /api/v1/company-service/create`
- **Acesso**: `COMPANY_OWNER`
- **Body**:
  ```json
  {
    "name": "Barboterapia Completa",
    "description": "Toalha quente e óleos essenciais",
    "durationMinutes": 40,
    "totalPrice": 50.00,
    "downPaymentPercent": 50,
    "serviceGroupId": "uuid-service-group"
  }
  ```
  *(Nota: `downPaymentPercent` aceita exclusivamente `25` ou `50`)*.

#### 24. `GET /api/v1/company-service`
- **Acesso**: `COMPANY_OWNER`
- **Resposta (200 OK)**: Array de serviços cadastrados com seus grupos associados.

#### 25. `PATCH /api/v1/company-service/:id` & `DELETE /api/v1/company-service/:id`
- **Acesso**: `COMPANY_OWNER`
- **Finalidade**: Edição de campos ou desativação do serviço.

---

### 🕒 6.5. Expediente & Exceções (`/api/v1/working-hours`)

#### 26. `GET /api/v1/working-hours`
- **Acesso**: `COMPANY_OWNER`
- **Resposta (200 OK)**: Array com a grade semanal da empresa.

#### 27. `PUT /api/v1/working-hours`
- **Acesso**: `COMPANY_OWNER`
- **Body**:
  ```json
  {
    "workingHours": [
      { "dayOfWeek": 0, "startTime": "00:00", "endTime": "00:00", "isClosed": true },
      { "dayOfWeek": 1, "startTime": "09:00", "endTime": "18:00", "lunchStartTime": "12:00", "lunchEndTime": "13:00", "isClosed": false },
      { "dayOfWeek": 2, "startTime": "09:00", "endTime": "18:00", "lunchStartTime": "12:00", "lunchEndTime": "13:00", "isClosed": false },
      { "dayOfWeek": 3, "startTime": "09:00", "endTime": "18:00", "lunchStartTime": "12:00", "lunchEndTime": "13:00", "isClosed": false },
      { "dayOfWeek": 4, "startTime": "09:00", "endTime": "18:00", "lunchStartTime": "12:00", "lunchEndTime": "13:00", "isClosed": false },
      { "dayOfWeek": 5, "startTime": "09:00", "endTime": "19:00", "lunchStartTime": "12:00", "lunchEndTime": "13:00", "isClosed": false },
      { "dayOfWeek": 6, "startTime": "08:00", "endTime": "17:00", "lunchStartTime": null, "lunchEndTime": null, "isClosed": false }
    ]
  }
  ```

#### 28. `GET /api/v1/working-hours/company/:companyId`
- **Acesso**: Público
- **Finalidade**: Consulta pública da grade de funcionamento.

#### 29. `POST /api/v1/working-hours/exceptions`
- **Acesso**: `COMPANY_OWNER`
- **Body**:
  ```json
  {
    "date": "2026-12-25",
    "isClosed": true,
    "description": "Feriado de Natal"
  }
  ```

#### 30. `GET /api/v1/working-hours/exceptions` & `DELETE /api/v1/working-hours/exceptions/:id`
- **Acesso**: `COMPANY_OWNER`
- **Finalidade**: Consulta e remoção de exceções/feriados.

---

### 📅 6.6. Agendamentos & Disponibilidade (`/api/v1/appointments`)

#### 31. `GET /api/v1/appointments/available-slots`
- **Acesso**: Público (Rate limit: 120 req/60s)
- **Query Params**: `?companyId=uuid&serviceId=uuid&date=YYYY-MM-DD`
- **Resposta (200 OK)**:
  ```json
  {
    "date": "2026-08-25",
    "totalAvailable": 6,
    "slots": ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30"]
  }
  ```

#### 32. `POST /api/v1/appointments`
- **Acesso**: `CLIENT`, `COMPANY_OWNER`
- **Body**:
  ```json
  {
    "companyId": "uuid-company",
    "serviceId": "uuid-service",
    "appointmentDate": "2026-08-25T14:00:00.000Z",
    "downPaymentPercent": 50
  }
  ```
- **Resposta (201 Created)**:
  ```json
  {
    "id": "uuid-appointment",
    "companyId": "uuid-company",
    "serviceId": "uuid-service",
    "clientId": "uuid-user",
    "appointmentDate": "2026-08-25T14:00:00.000Z",
    "appointmentEndDate": "2026-08-25T14:30:00.000Z",
    "status": "PENDING_PAYMENT",
    "servicePrice": 50.00,
    "downPaymentAmount": 25.00,
    "platformFeeAmount": 3.75,
    "expiresAt": "2026-08-23T14:45:00.000Z"
  }
  ```

#### 33. `GET /api/v1/appointments/user`
- **Acesso**: `CLIENT`
- **Resposta (200 OK)**: Array com agendamentos do cliente logado com dados do serviço e da empresa.

#### 34. `GET /api/v1/appointments/company`
- **Acesso**: `COMPANY_OWNER`
- **Query Params**: `?status=&startDate=&endDate=`
- **Resposta (200 OK)**: Array com os agendamentos da empresa do dono.

#### 35. `GET /api/v1/appointments/:id`
- **Acesso**: Autenticado (Dono, Cliente ou Admin)
- **Resposta (200 OK)**: Detalhes completos do agendamento, status de pagamento e dados da transação.

#### 36. `PATCH /api/v1/appointments/:id/complete`
- **Acesso**: `COMPANY_OWNER`, `ADMIN`
- **Finalidade**: Conclui o atendimento de forma irreversível.
- **Resposta (200 OK)**: `{ "id": "...", "status": "COMPLETED" }`.

#### 37. `PATCH /api/v1/appointments/:id/status`
- **Acesso**: `COMPANY_OWNER`, `ADMIN`
- **Body**: `{ "status": "COMPLETED" | "CANCELED" }`

#### 38. `DELETE /api/v1/appointments/:id/client`
- **Acesso**: `CLIENT`, `COMPANY_OWNER`
- **Finalidade**: Cancelamento solicitado pelo cliente. Executa **estorno integral** via Asaas se solicitado `> 24h` antes do horário ou **estorno parcial do excedente** ao sinal mínimo de garantia (`guaranteedDepositAmount`) se `<= 24h` (CDC Art. 51 / Código Civil Arts. 417 a 420).
- **Resposta (200 OK)**: `{ "id": "...", "status": "CANCELED", "isActive": false, "disabledAt": "..." }`

#### 39. `DELETE /api/v1/appointments/:id/deactivate`
- **Acesso**: `COMPANY_OWNER`, `ADMIN`
- **Finalidade**: Cancelamento administrativo ou arquivamento de agendamento.

---

### 💳 6.7. Transações Pix & Subcontas (`/api/v1/transactions` e `/api/v1/financial-profile`)

#### 39. `POST /api/v1/transactions/pix/:appointmentId`
- **Acesso**: Autenticado (Rate limit: 10 req/60s)
- **Resposta (201 Created)**:
  ```json
  {
    "paymentId": "pay_1234567890",
    "totalValue": 25.00,
    "qrCodePayload": "00020126580014BR.GOV.BCB.PIX0136...",
    "qrCodeImage": "data:image/png;base64,iVBORw0KGgo...",
    "expirationDate": "2026-08-23T14:45:00.000Z",
    "barberNetValue": 20.26,
    "platformFee": 3.75,
    "asaasFee": 0.99
  }
  ```

#### 40. `POST /api/v1/financial-profile/create`
- **Acesso**: `COMPANY_OWNER`
- **Body (Pessoa Física)**:
  ```json
  {
    "name": "Carlos Alberto",
    "email": "carlos@barbearia.com",
    "cpfCnpj": "12345678901",
    "birthDate": "1990-05-15",
    "mobilePhone": "75999999999",
    "incomeValue": 5000.00,
    "address": "Avenida Getúlio Vargas",
    "addressNumber": "1500",
    "province": "Centro",
    "postalCode": "44001000"
  }
  ```
- **Resposta (201 Created)**: Dados da subconta gerada com `walletId` único.

#### 41. `GET /api/v1/financial-profile/list`
- **Acesso**: `COMPANY_OWNER`
- **Resposta (200 OK)**: Subcontas vinculadas ao proprietário.

#### 42. `GET /api/v1/financial-profile/balance/:id`
- **Acesso**: `COMPANY_OWNER`
- **Resposta (200 OK)**: `{ "balance": 1234.56 }`.

#### 43. `DELETE /api/v1/financial-profile/deactivate/:id` & `PATCH /api/v1/financial-profile/activate/:id`
- **Acesso**: `COMPANY_OWNER`
- **Finalidade**: Desativação ou reativação da subconta bancária.

---

### ☁️ 6.8. Upload de Mídia (`/api/v1/upload`)

#### 44. `POST /api/v1/upload/image`
- **Acesso**: `COMPANY_OWNER`, `ADMIN`
- **Header**: `Content-Type: multipart/form-data`
- **Form Data**:
  - `file`: Arquivo binário (JPEG, PNG ou WEBP, máx. 5MB)
  - `companyId`: UUID da empresa
- **Resposta (201 Created)**:
  ```json
  {
    "url": "https://res.cloudinary.com/sinalizego/image/upload/v1/...",
    "public_id": "sinalizego/uuid-company/logo/abc123xyz"
  }
  ```

---

### 🛡️ 6.9. Super Admin & Platform Intelligence (`/api/v1/admin`)

#### 45. `GET /api/v1/admin/dashboard/metrics`
- **Acesso**: `SUPER_ADMIN`, `ADMIN`
- **Query Params**: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- **Resposta (200 OK)**:
  ```json
  {
    "platformGrossRevenue": 15420.00,
    "totalAsaasPixCosts": 1280.00,
    "platformNetProfit": 14140.00,
    "gmv": 85600.00,
    "growth": {
      "totalCompanies": 42,
      "activeCompanies": 39,
      "inactiveCompanies": 3,
      "totalUsers": 1250,
      "clients": 1180,
      "companyOwners": 70,
      "appointmentsByStatus": {
        "COMPLETED": 1840,
        "CONFIRMED": 95,
        "CANCELED": 64,
        "PENDING_PAYMENT": 18
      }
    },
    "topTenants": [
      {
        "id": "uuid-company",
        "businessName": "Barbearia Imperial",
        "slug": "barbearia-imperial",
        "completedAppointments": 340,
        "totalRevenue": 18500.00,
        "platformFeesGenerated": 2775.00
      }
    ]
  }
  ```

#### 46. `GET /api/v1/admin/companies`
- **Acesso**: `SUPER_ADMIN`, `ADMIN`
- **Query Params**: `?page=1&limit=10&search=termo&status=ACTIVE|INACTIVE|ALL`
- **Resposta (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "uuid-company",
        "businessName": "Barbearia Imperial",
        "slug": "barbearia-imperial",
        "city": "Feira de Santana",
        "state": "BA",
        "isActive": true,
        "createdAt": "2026-06-15T10:00:00.000Z",
        "owner": {
          "id": "uuid-user",
          "name": "Marcos Roberto",
          "email": "marcos@imperial.com",
          "phone": "75988888888"
        },
        "_count": {
          "appointments": 420,
          "services": 12,
          "serviceGroups": 3
        }
      }
    ],
    "meta": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
  ```

#### 47. `PATCH /api/v1/admin/companies/:id/toggle-status`
- **Acesso**: `SUPER_ADMIN`, `ADMIN`
- **Finalidade**: Moderação/Suspensão ou reativação imediata de estabelecimentos.
- **Resposta (200 OK)**: `{ "id": "...", "isActive": false, "disabledAt": "2026-08-23T..." }`.

---

## 7. 🎨 Identidade Visual Institucional (Dark Mode)

- **Fundo Exterior**: `#0B1120`
- **Containers / Cards**: `#0F172A`
- **Cards Internos / Modais / Inputs**: `#1E293B`
- **Destaque / Ação (Teal)**: `#14B8A6` (Hover: `#0D9488`)
- **Alertas / Erros / Cancelamento**: `#EF4444`
- **Textos**: `#F8FAFC` (Principal) e `#94A3B8` (Secundário)
- **Bordas**: `#334155`
- **Tipografia**: `Inter, system-ui, sans-serif`
