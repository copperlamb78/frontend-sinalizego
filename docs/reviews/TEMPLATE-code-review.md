# Code Review: [Nome da Feature]
- **Status:** APPROVED | CHANGES_REQUESTED
- **Módulo:** `src/features/[modulo]`
- **Data:** [YYYY-MM-DD]
- **Revisor:** Reviewer Agent
- **Iteração Atual:** [1/3 | 2/3 | 3/3]

---

## 1. Arquivos Inspecionados
- `src/features/[modulo]/...`
- `src/routes/pages/...`

---

## 2. Checklist de Auditoria Técnica
- [ ] **Arquitetura Vertical Slice:** Respeita isolamento e barreira pública `index.ts`.
- [ ] **Design System Atômico:** Componentes de `src/design-system/ui/` utilizados (zero HTML ad-hoc).
- [ ] **Ações Primárias:** Botões de CTA utilizam `Button variant="primary"` (Teal oficial + texto branco).
- [ ] **Tipagem TypeScript:** Zero uso de `any`; tipagens completas e estritas.
- [ ] **Estética Robusta & Chapada:** Bordas sólidas (1.5px - 2px), cantos secos (`rounded-sm`/`rounded-md`), sombras táteis sem blur difuso.
- [ ] **Testabilidade:** Elementos interativos possuem `data-testid`.
- [ ] **Segurança:** Ausência de `console.log`, dados sensíveis ou `target="_blank"` sem `rel="noopener noreferrer"`.

---

## 3. Apontamentos e Ações Corretivas (se CHANGES_REQUESTED)
| Arquivo | Linha | Problema Identificado | Ação Solicitada |
|---|---|---|---|
| `exemplo.tsx` | L24 | Tag `<button>` nativa | Substituir por `<Button variant="primary">` |

---

## 4. Veredito Final
STATUS: [APPROVED | CHANGES_REQUESTED]
