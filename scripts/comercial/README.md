# O comercial do Eleva

Horizontal (1920×1080), para tocar dentro da apresentação. Fala com o time da
Ramasa: não explica o que é o app — mostra o que ele faz e o que eles já
construíram com ele. Pedido da Vivian em 29/09/2026.

```bash
npm run dev                                          # o app precisa estar no ar
S=/tmp/comercial                                     # pasta de trabalho
node scripts/comercial/captura.mjs "$S"              # as telas, inteiras
python3 scripts/comercial/narrar.py "$S"             # locução Francisca
python3 scripts/comercial/monta.py "$S" saida.mp4    # desenha e monta

SO_AUDIO=1 python3 scripts/comercial/monta.py "$S" saida.mp4   # só remixa o som
```

## As três decisões que fazem o vídeo funcionar

**O movimento não é vídeo de tela.** Gravar o navegador rolando sai com queda de
quadro e cursor aparecendo. Aqui a captura traz a PÁGINA INTEIRA num PNG alto e
a janela de recorte desce sobre ela, quadro a quadro, com aceleração suave nas
pontas. Sai liso, e dá para escolher exatamente onde começa e termina a rolagem.

**As barras fixas saem da captura e voltam na montagem.** `.wp-nav` é
`position: fixed`: numa captura além do visor o navegador a desenha na altura em
que o visor estava — ou seja, no meio da imagem alta. No primeiro corte a barra
de abas aparecia flutuando no meio da tela, como se o app estivesse quebrado.
Agora cada tela sai duas vezes (página sem as barras + visor com elas) e a
montagem cola as faixas por cima do conteúdo que corre.

**As durações vêm da locução.** Cada cena dura o áudio dela mais um respiro —
nada é cronometrado no chute. E a voz entra 0,35 s depois do corte: voz que
começa junto com a imagem parece dublagem mal encaixada.

## Trilha

Dois loops do GarageBand, do mesmo kit ("Go Time"): mesmo kit = mesmo andamento
e mesma tonalidade. Escolhi pela DURAÇÃO EXATA (8,000000 s nos dois) — loops de
kits diferentes têm tamanhos diferentes (7,44 s contra 8,00 s) e vão saindo de
compasso ao longo do vídeo.

Volume: a trilha fica ~11 dB abaixo da voz. Na primeira versão ela estava a
1,7 dB e disputava a frase. Se mexer, meça, não confie no ouvido no notebook:

```bash
ffmpeg -i trilha.wav -af volumedetect -f null -        # média da trilha
ffmpeg -i saida.mp4 -af ebur128=framelog=quiet -f null -   # tem que dar -16 LUFS
```

## O que envelhece

**Os números do Painel.** A cena do Painel diz "vinte e três em agosto,
duzentos e cinquenta e seis em setembro". Isso é dado real, medido no dia — e
muda. Antes de reapresentar, confira o Painel e, se mudou, ajuste a fala em
`roteiro.py` e rode `narrar.py` de novo (apague o MP3 da cena primeiro, senão
ele reaproveita a locução velha).

**As telas.** Se o app mudou, recapture. Print velho num vídeo de venda é pior
que não ter vídeo.
