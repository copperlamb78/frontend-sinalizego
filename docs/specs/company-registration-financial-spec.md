# Especificação Financeira & DoR — FinOps & Frugal DBA

> **Autor:** 💰 FinOps & Frugal DBA  
> **Feature:** Cadastro de Empresa / Barbearia e Segmentação na Página Inicial  
> **Referência:** `docs/specs/company-registration-architecture.md`  
> **Data:** 2026-10-07  
> **Status:** `APPROVED_DOR`  

---

## 1. Validação das Regras Financeiras N1–N7
- [x] **N1–N4 — Split, Escrow e Hold:** A criação da empresa gera o registro `Company` no PostgreSQL vinculado ao `COMPANY_OWNER`. Este registro é o pré-requisito para posterior ativação de subconta Asaas e divisão de splits.
- [x] **N5 — Zero-Trust Financeiro:** Nenhuma taxa arbitrária ou percentual financeiro é enviado pelo frontend na criação da empresa. O backend utiliza valores padrão seguros da plataforma.

---

## 2. Auditoria Frugal de Banco de Dados (Prisma/PostgreSQL)
- [x] **Zero Poluição:** Reutilização estrita da transação existente no NestJS (`this.prisma.user.create` com relação aninhada `companies.create`).
- [x] **Projeção e Segurança:** Hash da senha via bcrypt (10 rounds) e devolução sanitizada de dados, sem vazamento do hash de senha.

---

## 3. Veredito de DoR
- **STATUS:** `APPROVED_DOR` (Liberado para implementação pelo Desenvolvedor).
