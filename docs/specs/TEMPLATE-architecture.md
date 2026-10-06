# Arquitetura & Especificação: [Nome da Feature]
- **Status:** READY_FOR_FINOPS
- **Módulo:** `src/features/[modulo]`
- **Data:** [YYYY-MM-DD]
- **Autor:** Principal Engineer (com PM)

---

## 1. Histórias de Usuário & Critérios de Aceite
- **História:** Como [cliente / barbeiro], quero [realizar uma ação] para que [obter um resultado].
- **Critério 1 (Gherkin):**
  - *Dado que* [condição inicial]
  - *Quando* [ação do usuário]
  - *Então* [resultado esperado na tela]

---

## 2. Contrato de API (Source of Truth - NestJS)
- **Endpoint:** `[GET/POST/PUT/DELETE] /api/v1/[recurso]`
- **Autenticação:** [Bearer Token / Pública]
- **Payload de Entrada (DTO):**
```json
{
  "campoExemplo": "valor"
}
```
- **Respostas Esperadas:**
  - `200/201 OK`: [Payload esperado]
  - `400 Bad Request`: [Erro de validação]
  - `409 Conflict`: [Conflito de vaga ou recurso]

---

## 3. Schemas de Validação (Zod)
- Schema: `[nome]Schema`
- Validações: campos obrigatórios, formatos e mensagens humanizadas de erro.

---

## 4. Estrutura de Arquivos Planejada (Vertical Slice)
```text
src/features/[modulo]/
├── components/
│   └── [NomeComponente].tsx
├── hooks/
│   └── use[NomeHook].ts
├── schemas/
│   └── [nome].schema.ts
├── services/
│   └── [nome]Service.ts
├── types/
│   └── [nome].types.ts
└── index.ts
```

---

## 5. Diretrizes de Segurança & Edge Cases
- Proteção contra IDOR e sanitização de entradas.
- Comportamento em offline ou lentidão de rede.
