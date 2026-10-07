# Especificação Arquitetural & DoR Técnico — Autenticação (Login e Cadastro)

> **Autor:** 🏛️ Principal Engineer & Tech Lead (com PM)  
> **Feature:** Autenticação: Página de Login, Cadastro de Clientes e Integração com Backend  
> **Data:** 2026-10-07  
> **Status:** `READY_FOR_FINOPS`  

---

## 1. Visão Geral & Objetivo de Negócio
- **Descrição da Demanda:** Implementação da tela de Login e tela de Cadastro (registro de novos usuários/clientes) no frontend React 19 integrado à API NestJS existente, permitindo autenticação via JWT, persistência segura da sessão e feedback visual de qualidade padrão Big Tech.
- **Público-Alvo:** Clientes finais do agendamento, donos de barbearia e prestadores de serviço do ecossistema SinalizeGO.
- **Camadas Impactadas:** 
  - `api-sinalizego/`: Verificação e consumo dos endpoints existentes de autenticação e criação de usuário.
  - `frontend-sinalizego/`: Rotas `/login` e `/cadastro`, contexto de autenticação (`AuthContext`), formulários com React Hook Form + Zod, consumo via `apiClient` e integração com o Design System oficial.

---

## 2. Verificação Prévia na API (`api-sinalizego/`)
- [x] Inspecionados controllers, DTOs e Prisma schema em `src/modules/auth/` e `src/modules/users/`.
- **Endpoints Existentes Utilizados:**
  1. `POST /api/v1/auth/login`: Autentica com e-mail e senha, retornando `access_token`, `refresh_token` e objeto `user`.
  2. `POST /api/v1/users/create`: Registra novos usuários com `name`, `email`, `password`, `phone`.
  3. `GET /api/v1/auth/me`: Retorna perfil do usuário logado baseado no Bearer JWT.
  4. `POST /api/v1/auth/logout`: Revoga a sessão ativa no backend.
- **Novos Endpoints Necessários:** Nenhum. A API já possui a estrutura completa e testada.

---

## 3. Contratos de API & DTOs

### 3.1 Rota: `POST /api/v1/auth/login`
- **Request Body (JSON):**
```json
{
  "email": "cliente@exemplo.com",
  "password": "senhaSegura123"
}
```
- **Response 201 (JSON):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "clsw0s2b0003138mg1wmg1wmg1",
    "name": "João Silva",
    "email": "cliente@exemplo.com",
    "phone": "5511999999999",
    "role": "CLIENT",
    "cpfCnpj": null,
    "mustChangePassword": false
  }
}
```
- **Respostas de Erro:** `401 Unauthorized` ("Credenciais inválidas"), `429 Too Many Requests`.

### 3.2 Rota: `POST /api/v1/users/create`
- **Request Body (JSON):**
```json
{
  "name": "Maria Oliveira",
  "email": "maria@exemplo.com",
  "password": "senhaSegura123",
  "phone": "5511999999999"
}
```
- **Response 201 (JSON):**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid-aqui",
    "name": "Maria Oliveira",
    "email": "maria@exemplo.com",
    "phone": "5511999999999",
    "role": "CLIENT",
    "createdAt": "2026-10-07T18:00:00.000Z",
    "isActive": true
  }
}
```
- **Respostas de Erro:** `400 Bad Request` (validação de formato), `409 Conflict` ("Não foi possível concluir o cadastro com os dados informados."), `429 Too Many Requests`.

---

## 4. Critérios de Aceite Gherkin

```gherkin
Cenário: Login bem-sucedido com credenciais válidas
  Dado que o usuário está na página "/login"
  Quando ele preenche o e-mail cadastrado e a senha correta
  E clica no botão "Acessar Conta"
  Então a requisição "POST /api/v1/auth/login" é disparada
  E os tokens e perfil do usuário são armazenados no LocalStorage
  E o usuário é redirecionado para a página inicial ou rota de retorno com notificação de sucesso.

Cenário: Falha de autenticação com credenciais incorretas
  Dado que o usuário está na página "/login"
  Quando ele informa credenciais incorretas
  E clica no botão "Acessar Conta"
  Então uma mensagem amigável de erro ("Credenciais inválidas. Verifique seu e-mail e senha.") é exibida
  E nenhum token é armazenado.

Cenário: Cadastro bem-sucedido de novo cliente
  Dado que o usuário está na página "/cadastro"
  Quando ele preenche nome completo, e-mail válido, telefone com DDD e senha com no mínimo 6 caracteres
  E clica no botão "Criar Minha Conta"
  Então a requisição "POST /api/v1/users/create" é disparada com sucesso
  E a plataforma realiza o auto-login ou redireciona para "/login" com feedback visual de boas-vindas.

Cenário: Tentativa de cadastro com e-mail já existente (Conflito 409)
  Dado que o usuário tenta cadastrar um e-mail já registrado
  Quando a API responde status 409
  Então a interface exibe feedback claro indicando que os dados já estão em uso.
```

---

## 5. Governança Zero-Trust & UX Guardrails
- **Armazenamento Seguro:** `access_token` persistido sob chave `@sinalizego:token` respeitando interceptor do Axios.
- **Fail-Closed:** Se a API cair ou retornar 401 na validação de sessão (`/me`), a sessão local é expurgada de forma limpa.
- **Design System:** Utilização exclusiva de componentes `Input`, `Button`, `Card`, `Badge`, `FadeIn` e `toast` da Sonner.
- **Acessibilidade:** Suporte a navegação por teclado, rótulos explícitos e touch targets mobile >= 44x44px.
