# Relatório de uso do Eleva

PDF com o uso real do app, separado por frente (vendedor de veículos, vendedor
de acessórios, leads e gestão), pessoa por pessoa.

```bash
cd scripts/relatorio-uso
node uso.mjs        # lê elevaStats, tira as contas de teste → uso-bruto.json
node detalhe.mjs    # agrega por pessoa, carro, documento → uso-detalhe.json
node relatorio.mjs  # monta o HTML
node pdf.mjs        # imprime em PDF pelo Chrome headless
```

O dado vem do registro do próprio app (`elevaStats`), não de estimativa.
"Dias ativos" conta dias distintos com ao menos uma ação. Contas de teste
(Vivian, Silene, Mari, diagnóstico) ficam de fora — foi o que já inflou a
contagem uma vez.

As datas e o texto da seção "Leitura" no fim de `relatorio.mjs` são escritos à
mão a cada rodada: são a interpretação dos números, não saem deles sozinhos.
