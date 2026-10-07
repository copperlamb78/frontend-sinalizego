# Especificação Arquitetural & DoR — Cadastro de Estabelecimento (Empresa)

> **Autor:** 🏛️ Principal Engineer & Tech Lead (com PM)  
> **Feature:** Cadastro de Empresa / Barbearia e Segmentação na Página Inicial  
> **Data:** 2026-10-07  
> **Status:** `READY_FOR_FINOPS`  

---

## 1. Visão Geral & Objetivo de Negócio
- **Descrição da Demanda:** Disponibilizar fluxo dedicado de cadastro para estabelecimentos (barbearias, salões de beleza, estúdios), permitindo a criação simultânea da conta de proprietário (`COMPANY_OWNER`) e dos dados de negócio/endereço, integrado à API NestJS existente.
- **Segmentação na Página Inicial:**
  - Hero e Header com CTAs claros separando a jornada de Clientes e Estabelecimentos.
  - Tela de cadastro com abas de alternância de perfil: `"Sou Cliente (Para Você)"` vs `"Sou Empresa (Para seu Negócio)"`.
- **Camadas Impactadas:**
  - `api-sinalizego/`: Consumo do endpoint público `POST /api/v1/company/create`.
  - `frontend-sinalizego/`: Rotas `/cadastro/empresa`, formulário em etapas ou seções organizadas (`RegisterCompanyForm`), abas na página de cadastro e CTAs na Home/Header.

---

## 2. Verificação Prévia na API (`api-sinalizego/`)
- [x] Inspecionado `src/modules/company/company.controller.ts` e `dto/company-create.dto.ts`.
- **Endpoint Utilizado:** `POST /api/v1/company/create`
- **Contrato de Request (JSON):**
```json
{
  "name": "Carlos Alberto",
  "email": "carlos@barbershop.com",
  "password": "senhaSegura123",
  "phone": "75999999999",
  "providerType": "Barbearia",
  "businessName": "Barber's Club",
  "zipCode": "44085370",
  "street": "Artemia Pires Freitas",
  "number": "123",
  "district": "SIM",
  "city": "Feira de Santana",
  "state": "Bahia",
  "referralCode": "XYZ12345"
}
```
- **Contrato de Response 201 (JSON):**
```json
{
  "message": "Empresa criada com sucesso",
  "user": {
    "id": "uuid",
    "name": "Carlos Alberto",
    "email": "carlos@barbershop.com",
    "role": "COMPANY_OWNER",
    "companies": [{ "id": "uuid", "businessName": "Barber's Club", "slug": "barbers-club" }]
  },
  "access_token": "jwt...",
  "refresh_token": "jwt..."
}
```

---

## 3. Critérios de Aceite Gherkin

```gherkin
Cenário: Cadastro de estabelecimento com sucesso
  Dado que o usuário proprietário está na página "/cadastro/empresa"
  Quando preenche os dados do responsável (nome, e-mail, telefone, senha)
  E preenche os dados do estabelecimento (nome fantasia, tipo de serviço, endereço)
  E clica em "Cadastrar Estabelecimento"
  Então a requisição "POST /api/v1/company/create" é executada
  E os tokens e dados do usuário são salvos no LocalStorage
  E o usuário é autenticado e redirecionado com feedback de sucesso.

Cenário: Alternância entre abas de cadastro
  Dado que o usuário está na tela de cadastro
  Quando ele clica na aba "Sou Empresa"
  Então os campos específicos de negócio e endereço são apresentados sem recarregar a página.
```
