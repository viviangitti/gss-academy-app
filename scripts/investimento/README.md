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

## O que não pode mudar sem avisar

- **O método das horas.** Janela do dia + 30 min, e sempre 60% dela quando o
  assunto é preço. Se mudar, a comparação com as versões anteriores morre.
- **As pastas medidas** (`medir.mjs`). Mesma coisa.
- **A taxa de R$ 200/h** usada para converter horas em custo.

## Versões

| Data | Dias | Entregas | Horas da Ramasa | Custo | Tabela cheia |
|---|---|---|---|---|---|
| 11/09/2026 | 49 | 346 | 107 h | R$ 21.420 | R$ 35.380 |
| 25/09/2026 | 58 | 379 | 158 h | R$ 31.600 | R$ 51.930 |
