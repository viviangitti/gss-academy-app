# Os vídeos

Verticais, com locução e legenda karaokê. As telas são o app de verdade,
rodando, com o conteúdo publicado de verdade — nada de mockup.

| vídeo | para quem | marca nas telas |
|---|---|---|
| `vendedor` | time de salão da Ramasa | ramasa |
| `gerente` | gerência da Ramasa | ramasa |
| `drogaria` | **apresentação** para a Sorocaps · Drogaria São Paulo | dsp |

O da drogaria não é tutorial: é apresentação para quem ainda não usa o app.
Cada cena responde "o que isso muda no balcão", e as telas são as da marca
DELES — farmácia com carro na tela seria entregar o material de outro cliente.

## Como refazer

```bash
npm run dev                                  # o app precisa estar no ar
cd scripts/tutorial
node ../relatorio-uso/uso.mjs                # gera time-ramasa.json (usado na cena do Painel)
node dados.mjs                               # puxa as condições publicadas
node falas.mjs                                # roteiro -> falas-{qual}.json (SEM isto, a narração velha fica)
node capturar.mjs drogaria                   # ou vendedor / gerente
python3 narrar.py drogaria
python3 karaoke.py drogaria
python3 montar.py drogaria
```

## O que cada peça faz

| arquivo | papel |
|---|---|
| `roteiros.mjs` | as cenas: url, ação na página, o que circular (`foco`) e a fala |
| `cdp.mjs` | sobe um Chrome headless e conversa com ele |
| `capturar.mjs` | navega, executa a ação e grava o PNG + a posição do elemento a circular |
| `ilustra.py` | desenha os passos do Safari (instalar), que não são tela do app |
| `narrar.py` | locução (voz Thalita) **com o tempo de cada palavra** |
| `karaoke.py` | a faixa de legenda, uma frase por vez, palavra acendendo |
| `montar.py` | junta tudo: capa, quadros, zoom lento, legenda por cima, áudio |

## Armadilhas que já custaram caro

**O endereço, dos dois lados.** O Vite às vezes sobe escutando só em IPv6: o
Chrome tenta IPv4, falha em silêncio e o quadro sai **branco**. E já aconteceu o
contrário — o Chrome desta máquina não alcançou `[::1]` e gravou 14 cenas
idênticas com "site não acessível". Agora o padrão é `http://localhost:5173`, e
dá para forçar com `ELEVA_URL=http://127.0.0.1:5173`. Se os quadros saírem todos
do MESMO tamanho em bytes, é isto: confira o servidor
(`lsof -nP -iTCP:5173 -sTCP:LISTEN`) antes de qualquer outra coisa.

**O acesso gruda.** `Page.addScriptToEvaluateOnNewDocument` ACUMULA: um script
injetado numa cena continua valendo nas seguintes. Foi assim que o vídeo do
gerente virou o vídeo da Silmara da cena 8 em diante. O `capturar.mjs` remove o
anterior antes de pôr o novo — não mexa nisso.

**A legenda escorrega.** As durações vão em QUADROS inteiros, não em segundos.
Em segundos o ffmpeg arredonda cada estado pra cima e, com ~600 palavras, o
erro somou onze segundos de atraso no fim.

**Os dados do time.** A sessão de gravação não tem login do Firebase, então a
aba Resultados sai vazia. Para gravá-la cheia, aplique um remendo TEMPORÁRIO em
`src/pilulas/data/teamStats.ts` fazendo `fetchTeam` devolver o conteúdo de
`localStorage.wp_demo_time`, grave, e **reverta antes de commitar**. Nunca subiu
pro app e não deve subir.

**Confira antes de entregar.** Meça quanto de cada quadro é branco (>90% = falha
de captura), confira quem aparece na conta de cada cena, e sorteie 4 instantes
pra ver se a palavra acesa é a que a voz está dizendo.
