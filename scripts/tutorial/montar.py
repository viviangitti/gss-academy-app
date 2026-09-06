#!/usr/bin/env python3
"""Monta o vídeo: cada cena vira um quadro 1080x1920 com o celular no meio e a
legenda embaixo. Legenda existe porque metade das pessoas assiste sem som."""
import json, subprocess, sys, os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

QUAL = sys.argv[1]
TITULO = 'Guia do vendedor' if QUAL == 'vendedor' else 'Guia do gerente'
SUB = 'Eleva · Ramasa — Jaecoo e Omoda'

W, H = 1080, 1920
ALVO_H = 1660     # altura do celular no quadro (era 1420, com a legenda embaixo)
TOPO_Y = 46
FUNDO = (13, 13, 24)
AZUL = (75, 141, 255)
BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
REG = '/System/Library/Fonts/Supplemental/Arial.ttf'

falas = {c['id']: c['fala'] for c in json.loads(Path(f'falas-{QUAL}.json').read_text(encoding='utf-8'))}
tempos = json.loads(Path(f'tempos-{QUAL}.json').read_text(encoding='utf-8'))
quadros = Path(f'quadros-{QUAL}'); quadros.mkdir(exist_ok=True)

def quebra(d, txt, fonte, larg):
    linhas, atual = [], ''
    for p in txt.split():
        t = f'{atual} {p}'.strip()
        if d.textlength(t, font=fonte) > larg and atual:
            linhas.append(atual); atual = p
        else:
            atual = t
    if atual: linhas.append(atual)
    return linhas

def capa(destino, png_fundo):
    """A capa mostra O APP — no mesmo enquadramento das outras cenas, bem
    escurecido, com o título por cima.

    Antes era fundo preto liso enquanto a voz falava vinte segundos, e a Vivian
    disse, com razão, que começar falando sem imagem nenhuma não fica bom. A
    primeira tentativa foi o print inteiro sangrando a tela: ficou poluído, o
    conteúdo do app competindo com o título. Aqui o aparelho aparece inteiro,
    apagado o suficiente pra ser cenário, e o título manda."""
    im = Image.new('RGB', (W, H), FUNDO)
    foto = Image.open(png_fundo).convert('RGB')
    esc = ALVO_H / foto.height
    foto = foto.resize((int(foto.width * esc), ALVO_H), Image.LANCZOS)
    # apaga o print ANTES de colar: assim as bordas do aparelho continuam nítidas
    foto = Image.blend(foto, Image.new('RGB', foto.size, FUNDO), 0.86)
    x = (W - foto.width) // 2
    mascara = Image.new('L', foto.size, 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, foto.width, foto.height], 34, fill=255)
    im.paste(foto, (x, TOPO_Y), mascara)

    d = ImageDraw.Draw(im)
    d.text((W // 2, 780), 'ELEVA', font=ImageFont.truetype(BOLD, 140), fill=(255, 255, 255), anchor='mm')
    d.text((W // 2, 925), TITULO.upper(), font=ImageFont.truetype(BOLD, 58), fill=AZUL, anchor='mm')
    d.text((W // 2, 1020), SUB, font=ImageFont.truetype(REG, 36), fill=(150, 155, 175), anchor='mm')
    im.save(destino)

def marca(im, caixa, x0, y0, esc):
    """Circula o que a narração está falando.

    A caixa vem MEDIDA no navegador, em pixels de CSS; aqui ela vira posição no
    quadro. Sem isso a marca é chute, e chute erra no dia em que o layout muda.
    Dois traços: um cheio e um translúcido em volta, pra aparecer tanto em fundo
    claro quanto escuro."""
    if not caixa: return
    folga = 14
    l = x0 + caixa['x']*3*esc - folga
    t = y0 + caixa['y']*3*esc - folga
    r = l + caixa['w']*3*esc + folga*2
    b = t + caixa['h']*3*esc + folga*2
    d = ImageDraw.Draw(im, 'RGBA')
    d.rounded_rectangle([l-5, t-5, r+5, b+5], 26, outline=(75,141,255,70), width=12)
    d.rounded_rectangle([l, t, r, b], 22, outline=(75,141,255,255), width=7)

def cena(png, texto, destino, caixa=None):
    im = Image.new('RGB', (W, H), FUNDO); d = ImageDraw.Draw(im)
    foto = Image.open(png).convert('RGB')
    # O CELULAR CRESCEU. A legenda ocupava até cinco linhas no rodapé e comia um
    # terço da tela; agora é uma frase por vez, queimada por cima, e o espaço
    # que sobrou foi todo pro app — que é o que a pessoa precisa enxergar.
    esc = ALVO_H / foto.height
    foto = foto.resize((int(foto.width*esc), ALVO_H), Image.LANCZOS)
    topo_x = (W - foto.width)//2
    # cantos arredondados, pra parecer aparelho e não captura de tela
    mascara = Image.new('L', foto.size, 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0,0,foto.width,foto.height], 34, fill=255)
    im.paste(foto, (topo_x, TOPO_Y), mascara)
    marca(im, caixa, topo_x, TOPO_Y, esc)
    im.save(destino)

SILENCIO = 2.0   # respiro antes da voz começar
FOLGA = 0.55     # respiro depois de cada fala

# A ABERTURA É DIVIDIDA EM DUAS TELAS.
# A definição do Eleva, igual à do site, leva mais de vinte segundos — e vinte
# segundos parado na mesma imagem cansa antes de a pessoa entender. A capa
# segura a primeira metade da fala; o app entra na segunda. O áudio não é
# cortado: ele corre inteiro por cima das duas.
partes = []
capa(quadros/'00-capa.png', f'frames-{QUAL}/{tempos[0]["id"]}.png')
dur0 = tempos[0]['dur']
partes.append(('00-capa.png', SILENCIO + dur0 * 0.5))
for i, t in enumerate(tempos):
    cx = Path(f'frames-{QUAL}/{t["id"]}.json')
    caixa = json.loads(cx.read_text()) if cx.exists() else None
    cena(f'frames-{QUAL}/{t["id"]}.png', falas[t['id']], quadros/f'{t["id"]}.png', caixa)
    dur = (dur0 * 0.5 + FOLGA) if i == 0 else (t['dur'] + FOLGA)
    partes.append((f'{t["id"]}.png', dur))

# clipes com um zoom lento — quadro parado por três minutos cansa
os.makedirs(f'clipes-{QUAL}', exist_ok=True)
lista = []
for i, (arq, dur) in enumerate(partes):
    saida = f'clipes-{QUAL}/{i:02d}.mp4'
    n = max(int(dur*30), 2)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-loop','1','-i', str(quadros/arq),
        '-vf', f"scale=2160:-2,zoompan=z='min(zoom+0.00035,1.06)':d={n}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps=30,format=yuv420p",
        '-t', f'{dur}', '-r','30','-c:v','libx264','-preset','medium','-crf','20', saida], check=True)
    lista.append(saida)

Path(f'lista-{QUAL}.txt').write_text(''.join(f"file '{c}'\n" for c in lista), encoding='utf-8')
# áudio: silêncio da capa + cada locução com a mesma folga do clipe
aud = ['-f','lavfi','-t',str(SILENCIO),'-i','anullsrc=r=44100:cl=stereo']
for t in tempos: aud += ['-i', f'audio-{QUAL}/{t["id"]}.mp3']
n = len(tempos)+1
filtro = ''.join(f'[{i}:a]apad=pad_dur={FOLGA}[a{i}];' for i in range(1, n)) + \
         '[0:a]' + ''.join(f'[a{i}]' for i in range(1, n)) + f'concat=n={n}:v=0:a=1[out]'
subprocess.run(['ffmpeg','-y','-loglevel','error', *aud, '-filter_complex', filtro,
    '-map','[out]', f'voz-{QUAL}.m4a'], check=True)
# a legenda entra como FAIXA por cima, no rodapé — ver karaoke.py
subprocess.run(['ffmpeg','-y','-loglevel','error',
    '-f','concat','-safe','0','-i', f'lista-{QUAL}.txt',
    '-i', f'legenda-{QUAL}.mp4',
    '-i', f'voz-{QUAL}.m4a',
    '-filter_complex', '[0:v][1:v]overlay=0:1706:shortest=0[v]',
    '-map','[v]','-map','2:a',
    '-c:v','libx264','-preset','medium','-crf','20','-c:a','aac','-b:a','160k','-shortest',
    f'ELEVA — {TITULO}.mp4'], check=True)
print('pronto:', f'ELEVA — {TITULO}.mp4')
