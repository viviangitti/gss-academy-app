#!/usr/bin/env python3
"""A FAIXA DE LEGENDA, desenhada quadro a quadro.

Este ffmpeg foi compilado sem libass e sem freetype: não tem `subtitles` nem
`drawtext`. Então a legenda vira uma FAIXA DE VÍDEO própria — uma tira de
1080x214 por estado de palavra — que depois entra por cima do vídeo base com
`overlay`, que existe.

A tira é opaca de propósito: ela mora no rodapé, onde só há fundo, então não
precisa de canal alfa — e sem alfa o arquivo fica pequeno e o overlay, barato.
"""
import json, subprocess, sys, os, shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

QUAL = sys.argv[1]
W, FAIXA_H, FAIXA_Y = 1080, 214, 1706
FUNDO = (13, 13, 24)
DITA = (255, 255, 255)       # a palavra que está sendo dita agora
AINDA = (128, 134, 158)      # o que vem depois
JA = (150, 175, 225)         # o que já passou
BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FONTE = ImageFont.truetype(BOLD, 52)
SILENCIO, FOLGA, FPS = 2.0, 0.55, 30

tiras = Path(f'tiras-{QUAL}'); shutil.rmtree(tiras, ignore_errors=True); tiras.mkdir()
falas = {c['id']: c['fala'] for c in json.loads(Path(f'falas-{QUAL}.json').read_text(encoding='utf-8'))}
tempos = json.loads(Path(f'tempos-{QUAL}.json').read_text())

def compontuacao(palavras, fala):
    pos = 0
    for p in palavras:
        i = fala.find(p['w'], pos)
        if i < 0: continue
        fim = i + len(p['w']); extra = ''
        while fim < len(fala) and fala[fim] in '.,!?:;)”"':
            extra += fala[fim]; fim += 1
        p['w'] += extra; pos = fim
    return palavras

def frases(ps):
    out, atual = [], []
    for p in ps:
        atual.append(p)
        texto = ' '.join(x['w'] for x in atual)
        fecha = p['w'].rstrip()[-1:] in '.,!?:;—'
        if (fecha and len(atual) >= 3) or len(atual) >= 7 or len(texto) >= 44:
            out.append(atual); atual = []
    if atual:
        if out and len(atual) < 3: out[-1] += atual
        else: out.append(atual)
    return out

def tira(grupo, atual, destino):
    """Uma linha só. A palavra dita agora vem branca e maior que o resto."""
    im = Image.new('RGB', (W, FAIXA_H), FUNDO); d = ImageDraw.Draw(im)
    palavras = [p['w'] for p in grupo]
    larg = [d.textlength(p + ' ', font=FONTE) for p in palavras]
    x = (W - sum(larg)) / 2
    y = FAIXA_H // 2
    for i, p in enumerate(palavras):
        cor = DITA if i == atual else (JA if i < atual else AINDA)
        if i == atual:
            # halo azul atrás da palavra dita — destaca sem piscar a tela inteira
            d.rounded_rectangle([x-10, y-40, x+larg[i]-8, y+38], 14, fill=(30, 52, 104))
        d.text((x, y), p, font=FONTE, fill=cor, anchor='lm')
        x += larg[i]
    im.save(destino)

vazia = tiras / 'vazia.png'
Image.new('RGB', (W, FAIXA_H), FUNDO).save(vazia)

# A LINHA DO TEMPO, EM QUADROS INTEIROS.
#
# Primeira versão pedia a duração de cada estado em segundos, e o concat do
# ffmpeg arredonda cada um pra cima até fechar um quadro. Com 564 estados, o
# erro somou ONZE SEGUNDOS: a legenda ia ficando cada vez mais atrasada em
# relação à tela — descasava.
#
# Aqui cada troca é marcada no QUADRO em que acontece, e a duração é a diferença
# entre um quadro e o próximo. Como tudo é inteiro, a soma fecha exata: não há
# o que arredondar, e o erro não tem por onde entrar.
marcas = []   # (quadro_inicial, arquivo)
inicio = SILENCIO
n = 0
for t in tempos:
    ps = compontuacao(json.loads(Path(f'audio-{QUAL}/{t["id"]}.json').read_text(encoding='utf-8')), falas[t['id']])
    for grupo in frases(ps):
        for i, p in enumerate(grupo):
            comeco = inicio + p['t']
            arq = tiras / f'{n:04d}.png'; n += 1
            tira(grupo, i, arq)
            marcas.append((round(comeco * FPS), str(arq)))
        # depois da última palavra da frase, a faixa volta a ficar vazia
        ult = grupo[-1]
        marcas.append((round((inicio + ult['t'] + ult['d'] + 0.20) * FPS), str(vazia)))
    inicio += t['dur'] + FOLGA

TOTAL = round((inicio + 1.0) * FPS)
marcas.sort(key=lambda m: m[0])
# marca no mesmo quadro que a seguinte não existe: fica a última
limpo = []
for q, a in marcas:
    if limpo and limpo[-1][0] == q: limpo[-1] = (q, a)
    else: limpo.append((q, a))
if limpo[0][0] > 0: limpo.insert(0, (0, str(vazia)))

pedacos = []
for j, (q, a) in enumerate(limpo):
    prox = limpo[j+1][0] if j+1 < len(limpo) else TOTAL
    quadros = max(prox - q, 1)
    pedacos.append((a, quadros / FPS))

lista = Path(f'tiras-{QUAL}.txt')
lista.write_text(''.join(f"file '{a}'\nduration {d:.5f}\n" for a, d in pedacos) + f"file '{pedacos[-1][0]}'\n", encoding='utf-8')
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i', str(lista),
    '-vf', f'fps={FPS}', '-frames:v', str(TOTAL),
    '-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',
    f'legenda-{QUAL}.mp4'], check=True)
print(f'{n} estados de palavra · legenda-{QUAL}.mp4')
