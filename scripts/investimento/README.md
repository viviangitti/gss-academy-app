# A folha de investimento da Ramasa

O documento que responde "quanto já foi investido no app" — o que existe, quanto
trabalho está dentro disso, quanto custa manter e quanto vale cada peça.

**É uso interno.** Tem preço, tem custo e tem a recomendação de quanto cobrar.
Não é material de cliente.

## Atualizar

1. `node scripts/investimento/medir.mjs` — dias, entregas e horas por fase,
   lidos do histórico do repositório.
2. Edite `doc.html` com os números novos e com o que entrou desde a última
   versão (a primeira seção, "O que mudou", é o que a Vivian lê primeiro).
3. `node scripts/investimento/gera.mjs` — sai o PDF em `~/Downloads`, com a data
   de hoje no nome.
4. `node scripts/investimento/gera-word.mjs` — sai o `.docx` editável, ao lado.

O PDF é o que se manda; o Word é o que se mexe. O conteúdo é o mesmo, mas mora
em dois lugares: `doc.html` (PDF) e `gera-word.mjs` (Word). **Mudou um, mude o
outro** — não há geração automática de um a partir do outro, de propósito: o
Word precisa de tabela de verdade, e o PDF precisa de CSS.

A fonte do Word é Arial em tudo, porque o Mac da Vivian não tem Office e
Calibri/Cambria viram outra coisa no Pages.

## A conta é só da Ramasa

A **plataforma base** (abr a 09/ago — o app em si) ficou FORA da conta: ela
nasceu com a Meraki e a Sorocaps, é ativo da GSS e se repete de graça no
próximo cliente. O documento a mostra, marcada como fora, para que ninguém
pense que foi esquecida.

A pasta `scripts/investimento` também não entra na medição: escrever quanto
cobrar não é entrega ao cliente, e contá-la faria o número crescer sozinho a
cada vez que o documento é refeito.

## O que não pode mudar sem avisar

- **O método das horas.** Janela do dia + 30 min, e sempre 60% dela quando o
  assunto é preço. Se mudar, a comparação com as versões anteriores morre.
- **As pastas medidas** (`medir.mjs`). Mesma coisa.
- **A taxa de R$ 200/h** usada para converter horas em custo.

## Versões

Dias e entregas contam **só a Ramasa** (de 10/08 em diante).

| Data | Dias | Entregas | Horas da Ramasa | Custo | Tabela cheia |
|---|---|---|---|---|---|
| 11/09/2026 | 25 | 176 | 107 h | R$ 21.420 | R$ 35.380 |
| 25/09/2026 | 33 | 213 | 158 h | R$ 31.600 | R$ 51.930 |

(A versão publicada em 11/09 mostrava 49 dias e 346 entregas porque somava a
plataforma base junto.)
