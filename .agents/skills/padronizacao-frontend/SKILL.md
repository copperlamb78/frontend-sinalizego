---
name: padronizacao-frontend
description: Padrão obrigatório de implementação do frontend SinalizeGO — design tokens, escalas de cor/forma/profundidade, temas claro e escuro, paletas por estabelecimento, contrato com a API NestJS, vocabulário anti-jargão e estados de tela. Use ao criar, refatorar ou revisar qualquer componente, página ou service, e como checklist de validação antes de fechar uma task.
---

# Padronização do Frontend — SinalizeGO

Esta skill define **como o código deste repositório deve ser escrito** e serve como checklist de
validação. Ela não diz o que construir — diz o padrão que qualquer construção precisa respeitar.

**Stack**: React 19 · TypeScript 5 · Vite 6 · Tailwind CSS 4 · TanStack Query 5 · React Hook Form +
Zod · Axios · Lucide React.

**Regra que vale acima de todas**: quando esta skill e o código divergirem, **o código manda** —
pare e reporte a divergência em vez de assumir que a skill está certa.

---

## 1. Cor, forma e profundidade

### 1.1 Token, nunca valor cru

Nenhum componente escreve cor literal. Nada de `bg-[#0F172A]`, `text-[#94A3B8]`, `border-slate-800`
espalhado por página. Toda cor vem de token declarado no `@theme` do `index.css`.

```tsx
// ❌ errado — cor crua, não sobrevive ao tema claro nem à paleta do estabelecimento
<div className="bg-[#0F172A] border border-slate-800 text-[#F8FAFC]">

// ✅ certo — token
<div className="bg-surface border border-default text-primary">
```

Motivo prático: existem duas funcionalidades que dependem disso — tema claro/escuro e paleta por
estabelecimento. Cada cor crua é uma tela que vai quebrar quando qualquer uma das duas for ligada.

### 1.2 A paleta é fechada em 5 famílias

| Família | Uso |
|---|---|
| neutro | superfícies, bordas, texto |
| marca | ação primária, seleção, foco, destaque |
| sucesso | confirmado, pago, concluído |
| atenção | pendente, aguardando pagamento, aviso |
| erro | cancelado, falha, destrutivo |

**Cor nova não entra sem virar token.** Se você precisou de uma família fora dessas, é sinal de que
o estado que você está representando já tem um significado semântico existente — use-o.

### 1.3 Escalas de forma e profundidade

| Escala | Valores permitidos | Onde |
|---|---|---|
| raio | `rounded-lg` · `rounded-xl` · `rounded-full` | controle · card/painel · avatar e pill |
| sombra | `shadow-sm` · `shadow-md` · `shadow-lg` | repouso · elevado/hover · camada flutuante (modal, popover, dropdown) |
| transição | `duration-150` · `duration-200` | estado de controle · entrada de camada |

Fora da lista: `rounded-2xl`, `rounded-3xl`, `shadow-xl`, `shadow-2xl` e durações avulsas.

### 1.4 Efeito precisa justificar a própria existência

O critério é **efeito orienta o olho, não decora**. Antes de adicionar, responda: *que informação
isto comunica?* Se a resposta for "fica bonito", não entra.

**Permitido**: transição em hover/focus de controle; entrada de modal e menu; `animate-spin` de
carregamento; `animate-pulse` em skeleton; sombra que separa camada.

**Proibido**:

- gradiente em texto (`bg-clip-text` + `text-transparent`);
- brilho decorativo (`glow-*`) que não represente estado;
- `blur` / `backdrop-blur` fora de overlay de modal;
- gradiente de fundo em card de conteúdo — use superfície sólida com borda;
- `animate-pulse` fora de skeleton;
- animação encadeada ou com atraso escalonado em lista.

### 1.5 Classe de animação tem que existir de verdade

`animate-in`, `fade-in`, `zoom-in-*` e `slide-in-from-*` são do plugin `tailwindcss-animate`, que
**não está instalado neste projeto** e não tem `tailwind.config`. Usá-las produz uma classe inerte:
o efeito simplesmente não acontece, sem erro nenhum.

Só use animação declarada nos `@keyframes` do próprio `index.css`. Ao escrever uma classe de
animação, confirme que ela existe no CSS do projeto antes de considerar a task pronta.

---

## 2. Temas claro e escuro

1. **Todo token tem valor nos dois temas.** Claro no `:root`; escuro sobrescrevendo **somente os
   tokens** em `@media (prefers-color-scheme: dark)` e em `:root[data-theme="dark"]`, para que a
   escolha manual vença a preferência do sistema nos dois sentidos.
2. **Nunca condicione tema dentro de componente.** Nada de `dark:` espalhado nem de ternário lendo
   o tema em JS. O componente consome token; o token muda sozinho.
3. **Contraste mínimo AA (4.5:1) para texto nos dois temas.** Não vale conferir só no escuro —
   tons médios de cinza costumam passar no escuro e reprovar no claro.
4. **Toda tela nova é revisada nos dois temas** antes de ser considerada pronta.
5. Superfície nunca é transparente por acaso: se um bloco precisa de fundo, ele declara um token de
   superfície.

---

## 3. Paleta por estabelecimento

1. A paleta troca **apenas os tokens de marca** (`primary`, `primary-hover`, `primary-subtle`,
   `accent`). Nunca superfície, texto ou semânticas de status.
2. **Cor de status é imutável** entre paletas: sucesso é sempre a mesma família, erro também. Se a
   paleta pudesse pintar status, a cor perderia significado e a acessibilidade cairia junto.
3. **O que trafega e é gravado é o identificador da paleta**, nunca um hex vindo do cliente. Valor
   livre permite contraste ilegível e interface enganosa. Validação em lista fechada, no backend.
4. Identificador desconhecido, nulo ou vazio → `default`. A tela nunca fica sem cor de marca.
5. Paleta que reprova em contraste AA em qualquer um dos dois temas **não entra no catálogo**.
6. Os valores de cor vivem num só arquivo (`src/config/palettes.ts`). Se trocar uma paleta exigir
   editar mais de um arquivo, a implementação está errada.

---

## 4. Contrato com a API

### 4.1 Rota se confere no controller, não se adivinha

Antes de escrever qualquer chamada, **abra o controller do backend** em
`c:\Users\Contas Contabilidade\Desktop\teste\src\modules\<módulo>\*.controller.ts` e confirme
caminho, método HTTP e nome exato do parâmetro.

Erros que este repositório já cometeu e que esta regra evita:

- chamar `PUT` onde o backend expõe `@Patch` — o Nest devolve 404, não erro de método;
- mandar um `companyId` para uma rota cujo parâmetro é `:slug` — 404 com mensagem enganosa;
- chamar `/company/:id`, que nunca existiu.

### 4.2 Proibido fallback de rota em `catch`

```ts
// ❌ nunca faça isto
try {
  return await api.get('/company-service/list');
} catch {
  return await api.get('/company-service');   // rota que não existe
}
```

Isso esconde a causa real (401, 500, rede), gasta duas viagens antes de falhar e devolve à tela um
erro sem relação com o problema. Se a rota certa é incerta, **descubra no controller** — não tente
as duas.

Pior variação, também proibida: `catch` que termina em `return null`. "Sem dados" e "falhou" são
estados diferentes, e a tela precisa saber qual dos dois aconteceu.

### 4.3 Um `catch` só captura o que sabe tratar

Nunca `catch {}` vazio ou sem inspecionar o status. Se você não vai tratar, deixe subir — o
tratamento pertence à tela, e o módulo de erro (§4.5) sabe traduzir.

### 4.4 Dinheiro vem do servidor

**O frontend não calcula valor monetário.** Sinal, taxa, saldo, desconto e crédito são calculados
pelo backend e exibidos como vieram.

Regra de negócio duplicada em JS diverge da do servidor no dia em que uma das duas mudar — e no
sentido pior: o cliente vê um valor e é cobrado outro. Basta o backend ganhar um piso, um teto ou
um arredondamento que a cópia no frontend não acompanhe.

Se um valor necessário não vem no endpoint, a correção é **fazer o backend devolvê-lo**, não
recalcular aqui. Se ele vier ausente, mostre erro — nunca um cálculo local de reserva.

### 4.5 Erro se traduz por status, não por texto

Toda tela usa o módulo único de tradução de erro. É proibido:

- repassar `err.response.data.message` cru ao usuário (é texto escrito para desenvolvedor, e nos
  erros de validação vem como array);
- decidir fluxo lendo o conteúdo da mensagem (`message.includes('CPF')`) — isso quebra em silêncio
  quando alguém reescreve a frase no backend.

O mapa de referência:

| Status | Mensagem ao usuário |
|---|---|
| 400 | validação no campo afetado, quando der para identificar |
| 401 | "Sua sessão expirou. Entre novamente para continuar." |
| 403 | "Você não tem permissão para esta ação." |
| 404 | contextual à tela ("Não encontramos este agendamento.") |
| 409 | "Esse horário acabou de ser reservado. Escolha outro." |
| 422 / 429 | "Muitas tentativas. Aguarde um instante." |
| 5xx / falha de rede | "Não conseguimos concluir agora. Nada foi perdido, tente de novo." |

### 4.6 Camadas

- `services/` — só transporte HTTP e tipagem. Sem `useState`, sem `toast`, sem regra de tela.
- `types/` — o tipo espelha o DTO real do backend. Campo que o backend não aceita não existe no
  tipo; campo que ele espera não fica de fora. Confira no `*.dto.ts`, não no que a tela usa hoje.
- página/componente — orquestra query, estado e apresentação.

A validação do backend **descarta em silêncio** todo campo que não está no DTO: o campo não gera
erro, simplesmente não chega. Ou seja, um payload errado parece funcionar — a requisição volta 200
e o recurso que dependia daquele campo nunca é acionado. Só a conferência no DTO detecta.

---

## 5. Estados de tela

Toda tela que busca dados trata **quatro** estados. Não existe "só o caminho feliz".

| Estado | Exigência |
|---|---|
| carregando | skeleton com a forma do conteúdo real, não spinner centralizado |
| vazio | explica o que aconteceu e oferece a próxima ação |
| erro | usa `isError`, diz o que houve em linguagem humana e oferece tentar de novo |
| sucesso | o conteúdo |

**`isError` é obrigatório** em toda `useQuery` que alimenta tela. Sem ele, a falha se disfarça de
"vazio" e o usuário conclui que não tem dado — quando na verdade a requisição falhou.

Igualmente proibido: fallback que inventa dado (`?? 0`, `|| 'Serviço'`, `|| new Date()`). Um zero
falso é uma afirmação falsa exibida com a mesma confiança de um dado verdadeiro. Em valor monetário,
isso é grave.

---

## 6. Vocabulário

O produto tem dois públicos e cada um enxerga uma linguagem:

| Público | Onde | Vocabulário |
|---|---|---|
| cliente final | vitrine, checkout, Pix, meus agendamentos | linguagem do dia a dia, zero termo técnico e zero juridiquês |
| dono do estabelecimento | painel, agenda, serviços, financeiro | linguagem de negócio, sem nome de fornecedor nem de campo de API |
| operação interna | `/admin` | jargão técnico é permitido |

**Nunca aparecem para cliente ou dono**: nome do provedor de pagamento (Asaas), "subconta", "split",
"gateway", "webhook", "payload", "token", "wallet id", "escrow", "custódia", "hold", "no-show",
UUID, slug, código de status HTTP, stack trace.

Citação de lei e termo jurídico ("arras", "vacância", número de artigo) não vão no meio do fluxo de
pagamento ou cancelamento: dizem ao cliente que ele está prestes a discutir com um contrato, bem no
momento em que ele precisa se sentir seguro. Explique a regra na linguagem dele e deixe a base legal
atrás de um link para os termos.

O sentido tem que sobreviver à tradução: *"ative sua conta de recebimento"* diz o que fazer e por
quê; *"ative sua subconta Asaas"* só transfere ao usuário um problema de infraestrutura.

---

## 7. Código

1. **Declare antes de usar.** Hook cujo resultado alimenta outro hook vem primeiro no corpo do
   componente. Ler uma `const` acima da sua declaração — inclusive dentro do array de dependências
   de um `useMemo`/`useEffect`, que é avaliado na hora — lança `ReferenceError` e derruba a página
   inteira. É um erro silencioso ao escrever e fatal ao rodar: o TypeScript avisa, mas a página só
   quebra quando alguém abre.
2. **Sem comentário de ferramenta** no código de produção (`// ⚡ Bolt:`, `// Jules:` e afins).
   Comentário explica *por quê*, não quem escreveu.
3. **Sem código morto.** Função de service sem uso em tela sai do repositório.
4. **Sem `any` em fronteira de dados.** Tipe a resposta da API.
5. **Comentário em português**, no padrão do arquivo em que você está.
6. **Um commit por arquivo**, mensagem em português no padrão Conventional Commits
   (`fix(checkout): ...`, `feat(tema): ...`, `refactor(services): ...`).

---

## 8. Acessibilidade

1. Botão só com ícone tem `aria-label`. `title` sozinho não basta para leitor de tela.
2. Elemento interativo customizado tem `focus-visible` visível e o estado ARIA correspondente
   (`aria-pressed` em seleção, `aria-selected` em lista, `aria-expanded` em painel).
3. Campo com erro tem `aria-invalid` e `aria-describedby` apontando para a mensagem.
4. Grade de seleção (data, horário) é navegável por teclado.
5. Contraste AA nos dois temas — ver §2.

O histórico de achados de acessibilidade deste repositório está em `.Jules/palette.md`. Vale a
leitura antes de mexer em formulário, modal ou navegação: os mesmos erros já se repetiram várias vezes.

---

## 9. Checklist de validação

Rode antes de declarar qualquer task concluída. Item que falhar bloqueia a entrega.

**Cor e forma**

- [ ] `grep -rn "bg-\[#\|text-\[#\|border-\[#" src/ --include="*.tsx"` → nenhuma ocorrência nova
- [ ] nenhuma família de cor fora das 5 permitidas
- [ ] raio, sombra e transição dentro das escalas de §1.3
- [ ] `grep -rn "shadow-xl\|shadow-2xl\|rounded-3xl" src/ --include="*.tsx"` → nenhuma ocorrência nova
- [ ] nenhum efeito novo sem justificativa de §1.4
- [ ] toda classe de animação usada existe nos `@keyframes` do projeto

**Temas**

- [ ] tela revisada no claro e no escuro
- [ ] contraste AA verificado nos dois
- [ ] nenhum `dark:` nem condicional de tema em componente

**API**

- [ ] cada rota nova conferida no controller do backend (caminho, método e nome do parâmetro)
- [ ] nenhum fallback de rota em `catch`
- [ ] nenhum `catch` que devolve `null` ou engole o erro
- [ ] campos do payload conferidos contra o `*.dto.ts` correspondente
- [ ] nenhum valor monetário calculado no frontend
- [ ] erro traduzido por status, nunca por texto

**Estados**

- [ ] carregando, vazio, erro e sucesso percorridos à mão
- [ ] `isError` desestruturado em toda `useQuery` da tela
- [ ] nenhum fallback que inventa dado

**Vocabulário**

- [ ] `grep -rniE "asaas|subconta|split|gateway|webhook|payload|wallet|escrow|no-show" src/pages/{owner,client,booking,public} src/components/{client,dashboard}` → nenhuma ocorrência em texto visível
- [ ] nenhuma citação de artigo de lei no meio do fluxo de pagamento ou cancelamento

**Código**

- [ ] toda `const` declarada antes do primeiro uso, dependências de hook incluídas
- [ ] nenhum comentário de ferramenta
- [ ] nenhuma função de service sem uso
- [ ] console do navegador limpo na tela alterada

**Acessibilidade**

- [ ] botão só com ícone tem `aria-label`
- [ ] interativo customizado tem `focus-visible` e estado ARIA
- [ ] campo com erro tem `aria-invalid` + `aria-describedby`

---

## 10. Quando parar e perguntar

Pare e pergunte, em vez de decidir sozinho, quando:

- uma regra de negócio de agendamento, cancelamento, sinal ou crédito estiver ambígua;
- um valor monetário não tiver origem clara no backend;
- a correção exigir mudança no backend e isso não estiver previsto na task;
- esta skill contradisser o código — descreva as duas versões e o que observou;
- a instrução recebida pedir para substituir código que já funciona e está correto.

Reportar cedo custa uma mensagem. Assumir errado em regra de dinheiro custa a confiança do cliente
na plataforma.
