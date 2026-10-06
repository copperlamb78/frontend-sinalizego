---
name: validacao-repaginacao
description: Protocolo de validação da repaginação do frontend SinalizeGO — prova que cada bloco entregue funciona de verdade, cobrindo o bug da vitrine, o contrato com a API NestJS, os valores de sinal e taxa, os design tokens, os temas claro e escuro, as paletas por estabelecimento, o vocabulário e a performance. Use ao final de cada bloco e antes de declarar a repaginação concluída, e para montar o relatório de entrega.
---

# Validação da Repaginação — SinalizeGO Frontend

Esta skill responde a uma pergunta só: **como provar que a repaginação funciona?**

Ela não repete o que já existe. Para responsividade, estados de formulário e teste humanizado, use
`frontend-page-testing`. Para arquitetura de testes E2E, use `playwright-e2e-testing`. Aqui está o
que é específico da repaginação — e a maior parte não se prova com teste automatizado, se prova
abrindo a tela e conferindo.

**Regra de ouro**: `npm run build` passar **não é validação, é compilação**. Um valor monetário
errado, um texto com jargão e um tema claro ilegível compilam perfeitamente.

---

## 0. Antes de validar qualquer coisa

```bash
# frontend
npm install
npm run build          # tem que passar limpo; erro de tipo aqui bloqueia a entrega
npm run dev

# backend, em outro terminal
npm run start:dev
```

Sem o backend rodando, quase nada desta skill pode ser verificado — metade das provas depende de
comparar o que a tela mostra com o que o servidor responde.

**Registre o ponto de partida.** Antes de mexer em qualquer coisa, anote os números que você vai
comparar depois: contagens do §5, tempos do §7 e o estado das telas. Validação sem "antes" só
consegue dizer que algo existe, não que melhorou.

---

## 1. Bloco 0 — a vitrine volta a renderizar

Esta é a primeira e a mais simples: **a página abre ou não abre.**

| Passo | Resultado esperado |
|---|---|
| abrir `/empresa/<slug>` de uma empresa real | página renderiza inteira |
| console do navegador | **zero erro** — em especial nenhum `ReferenceError` |
| abrir deslogado | renderiza; o bloco de crédito simplesmente não aparece |
| abrir logado, com crédito naquela empresa | renderiza e o crédito aparece |
| abrir logado, sem crédito naquela empresa | renderiza sem crédito, sem quebrar |

Os quatro últimos casos importam porque o bug estava justamente no cruzamento entre os dados da
empresa e os créditos do cliente. Testar só logado esconde metade dos caminhos.

**Prova de regressão**: vale escrever um teste E2E que abre a vitrine e falha se houver erro no
console. É barato e trava o retorno do bug.

```ts
const erros: string[] = [];
page.on('pageerror', (e) => erros.push(e.message));
await page.goto('/empresa/<slug>');
await expect(page.getByRole('heading')).toBeVisible();
expect(erros).toEqual([]);
```

---

## 2. Contrato com a API

### 2.1 Nenhuma rota inventada sobrou

```bash
# lista todas as chamadas do frontend
grep -rnE "api\.(get|post|put|patch|delete)" src/services/
```

Para **cada linha** do resultado, abra o controller correspondente no backend e confirme caminho,
método HTTP e nome do parâmetro. Não confie na memória nem no comentário acima da função — os
comentários deste repositório já descreviam rotas que não existiam.

```bash
# e nenhum fallback de rota pode ter sobrado
grep -rn -B3 -A6 "catch" src/services/
```

Nenhum `catch` pode conter uma segunda chamada `api.*`. Nenhum pode terminar em `return null`.

### 2.2 As rotas corrigidas funcionam de verdade

| O que testar | Como | Esperado |
|---|---|---|
| empresa por id | abrir a página de reserva e **dar F5** | carrega — sem o F5, a tela usa os dados da navegação e a rota nem é chamada |
| empresa por slug | abrir a vitrine direto pela URL | carrega |
| editar categoria de serviço | painel → serviços → renomear uma categoria → salvar | salva e persiste após F5 |
| criar, editar e desativar serviço | o ciclo completo no painel | cada passo confirma na tela e persiste após F5 |

**F5 é obrigatório em todo teste de rota.** Muita coisa aqui funciona só porque a tela anterior
passou os dados pelo `state` da navegação; recarregar é o que revela a chamada real.

### 2.3 O erro chega traduzido

Force cada caso e confira o que o usuário lê. Com o backend parado, ou com o DevTools → Network →
*Offline*, ou bloqueando a rota:

| Situação | Não pode aparecer | Tem que aparecer |
|---|---|---|
| sessão expirada (401) | "Unauthorized", "401" | aviso de sessão em linguagem humana |
| horário já reservado (409) | mensagem crua do servidor | "esse horário acabou de ser reservado…" |
| erro do servidor (500) | stack trace, nome de exceção | mensagem de tentar de novo |
| rede fora | "Network Error", "timeout" | mensagem de conexão |
| validação (400) | array emendado por vírgula | erro no campo afetado |

E confirme que **nenhuma decisão de fluxo lê o texto da mensagem**:

```bash
grep -rn "message.includes\|message.indexOf\|\.message ===" src/
```

---

## 3. Dinheiro — a validação mais importante

Um erro aqui não é bug de interface: é o cliente vendo um preço e pagando outro.

### 3.1 O frontend não calcula mais

```bash
# não pode haver aritmética de dinheiro nas telas
grep -rnE "\* *0\.[0-9]|/ *100|Math\.(ceil|floor|round).*(price|Price|fee|Fee|deposit|amount)" src/pages/ src/components/
```

O que sobrar precisa ser formatação (centavos → reais para exibir), nunca cálculo de valor.

### 3.2 A tabela de conferência

Cadastre estes serviços e percorra o checkout de cada um. **O valor exibido tem que ser
exatamente o valor cobrado no Pix gerado** — compare com a resposta do servidor no DevTools →
Network, não com o que você espera.

| Preço do serviço | Por que este caso | Confira |
|---|---|---|
| R$ 10,00 | abaixo do piso de microtransação | cobra 100% |
| **R$ 20,00** | **o caso mais sensível**: 50% do preço fica abaixo do piso | o piso prevalece sobre o percentual |
| R$ 29,99 | limite superior da faixa quebrada | sinal com o piso aplicado |
| R$ 30,00 | primeiro valor em que 50% supera o piso | sinal de R$ 15,00 pela regra normal |
| R$ 100,00 | caso comum | sinal de 50% |
| R$ 400,00 com sinal 30% | regra de alto ticket | sinal de 30% |
| R$ 400,00 com sinal 50% | alto ticket na regra padrão | sinal de 50% |

Para cada linha, confira **três** números, não um: o sinal, a taxa de conveniência e o total do
Pix. A taxa é calculada sobre o sinal — se o sinal errar, ela erra junto e o total esconde as duas.

E confira o valor restante ("a pagar no local"): `preço − sinal`. É onde um arredondamento
aparece.

### 3.3 Crédito

| Caso | Esperado |
|---|---|
| crédito cobre o sinal inteiro | confirma sem pagamento, e a tela diz isso claramente |
| crédito cobre parte do sinal | cobra a diferença; o abatimento aparece discriminado |
| sem crédito | fluxo normal |
| cliente marca "usar crédito" | a requisição sai com `useCredit: true` — **confirme no Network**, o campo já foi esquecido antes |

---

## 4. Design tokens e padronização

```bash
# cor crua fora do CSS: tem que dar zero
grep -rn "bg-\[#\|text-\[#\|border-\[#\|from-\[#\|to-\[#" src/ --include="*.tsx"

# escalas aposentadas: tem que dar zero
grep -rn "shadow-xl\|shadow-2xl\|rounded-3xl\|rounded-2xl" src/ --include="*.tsx"

# famílias fora da paleta fechada
grep -roE "(bg|text|border|ring)-(emerald|sky|rose|blue|purple|indigo|violet|cyan|lime|fuchsia|pink|gray|zinc|neutral|stone)-[0-9]+" src/ --include="*.tsx" | sort -u

# animação declarada tem que existir no CSS
grep -roE "animate-[a-z-]+" src/ --include="*.tsx" | sed 's/.*animate/animate/' | sort -u
```

Para a última: **cada nome que aparecer tem que existir** nos `@keyframes` do `index.css` ou ser
nativo do Tailwind (`animate-spin`, `animate-pulse`, `animate-bounce`, `animate-ping`). Se um nome
não estiver em nenhum dos dois, é classe inerte — o efeito não acontece e ninguém percebe.

**Prova visual, não só grep**: abra um modal, um menu suspenso e o seletor de data. Eles têm que
entrar com animação. Antes da correção, apareciam secos.

---

## 5. Redução de efeitos — comparar antes e depois

Números medidos, não impressão. Rode antes e depois:

```bash
for p in "bg-gradient-to" "animate-" "backdrop-blur" "blur-" "shadow-2xl" "shadow-xl" "ring-[0-9]" "glow-"; do
  printf "%-18s %s\n" "$p" "$(grep -roE "$p" src/ --include='*.tsx' --include='*.css' | wc -l)"
done
```

| Sinal | Antes | Alvo |
|---|---|---|
| `bg-gradient-to-*` | 32 | ≤ 5, só hero/banner |
| `blur` + `backdrop-blur` | 26 | só overlay de modal |
| `shadow-xl` + `shadow-2xl` | 31 | 0 |
| `glow-*` decorativo | — | 0 (só se representar estado) |
| `bg-clip-text` | 1 | 0 |

`animate-*` não tem alvo numérico: o que importa é que todos existam de verdade (§4) e que
`animate-pulse` só apareça em skeleton.

**A pergunta final é humana, não numérica**: abra a home, a vitrine e o painel e responda — *isto
parece um produto ou parece um template?* Se ainda parecer template, os números caíram mas o
problema continua. Anote o que ainda incomoda em vez de declarar concluído.

---

## 6. Temas e paletas

### 6.1 Os dois temas

Percorra **todas** as telas nos dois temas. Não amostre — no tema claro, uma cor esquecida vira
texto branco sobre fundo branco, e a tela some sem erro no console.

| Verificação | Como |
|---|---|
| troca de tema | claro → escuro → sistema, com a tela recarregando em cada um |
| persistência | escolher escuro, dar F5: continua escuro |
| sem piscar | recarregar no escuro não pode mostrar um flash branco antes de pintar |
| respeitar o sistema | no modo "sistema", trocar o tema do SO muda a aplicação |
| contraste AA | todo texto ≥ 4,5:1 nos dois temas |
| campos nativos | data, hora e `select` legíveis nos dois temas |

Telas que não podem faltar na varredura: vitrine, checkout, pagamento Pix, confirmação, meus
agendamentos, painel, agenda, serviços, expediente, financeiro, configurações, login, cadastro e
os modais (cancelamento, voucher, saque, perfil financeiro).

### 6.2 Paletas por estabelecimento

| Verificação | Esperado |
|---|---|
| trocar a paleta nas configurações | vitrine daquela empresa muda de cor |
| a mudança persiste | após F5 e em outro navegador |
| duas empresas, paletas diferentes | cada vitrine com a sua; nenhuma vaza para a outra |
| cor de status | **não muda** com a paleta: sucesso e erro seguem iguais |
| superfície e texto | **não mudam** com a paleta |
| paleta inválida ou vazia no banco | cai em `default`, sem tela sem cor |
| cada paleta × cada tema | contraste AA em todas as combinações |
| campo enviado ao backend | o **identificador**, nunca um hex — confira no Network |
| valor fora da lista | backend recusa (teste direto na API, não pela tela) |

O último caso importa: se a validação só existir no frontend, qualquer requisição fora da interface
grava uma cor arbitrária.

---

## 7. Vocabulário

```bash
# telas de cliente e de dono: tem que dar zero em texto visível
grep -rniE "asaas|subconta|split|gateway|webhook|payload|wallet|escrow|custódia|no-show|slug|token|endpoint" \
  src/pages/owner src/pages/client src/pages/booking src/pages/public \
  src/components/client src/components/dashboard
```

O grep traz identificadores de código junto — o que importa é o que está **entre tags JSX, em
`label`, `placeholder`, `title` e em `toast.*`**. `/admin` fica fora: é interno e mantém o jargão.

Depois do grep, o teste que o grep não faz: **leia as telas em voz alta como se fosse um cliente
de barbearia.** Frase que você não diria a uma pessoa no balcão não deveria estar lá. Vale
especialmente para a política de cancelamento e para o pedido de CPF, onde o texto precisa
tranquilizar, não parecer contrato.

Confira também as mensagens de erro do §2.3 — elas são texto de interface como qualquer outro.

---

## 8. Performance

Sempre **antes e depois**, com os mesmos passos, mesmo navegador e cache limpo. Número sem
comparação não prova nada.

DevTools → Network, "Disable cache" desmarcado (queremos o caso real, com cache), para
`/painel`, `/meus-agendamentos` e `/empresa/:slug`:

| Medida | Por que |
|---|---|
| tempo até o conteúdo aparecer | é o que o dono sentiu como "1 a 2 segundos" |
| ordem e duração de cada requisição | mostra o que esperou o quê |
| requisições em série que poderiam ser paralelas | é o alvo da correção |
| tempo de resposta do próprio backend | se o servidor leva 800 ms, nenhuma mudança de frontend resolve |

**Prova específica da correção de sessão**: entre na aplicação, feche a aba, abra de novo já
logado. O conteúdo tem que aparecer **sem esperar** o `/auth/me` terminar. Confirme no Network que
a chamada acontece **junto** com as da página, não antes delas.

**Prova da paralelização do dashboard**: as requisições do painel devem começar praticamente
juntas. Se uma só começa quando outra termina, a cascata continua.

E o caso que não pode regredir: **sessão inválida ainda tem que expulsar** para o login. Renderizar
antes de validar não pode virar acesso indevido — apague o token no `localStorage`, recarregue e
confirme o redirecionamento.

---

## 9. Estados de tela

Para cada tela tocada, os quatro estados. O de erro é o que ninguém testa e o que mais aparece:

| Estado | Como forçar |
|---|---|
| carregando | DevTools → Network → *Slow 3G* |
| vazio | conta nova, empresa sem serviços, cliente sem agendamento |
| erro | backend parado, ou *Offline*, ou bloqueando a rota |
| sucesso | fluxo normal |

```bash
# toda useQuery de tela precisa tratar erro
grep -rn "useQuery" src/pages/ src/components/ | wc -l
grep -rn "isError" src/pages/ src/components/ | wc -l
```

Os dois números não precisam ser idênticos, mas uma diferença grande indica telas que tratam falha
como vazio. Investigue cada `useQuery` sem `isError` correspondente.

```bash
# fallback que inventa dado
grep -rnE "\?\? *0|\|\| *0|\|\| *'|\|\| *new Date\(\)" src/pages/ src/components/
```

Nem todo resultado é problema — o que não pode existir é fallback em **valor monetário, data de
agendamento ou nome de serviço**. Um zero falso é uma afirmação falsa com cara de dado real.

---

## 10. Relatório de entrega

A repaginação só está concluída quando este relatório existir. Um item sem prova é um item não
entregue — e "não consegui validar" é resposta aceitável; "está pronto" sem prova, não.

```markdown
## Relatório da Repaginação

### Ambiente de validação
- frontend no commit: <hash>   backend no commit: <hash>
- navegador e resolução usados:
- backend rodando local / homologação:

### Bloco 0 — vitrine
- [ ] renderiza nos 4 casos (deslogado, logado com e sem crédito) · console limpo
- evidência:

### Contrato com a API
- [ ] toda chamada conferida no controller · nenhum fallback em catch
- [ ] rotas corrigidas testadas com F5
- [ ] erros traduzidos por status
- evidência:

### Dinheiro
- [ ] tabela de preços do §3.2 conferida, valor exibido = valor cobrado
- [ ] crédito nos 4 casos, `useCredit` confirmado no Network
- evidência (print do Network do caso R$ 20,00):

### Design e efeitos
- contagens antes → depois:
- [ ] zero cor crua · zero escala aposentada · toda animação existe
- resposta honesta: ainda parece template? onde?

### Temas e paletas
- [ ] todas as telas nos dois temas · contraste AA
- [ ] paletas isoladas por empresa · status imutável · validação no backend
- telas que precisaram de ajuste:

### Vocabulário
- [ ] grep limpo em cliente e dono
- [ ] leitura em voz alta feita
- textos reescritos:

### Performance
- antes → depois, por tela:
- [ ] sessão em cache não bloqueia mais · sessão inválida ainda expulsa
- [ ] requisições do painel em paralelo

### Estados
- [ ] 4 estados percorridos nas telas tocadas
- [ ] nenhum fallback inventando dado em valor, data ou nome

### O que ficou de fora e por quê
### Divergências entre o plano e o código encontrado
### Perguntas que precisam de decisão do dono
```
