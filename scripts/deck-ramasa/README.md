# O deck da Ramasa, enxugado

`monta.py` parte da apresentação exportada do Keynote e devolve a versão
enxuta: corrige os números do caso, troca o preço de implantação, cria o slide
"O que entra, peça por peça" e corta os slides que a nova substitui.

```bash
# 1. exportar o .key para .pptx (o Keynote precisa estar com o arquivo aberto)
osascript -e 'tell application "Keynote" to export document "Eleva - Apresentacao institucional Ramasa" to POSIX file "/tmp/ramasa.pptx" as Microsoft PowerPoint'

# 2. montar
python3 scripts/deck-ramasa/monta.py /tmp/ramasa.pptx ~/Desktop/"Eleva - Apresentacao Ramasa ENXUTA (17 slides).pptx"
```

## O que ele faz

1. **Caso Ramasa (slide 10)** — 86 dias / 30 de 37 / 744 ações / 64 resumos, e a
   data de 1º de julho. O "85 dias da primeira linha de conteúdo ao time usando
   o app" era erro de rótulo: esse número é 18.
2. **Preço** — implantação passa de R$ 35.380 para R$ 25.000, com a tabela
   cheia de R$ 51.930 como âncora.
3. **Slide novo, penúltimo** — três colunas: módulo principal (R$ 39.280),
   módulos extras (R$ 12.650) e diferenciais. Os dois subtotais somam a tabela
   cheia; o bloco escuro fecha no pacote.
4. **Corte de 22 para 17** — saem A jornada do atendimento, A pessoa aprende e
   prova, as duas de "Tudo o que vem no Eleva", Como trabalhamos juntos e O que
   a implantação entrega. Todas viraram linha do slide novo.
5. **Rodapé** — renumera. A primeira versão duplicava o número ("… 14   14")
   porque o regex casava também a string vazia no fim.

## Cuidado

O `.key` da Vivian **não é tocado**. O script escreve um `.pptx` novo, que ela
abre no Keynote. Se ela editar o `.key` depois, exporte de novo antes de rodar —
senão as edições dela se perdem.
