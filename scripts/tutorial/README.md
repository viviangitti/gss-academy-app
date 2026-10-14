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

**A VOZ PARA DE FUNCIONAR SOZINHA.** O `narrar.py` usa o edge-tts, que fala com
um servidor da Microsoft, e a Microsoft muda a autenticação sem avisar. Em
14/10/2026 ele passou a devolver `WSServerHandshakeError 403` e a narração das
cenas novas simplesmente não saiu — as velhas continuaram no lugar porque o
script só gera o que falta, então o vídeo ia sair mudo só nos trechos novos, que
é o pior jeito de descobrir. Conserto: `python3 -m pip install --upgrade
edge-tts` (de 7.2.8 para 7.3.1 resolveu). Antes de montar, confira que o número
de MP3 bate com o de cenas:

```bash
ls audio-vendedor/*.mp3 | wc -l     # tem que bater com as cenas de falas-vendedor.json
```

**RESOLVIDO EM 14/10/2026 — mas leia assim mesmo.** O `vite.config.ts` agora
tem `server: { host: '127.0.0.1' }`, o que faz o Vite escutar em IPv4 e tira o
problema abaixo da mesa. Se alguém mexer nisso, ele volta: naquele dia a
gravação do vendedor saiu com 32 quadros de **129.433 bytes cada**, o mesmo
tamanho, porque o `localhost` desta máquina resolvia só para `[::1]` e o Chrome
headless não alcançava. Confira com
`curl -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/` antes de gravar: se
der `000`, é isto.

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
