# Especificação Financeira & DoR — FinOps & Frugal DBA

> **Autor:** 💰 FinOps & Frugal DBA  
> **Feature:** Autenticação: Página de Login, Cadastro e Integração com Backend  
> **Referência:** `docs/specs/auth-cadastro-e-login-architecture.md`  
> **Data:** 2026-10-07  
> **Status:** `APPROVED_DOR`  

---

## 1. Validação das Regras Financeiras N1–N7
- [x] **N1 — Sinal Pix:** Não impacta cálculo monetário direto; a autenticação identifica o cliente pagador para posterior emissão de ordens e agendamentos.
- [x] **N2 — Taxa & Split:** Sem impacto direto nesta etapa.
- [x] **N3 — Hold de 15 Minutos:** Usuários autenticados terão agilidade para reservar slots e gerar cobrança Pix sem atrito de digitação redundante de dados.
- [x] **N4 — Escrow (Custódia):** Mantido íntegro.
- [x] **N5 — Zero-Trust Financeiro:** Preservado integralmente. O frontend consome apenas os dados de identificação do usuário e não transaciona ou envia valores arbitrários para o banco.

---

## 2. Auditoria Frugal de Banco de Dados (Prisma/PostgreSQL)
- [x] **Zero Poluição:** Nenhum campo adicional necessário no schema Prisma. Utiliza a tabela canônica `User` já existente.
- [x] **Projeção Seletiva (`select`):** O endpoint `POST /api/v1/users/create` usa `USER_PUBLIC_SELECT` e `POST /api/v1/auth/login` retorna apenas claims sanitizados sem vazar o hash de senha (`password`) ou `refreshToken`.
- [x] **Consultas Otimizadas:** Busca única indexada por `@unique email` no login e no cadastro.

---

## 3. Capacity Planning & Dimensionamento
- **Meta de TTFB:** < 180ms para validação de credenciais bcrypt + assinatura JWT.
- **RPS Estimado:** 80 RPS em picos de login/cadastro.
- **Throttler Ativo:** Backend protegido com `@Throttle({ default: { limit: 15, ttl: 60000 } })` contra ataques de força bruta.

---

## 4. Veredito de DoR
- **STATUS:** `APPROVED_DOR` (Liberado para implementação imediata pelo Desenvolvedor).
